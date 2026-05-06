import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, LogIn } from 'lucide-react';

const PREPODISHA_URL = import.meta.env.VITE_PREPODISHA_URL || 'http://localhost:3000';

export default function NotLoggedIn() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#17212b',
      padding: '0 16px',
      backgroundImage: 'radial-gradient(ellipse at 60% 10%, rgba(82,136,193,0.08) 0%, transparent 60%)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', maxWidth: '384px' }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(to bottom right, #5288c1, #2d5f9e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(82,136,193,0.3)'
          }}
        >
          <MessageSquare style={{ width: '40px', height: '40px', color: 'white' }} />
        </motion.div>

        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>PrepOdisha Chat</h1>
        <p style={{ color: '#8a9bb0', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
          You need to be logged into PrepOdisha to access the student chat. Please log in to continue.
        </p>

        <motion.a
          href={`${PREPODISHA_URL}/login`}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(82,136,193,0.35)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            inlineFlex: 'inline-flex',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(to right, #5288c1, #4278b1)',
            color: 'white',
            fontWeight: '600',
            padding: '14px 32px',
            borderRadius: '16px',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            textDecoration: 'none'
          }}
        >
          <LogIn style={{ width: '16px', height: '16px' }} />
          Go to PrepOdisha Login
        </motion.a>

        <p style={{ fontSize: '12px', color: '#3d5268', marginTop: '32px' }}>
          🎓 All courses are free · Enroll · Connect · Learn Together
        </p>
      </motion.div>
    </div>
  );
}
