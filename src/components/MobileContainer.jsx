import React from 'react';

export default function MobileContainer({ children }) {
  return (
    <div className="app-viewport">
      {/* Pure Mobile Application Content Container */}
      <div className="screen-content">
        {children}
      </div>
    </div>
  );
}
