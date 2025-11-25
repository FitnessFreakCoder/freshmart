
/** 
 * INSTALLATION:
 * 1. Initialize: npm init -y
 * 2. Install: npm install express mongoose cors dotenv bcrypt jsonwebtoken multer
 * 3. Save models code above as 'models.js'
 * 4. Save this file as 'server.js'
 * 5. Create .env file with MONGO_URI
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const { User, Product, Coupon, Order } = require('./models');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).send("Admin Access Required");
  next();
};

// --- IMAGE UPLOAD ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. AUTH REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash });
    await user.save();
    
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. AUTH LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // Identifier can be email or username
    // Note: Frontend sends 'identifier', logic handles finding by email OR username
    const user = await User.findOne({ 
        $or: [{ email: identifier }, { username: identifier }] 
    });

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Map _id to id for frontend consistency
    res.json({ 
        token, 
        user: { id: user._id, username: user.username, role: user.role, mobileNumber: user.mobileNumber } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET PRODUCTS
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  // Map _id to id
  res.json(products.map(p => ({ 
      id: p._id, 
      ...p.toObject() 
  })));
});

// 4. ADD PRODUCT (Admin)
app.post('/api/admin/products', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, originalPrice, unit, stock, category } = req.body;
    const bulkRule = req.body.bulkRule ? JSON.parse(req.body.bulkRule) : null;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const product = new Product({
      name, 
      price, 
      originalPrice, 
      unit, 
      stock, 
      category, 
      imageUrl,
      bulkRule
    });
    
    await product.save();
    res.json({ message: 'Product added', id: product._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE PRODUCT (Admin)
app.delete('/api/admin/products/:id', authenticateToken, isAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

// 6. PLACE ORDER
app.post('/api/orders', authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, total, discount, finalTotal, location, mobileNumber, username } = req.body;
    
    // Create Order
    const orderId = 'ORD-' + Date.now();
    const order = new Order({
      orderId,
      user: req.user.id,
      username: username, // Save snapshot
      mobileNumber,
      items: items.map(i => ({
          productId: i.id, // Maps frontend 'id' to backend ObjectId if valid, or just stores string ref
          name: i.name,
          price: i.price,
          quantity: i.quantity
      })),
      totalAmount: total,
      discountApplied: discount,
      finalAmount: finalTotal,
      location,
      status: 'Pending'
    });

    await order.save({ session });

    // Update Stock
    for (const item of items) {
       await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.quantity } }, { session });
    }
    
    // Update User Mobile if provided
    if (mobileNumber) {
        // Strip +977 for storage if needed, or store full
        const rawMobile = mobileNumber.replace('+977-', ''); 
        await User.findByIdAndUpdate(req.user.id, { mobileNumber: rawMobile }, { session });
    }

    await session.commitTransaction();
    res.json({ orderId, status: 'Pending' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

// 7. GET ORDERS (User & Admin)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
      let query = {};
      // If not admin, only show own orders
      if (req.user.role !== 'ADMIN') {
          query = { user: req.user.id };
      }
      
      const orders = await Order.find(query).sort({ createdAt: -1 });
      
      // Transform for frontend
      res.json(orders.map(o => ({
          id: o.orderId, // Frontend expects 'id' as the order number string
          userId: o.user,
          username: o.username,
          mobileNumber: o.mobileNumber,
          items: o.items,
          total: o.totalAmount,
          discount: o.discountApplied,
          finalTotal: o.finalAmount,
          status: o.status,
          location: o.location,
          createdAt: o.createdAt
      })));
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// 8. UPDATE ORDER STATUS (Admin)
app.put('/api/admin/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.body;
    // Find by custom orderId (ORD-XXX)
    await Order.findOneAndUpdate({ orderId: req.params.id }, { status });
    res.json({ message: 'Status updated' });
});

// 9. COUPONS
app.get('/api/coupons', async (req, res) => {
    const coupons = await Coupon.find({ isActive: true });
    res.json(coupons);
});

app.post('/api/admin/coupons', authenticateToken, isAdmin, async (req, res) => {
    const { code, discountAmount, expiry, minOrderAmount } = req.body;
    const coupon = new Coupon({ 
        code, 
        discountAmount, 
        minOrderAmount, 
        expiryDate: new Date(expiry) 
    });
    await coupon.save();
    res.json({ message: 'Coupon created' });
});

app.delete('/api/admin/coupons/:code', authenticateToken, isAdmin, async (req, res) => {
    await Coupon.findOneAndDelete({ code: req.params.code });
    res.json({ message: 'Coupon deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  