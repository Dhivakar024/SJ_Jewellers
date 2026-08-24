import React from 'react';
import { Home, Wallet, FolderClosed, User, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab, onTogglePlus }) {
  return (
    <div className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
      >
        <Home size={22} color={activeTab === 'home' ? '#ffd000' : '#ffffff'} />
        <span>Home</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'buy' ? 'active' : ''}`}
        onClick={() => onSelectTab('buy')}
      >
        <Wallet size={22} color={activeTab === 'buy' ? '#ffd000' : '#ffffff'} />
        <span>Buy</span>
      </button>

      <div className="plus-btn-wrapper">
        <button className="floating-plus-btn" onClick={onTogglePlus} aria-label="Quick Menu">
          <Plus size={30} strokeWidth={3} />
        </button>
      </div>

      <button 
        className={`nav-item ${activeTab === 'holdings' ? 'active' : ''}`}
        onClick={() => onSelectTab('holdings')}
      >
        <FolderClosed size={22} color={activeTab === 'holdings' ? '#ffd000' : '#ffffff'} />
        <span>Holdings</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onSelectTab('profile')}
      >
        <User size={22} color={activeTab === 'profile' ? '#ffd000' : '#ffffff'} />
        <span>Profile</span>
      </button>
    </div>
  );
}
