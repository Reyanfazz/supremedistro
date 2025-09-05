// src/pages/BrandDetails.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import CartContext from "../components/context/CartContext";

const BrandDetails = () => {
  const { brandName } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [brand, setBrand] = useState({
    name: brandName,
    logo: "",
    description: "",
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandAndProducts = async () => {
      try {
        setLoading(true);

        // 1. Fetch products for this brand
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products?brand=${encodeURIComponent(
            brandName
          )}`
        );

        const fetchedProducts = res.data || [];
        setProducts(fetchedProducts);

        if (fetchedProducts.length > 0) {
          // Pick first product with brand details
          const firstWithDesc =
            fetchedProducts.find(
              (p) =>
                (p.brandDescription && p.brandDescription.trim() !== "") ||
                p.brandLogo
            ) || fetchedProducts[0];

          setBrand({
            name: firstWithDesc.brand || brandName,
            logo: firstWithDesc.brandLogo || "",
            description:
              firstWithDesc.brandDescription?.trim() ||
              "No description available.",
          });
        } else {
          // 2. Fallback → fetch brand details separately if no products
          try {
            const brandRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/brands/${encodeURIComponent(
                brandName
              )}`
            );

            setBrand({
              name: brandRes.data?.name || brandName,
              logo: brandRes.data?.logo || "",
              description:
                brandRes.data?.description || "No description available.",
            });
          } catch (brandError) {
            console.warn("No separate brand info found:", brandError);
            setBrand({
              name: brandName,
              logo: "",
              description: "No description available.",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching brand info and products:", error);
        setProducts([]);
        setBrand({
          name: brandName,
          logo: "",
          description: "No description available.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBrandAndProducts();
  }, [brandName]);

  if (loading) {
    return (
      <div className="text-white text-center py-20 text-xl">
        Loading brand details...
      </div>
    );
  }

  return (
    <div className="mt-20 mb-20 max-w-7xl mx-auto p-4">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        {brand.logo && (
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/${brand.logo}`}
            alt={brand.name}
            className="h-20 w-20 object-contain mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-white">{brand.name}</h1>
        <p className="text-gray-300 mt-2 max-w-2xl">{brand.description}</p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <p className="text-gray-400 text-center">
          No products available for this brand.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white text-black rounded-xl shadow-md cursor-pointer hover:shadow-xl transition-shadow flex flex-col"
              onClick={() => navigate(`/productdetails/${p._id}`)}
            >
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${p.image}`}
                alt={p.name}
                className="h-40 w-full object-cover rounded-t-xl"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold line-clamp-1">{p.name}</h3>
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                  {p.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="font-bold text-lg">₹{p.dailyPrice}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p);
                    }}
                    className="bg-[#C60E0E] hover:bg-red-700 text-white p-2 rounded-full"
                    aria-label={`Add ${p.name} to cart`}
                  >
                    <FiShoppingCart />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandDetails;
