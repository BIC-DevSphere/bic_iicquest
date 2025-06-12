import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster 
        containerStyle={{
          top: '10px',
          right: '10px',
          bottom: 'auto',
          left: 'auto',
        }}
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px) saturate(180%)',
            color: 'oklch(0.15 0.008 230)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          },
          success: {
            duration: 3000,
            style: {
              background: 'rgba(16, 185, 129, 0.95)',
              backdropFilter: 'blur(16px) saturate(180%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2), 0 6px 12px rgba(16, 185, 129, 0.1)',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'rgba(16, 185, 129, 0.95)',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: 'rgba(239, 68, 68, 0.95)',
              backdropFilter: 'blur(16px) saturate(180%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2), 0 6px 12px rgba(239, 68, 68, 0.1)',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'rgba(239, 68, 68, 0.95)',
            },
          },
          loading: {
            style: {
              background: 'rgba(99, 102, 241, 0.95)',
              backdropFilter: 'blur(16px) saturate(180%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.2), 0 6px 12px rgba(99, 102, 241, 0.1)',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'rgba(99, 102, 241, 0.95)',
            },
          },
        }}
      />
    <App />
  </StrictMode>,
)
