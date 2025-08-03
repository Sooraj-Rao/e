"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import OrderSuccess from "../../../components/OrderSuccess/OrderSuccess";
import "./Checkout.css";
import gpay from "../../../../public/gpay.jpg";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState("Cash on Delivery");
  const [upiRef, setupiRef] = useState("");

  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const handleInputChange = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        customerDetails,
        paymentMode: paymentMode == "UPI" ? upiRef : paymentMode,
      };

      const response = await axios.post("/api/orders", orderData);

      clearCart();
      setOrderId(response.data._id);
      setOrderSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderSuccess) {
    navigate("/cart");
    return null;
  }

  if (orderSuccess) {
    return <OrderSuccess orderId={orderId} />;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          <div className="checkout-form">
            <h2>Customer Details</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerDetails.name}
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
                  value={customerDetails.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={customerDetails.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentMode">Mode of Payment *</label>
                <select
                  id="paymentMode"
                  name="paymentMode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  required
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              {paymentMode === "UPI" && (
                <div className="upi-section">
                  <img
                    style={{ height: "300px" }}
                    src={gpay}
                    alt="Scan to Pay"
                    className="upi-scanner"
                  />
                  <p className="upi-note">
                    Please scan and complete your UPI payment. Successful
                    payments will be verified within a few hours.
                  </p>
                </div>
              )}

              {paymentMode === "UPI" && (
                <div className="form-group">
                  <label htmlFor="upiref">UPI Reference *</label>
                  <input
                    type="text"
                    id="upi"
                    name="upi"
                    value={upiRef}
                    onChange={(e) => setupiRef(e.target.value)}
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                className="btn place-order-btn"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item._id} className="order-item">
                  <img
                    src={`/uploads/${item.image}`}
                    alt={item.title}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=60&width=60";
                    }}
                  />
                  <div className="item-info">
                    <h4>{item.title}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="total-row final-total">
                <span>Total:</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
