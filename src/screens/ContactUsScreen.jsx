import React, { useState } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, Globe } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ContactUsScreen({ onNavigate, onTogglePlus }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you shortly.');
    setFullName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header Bar */}
      <div className="top-header-bar">
        <button className="back-btn" onClick={() => onNavigate('home')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>Contact Us</h2>
      </div>

      {/* Content */}
      <div className="screen-content" style={{ padding: '20px 18px 24px 18px' }}>
        {/* Quote banner */}
        <div style={{
          textAlign: 'center',
          color: 'var(--primary-purple)',
          fontWeight: '700',
          fontSize: '17px',
          lineHeight: '1.4',
          marginBottom: '20px',
          padding: '0 10px'
        }}>
          "Discover purity in every piece.<br />
          Contact us for your perfect gold."
        </div>

        {/* Contact Details Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Address */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: '#ede7fc', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <MapPin size={20} color="var(--primary-purple)" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#2c2642', lineHeight: '1.4' }}>
              Salem New Bus Stand Meyyanoor Road, Meyyanoor, Salem – 636004, Tamil Nadu, India
            </div>
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: '#ede7fc', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Phone size={20} color="var(--primary-purple)" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2c2642' }}>
              94562-84829
            </div>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: '#ede7fc', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Mail size={20} color="var(--primary-purple)" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#2c2642' }}>
              goldhouse@gmail.com
            </div>
          </div>

          {/* Website */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: '#ede7fc', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Globe size={20} color="var(--primary-purple)" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#2c2642' }}>
              www.goldhouse.com
            </div>
          </div>
        </div>

        {/* Send Message Card */}
        <div style={{
          backgroundColor: '#dcd0ff',
          borderRadius: '24px',
          padding: '24px 20px',
          border: '1px solid #c9b8fc'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', textAlign: 'center', marginBottom: '20px' }}>
            Send Message
          </h3>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#4a3f75', display: 'block', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%', border: 'none', borderBottom: '1.5px solid #8574be',
                  backgroundColor: 'transparent', padding: '8px 0', fontSize: '15px', fontWeight: '600', outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#4a3f75', display: 'block', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', border: 'none', borderBottom: '1.5px solid #8574be',
                  backgroundColor: 'transparent', padding: '8px 0', fontSize: '15px', fontWeight: '600', outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#4a3f75', display: 'block', marginBottom: '4px' }}>
                Type your message..
              </label>
              <input
                type="text"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%', border: 'none', borderBottom: '1.5px solid #8574be',
                  backgroundColor: 'transparent', padding: '8px 0', fontSize: '15px', fontWeight: '600', outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '140px',
                height: '46px',
                margin: '16px auto 0 auto',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: '#ffffff',
                color: 'var(--text-dark)',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab="home"
        onSelectTab={(tab) => onNavigate(tab)}
        onTogglePlus={onTogglePlus}
      />
    </div>
  );
}
