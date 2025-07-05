import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Bootstrap + CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // bundle includes Popper
import './index.css';

// Root container
const rootElement = document.getElementById('root');

// Only create root once here
const root = ReactDOM.createRoot(rootElement);

// Render the main App
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
