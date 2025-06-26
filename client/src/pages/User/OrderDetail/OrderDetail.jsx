"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BillModal from "../../../components/BillModal/BillModal";
import "./OrderDetail.css";
import { useAuth } from "../../../context/AuthContext";

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBill, setShowBill] = useState(false);

  useEffect(() => {
    if (user && id) fetchOrder();
  }, [id, user]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
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
      default:
        return "#6c757d";
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="loading">Order not found</div>;
  }

  console.log(order)
  return (
    <div className="order-detail-page">
      <div className="container">
        <div className="order-detail-header">
          <h1>Order Details</h1>
          <button
            onClick={() => setShowBill(true)}
            className="btn "
          >
            View Bill
          </button>
        </div>

        <div className="order-detail-content">
          <div className="order-info-section">
            <div className="order-summary-card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Order ID:</span>
                <span>#{order._id.slice(-8)}</span>
              </div>
              <div className="summary-row">
                <span>Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="summary-row">
                <span>Status:</span>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="summary-row">
                <span>Total Amount:</span>
                <span className="total-amount">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="customer-details-card">
              <h2>Customer Details</h2>
              <div className="detail-row">
                <span>Name:</span>
                <span>{order.customerDetails.name}</span>
              </div>
              <div className="detail-row">
                <span>Email:</span>
                <span>{order.customerDetails.email}</span>
              </div>
              <div className="detail-row">
                <span>Phone:</span>
                <span>{order.customerDetails.phone}</span>
              </div>
              <div className="detail-row">
                <span>Address:</span>
                <span>{order.customerDetails.address}</span>
              </div>
            </div>
          </div>

          <div className="order-items-section">
            <h2>Order Items</h2>
            <div className="items-list">
              {order.items.map((item, idx) => {
                const isDeleted = !item.product;

                return (
                  <div key={item._id || idx} className="order-item-detail">
                    <div className="item-image">
                      <img
                        src={
                          isDeleted
                            ? "/placeholder.svg?height=100&width=100"
                            : `/uploads/${item.product.image}`
                        }
                        alt={isDeleted ? "Deleted Product" : item.product.title}
                        onError={(e) => {
                          e.target.src =
                            "/placeholder.svg?height=100&width=100";
                        }}
                      />
                    </div>
                    <div className="item-info">
                      <h3>
                        {isDeleted
                          ? "Product no longer available"
                          : item.product.title}
                      </h3>
                      {!isDeleted && (
                        <>
                          <p className="item-category">
                            {item.product.category}
                          </p>
                          <p className="item-description">
                            {item.product.description}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="item-pricing">
                      <div className="price-row">
                        <span>Price:</span>
                        <span>₹{item.price.toFixed(2)}</span>
                      </div>
                      <div className="price-row">
                        <span>Quantity:</span>
                        <span>{item.quantity}</span>
                      </div>
                      <div className="price-row total">
                        <span>Total:</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {showBill && (
          <BillModal order={order} onClose={() => setShowBill(false)} />
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
