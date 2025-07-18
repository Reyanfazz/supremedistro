import { Routes, Route, useLocation  } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/NavBar';
import './index.css';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Admin/Products';
import AddProduct from './pages/Admin/AddProduct';
function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <>
     {!isAdminRoute && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

       <Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute adminOnly={true}>
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/products"
  element={
    <ProtectedRoute adminOnly={true}>
      <AdminLayout><Products /></AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/addproduct"
  element={
    <ProtectedRoute adminOnly={true}>
      <AdminLayout><AddProduct /></AdminLayout>
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
