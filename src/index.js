import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { init } from '@plausible-analytics/tracker';

// Initialize Plausible Analytics
// Configure your domain in Plausible dashboard and set it here or via environment variable
const plausibleDomain = process.env.REACT_APP_PLAUSIBLE_DOMAIN || window.location.hostname;

if (plausibleDomain) {
  init({
    domain: plausibleDomain,
    autoCapturePageviews: true,
    captureOnLocalhost: process.env.NODE_ENV === 'development',
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
