import React from 'react';
import ReactDOM from 'react-dom/client';

const TestApp = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1>React is working! 🎉</h1>
        <p>If you can see this, React is working correctly.</p>
        <p>Now let's fix the main application...</p>
      </div>
    </div>
  );
};

export default TestApp;
