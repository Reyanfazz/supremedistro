import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];

const ProductForm = ({ product, onSuccess }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    brand: product?.brand || '',
    brandDescription: product?.brandDescription || '',
    dailyPrice: product?.dailyPrice || '',
    offSalePrice: product?.offSalePrice || '',
    stock: product?.stock ?? 0,
    isFeatured: product?.isFeatured || false,
    isDealOfDay: product?.isDealOfDay || false,
    expiryDate: product?.expiryDate ? product.expiryDate.substring(0, 16) : '',
    image: null, // new upload file
    brandLogo: null, // new upload file
    images: [], // multiple new gallery files
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(product?.image ? `${apiUrl}/uploads/${product.image}` : '');
  const [brandLogoPreview, setBrandLogoPreview] = useState(
    product?.brandLogo ? `${apiUrl}/uploads/${product.brandLogo}` : ''
  );
  const [galleryPreviews, setGalleryPreviews] = useState(product?.images?.map((img) => `${apiUrl}/uploads/${img}`) || []);
  const [loading, setLoading] = useState(false);

  // Validation
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    if (!formData.category) errs.category = 'Category is required.';
    if (!formData.brand.trim()) errs.brand = 'Brand is required.';
    if (formData.dailyPrice === '' || formData.dailyPrice < 0) errs.dailyPrice = 'Daily price must be 0 or greater.';
    if (formData.offSalePrice !== '' && formData.offSalePrice < 0)
      errs.offSalePrice = 'Off sale price must be 0 or greater.';
    if (formData.stock < 0) errs.stock = 'Stock cannot be negative.';

    if (formData.isDealOfDay) {
      if (!formData.expiryDate) {
        errs.expiryDate = 'Expiry Date and Time is required for Deal of the Day.';
      } else {
        const now = new Date();
        const expiry = new Date(formData.expiryDate);
        if (expiry <= now) {
          errs.expiryDate = 'Expiry Date and Time must be in the future.';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      if (name === 'image') {
        const file = files[0];
        setFormData((f) => ({ ...f, image: file }));
        setImagePreview(file ? URL.createObjectURL(file) : '');
      } else if (name === 'brandLogo') {
        const file = files[0];
        setFormData((f) => ({ ...f, brandLogo: file }));
        setBrandLogoPreview(file ? URL.createObjectURL(file) : '');
      } else if (name === 'images') {
        // Multiple gallery images
        const fileArray = Array.from(files);
        setFormData((f) => ({ ...f, images: fileArray }));
        setGalleryPreviews(fileArray.map((file) => URL.createObjectURL(file)));
      }
    } else if (type === 'checkbox') {
      setFormData((f) => ({
        ...f,
        [name]: checked,
        ...(name === 'isDealOfDay' && !checked ? { expiryDate: '' } : {}),
      }));
    } else if (type === 'number') {
      setFormData((f) => ({ ...f, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData((f) => ({ ...f, [name]: value }));
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const payload = new FormData();

    // Append text and number fields
    const fieldsToAppend = [
      'name',
      'description',
      'category',
      'brand',
      'brandDescription',
      'dailyPrice',
      'offSalePrice',
      'stock',
      'expiryDate',
    ];

    fieldsToAppend.forEach((field) => {
      if (formData[field] !== null && formData[field] !== '') {
        if (field === 'expiryDate') {
          payload.append(field, new Date(formData.expiryDate).toISOString());
        } else {
          payload.append(field, formData[field]);
        }
      }
    });

    // Append booleans as strings
    payload.append('isFeatured', formData.isFeatured ? 'true' : 'false');
    payload.append('isDealOfDay', formData.isDealOfDay ? 'true' : 'false');

    // Append files if selected
    if (formData.image) {
      payload.append('image', formData.image);
    }
    if (formData.brandLogo) {
      payload.append('brandLogo', formData.brandLogo);
    }
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((file) => {
        payload.append('images', file);
      });
    }

    try {
      if (product?._id) {
        await axios.put(`${apiUrl}/api/products/${product._id}`, payload);
      } else {
        await axios.post(`${apiUrl}/api/products`, payload);
        navigate('/admin/products');
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to submit product:', error);
      alert('Error submitting product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6"
    >
        {/* Main Product Image */}
      <div>
        <label htmlFor="image" className="block mb-1 font-semibold text-gray-700">
          Product Image
        </label>
        <input
          id="image"
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          disabled={loading}
          className="w-full border rounded-md p-2 cursor-pointer text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Product Preview"
            className="mt-3 max-h-40 rounded-md object-contain border"
          />
        )}
      </div>
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block mb-1 font-semibold text-gray-700">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          placeholder="Enter product name"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.name ? 'border-red-500' : ''
          }`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block mb-1 font-semibold text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
          placeholder="Enter product description"
          rows={4}
          className={`w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.description ? 'border-red-500' : ''
          }`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block mb-1 font-semibold text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={loading}
          className={`w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.category ? 'border-red-500' : ''
          }`}
        >
          <option value="" disabled>
            Select category
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>

      {/* Brand Name */}
      <div>
        <label htmlFor="brand" className="block mb-1 font-semibold text-gray-700">
          Brand <span className="text-red-500">*</span>
        </label>
        <input
          id="brand"
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          disabled={loading}
          placeholder="Enter brand name"
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.brand ? 'border-red-500' : ''
          }`}
        />
        {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
      </div>

      {/* Brand Description */}
      <div>
        <label htmlFor="brandDescription" className="block mb-1 font-semibold text-gray-700">
          Brand Description
        </label>
        <textarea
          id="brandDescription"
          name="brandDescription"
          value={formData.brandDescription}
          onChange={handleChange}
          disabled={loading}
          placeholder="Enter description about the brand"
          rows={3}
          className="w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

       {/* Brand Logo Image */}
      <div>
        <label htmlFor="brandLogo" className="block mb-1 font-semibold text-gray-700">
          Brand Logo
        </label>
        <input
          id="brandLogo"
          type="file"
          name="brandLogo"
          accept="image/*"
          onChange={handleChange}
          disabled={loading}
          className="w-full border rounded-md p-2 cursor-pointer text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {brandLogoPreview && (
          <img
            src={brandLogoPreview}
            alt="Brand Logo Preview"
            className="mt-3 max-h-20 rounded-md object-contain border"
          />
        )}
      </div>

      {/* Stock */}
      <div>
        <label htmlFor="stock" className="block mb-1 font-semibold text-gray-700">
          Stock Quantity
        </label>
        <input
          id="stock"
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          disabled={loading}
          min={0}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.stock ? 'border-red-500' : ''
          }`}
        />
        {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dailyPrice" className="block mb-1 font-semibold text-gray-700">
            Daily Price
          </label>
          <input
            id="dailyPrice"
            type="number"
            name="dailyPrice"
            value={formData.dailyPrice}
            onChange={handleChange}
            disabled={loading}
            placeholder="₹0"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.dailyPrice ? 'border-red-500' : ''
            }`}
          />
          {errors.dailyPrice && <p className="text-red-500 text-sm mt-1">{errors.dailyPrice}</p>}
        </div>

        <div>
          <label htmlFor="offSalePrice" className="block mb-1 font-semibold text-gray-700">
            Off Sale Price
          </label>
          <input
            id="offSalePrice"
            type="number"
            name="offSalePrice"
            value={formData.offSalePrice}
            onChange={handleChange}
            disabled={loading}
            placeholder="₹0"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.offSalePrice ? 'border-red-500' : ''
            }`}
          />
          {errors.offSalePrice && <p className="text-red-500 text-sm mt-1">{errors.offSalePrice}</p>}
        </div>
      </div>

      {/* Featured and Deal Checkboxes */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 font-semibold text-gray-700">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            disabled={loading}
            className="h-5 w-5 text-green-600"
          />
          Featured Product
        </label>

        <label className="flex items-center gap-2 font-semibold text-gray-700">
          <input
            type="checkbox"
            name="isDealOfDay"
            checked={formData.isDealOfDay}
            onChange={handleChange}
            disabled={loading}
            className="h-5 w-5 text-green-600"
          />
          Deal of the Day
        </label>
      </div>

      {/* Expiry Date and Time (only for Deal) */}
      {formData.isDealOfDay && (
        <div>
          <label htmlFor="expiryDate" className="block mb-1 font-semibold text-gray-700">
            Expiry Date and Time <span className="text-red-500">*</span>
          </label>
          <input
            id="expiryDate"
            type="datetime-local"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.expiryDate ? 'border-red-500' : ''
            }`}
          />
          {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
        </div>
      )}

      

     

      {/* Gallery Images (multiple) */}
      <div>
        <label htmlFor="images" className="block mb-1 font-semibold text-gray-700">
          Additional Gallery Images
        </label>
        <input
          id="images"
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleChange}
          disabled={loading}
          className="w-full border rounded-md p-2 cursor-pointer text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="mt-3 flex flex-wrap gap-3 max-h-40 overflow-auto  rounded-md p-2">
          {galleryPreviews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Gallery Preview ${i + 1}`}
              className="h-20 w-20 object-contain rounded-md border"
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-green-600 text-white font-semibold py-3 rounded-md transition ${
          loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
        }`}
      >
        {loading ? (product ? 'Updating...' : 'Adding...') : product ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
};

export default ProductForm;
