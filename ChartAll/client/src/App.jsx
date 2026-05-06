import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store';
import Login from './pages/Login';
import Chat from './pages/Chat';
import NotLoggedIn from './pages/NotLoggedIn';

export default function App() {
  const { currentUser, setCurrentUser } = useStore();

  useEffect(() => {
    // Only try to auto-login if no user is set
    if (currentUser) return;

    const params = new URLSearchParams(window.location.search);
    const userJson = params.get('user');
    const token = params.get('token');

    if (userJson && token) {
      try {
        const userData = JSON.parse(userJson);
        // Map common fields if necessary, though they should match
        setCurrentUser(userData);
        
        // Clean up URL to keep it pretty
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Failed to parse user from URL', e);
      }
    }
  }, [currentUser, setCurrentUser]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#233240', color: '#e9edef', border: '1px solid #2a3a4a' },
          duration: 2500
        }}
      />
      {currentUser ? <Chat /> : <NotLoggedIn />}
    </>
  );
}
