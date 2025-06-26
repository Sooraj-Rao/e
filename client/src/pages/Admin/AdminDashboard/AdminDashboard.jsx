"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../../context/AuthContext"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin")
      return
    }
    fetchDashboardData()
  }, [user, navigate])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        axios.get("/api/products"),
        axios.get("/api/orders"),
        axios.get("/api/users"),
      ])

      const products = productsRes.data
      const orders = ordersRes.data
      const users = usersRes.data

      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue,
      })

      setRecentOrders(orders.slice(0, 5))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon products">📦</div>
            <div className="stat-info">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">📋</div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon users">👥</div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">💰</div>
            <div className="stat-info">
              <h3>₹{stats.totalRevenue}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/admin/products" className="btn action-btn">
                Manage Products
              </Link>
              <Link to="/admin/orders" className="btn action-btn">
                View Orders
              </Link>
              <Link to="/admin/users" className="btn action-btn">
                Manage Users
              </Link>
            </div>
          </div>

          <div className="recent-orders">
            <h2>Recent Orders</h2>
            {recentOrders.length > 0 ? (
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-8)}</td>
                        <td>{order.customerDetails.name}</td>
                        <td>₹{order.totalAmount.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
