import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import ProductDetails from "../pages/ProductDetails";
import Contact from "../pages/Contact";
import About from "../pages/About";
import FAQs from "../pages/FAQs";
import Blog from "../pages/Blog";
import BlogPost from "../pages/BlogPost";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Account from "../pages/Account";
import Orders from "../pages/Orders";
import PrivacyPolicy from "../pages/Legal/PrivacyPolicy";
import Terms from "../pages/Legal/Terms";
import ModernSlavery from "../pages/Legal/ModernSlavery";
import OAuthSuccess from './pages/OAuthSuccess';
const AppRoutes = () => (
  <Routes>
    <Route path="/oauth-success" element={<OAuthSuccess />} />
    <Route path="/" element={<Home />} />
    <Route path="/shop" element={<Shop />} />
    <Route path="/product/:id" element={<ProductDetails />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
    <Route path="/faqs" element={<FAQs />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/:id" element={<BlogPost />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/account" element={<Account />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/legal/terms" element={<Terms />} />
    <Route path="/legal/modern-slavery" element={<ModernSlavery />} />
  </Routes>
);

export default AppRoutes;
