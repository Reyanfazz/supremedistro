import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AddressModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedAddress,
  addresses = [],        // <-- addresses passed as prop
  onAddressesChange,     // <-- callback to notify parent to refresh
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL || '';
  const { token } = useContext(AuthContext);

  useEffect(() => {
    // Reset form when modal opens or closes
    if (!isOpen) {
      setFormData({
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        postalCode: '',
        country: '',
      });
      setIsEditing(false);
      setEditingId(null);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const { fullName, phone, addressLine, city, postalCode, country } = formData;

    if (!fullName || !phone || !addressLine || !city || !postalCode || !country) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `${apiBase}/api/address/${editingId}`
        : `${apiBase}/api/address`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // <-- important
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save address');

      if (onAddressesChange) await onAddressesChange(); // notify parent to refresh
      setFormData({
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        postalCode: '',
        country: '',
      });
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (addr) => {
    setFormData(addr);
    setEditingId(addr._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await fetch(`${apiBase}/api/address/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete address');
      if (onAddressesChange) await onAddressesChange(); // notify parent to refresh
    } catch {
      alert('Failed to delete address');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-2xl rounded-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Select Shipping Address</h2>

        {/* Address List */}
        <div className="space-y-2 mb-6">
          {Array.isArray(addresses) && addresses.length > 0 ? (
            addresses.map((addr) => (
              <div
                key={addr._id}
                className={`border p-3 rounded flex items-start justify-between ${
                  selectedAddress?._id === addr._id ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                <div>
                  <p className="font-semibold">{addr.fullName} ({addr.phone})</p>
                  <p className="text-sm text-gray-700">
                    {addr.addressLine}, {addr.city}, {addr.postalCode}, {addr.country}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onSelect(addr)} className="text-blue-600 text-sm">Select</button>
                  <button onClick={() => handleEdit(addr)} className="text-yellow-600 text-sm">Edit</button>
                  <button onClick={() => handleDelete(addr._id)} className="text-red-600 text-sm">Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p>No saved addresses found.</p>
          )}
        </div>

        {/* Address Form */}
        <h3 className="text-lg font-semibold mb-2">{isEditing ? 'Edit Address' : 'Add New Address'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            name="addressLine"
            placeholder="Address"
            value={formData.addressLine}
            onChange={handleChange}
            className="border px-2 py-1 rounded col-span-full"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {isEditing ? 'Update' : 'Save'}
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
