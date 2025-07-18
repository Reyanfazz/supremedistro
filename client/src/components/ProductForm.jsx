import React, { useState, useEffect } from 'react';
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
    dailyPrice: product?.dailyPrice || '',
    offSalePrice: product?.offSalePrice || '',
    isFeatured: product?.isFeatured || false,
    isDealOfDay: product?.isDealOfDay || false,
    expiryDate: product?.expiryDate ? product.expiryDate.substring(0, 16) : '', // Format for datetime-local input
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Set image preview when editing existing product
  useEffect(() => {
    if (product?.image) {
      setImagePreview(`${apiUrl}/uploads/${product.image}`);
    }
  }, [product, apiUrl]);

  // Validate inputs, return true if valid
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    if (!formData.category) errs.category = 'Category is required.';
    if (formData.dailyPrice === '' || formData.dailyPrice < 0)
      errs.dailyPrice = 'Daily price must be 0 or greater.';
    if (formData.offSalePrice !== '' && formData.offSalePrice < 0)
      errs.offSalePrice = 'Off sale price must be 0 or greater.';

    if (formData.isDealOfDay) {
      if (!formData.expiryDate) {
        errs.expiryDate = 'Expiry Date and Time is required for Deal of the Day.';
      } else {
        // Check expiryDate is in the future
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

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData((f) => ({ ...f, image: file }));
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview('');
      }
    } else if (type === 'checkbox') {
      setFormData((f) => ({
        ...f,
        [name]: checked,
        ...(name === 'isDealOfDay' && !checked ? { expiryDate: '' } : {}),
      }));
    } else {
      setFormData((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const payload = new FormData();

    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== '') {
        if (key === 'expiryDate') {
          payload.append(key, new Date(formData.expiryDate).toISOString());
        } else if (key === 'isFeatured' || key === 'isDealOfDay') {
          payload.append(key, formData[key] ? 'true' : 'false');
        } else {
          payload.append(key, formData[key]);
        }
      }
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
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
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
          placeholder="Enter product name"
          disabled={loading}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
          placeholder="Enter product description"
          disabled={loading}
          rows={4}
          className={`w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
          className={`w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
            placeholder="₹0"
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
            placeholder="₹0"
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.offSalePrice ? 'border-red-500' : ''
            }`}
          />
          {errors.offSalePrice && <p className="text-red-500 text-sm mt-1">{errors.offSalePrice}</p>}
        </div>
      </div>

      {/* Featured checkbox */}
      <div className="flex items-center space-x-4">
        <input
          id="isFeatured"
          type="checkbox"
          name="isFeatured"
          checked={formData.isFeatured}
          onChange={handleChange}
          disabled={loading}
          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="isFeatured" className="font-semibold text-gray-700">
          Featured Product
        </label>
      </div>

      {/* Deal of the Day checkbox */}
      <div className="flex items-center space-x-4">
        <input
          id="isDealOfDay"
          type="checkbox"
          name="isDealOfDay"
          checked={formData.isDealOfDay}
          onChange={handleChange}
          disabled={loading}
          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="isDealOfDay" className="font-semibold text-gray-700">
          Deal of the Day
        </label>
      </div>

      {/* Expiry Date and Time input (shown only if Deal of the Day checked) */}
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
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.expiryDate ? 'border-red-500' : ''
            }`}
          />
          {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
        </div>
      )}

      {/* Image upload */}
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
            alt="Preview"
            className="mt-3 max-h-40 rounded-md object-contain border"
          />
        )}
      </div>

      {/* Submit button */}
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
