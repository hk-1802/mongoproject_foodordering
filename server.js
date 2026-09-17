require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const menuData = require('./data/menu');
const { JWT_SECRET } = require('./middleware/auth');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_ordering';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change_this_to_a_strong_password';

// Admins to seed: the primary pair above, plus anything in EXTRA_ADMINS,
// written as comma-separated "email:password" entries.
function adminAccounts() {
  const list = [{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }];
  for (const entry of (process.env.EXTRA_ADMINS || '').split(',')) {
    const trimmed = entry.trim();
    const split = trimmed.indexOf(':');
    if (split < 1) continue; // skip blanks and malformed entries
    const email = trimmed.slice(0, split).trim().toLowerCase();
    const password = trimmed.slice(split + 1).trim();
    if (email && password && !list.some((a) => a.email === email)) list.push({ email, password });
  }
  return list;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/orders')(io));
app.use('/api', require('./routes/geocode'));
app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));

/* ---- Real-time: authenticate sockets and put them in rooms ---- */
io.use((socket, next) => {
  try {
    socket.user = jwt.verify(socket.handshake.auth?.token, JWT_SECRET());
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});
io.on('connection', (socket) => {
  if (socket.user.role === 'admin') socket.join('admins');
  else socket.join(`user:${socket.user.id}`);
});

/* ---- Seed admin account + 40 menu items ---- */
async function seed() {
  for (const { email, password } of adminAccounts()) {
    const existing = await User.findOne({ email });
    if (!existing) {
      await User.create({
        name: 'Admin',
        email,
        password: await bcrypt.hash(password, 10),
        role: 'admin',
      });
      console.log(`✔ Admin account created: ${email}`);
    } else if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`✔ Existing account promoted to admin: ${email}`);
    }
  }

  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany(menuData);
    console.log(`✔ Seeded ${menuData.length} menu items`);
  }
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✔ Connected to MongoDB');
    await seed();
    server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('✖ MongoDB connection failed:', err.message);
    process.exit(1);
  });
