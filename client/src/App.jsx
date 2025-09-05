import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/NavBar';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Admin/Products';
import AddProduct from './pages/Admin/AddProduct';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CartProvider from './components/context/CartProvider'; // ✅ import CartProvider
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AddressModal from './components/AddressModal';
import BrandDetails from './pages/BrandDetails';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <CartProvider> {/* ✅ Wrap entire app with CartProvider */}
<ToastContainer
        position="top-right"  // or 'bottom-left', 'bottom-right', etc.
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // or "light" or "dark"
      />      {!isAdminRoute && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
<Route path="/checkout" element={<Checkout />} />
<Route path="/address" element={<AddressModal/>}/>
<Route path="/brand/:brandName" element={<BrandDetails />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route
          path="/productdetails/:id"
          element={<ProductDetails key={location.pathname} />}
        />

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
              <AdminLayout>
                <Products />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/addproduct"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AddProduct />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all for unmatched routes */}
        <Route path="*" element={<h2 className="text-center mt-20">404: Page Not Found</h2>} />
      </Routes>
    </CartProvider>
  );
}

export default App;
