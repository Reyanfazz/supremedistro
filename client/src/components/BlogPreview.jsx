import React from "react";
import { Link } from "react-router-dom";

const samplePosts = [
  {
    id: "101",
    title: "New Vape Pen Launch This Month",
    snippet:
      "Discover the latest in vape technology with our new Vape Pen 2025 edition...",
  },
  {
    id: "102",
    title: "Understanding Nicotine Pouches",
    snippet:
      "Learn about the benefits and usage of nicotine pouches as a smokeless alternative...",
  },
  {
    id: "103",
    title: "Top 5 Smoking Accessories for Beginners",
    snippet:
      "Check out our curated list of must-have smoking accessories that enhance your experience...",
  },
];

const BlogPreview = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {samplePosts.map(({ id, title, snippet }) => (
        <Link
          to={`/blog/${id}`}
          key={id}
          className="block p-4 bg-white rounded shadow hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold text-blue-700">{title}</h3>
          <p className="mt-1 text-gray-600">{snippet}</p>
        </Link>
      ))}
    </div>
  );
};

export default BlogPreview;
