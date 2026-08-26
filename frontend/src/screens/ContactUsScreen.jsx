import React, { useState } from 'react';
import { ArrowLeft, Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { CUSTOMER_SUPPORT_PHONE, CUSTOMER_SUPPORT_EMAIL, getTelephoneLink } from '../config/support';

export default function ContactUsScreen({ onNavigate, fromScreen = 'home', onTogglePlus }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !message) {
      alert('Please enter your name and message.');
      return;
    }
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setName('');
      setEmail('');
      setMessage('');
      alert('Your inquiry has been submitted! Our support team will get in touch shortly.');
    }, 1500);
  };

  return (
    <div className="app-screen-layout">
      {/* 1. Fixed Top Header */}
      <header className="top-header-bar">
        <button className="back-btn" onClick={() => onNavigate(fromScreen || 'home')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>Contact Us</h2>
      </header>

      {/* 2. Middle Scrollable Content (ONLY THIS SCROLLS) */}
      <main className="app-scroll-content" style={{ padding: '20px 18px', gap: '20px' }}>
        {/* Info Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e' }}>
            SJ Jewelers Customer Support
          </h3>

          <a
            href={getTelephoneLink(CUSTOMER_SUPPORT_PHONE)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: '#33295c',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            <Phone size={18} color="var(--primary-purple)" />
            <span style={{ color: 'var(--primary-purple)', fontWeight: '700' }}>{CUSTOMER_SUPPORT_PHONE}</span>
          </a>

          <a
            href={`mailto:${CUSTOMER_SUPPORT_EMAIL}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: '#33295c',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            <Mail size={18} color="var(--primary-purple)" />
            <span style={{ color: 'var(--primary-purple)', fontWeight: '700' }}>{CUSTOMER_SUPPORT_EMAIL}</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#33295c', fontWeight: '600' }}>
            <MapPin size={18} color="var(--primary-purple)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Bazaar Street, Salem, Tamil Nadu - 636001</span>
          </div>
        </div>

        {/* Message Form */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b2e', marginBottom: '16px' }}>
            Send us a Message
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group">
              <input
                type="text"
                className="custom-input"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                className="custom-input"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <textarea
                rows={4}
                className="custom-input"
                placeholder="Write your query or feedback here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ height: 'auto', padding: '14px 20px', resize: 'none' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ height: '52px', fontSize: '16px', gap: '8px' }}
            >
              {sentSuccess ? (
                <>
                  <CheckCircle2 size={20} />
                  <span>Message Sent!</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* 3. Fixed Bottom Nav */}
      <BottomNav
        activeTab="profile"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />
    </div>
  );
}
