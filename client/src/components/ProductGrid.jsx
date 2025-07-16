import React from "react";
import { Link } from "react-router-dom";

const sampleProducts = [
  {
    id: "1",
    title: "Vape Pen 5000 Puffs - 3 Units",
    price: "£29.99",
    image: "/images/products/vape-pen.jpg",
  },
  {
    id: "2",
    title: "Nicotine Pouches - Cool Mint",
    price: "£9.99",
    image: "/images/products/nicotine-pouch.jpg",
  },
  {
    id: "3",
    title: "Smoking Accessory Kit",
    price: "£15.99",
    image: "/images/products/smoking-kit.jpg",
  },
  {
    id: "4",
    title: "E-Liquid Strawberry Flavor 50ml",
    price: "£12.99",
    image: "/images/products/e-liquid.jpg",
  },
];

const ProductGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {sampleProducts.map(({ id, title, price, image }) => (
        <Link
          to={`/product/${id}`}
          key={id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <div className="p-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-gray-700 mt-1">{price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
