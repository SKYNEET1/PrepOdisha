import React, { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store';

// PrepOdisha login URL — redirect here if not authenticated
const PREPODISHA_LOGIN = import.meta.env.VITE_PREPODISHA_URL
  ? `${import.meta.env.VITE_PREPODISHA_URL}/login`
  : 'http://localhost:3000/login';

export default function ProtectedRoute({ children }) {
  const { token, user, hydrate } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Auth Bridge: Check for token/user in URL (e.g. from PrepOdisha link)
    const urlToken = searchParams.get('token');
    const urlUser = searchParams.get('user');

    if (urlToken && urlUser) {
      try {
        localStorage.setItem('token', JSON.stringify(urlToken));
        localStorage.setItem('user', urlUser); 
        hydrate();

        // Sync with Chat Backend immediately
        const userData = JSON.parse(urlUser);
        const CHAT_API = import.meta.env.VITE_CHAT_URL || 'http://localhost:5001';
        
        fetch(`${CHAT_API}/api/v1/chat/sync-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            image: userData.image,
            accountType: userData.accountType
          })
        }).catch(err => console.error("Sync failed", err));

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Failed to sync auth from URL', e);
      }
    } else {
      hydrate();
    }
  }, [searchParams, hydrate]);

  if (!token || !user) {
    window.location.href = PREPODISHA_LOGIN;
    return null;
  }

  return children;
}
