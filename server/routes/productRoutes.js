import { Router } from 'express';
import multer from 'multer';
import { extname } from 'path';
import Product from '../models/Product.js';

const router = Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});
const upload = multer({ storage });

const cpUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'brandLogo', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

// GET all or filtered products
router.get('/', async (req, res) => {
  try {
    const { featured, dealOfDay } = req.query;

    const filter = {};
    if (featured === 'true') filter.isFeatured = true;
    if (dealOfDay === 'true') {
      filter.isDealOfDay = true;
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

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// POST new product
router.post('/', cpUpload, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      brandDescription,
      dailyPrice,
      offSalePrice,
      stock,
      isFeatured,
      isDealOfDay,
      expiryDate,
    } = req.body;

    const image = req.files['image'] ? req.files['image'][0].filename : null;
    const brandLogo = req.files['brandLogo'] ? req.files['brandLogo'][0].filename : null;
    const images = req.files['images'] ? req.files['images'].map(file => file.filename) : [];

    const product = new Product({
      name,
      description,
      category,
      brand,
      brandDescription,
      dailyPrice: Number(dailyPrice),
      offSalePrice: offSalePrice ? Number(offSalePrice) : undefined,
      stock: stock ? Number(stock) : 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isDealOfDay: isDealOfDay === 'true' || isDealOfDay === true,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      image,
      brandLogo,
      images,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add product' });
  }
});

// PUT update product
router.put('/:id', cpUpload, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      brand,
      brandDescription,
      dailyPrice,
      offSalePrice,
      stock,
      isFeatured,
      isDealOfDay,
      expiryDate,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = name;
    product.description = description;
    product.category = category;
    product.brand = brand;
    product.brandDescription = brandDescription;
    product.dailyPrice = Number(dailyPrice);
    product.offSalePrice = offSalePrice ? Number(offSalePrice) : undefined;
    product.stock = stock ? Number(stock) : product.stock;
    product.isFeatured = isFeatured === 'true' || isFeatured === true;
    product.isDealOfDay = isDealOfDay === 'true' || isDealOfDay === true;
    product.expiryDate = expiryDate ? new Date(expiryDate) : null;

    if (req.files['image']) {
      product.image = req.files['image'][0].filename;
    }
    if (req.files['brandLogo']) {
      product.brandLogo = req.files['brandLogo'][0].filename;
    }
    if (req.files['images']) {
      product.images = req.files['images'].map(file => file.filename);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// DELETE product
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
