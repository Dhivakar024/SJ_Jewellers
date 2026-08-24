import React from 'react';

export default function MobileContainer({ children }) {
  return (
    <div className="app-viewport">
      {children}
    </div>
  );
}
