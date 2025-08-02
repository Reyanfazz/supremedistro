// src/components/CartDrawer.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import CartContext from "./context/CartContext";
import { FiX, FiTrash2 } from "react-icons/fi";

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);

  const totalAmount = cart.reduce(
    (acc, item) => acc + (item.offSalePrice || item.dailyPrice) * item.quantity,
    0
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-180px)]">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="flex gap-3 mb-4 border-b pb-3">
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-green-700 font-semibold text-sm">
                      ₹{(item.offSalePrice || item.dailyPrice).toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-xs">× {item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-2 bg-gray-200 rounded text-sm"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-2 bg-gray-200 rounded text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-gray-700">Subtotal:</span>
            <span className="font-bold text-lg text-green-700">₹{totalAmount.toFixed(2)}</span>
          </div>
          <Link
    to="/cart"
    onClick={onClose}
    className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
  >
    View Cart
  </Link>
  <Link
    to="/checkout"
    onClick={onClose}
    className="block text-center bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
  >
    Checkout
  </Link>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
