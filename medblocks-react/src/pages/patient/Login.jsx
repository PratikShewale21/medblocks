import React, { useState } from "react";
import { FaUserMd, FaEnvelope, FaLock, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8002';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store token and patient data
      localStorage.setItem('patientToken', data.token);
      localStorage.setItem('patientData', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        condition: data.condition
      }));

      setSuccess("Login successful! Redirecting...");
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate('/pill-tracker');
      }, 1500);

    } catch (err) {
      setError(err.message || "Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <FaUserMd />
            </div>
            <h1>Patient Login</h1>
            <p>Access your personal health dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="success-message">
                <FaCheckCircle />
                <span>{success}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FaLock />
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <FaUserMd />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="demo-accounts">
            <h3>Demo Accounts</h3>
            <div className="demo-list">
              <div className="demo-account">
                <strong>John Doe</strong> - Diabetes
                <br />
                <small>john.doe@email.com / password123</small>
              </div>
              <div className="demo-account">
                <strong>Jane Smith</strong> - Heart Disease
                <br />
                <small>jane.smith@email.com / password123</small>
              </div>
              <div className="demo-account">
                <strong>Mike Wilson</strong> - Hypertension
                <br />
                <small>mike.wilson@email.com / password123</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
