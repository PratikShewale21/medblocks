import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const AuthTest = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      const result = await login(`test@${role}.com`, 'password', role);
      if (result && result.redirectPath) {
        navigate(result.redirectPath);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const loginPath = logout();
    navigate(loginPath);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1>Authentication Test</h1>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        
        {isAuthenticated ? (
          <div>
            <p>You are logged in as: <strong>{user.role}</strong></p>
            <p>Email: {user.email}</p>
            <button 
              onClick={handleLogout}
              disabled={loading}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '20px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        ) : (
          <div>
            <p>You are not logged in</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => handleLogin('doctor')}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Logging in...' : 'Login as Doctor'}
              </button>
              <button 
                onClick={() => handleLogin('patient')}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Logging in...' : 'Login as Patient'}
              </button>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
          <h3>Debug Info:</h3>
          <pre style={{ textAlign: 'left', overflowX: 'auto' }}>
            {JSON.stringify({
              isAuthenticated,
              user,
              location: window.location.pathname
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
