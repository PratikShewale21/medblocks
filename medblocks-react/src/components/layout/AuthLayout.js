import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
};

export default AuthLayout;
