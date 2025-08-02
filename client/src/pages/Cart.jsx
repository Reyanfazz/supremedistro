import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../components/context/CartContext';

const Cart = () => {
  const { cart = [], updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);

  // Load selected items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('selectedItems');
    if (stored) {
      setSelectedItems(JSON.parse(stored));
    } else {
      setSelectedItems(cart.map((item) => item._id));
    }
  }, [cart]);

  // Persist selected items to localStorage
  useEffect(() => {
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
  }, [selectedItems]);

  const isSelected = (id) => selectedItems.includes(id);

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item._id));
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    alert('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    alert('Cart cleared');
  };

  const estimateDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate.toDateString();
  };

  const selectedCartItems = cart.filter((item) => selectedItems.includes(item._id));

  const total = selectedCartItems.reduce(
    (acc, item) => acc + (item.offSalePrice || item.dailyPrice) * item.quantity,
    0
  );

  const originalTotal = selectedCartItems.reduce(
    (acc, item) => acc + item.dailyPrice * item.quantity,
    0
  );

  const savings = originalTotal - total;

  const totalQuantity = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

  const proceedToCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert('Please select at least one item to proceed.');
      return;
    }
    navigate('/checkout', { state: { items: selectedCartItems } });
  };

  return (
    <div className="max-w-7xl mt-10 mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={selectedItems.length === cart.length}
                onChange={toggleSelectAll}
              />
              <span className="text-sm font-medium">Select All</span>
            </div>

            {cart.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row border rounded-lg p-4 shadow-sm items-start gap-4"
              >
                <input
                  type="checkbox"
                  checked={isSelected(item._id)}
                  onChange={() => toggleSelectItem(item._id)}
                />
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                  alt={item.name}
                  className="w-28 h-28 object-cover rounded"
                />
                <div className="flex-1 space-y-2">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-600">
                    Price:{' '}
                    <span className="text-green-700 font-medium">
                      ₹{item.offSalePrice || item.dailyPrice}
                    </span>
                  </p>
                  {item.offSalePrice && (
                    <p className="text-sm text-gray-500 line-through">₹{item.dailyPrice}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Estimated Delivery:{' '}
                    <span className="text-black">{estimateDelivery()}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Qty:</span>
                    <button
                      className="px-2 bg-gray-200 rounded"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-2 bg-gray-200 rounded"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="ml-4 text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-right font-bold text-green-700">
                    ₹{(item.offSalePrice || item.dailyPrice) * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-4 bg-white border rounded-lg p-6 shadow-md space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Order Summary</h2>
              <p className="flex justify-between">
                <span>Items ({selectedCartItems.length})</span>
                <span>Qty: {totalQuantity}</span>
              </p>
              <p className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </p>
              {savings > 0 && (
                <p className="flex justify-between text-sm text-green-600">
                  <span>You Save:</span>
                  <span>₹{savings.toFixed(2)}</span>
                </p>
              )}
              <hr />
              <div className="space-y-2">
                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-500 font-semibold transition"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={handleClearCart}
                  className="w-full bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 transition"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
