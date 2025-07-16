import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto mt-20 p-6">
      <h1 className="text-3xl mb-4">Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      {user?.role === 'admin' && (
        <div className="mt-6 p-4 border rounded bg-yellow-100">
          <h2 className="text-xl mb-2">Admin Dashboard</h2>
          <p>Admin-specific controls and stats go here.</p>
        </div>
      )}

      {user?.role === 'user' && (
        <div className="mt-6 p-4 border rounded bg-green-100">
          <h2 className="text-xl mb-2">User Dashboard</h2>
          <p>Standard user info and options here.</p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
