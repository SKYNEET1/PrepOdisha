import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore, HARDCODED_USERS } from '../store';

export default function Login() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const setCurrentUser = useStore((s) => s.setCurrentUser);

  const handleLogin = async () => {
    if (!selected) return toast.error('Please select a user');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // short fake delay
    setCurrentUser(selected);
    setLoading(false);
    toast.success(`Welcome, ${selected.firstName}!`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0e1621',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '380px' }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', gap: '12px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg,#5288c1,#2c5282)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <MessageSquare style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>ChartAll</h1>
          <p style={{ fontSize: '14px', color: '#8a9bb0', margin: 0 }}>Global chat — pick your account</p>
        </div>

        {/* User cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {HARDCODED_USERS.map((user) => {
            const isSelected = selected?._id === user._id;
            return (
              <button
                key={user._id}
                onClick={() => setSelected(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: '2px solid',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(82,136,193,0.15)' : 'rgba(255,255,255,0.03)',
                  borderColor: isSelected ? '#5288c1' : 'rgba(255,255,255,0.08)',
                  outline: 'none',
                }}
              >
                <img
                  src={user.image}
                  alt={user.firstName}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', color: 'white', fontSize: '16px', margin: 0 }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p style={{ fontSize: '12px', color: '#8a9bb0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0 0' }}>
                    {user.email}
                  </p>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    padding: '2px 8px',
                    borderRadius: '99px',
                    marginTop: '4px',
                    display: 'inline-block',
                    background: user.accountType === 'Instructor' ? 'rgba(251,191,36,0.15)' : 'rgba(74,222,128,0.15)',
                    color: user.accountType === 'Instructor' ? '#fbbf24' : '#4ade80'
                  }}>
                    {user.accountType}
                  </span>
                </div>
                {isSelected && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#5288c1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleLogin}
          disabled={!selected || loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            cursor: selected ? 'pointer' : 'not-allowed',
            background: selected ? 'linear-gradient(135deg,#5288c1,#2c5282)' : 'rgba(255,255,255,0.06)',
            color: selected ? '#fff' : '#5a6d80',
          }}
        >
          {loading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : 'Enter Chat'}
        </button>
      </motion.div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
