// src/pages/Checkout.jsx
import { useContext, useState, useEffect } from 'react';
import CartContext from '../components/context/CartContext';
import AddressModal from '../components/AddressModal';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, selectedItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const selectedProducts = cart.filter(item => selectedItems.includes(item._id));
  const totalAmount = selectedProducts.reduce(
    (acc, item) => acc + (item.offSalePrice || item.dailyPrice) * item.quantity,
    0
  );
  const totalSavings = selectedProducts.reduce(
    (acc, item) => acc + ((item.dailyPrice - (item.offSalePrice || item.dailyPrice)) * item.quantity),
    0
  );

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const storedAddress = localStorage.getItem('selectedAddress');
    if (storedAddress) {
      setSelectedAddress(JSON.parse(storedAddress));
    }
  }, []);

  useEffect(() => {
    // Fetch saved addresses from backend API
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token'); // adjust if your token is stored differently
        const res = await fetch('/api/addresses', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch addresses');
        const data = await res.json();
        setAddresses(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAddresses();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return alert('Please select a shipping address.');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: selectedProducts.map((p) => ({
            product: p._id,
            quantity: p.quantity,
          })),
          shippingAddress: selectedAddress,
          totalAmount,
          paymentMethod: 'Cash On Delivery',
        }),
      });
      if (!res.ok) throw new Error('Order failed');
      alert('Order placed successfully!');
      clearCart();
      localStorage.removeItem('selectedAddress');
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {/* Address section */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <button onClick={() => setShowAddressModal(true)} className="text-blue-600 text-sm">
            {selectedAddress ? 'Change Address' : 'Add Address'}
          </button>
        </div>
        {selectedAddress ? (
          <div className="border p-3 rounded mt-2">
            <p className="font-semibold">{selectedAddress.fullName} ({selectedAddress.phone})</p>
            <p className="text-sm text-gray-700">
              {selectedAddress.addressLine}, {selectedAddress.city}, {selectedAddress.postalCode}, {selectedAddress.country}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 mt-2">No address selected.</p>
        )}
      </div>

      {/* Product summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
        {selectedProducts.length === 0 ? (
          <p className="text-gray-500">No items selected.</p>
        ) : (
          <div className="space-y-2">
            {selectedProducts.map((item) => (
              <div key={item._id} className="flex items-center gap-4 border p-2 rounded">
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${item.image}`}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="text-green-700 font-semibold">
                  ₹{(item.offSalePrice || item.dailyPrice) * item.quantity}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total Section */}
      <div className="border-t pt-4 flex flex-col gap-2 text-right">
        <p>Total Amount: <span className="font-bold text-lg text-green-700">₹{totalAmount.toFixed(2)}</span></p>
        {totalSavings > 0 && (
          <p className="text-sm text-red-600">You saved ₹{totalSavings.toFixed(2)} today!</p>
        )}
        <button
          onClick={handlePlaceOrder}
          className={`mt-4 px-6 py-2 rounded text-white ${!selectedAddress ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          disabled={selectedProducts.length === 0 || !selectedAddress}
        >
          Place Order
        </button>
      </div>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addresses={addresses}  /* Pass the fetched addresses */
        onSelect={(addr) => {
          setSelectedAddress(addr);
          localStorage.setItem('selectedAddress', JSON.stringify(addr));
          setShowAddressModal(false);
        }}
        selectedAddress={selectedAddress}
      />
    </div>
  );
};

export default Checkout;
