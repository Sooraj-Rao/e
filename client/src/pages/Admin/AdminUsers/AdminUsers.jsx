"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../../context/AuthContext"
import "./AdminUsers.css"

const AdminUsers = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin")
      return
    }
    fetchUsers()
  }, [user, navigate])

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      await axios.put(`/api/users/${editingUser._id}`, formData)
      setSuccess("User updated successfully!")
      fetchUsers()
      closeModal()
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user")
    }
  }

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit)
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
    })
    setShowModal(true)
  }

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This will also delete all their orders.")) {
      try {
        await axios.delete(`/api/users/${userId}`)
        setSuccess("User and associated orders deleted successfully!")
        fetchUsers()
      } catch  {
        setError("Failed to delete user")
      }
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
    })
    setError("")
  }

  if (loading) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div className="admin-users">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Users</h1>
          <div className="user-stats">
            <span className="stat">
              Total Users: <strong>{users.length}</strong>
            </span>
          </div>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem._id}>
                  <td>
                    <div className="user-info">
                      <strong>{userItem.name}</strong>
                    </div>
                  </td>
                  <td>{userItem.email}</td>
                  <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(userItem)} className="btn  btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(userItem._id)} className="btn btn-danger btn-sm">
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
                <h2>Edit User</h2>
                <button onClick={closeModal} className="close-btn">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Update User
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

export default AdminUsers
