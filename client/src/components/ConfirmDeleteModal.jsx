import React from 'react';

const ConfirmDeleteModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 text-center space-y-4">
        <h3 className="text-xl font-semibold">Are you sure?</h3>
        <p>This will permanently delete the product.</p>
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={onConfirm} className="btn btn-error">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
