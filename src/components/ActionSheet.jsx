import React from 'react';
import { Hand, FileText, Phone, X } from 'lucide-react';

export default function ActionSheet({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div 
          className="sheet-item" 
          onClick={() => { onNavigate('withdraw'); onClose(); }}
        >
          <Hand size={24} color="#583cf5" />
          <span>Mode of Withdraw</span>
        </div>

        <div 
          className="sheet-item" 
          onClick={() => { onNavigate('transactions'); onClose(); }}
        >
          <FileText size={24} color="#583cf5" />
          <span>Transaction History</span>
        </div>

        <div 
          className="sheet-item" 
          onClick={() => { onNavigate('contact'); onClose(); }}
        >
          <Phone size={24} color="#583cf5" />
          <span>Contact Us</span>
        </div>

        <button className="sheet-close-btn" onClick={onClose} aria-label="Close">
          <X size={26} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
