const mongoose = require('mongoose');

const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: String,
    emoji: String,
    price: Number,
    qty: { type: Number, min: 1, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: String,
    customerEmail: String,
    phone: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String, default: '' },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    subtotal: Number,
    tax: Number,
    deliveryFee: Number,
    total: Number,
    paymentMethod: { type: String, enum: ['Cash on Delivery', 'UPI', 'Card'], default: 'Cash on Delivery' },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

orderSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Order', orderSchema);
