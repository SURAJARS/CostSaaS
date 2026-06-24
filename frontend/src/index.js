import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Add global styles
const style = document.createElement('style');
style.textContent = `
  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  body {
    overflow-y: auto;
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
