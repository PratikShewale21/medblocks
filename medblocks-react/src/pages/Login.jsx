import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : '');
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }
  }, []);

  const handleLoginAction = async () => {
    try {
      setLoading(true);
      
      let address = "";
      
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ 
            method: "eth_requestAccounts" 
          });
          
          if (accounts.length > 0) {
            address = accounts[0];
          } else {
            throw new Error('No accounts found');
          }
        } catch (metaMaskError) {
          const useDemo = confirm('MetaMask connection failed: ' + metaMaskError.message + '\n\nUse demo mode for testing?');
          
          if (useDemo) {
            address = "0x1234567890123456789012345678901234567890";
          } else {
            setLoading(false);
            return;
          }
        }
      } else {
        const useDemo = confirm(
          'MetaMask not detected.\n\nTo install MetaMask:\n1. Go to metamask.io\n2. Download for your browser\n3. Refresh this page\n\nUse demo mode for now?'
        );
        
        if (useDemo) {
          address = "0x1234567890123456789012345678901234567890";
        } else {
          window.open('https://metamask.io/download/', '_blank');
          setLoading(false);
          return;
        }
      }
      
      if (!address) {
        alert('Unable to get wallet address');
        setLoading(false);
        return;
      }
      
      setWalletAddress(address);

      const email = `${userType}-${address.slice(-6)}@example.com`;
      const result = await login(email, 'password', userType, address);
      
      if (result && result.redirectPath) {
        navigate(result.redirectPath);
      } else {
        navigate('/patient');
      }
      
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed: " + err.message);
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
        
        <div className="login-form-wrapper">
          <div className="form-group">
            <label htmlFor="wallet">Wallet Address</label>
            <div className="input-group">
              <FaWallet />
              <input 
                type="text" 
                id="wallet"
                placeholder="0x..." 
                value={walletAddress}
                readOnly 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="userType">Login As</label>
            <div className="user-type-selector">
              <div 
                className={`user-type-option ${userType === 'patient' ? 'selected' : ''}`}
                onClick={() => setUserType('patient')}
              >
                <FaUserInjured />
                <span>Patient</span>
              </div>
              <div 
                className={`user-type-option ${userType === 'doctor' ? 'selected' : ''}`}
                onClick={() => setUserType('doctor')}
              >
                <FaUserMd />
                <span>Doctor</span>
              </div>
            </div>
          </div>
          
          <button 
            type="button" 
            className="login-btn" 
            onClick={handleLoginAction} 
            disabled={loading}
          >
            <span>{loading ? 'Processing...' : 'Connect & Login'}</span>
            <FaArrowRight />
          </button>
        </div>
        
        <div className="info-text">
          <p><FaShieldAlt /> Your data is secured with blockchain technology</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
