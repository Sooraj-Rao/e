"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../../../components/ProductCard/ProductCard";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); 
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    sort: "newest",
    priceRange: "all",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
      const uniqueCategories = [
        ...new Set(response.data.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (filters.category !== "all") {
      filtered = filtered.filter(
        (product) => product.category === filters.category
      );
    }

    if (filters.search) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    if (filters.priceRange !== "all") {
      switch (filters.priceRange) {
        case "under-50":
          filtered = filtered.filter((product) => product.price < 50);
          break;
        case "50-100":
          filtered = filtered.filter(
            (product) => product.price >= 50 && product.price <= 100
          );
          break;
        case "100-500":
          filtered = filtered.filter(
            (product) => product.price > 100 && product.price <= 500
          );
          break;
        case "above-500":
          filtered = filtered.filter((product) => product.price > 500);
          break;
      }
    }

    switch (filters.sort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      search: "",
      sort: "newest",
      priceRange: "all",
    });
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1>All Products</h1>
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>
          </div>
        </div>

        <div className="products-layout">
          <div className="sidebar">
            <div className="filter-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="clear-btn">
                Clear All
              </button>
            </div>

            <div className="filter-section">
              <div>
                <h4>Categories</h4>
                <div className="category-filters">
                  <button
                    className={`category-btn ${
                      filters.category === "all" ? "active" : ""
                    }`}
                    onClick={() => handleFilterChange("category", "all")}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`category-btn ${
                        filters.category === category ? "active" : ""
                      }`}
                      onClick={() => handleFilterChange("category", category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-section">
              <div>
                <h4>Price Range</h4>
                <div className="price-filters">
                  <button
                    className={`price-btn ${
                      filters.priceRange === "all" ? "active" : ""
                    }`}
                    onClick={() => handleFilterChange("priceRange", "all")}
                  >
                    All Prices
                  </button>
                  <button
                    className={`price-btn ${
                      filters.priceRange === "under-50" ? "active" : ""
                    }`}
                    onClick={() => handleFilterChange("priceRange", "under-50")}
                  >
                    Under ₹50
                  </button>
                  <button
                    className={`price-btn ${
                      filters.priceRange === "50-100" ? "active" : ""
                    }`}
                    onClick={() => handleFilterChange("priceRange", "50-100")}
                  >
                    ₹50 - ₹100
                  </button>
                  <button
                    className={`price-btn ${
                      filters.priceRange === "100-500" ? "active" : ""
                    }`}
                    onClick={() => handleFilterChange("priceRange", "100-500")}
                  >
                    ₹100 - ₹500
                  </button>
                  <button
                    className={`price-btn ${
                      filters.priceRange === "above-500" ? "active" : ""
                    }`}
                    onClick={() =>
                      handleFilterChange("priceRange", "above-500")
                    }
                  >
                    Above ₹500
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="main-content">
            <div className="products-header">
              <div className="results-info">
                Showing {filteredProducts.length} of {products.length} products
              </div>

              <div className="header-controls">
                <div className="view-toggle">
                  <button
                    className={`view-btn ${
                      viewMode === "grid" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                  >
                    ⊞
                  </button>
                  <button
                    className={`view-btn ${
                      viewMode === "list" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("list")}
                    title="List View"
                  >
                    ☰
                  </button>
                </div>

                <div className="sort-section">
                  <label>Sort by:</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className={`products-grid ${viewMode}`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
