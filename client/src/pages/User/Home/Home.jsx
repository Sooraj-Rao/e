"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import ProductCard from "../../../components/ProductCard/ProductCard"
import "./Home.css"

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products")
      setProducts(response.data.slice(0, 8))
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading products...</div>
  }

  return (
    <div className="home">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Our Store</h1>
            <p>Discover amazing products at great prices</p>
            <Link to="/products" className="hero-btn">
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="featured-section">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all-btn">
              View All Products →
            </Link>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="explore-more">
            <Link to="/products" className="btn btn-primary">
              Explore More Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
