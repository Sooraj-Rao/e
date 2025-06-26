"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);
  console.log("redner");
  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders/my-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.put(`/api/orders/${orderId}/cancel`, {
        reason: cancelReason || "Customer requested cancellation",
      });

      alert("Order cancelled successfully!");
      fetchOrders();
      setCancellingOrder(null);
      setCancelReason("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
    }
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

  if (!user) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="not-logged-in">
            <h2>Please log in to view your orders</h2>
            <Link to="/login" className="btn">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>

        {orders?.length === 0 ? (
          <div className="no-orders">
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet.</p>
            <Link to="/" className="btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders?.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order._id.slice(-8)}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order?.items?.slice(0, 3).map((item, idx) => (
                    <div key={item._id || idx} className="order-item">
                      <img
                        src={
                          item.product?.image
                            ? `/uploads/${item.product.image}`
                            : "/placeholder.svg"
                        }
                        alt={item.product?.title || "Deleted Product"}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=50&width=50";
                        }}
                      />

                      <div className="item-details">
                        {item.product ? (
                          <>
                            <span className="item-name">
                              {item.product.title}
                            </span>
                            <span className="item-quantity">
                              Qty: {item.quantity}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="item-name deleted">
                              Product no longer available
                            </span>
                            <span className="item-quantity">
                              Qty: {item.quantity}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="more-items">
                      +{order.items.length - 3} more item
                      {order.items.length - 3 > 1 && "s"}
                    </div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: ₹{order.totalAmount.toFixed(2)}</strong>
                  </div>
                  <div className="order-actions">
                    <Link
                      to={`/order/${order._id}`}
                      className="btn btn-success"
                    >
                      View Details
                    </Link>
                    {canCancelOrder(order) && (
                      <button
                        onClick={() => setCancellingOrder(order._id)}
                        className="btn btn-danger"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {order.status === "cancelled" && (
                  <div className="cancellation-info">
                    <p>
                      <strong>Cancelled:</strong>{" "}
                      {new Date(order.cancelledAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Reason:</strong> {order.cancellationReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {cancellingOrder && (
          <div className="modal">
            <div className="modal-content">
              <h3>Cancel Order</h3>
              <p>Are you sure you want to cancel this order?</p>

              <div className="form-group">
                <label>Reason for cancellation (optional):</label>
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

export default Orders;
