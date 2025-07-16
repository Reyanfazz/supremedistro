import React from "react";

const brandLogos = [
  "/images/brands/brand1.png",
  "/images/brands/brand2.png",
  "/images/brands/brand3.png",
  "/images/brands/brand4.png",
  "/images/brands/brand5.png",
];

const BrandsLogos = () => {
  return (
    <div className="flex overflow-x-auto space-x-6 py-4 px-2 bg-white rounded shadow">
      {brandLogos.map((logo, idx) => (
        <img
          key={idx}
          src={logo}
          alt={`Brand ${idx + 1}`}
          className="h-16 object-contain"
          loading="lazy"
        />
      ))}
    </div>
  );
};

export default BrandsLogos;
