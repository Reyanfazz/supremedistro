// ✅ Backend: routes/productRoutes.js (ES Modules)
import { Router } from 'express';
import multer from 'multer';
import { extname } from 'path';
import Product from '../models/Product.js';

const router = Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});
const upload = multer({ storage });

/**
 * GET /api/products
 * Supports optional query params:
 *   ?featured=true
 *   ?dealOfDay=true
 * Both can be combined.
 * If dealOfDay=true, only returns deals with expiryDate in the future or no expiryDate set.
 */
router.get('/', async (req, res) => {
  try {
    const { featured, dealOfDay } = req.query;

    const filter = {};
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    if (dealOfDay === 'true') {
      filter.isDealOfDay = true;

      // Only include deals not expired (expiryDate null or future)
      filter.$or = [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } },
      ];
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

/**
 * POST /api/products
 * Creates a new product
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      dailyPrice,
      offSalePrice,
      isFeatured,
      isDealOfDay,
      expiryDate,
    } = req.body;
    const image = req.file ? req.file.filename : null;

    const product = new Product({
      name,
      description,
      category,
      dailyPrice,
      offSalePrice,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isDealOfDay: isDealOfDay === 'true' || isDealOfDay === true,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      image,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add product' });
  }
});

/**
 * PUT /api/products/:id
 * Updates an existing product
 */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      dailyPrice,
      offSalePrice,
      isFeatured,
      isDealOfDay,
      expiryDate,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = name;
    product.description = description;
    product.category = category;
    product.dailyPrice = dailyPrice;
    product.offSalePrice = offSalePrice;
    product.isFeatured = isFeatured === 'true' || isFeatured === true;
    product.isDealOfDay = isDealOfDay === 'true' || isDealOfDay === true;
    product.expiryDate = expiryDate ? new Date(expiryDate) : null;

    if (req.file) {
      product.image = req.file.filename;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

/**
 * DELETE /api/products/:id
 * Deletes a product
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
