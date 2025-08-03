"use client"
import "./BillModal.css"

const BillModal = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal">
      <div className="modal-content bill-modal">
        <div className="bill-header">
          <h2>Invoice</h2>
          <div className="bill-actions">
            <button onClick={handlePrint} className="btn ">
              Print Bill
            </button>
            <button onClick={onClose} className="btn btn-danger">
              Close
            </button>
          </div>
        </div>

        <div className="bill-content">
          <div className="bill-info">
            <div className="company-info">
              <h3>Agri Store</h3>
              <p>123 Business Street</p>
              <p>Puttur </p>
              <p>Phone: 122 123-4567</p>
              <p>Email: info@agri.com</p>
            </div>

            <div className="invoice-details">
              <h4>Invoice Details</h4>
              <p>
                <strong>Invoice #:</strong> INV-{order._id.slice(-8)}
              </p>
              <p>
                <strong>Order #:</strong> {order._id.slice(-8)}
              </p>
              <p>
                <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
          </div>

          <div className="customer-info">
            <h4>Bill To:</h4>
            <p>
              <strong>{order.customerDetails.name}</strong>
            </p>
            <p>{order.customerDetails.email}</p>
            <p>{order.customerDetails.phone}</p>
            <p>{order.customerDetails.address}</p>
          </div>

          <div className="bill-items">
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="item-details">
                        <strong>{item.product.title}</strong>
                        <br />
                        <small>{item.product.category}</small>
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bill-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span> ₹0.00</span>
            </div>
            <div className="summary-row total-row">
              <span>
                <strong>Total:</strong>
              </span>
              <span>
                <strong>₹{order.totalAmount.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          <div className="bill-footer">
            <p>
              <strong>Thank you for the purchase!</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillModal
