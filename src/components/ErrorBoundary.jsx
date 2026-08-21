import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          backgroundColor: '#f8fafc',
          color: '#111827',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div style={{
            maxWidth: '500px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '22px',
              fontWeight: 'bold'
            }}>
              !
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0', color: '#111827' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
              The application encountered an unexpected state. Click below to reload and continue.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
