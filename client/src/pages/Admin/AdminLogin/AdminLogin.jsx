"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../../context/AuthContext"
import "./AdminLogin.css"

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin/dashboard")
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await axios.post("/api/admin/login", {
        email: formData.email,
        password: formData.password,
      })

      const { token, user: adminUser } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      if (typeof setUser === "function") {
        setUser(adminUser)
      }

      navigate("/admin/dashboard")
    } catch (error) {
      setError(error.response?.data?.message || "Invalid admin credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="container">
        <div className="admin-login-container">
          <div className="admin-login-form">
            <h2>Admin Login</h2>
            <p>Please login with your admin credentials</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Admin Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Admin Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-admin" disabled={loading}>
                {loading ? "Logging in..." : "Login as Admin"}
              </button>
            </form>

            <div className="admin-info">
              <p>
                <strong>Default Admin Credentials:</strong>
              </p>
              <p>Email: admin@ecommerce.com</p>
              <p>Password: admin123</p>
              <small>You can change these in the server .env file</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
