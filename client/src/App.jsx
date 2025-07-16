import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/NavBar';
import './index.css';

function App() {
  return (
    <>
      {/* If you want the header always visible, render it here */}
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Optional: catch-all for unmatched routes */}
        <Route path="*" element={<h2 className="text-center mt-20">404: Page Not Found</h2>} />
      </Routes>
    </>
  );
}

export default App;
