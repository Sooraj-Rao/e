"use client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAdmin = user?.name === "Administrator";

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to={isAdmin ? "/admin" : "/"} className="navbar-brand">
            Agri Store
          </Link>

          <div className="navbar-links">
            <Link to={isAdmin ? "/admin" : "/"} className="navbar-link">
              Home
            </Link>

            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <Link to="/cart" className="navbar-link cart-link">
                      Cart ({getCartItemsCount()})
                    </Link>
                    <Link to="/orders" className="navbar-link">
                      Orders
                    </Link>
                    <span className="navbar-user">Hello, {user.name}</span>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  style={{ padding: "10px", border: "none", cursor: "pointer" }}
                  className=""
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn">
                  Login
                </Link>
                <Link to="/register" className="btn ">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
