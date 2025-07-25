import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ProductForm from '../../components/ProductForm';

const Products = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/products/${id}`);
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error('Delete error', error);
    }
  };

  // Helper to format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">All Products</h2>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-sm text-gray-800">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-left">Brand Logo</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Daily Price</th>
              <th className="px-4 py-3 text-left">Off Sale</th>
              <th className="px-4 py-3 text-left">Featured</th>
              <th className="px-4 py-3 text-left">Deal of the Day</th>
              <th className="px-4 py-3 text-left">Expiry Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  {p.image ? (
                    <img
                      src={`${apiUrl}/uploads/${p.image}`}
                      alt={p.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.brand}</td>
                <td className="px-4 py-3">
                  {p.brandLogo ? (
                    <img
                      src={`${apiUrl}/uploads/${p.brandLogo}`}
                      alt={`${p.brand} logo`}
                      className="h-8 w-8 object-contain rounded"
                    />
                  ) : (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">{p.stock ?? 0}</td>
                <td className="px-4 py-3">₹{p.dailyPrice}</td>
                <td className="px-4 py-3">{p.offSalePrice ? `₹${p.offSalePrice}` : '-'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                      p.isFeatured ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {p.isFeatured ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                      p.isDealOfDay ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {p.isDealOfDay ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(p.expiryDate)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4">
          <div
            className="bg-white rounded-xl shadow-lg p-6 relative animate-fadeIn
                w-full max-w-lg mx-auto
                max-h-[90vh] overflow-auto
                "
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setEditingProduct(null)}
            >
              &times;
            </button>

            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setEditingProduct(null);
                fetchProducts();
              }}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setEditingProduct(null)}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(editingProduct._id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
