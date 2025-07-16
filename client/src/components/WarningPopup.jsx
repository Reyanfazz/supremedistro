// src/components/WarningPopup.jsx
import React, { useState, useEffect } from 'react';

const WarningPopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('warningAccepted');
    if (!accepted) setShow(true);
  }, []);

  const acceptWarning = () => {
    localStorage.setItem('warningAccepted', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-lg max-w-md text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-700">WARNING</h2>
        <p className="mb-6">
          This site contains products for adults only. Please confirm that you are 18 years or older.
        </p>
        <button
          onClick={acceptWarning}
          className="px-6 py-3 bg-red-700 text-white font-semibold rounded hover:bg-red-800 transition"
        >
          I Accept
        </button>
      </div>
    </div>
  );
};

export default WarningPopup;
