// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { FaWallet, FaUserInjured, FaUserMd, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
// import './Login.css';

// const Login = () => {
//   const [walletAddress, setWalletAddress] = useState('');
//   const [userType, setUserType] = useState('patient');
//   const [loading, setLoading] = useState(false);
  
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!walletAddress) {
//       return;
//     }
    
//     try {
//       setLoading(true);
//       // For demo purposes, we'll use a mock email based on user type
//       const email = `demo-${userType}@example.com`;
//       const result = await login(email, 'password', userType);
      
//       // Navigate to the appropriate page based on user type
//       if (result && result.redirectPath) {
//         navigate(result.redirectPath);
//       }
//     } catch (err) {
//       console.error('Login failed:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <div className="logo">Med<span>Blocks</span></div>
//         <h2>Welcome Back</h2>
//         <p className="subtitle">Sign in to access your medical records</p>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label htmlFor="wallet">Wallet Address</label>
//             <div className="input-group">
//               <FaWallet />
//               <input 
//                 type="text" 
//                 id="wallet"
//                 placeholder="0x..." 
//                 value={walletAddress}
//                 onChange={(e) => setWalletAddress(e.target.value)}
//                 required
//               />
//             </div>
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="userType">Login As</label>
//             <div className="user-type-selector">
//               <div 
//                 className={`user-type-option ${userType === 'patient' ? 'selected' : ''}`}
//                 data-type="patient"
//                 onClick={() => setUserType('patient')}
//               >
//                 <FaUserInjured />
//                 <span>Patient</span>
//               </div>
//               <div 
//                 className={`user-type-option ${userType === 'doctor' ? 'selected' : ''}`}
//                 data-type="doctor"
//                 onClick={() => setUserType('doctor')}
//               >
//                 <FaUserMd />
//                 <span>Doctor</span>
//               </div>
//               <input type="hidden" value={userType} required />
//             </div>
//           </div>
          
//           <button type="submit" className="login-btn" disabled={loading}>
//             <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
//             <FaArrowRight />
//           </button>
//         </form>
        
//         <div className="info-text">
//           <p><FaShieldAlt /> Your data is secured with blockchain technology</p>
//         </div>
//       </div>
//     </div>
import React, { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
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

  // Main Action: Real MetaMask connection with fallback for testing
  const handleLoginAction = async () => {
    try {
      setLoading(true);
      console.log('Starting login process...');
      console.log('window.ethereum available:', !!window.ethereum);

      let address = "";
      
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask detected, attempting to connect...');
        try {
          // Request account access
          const accounts = await window.ethereum.request({ 
            method: "eth_requestAccounts" 
          });
          
          console.log('Accounts received:', accounts);
          
          if (accounts.length > 0) {
            address = accounts[0];
            console.log('Using address:', address);
          } else {
            throw new Error('No accounts found');
          }
        } catch (metaMaskError) {
          console.error('MetaMask connection error:', metaMaskError);
          const useDemo = confirm('MetaMask connection failed: ' + metaMaskError.message + '\n\nUse demo mode for testing?');
          
          if (useDemo) {
            address = "0x1234567890123456789012345678901234567890";
            console.log('Using demo address:', address);
          } else {
            setLoading(false);
            return;
          }
        }
      } else {
        console.log('MetaMask not detected');
        // MetaMask not installed - offer demo mode
        const useDemo = confirm(
          'MetaMask not detected.\n\nTo install MetaMask:\n1. Go to metamask.io\n2. Download for your browser\n3. Refresh this page\n\nUse demo mode for now?'
        );
        
        if (useDemo) {
          address = "0x1234567890123456789012345678901234567890";
          console.log('Using demo address:', address);
        } else {
          // Open MetaMask installation page
          window.open('https://metamask.io/download/', '_blank');
          setLoading(false);
          return;
        }
      }
      
      if (!address) {
        console.error('No wallet address obtained');
        alert('Unable to get wallet address');
        setLoading(false);
        return;
      }
      
      setWalletAddress(address);
      console.log('Connected wallet:', address);

      // Authenticate through the AuthContext system
      const email = `patient-${address.slice(-6)}@example.com`;
      const result = await login(email, 'password', 'patient', address);
      
      console.log('Auth result:', result);
      
      if (result && result.redirectPath) {
        console.log('Navigating to:', result.redirectPath);
        navigate(result.redirectPath);
      } else {
        console.log('Using fallback navigation to /patient');
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
        
        {/* 🔥 REPLACED <form> with <div> to kill the auto-refresh */}
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
          
          {/* 🔥 Trigger logic via onClick instead of onSubmit */}
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
          <div className="wallet-info">
            <p><strong>🚀 Quick Start:</strong></p>
            <p>• Click "Connect & Login" → Use demo mode if no MetaMask</p>
            <p>• Or install MetaMask from <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6' }}>metamask.io</a></p>
            <p>• Then you can add and track your medications!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;