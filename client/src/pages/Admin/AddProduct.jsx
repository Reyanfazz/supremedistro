import React from 'react';
import ProductForm from '../../components/ProductForm';

const AddProduct = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Product</h2>
      <ProductForm />
    </div>
  );
};

export default AddProduct;
