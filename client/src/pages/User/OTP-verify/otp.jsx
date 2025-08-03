import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./otp.css";
import { useAuth } from "../../../context/AuthContext";

const OTPForm = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userEmail, setuserEmail] = useState("");
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    if (email) {
      setuserEmail(email);
    }
  }, []);

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await verifyOtp(otp);

      if (response.success) {
        setMessage("OTP verified successfully!");
        navigate("/");
      } else {
        setMessage(response.message || "OTP verification failed.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <h2>Enter OTP</h2>
      <p style={{ marginBottom: "4rem" }}>We sent OTP to {userEmail}</p>
      <form onSubmit={handleSubmit} className="otp-form">
        <input
          type="text"
          name="otp"
          value={otp}
          onChange={handleChange}
          placeholder="Enter OTP"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Submit"}
        </button>
      </form>
      {message && <p className="otp-message">{message}</p>}
    </div>
  );
};

export default OTPForm;
