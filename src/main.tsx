import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

import React, { ErrorInfo } from 'react';

interface EBProps { children: React.ReactNode; }
interface EBState { hasError: boolean; error: any; }

class ErrorBoundary extends React.Component<EBProps, EBState> {
  state: EBState = { hasError: false, error: null };
  constructor(props: EBProps) {
    super(props);
  }
  static getDerivedStateFromError(error: any): EBState {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: 'white' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// Ensure you replace the clientId with your actual Google Client ID
const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || 'placeholder-client-id';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
