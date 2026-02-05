import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaWallet, FaUserInjured, FaUserMd, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [userType, setUserType] = useState('patient');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletAddress) {
      return;
    }
    
    try {
      setLoading(true);
      // For demo purposes, we'll use a mock email based on user type
      const email = `demo-${userType}@example.com`;
      const result = await login(email, 'password', userType);
      
      // Navigate to the appropriate page based on user type
      if (result && result.redirectPath) {
        navigate(result.redirectPath);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">Med<span>Blocks</span></div>
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to access your medical records</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="wallet">Wallet Address</label>
            <div className="input-group">
              <FaWallet />
              <input 
                type="text" 
                id="wallet"
                placeholder="0x..." 
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="userType">Login As</label>
            <div className="user-type-selector">
              <div 
                className={`user-type-option ${userType === 'patient' ? 'selected' : ''}`}
                data-type="patient"
                onClick={() => setUserType('patient')}
              >
                <FaUserInjured />
                <span>Patient</span>
              </div>
              <div 
                className={`user-type-option ${userType === 'doctor' ? 'selected' : ''}`}
                data-type="doctor"
                onClick={() => setUserType('doctor')}
              >
                <FaUserMd />
                <span>Doctor</span>
              </div>
              <input type="hidden" value={userType} required />
            </div>
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
            <FaArrowRight />
          </button>
        </form>
        
        <div className="info-text">
          <p><FaShieldAlt /> Your data is secured with blockchain technology</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
