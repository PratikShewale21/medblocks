import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // const login = useCallback(async (email, password, userType) => {
  //   // In a real app, you would make an API call here
  //   // This is a mock implementation
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       const mockUser = {
  //         id: '123',
  //         email,
  //         name: email.split('@')[0],
  //         role: userType,
  //         avatar: `https://i.pravatar.cc/150?u=${email}`,
  //       };
        
  //       setUser(mockUser);
  //       setIsAuthenticated(true);
  //       localStorage.setItem('user', JSON.stringify(mockUser));
        
  //       // Return the redirect path instead of navigating
  //       const redirectPath = userType === 'doctor' ? '/doctor' : '/patient';
  //       resolve({ user: mockUser, redirectPath });
  //     }, 1000);
  //   });
  // }, []);

// medblocks-react/src/context/AuthContext.jsx

const login = useCallback(async (email, password, userType, address) => { // Added address parameter
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUser = {
        id: '123',
        email,
        name: email.split('@')[0],
        role: userType,
        walletAddress: address, // Store the actual address here
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      const redirectPath = userType === 'doctor' ? '/doctor' : '/patient';
      resolve({ user: mockUser, redirectPath });
    }, 1000);
  });
}, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    return '/login';
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

