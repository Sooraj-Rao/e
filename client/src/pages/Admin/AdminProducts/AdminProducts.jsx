"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../../context/AuthContext"
import "./AdminProducts.css"

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing & Fashion",
  "Mobile & accessories",
  "Home & Kitchen",
  "Books & Stationery",
  "Sports & Fitness",
  "Beauty & Personal Care",
  "Toys & Games",
  "Automotive",
  "Health & Wellness",
  "Food & Beverages",
  "Agriculture"
]
const AdminProducts = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin")
      return
    }
    fetchProducts()
  }, [user, navigate])

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products")
      setProducts(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] })
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const submitData = new FormData()
    submitData.append("title", formData.title)
    submitData.append("description", formData.description)
    submitData.append("price", formData.price)
    submitData.append("category", formData.category)
    submitData.append("stock", formData.stock)
    if (formData.image) {
      submitData.append("image", formData.image)
    }

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setSuccess("Product updated successfully!")
      } else {
        await axios.post("/api/products", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setSuccess("Product added successfully!")
      }

      fetchProducts()
      resetForm()
      setShowModal(false)
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save product")
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: null,
    })
    setShowModal(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products/${productId}`)
        setSuccess("Product deleted successfully!")
        fetchProducts()
      } catch  {
        setError("Failed to delete product")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: null,
    })
    setEditingProduct(null)
    setError("")
    setSuccess("")
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  if (loading) {
    return <div className="loading">Loading products...</div>
  }

  return (
    <div className="admin-products">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Products</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-success">
            Add New Product
          </button>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={`/uploads/${product.image}`}
                      alt={product.title}
                      className="product-thumbnail"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=50&width=50"
                      }}
                    />
                  </td>
                  <td>
                    <div className="product-info">
                      <strong>{product.title}</strong>
                      <p>{product.description.substring(0, 50)}...</p>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>₹{product.price.toFixed(2)}</td>
                  <td>
                    <span className={`stock-badge ${product.stock <= 5 ? "low-stock" : ""}`}>{product.stock}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(product)} className="btn  btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={closeModal} className="close-btn">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                  <label htmlFor="title">Product Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock">Stock *</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select a category</option>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="image">Product Image {!editingProduct && "*"}</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    required={!editingProduct}
                  />
                  {editingProduct && <small>Leave empty to keep current image</small>}
                </div>

                <div className="form-actions">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
