import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaWallet, FaUserInjured, FaUserMd } from 'react-icons/fa';
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

  const handleWalletLogin = async () => {
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

      const userEmail = `${userType}-${address.slice(-6)}@example.com`;
      const result = await login(userEmail, 'password', userType, address);
      
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
    <div className="auth-container">
      {/* LEFT IMAGE SECTION */}
      <div className="auth-left">
        <div className="overlay">
          <h2>Empowering Healthcare, One Click at a Time</h2>
          <p>Your Health. Your Records. Your Control.</p>
        </div>
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="auth-right">
        <div className="login-box">
          <div className="brand-header">
            <h1>
              <span className="med">MED</span>
              <span className="blocks">BLOCKS</span>
            </h1>
            <div className="brand-dot"></div>
          </div>
          <p className="brand-subtitle">
            Secure medical records powered by blockchain
          </p>

          {/* Wallet Login Form */}
          <div className="wallet-login">
            <div className="form-group">
              <label htmlFor="wallet">Wallet Address</label>
              <div className="wallet-input">
                <div className="input-group">
                  <FaWallet />
                  <input 
                    type="text" 
                    id="wallet"
                    placeholder="Connect your wallet..." 
                    value={walletAddress}
                    readOnly 
                  />
                </div>
                <div className="wallet-badge">
                  MetaMask
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="userType">Login As</label>
              <div className="role-selector">
                <div 
                  className={`role-btn ${userType === 'patient' ? 'active' : ''}`}
                  onClick={() => setUserType('patient')}
                >
                  <FaUserInjured />
                  <span>Patient</span>
                </div>
                <div 
                  className={`role-btn ${userType === 'doctor' ? 'active' : ''}`}
                  onClick={() => setUserType('doctor')}
                >
                  <FaUserMd />
                  <span>Doctor</span>
                </div>
              </div>
            </div>
            
            <button 
              className="primary-btn" 
              onClick={handleWalletLogin} 
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>

          <p className="trust-text">
            🔒 Your data never leaves your wallet
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
