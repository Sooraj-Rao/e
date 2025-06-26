"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import BillModal from "../../../components/BillModal/BillModal";
import "./AdminOrders.css";

const AdminOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      setSuccess("Order status updated successfully!");
      fetchOrders();
    } catch {
      setError("Failed to update order status");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.put(`/api/orders/${orderId}/cancel`, {
        reason: cancelReason || "Cancelled by admin",
      });

      setSuccess("Order cancelled successfully!");
      fetchOrders();
      setCancellingOrder(null);
      setCancelReason("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleViewBill = (order) => {
    setSelectedOrder(order);
    setShowBill(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ffc107";
      case "confirmed":
        return "#007bff";
      case "shipped":
        return "#17a2b8";
      case "delivered":
        return "#28a745";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const canCancelOrder = (order) => {
    return order.status === "pending" || order.status === "confirmed";
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Orders</h1>
          <div className="filter-section">
            <label>Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>#{order._id.slice(-8)}</strong>
                  </td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.customerDetails.name}</strong>
                      <p>{order.customerDetails.email}</p>
                      <p>{order.customerDetails.phone}</p>
                    </div>
                  </td>
                  <td>
                    <div className="order-items">
                      {order?.items?.slice(0, 2).map((item) => {
                        const isDeleted = !item.product;
                        return (
                          <div key={item._id} className="item-preview">
                            <img
                              src={
                                isDeleted
                                  ? "/placeholder.svg?height=30&width=30"
                                  : `/uploads/${item.product.image}`
                              }
                              alt={
                                isDeleted
                                  ? "Deleted Product"
                                  : item.product.title
                              }
                              className="item-thumbnail"
                              onError={(e) => {
                                e.target.src =
                                  "/placeholder.svg?height=30&width=30";
                              }}
                            />
                            <span
                              style={{
                                color: isDeleted ? "#dc3545" : "inherit",
                              }}
                            >
                              {isDeleted
                                ? "Product deleted"
                                : `${item.product.title} (x${item.quantity})`}
                            </span>
                          </div>
                        );
                      })}
                      {order.items.length > 2 && (
                        <div className="more-items">
                          +{order.items.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong className="amount">
                      ₹{order.totalAmount.toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    {order.status === "cancelled" ? (
                      <span className="status-badge cancelled">Cancelled</span>
                    ) : (
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        className="status-select"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    )}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewBill(order)}
                        className="btn  btn-sm"
                      >
                        View Bill
                      </button>
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => setCancellingOrder(order._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="no-orders">
              <p>No orders found for the selected filter.</p>
            </div>
          )}
        </div>

        {showBill && selectedOrder && (
          <BillModal
            order={selectedOrder}
            onClose={() => {
              setShowBill(false);
              setSelectedOrder(null);
            }}
          />
        )}

        {cancellingOrder && (
          <div className="modal">
            <div className="modal-content">
              <h3>Cancel Order</h3>
              <p>Are you sure you want to cancel this order?</p>

              <div className="form-group">
                <label>Reason for cancellation:</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => {
                    setCancellingOrder(null);
                    setCancelReason("");
                  }}
                  className="btn btn-secondary"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => handleCancelOrder(cancellingOrder)}
                  className="btn btn-danger"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
