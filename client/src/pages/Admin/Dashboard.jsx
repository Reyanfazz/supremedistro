import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiBox, FiShoppingCart, FiClock } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/admin/dashboard-stats`);
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, [apiUrl]);

  if (!stats) {
    return (
      <div className="p-6 text-gray-600 font-medium">Loading dashboard...</div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border-l-4 border-blue-500">
          <div className="flex items-center space-x-4">
            <FiBox className="text-3xl text-blue-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border-l-4 border-green-500">
          <div className="flex items-center space-x-4">
            <FiShoppingCart className="text-3xl text-green-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Orders This Week</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrdersThisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border-l-4 border-yellow-500">
          <div className="flex items-center space-x-4">
            <FiClock className="text-3xl text-yellow-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Recent Orders</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.recentOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl overflow-hidden shadow">
          <thead className="bg-gray-100 text-left text-sm text-gray-600 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-200">
            {stats.recentOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-3 font-mono text-blue-700">{order._id.slice(-6)}</td>
                <td className="px-6 py-3">{order.user?.name || 'Unknown'}</td>
                <td className="px-6 py-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
