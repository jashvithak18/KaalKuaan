import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { DemoProvider } from './context/DemoContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <LocationProvider>
        <DemoProvider>
          <App />
        </DemoProvider>
      </LocationProvider>
    </AuthProvider>
  </React.StrictMode>
);
