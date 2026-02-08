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
//   );
// };

// export default Login;


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

  // Main Action: Handles both Connection and Navigation
  const handleLoginAction = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }

    try {
      setLoading(true);

      // 1. Get Address
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      const address = accounts[0];
      setWalletAddress(address);

      // 2. Perform Login
      const email = `demo-${userType}@example.com`;
      const result = await login(email, 'password', userType, address);

      // 3. Navigate (No form to interfere now)
      if (result && result.redirectPath) {
        navigate(result.redirectPath);
      } else {
        // Hardcoded fallback in case redirectPath is missing
        navigate(userType === 'doctor' ? '/doctor' : '/patient');
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Metamask connection failed.");
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
        </div>
      </div>
    </div>
  );
};

export default Login;