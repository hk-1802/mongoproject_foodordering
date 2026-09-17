const router = require('express').Router();
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const TAX_RATE = 0.05;
const DELIVERY_FEE = 30;
const FREE_DELIVERY_ABOVE = 500;

const makeOrderNumber = () =>
  'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

module.exports = (io) => {
  /* ---------------- Menu ---------------- */
  router.get('/menu', async (_req, res) => {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(items);
  });

  router.patch('/menu/:id', auth, adminOnly, async (req, res) => {
    const update = {};
    if (typeof req.body.available === 'boolean') update.available = req.body.available;
    if (typeof req.body.price === 'number' && req.body.price >= 0) update.price = req.body.price;
    const item = await MenuItem.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    io.emit('menu:updated', item); // every open menu page refreshes this item
    res.json(item);
  });

  /* ---------------- User orders ---------------- */
  router.post('/orders', auth, async (req, res) => {
    try {
      if (req.user.role === 'admin') return res.status(400).json({ message: 'Admin cannot place orders' });
      const { items, address, phone, notes, paymentMethod } = req.body;
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Your cart is empty' });
      if (!address || !phone) return res.status(400).json({ message: 'Address and phone are required' });

      const ids = items.map((i) => i.menuItem).filter((id) => mongoose.isValidObjectId(id));
      const menu = await MenuItem.find({ _id: { $in: ids } });
      const byId = new Map(menu.map((m) => [m._id.toString(), m]));

      const orderItems = [];
      for (const i of items) {
        const m = byId.get(String(i.menuItem));
        const qty = Math.max(1, Math.min(50, parseInt(i.qty, 10) || 1));
        if (!m) return res.status(400).json({ message: 'Some items are no longer on the menu' });
        if (!m.available) return res.status(400).json({ message: `${m.name} is currently unavailable` });
        // prices always come from the database, never from the browser
        orderItems.push({ menuItem: m._id, name: m.name, emoji: m.emoji, price: m.price, qty });
      }

      const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
      const tax = Math.round(subtotal * TAX_RATE);
      const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
      const user = await User.findById(req.user.id);

      const order = await Order.create({
        orderNumber: makeOrderNumber(),
        user: req.user.id,
        customerName: user?.name || req.user.name,
        customerEmail: user?.email || req.user.email,
        phone,
        address,
        notes: notes || '',
        paymentMethod: paymentMethod || 'Cash on Delivery',
        items: orderItems,
        subtotal,
        tax,
        deliveryFee,
        total: subtotal + tax + deliveryFee,
        statusHistory: [{ status: 'Pending' }],
      });

      io.to('admins').emit('order:new', order); // instant update on admin dashboard
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: 'Could not place order', error: err.message });
    }
  });

  router.get('/orders/my', auth, async (req, res) => {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  });

  router.patch('/orders/:id/cancel', auth, async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Pending') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled' });
    await order.save();
    io.to('admins').emit('order:updated', order);
    io.to(`user:${order.user}`).emit('order:updated', order);
    res.json(order);
  });

  /* ---------------- Admin ---------------- */
  router.get('/admin/orders', auth, adminOnly, async (req, res) => {
    const filter = {};
    if (req.query.status && Order.STATUSES.includes(req.query.status)) filter.status = req.query.status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(orders);
  });

  router.patch('/admin/orders/:id/status', auth, adminOnly, async (req, res) => {
    const { status } = req.body;
    if (!Order.STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    order.statusHistory.push({ status });
    await order.save();
    io.to(`user:${order.user}`).emit('order:updated', order); // customer sees live status
    io.to('admins').emit('order:updated', order);
    res.json(order);
  });

  router.get('/admin/stats', auth, adminOnly, async (_req, res) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [todayAgg, pending, active, users, allAgg, topItems] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: start }, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: { $in: ['Confirmed', 'Preparing', 'Out for Delivery'] } }),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', emoji: { $first: '$items.emoji' }, qty: { $sum: '$items.qty' } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
      ]),
    ]);
    res.json({
      todayOrders: todayAgg[0]?.count || 0,
      todayRevenue: todayAgg[0]?.revenue || 0,
      totalOrders: allAgg[0]?.count || 0,
      totalRevenue: allAgg[0]?.revenue || 0,
      pending,
      active,
      users,
      topItems,
    });
  });

  router.get('/admin/users', auth, adminOnly, async (_req, res) => {
    const users = await User.aggregate([
      { $match: { role: 'user' } },
      { $lookup: { from: 'orders', localField: '_id', foreignField: 'user', as: 'orders' } },
      {
        $project: {
          name: 1, email: 1, phone: 1, createdAt: 1,
          orderCount: { $size: '$orders' },
          spent: { $sum: '$orders.total' },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.json(users);
  });

  return router;
};
