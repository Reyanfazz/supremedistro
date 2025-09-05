import { Router } from 'express';
import multer from 'multer';
import { extname } from 'path';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const router = Router();

// === Multer setup for image uploads ===
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

// === Category Model ===
const categorySchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// === CATEGORY ROUTES ===

// GET all categories with brands
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    const categoriesWithBrands = await Promise.all(
      categories.map(async (cat) => {
        const brands = await Product.aggregate([
          { $match: { category: cat.name } },
          {
            $group: {
              _id: "$brand",
              brandLogo: { $first: "$brandLogo" },
              brandDescription: { $first: "$brandDescription" },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        return {
          ...cat.toObject(),
          brands: brands.map(b => ({
            name: b._id,
            logo: b.brandLogo,
            description: b.brandDescription,
          })),
        };
      })
    );

    res.json(categoriesWithBrands);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// POST add category
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ message: 'Category already exists' });

    const category = new Category({ name: name.trim() });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Failed to add category:', err);
    res.status(500).json({ message: 'Failed to add category' });
  }
});

// === PRODUCT ROUTES ===

// GET all or filtered products
router.get('/', async (req, res) => {
  try {
    const { featured, dealOfDay, brand } = req.query;
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
    if (brand) filter.brand = brand;

    const products = await Product.find(filter).sort({
      brandDescription: -1,
      createdAt: -1,
    });

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

    const product = new Product({
      name,
      description,
      category,
      brand,
      brandDescription: brandDescription?.trim() || '',
      dailyPrice: Number(dailyPrice),
      offSalePrice: offSalePrice ? Number(offSalePrice) : undefined,
      stock: stock ? Number(stock) : 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isDealOfDay: isDealOfDay === 'true' || isDealOfDay === true,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      image: req.files['image']?.[0]?.filename || null,
      brandLogo: req.files['brandLogo']?.[0]?.filename || null,
      images: req.files['images']?.map(f => f.filename) || [],
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Failed to add product:', err);
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
    product.brandDescription = brandDescription?.trim() || '';
    product.dailyPrice = Number(dailyPrice);
    product.offSalePrice = offSalePrice ? Number(offSalePrice) : undefined;
    product.stock = stock ? Number(stock) : product.stock;
    product.isFeatured = isFeatured === 'true' || isFeatured === true;
    product.isDealOfDay = isDealOfDay === 'true' || isDealOfDay === true;
    product.expiryDate = expiryDate ? new Date(expiryDate) : null;

    if (req.files['image']) product.image = req.files['image'][0].filename;
    if (req.files['brandLogo']) product.brandLogo = req.files['brandLogo'][0].filename;
    if (req.files['images']) product.images = req.files['images'].map(f => f.filename);

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Failed to update product:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Failed to delete product:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
