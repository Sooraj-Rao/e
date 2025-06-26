"use client";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product, viewMode }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-link">
        <div style={{ display: viewMode == "list" ? "flex" : "" }}>
          <div className="product-image">
            <img
              src={`/uploads/${product.image}`}
              alt={product.title}
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=200&width=200";
              }}
            />
            {product.stock <= 0 && (
              <div className="out-of-stock">Out of Stock</div>
            )}
          </div>

          <div className="product-info">
            <h4 style={{ fontSize: "1.2rem" }}>
              {product.title.length < 15
                ? product.title
                : product.title.slice(0, 15)}
            </h4>
            <p className="product-category" style={{ fontSize: "12px" }}>
              {product.category}
            </p>
            {viewMode == "list" && (
              <div className="product-stock">
                {product.description.slice(0, 80)}
              </div>
            )}
            <div className="product-price">₹{product.price.toFixed(2)}</div>

            <div className="product-stock">Stock: {product.stock}</div>
          </div>
        </div>
        <button className="add-to-cart-btn">View</button>
      </Link>
    </div>
  );
};

export default ProductCard;
