"use client"
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./OrderSuccess.css"

const OrderSuccess = ({ orderId }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/orders")
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="modal">
      <div className="modal-content order-success-modal">
        <div className="success-icon">✅</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order has been placed and is being processed.</p>

        {orderId && (
          <div className="order-details">
            <p>
              <strong>Order ID:</strong> #{orderId.slice(-8)}
            </p>
          </div>
        )}

        <div className="success-actions">
          <Link to="/orders" className="btn btn-success">
            View My Orders
          </Link>
          <Link to="/" className="btn">
            Continue Shopping
          </Link>
        </div>

        <p className="auto-redirect">You will be automatically redirected to your orders in 5 seconds...</p>
      </div>
    </div>
  )
}

export default OrderSuccess
