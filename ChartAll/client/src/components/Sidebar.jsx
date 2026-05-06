import React from 'react';
import { MessageSquare, Users, LogOut, Hash, Wifi, WifiOff } from 'lucide-react';
import { useStore, HARDCODED_USERS } from '../store';
import toast from 'react-hot-toast';

export default function Sidebar({ connected }) {
  const { currentUser, logout, view, setView, onlineUsers, messages } = useStore();
  const lastMsg = messages[messages.length - 1];

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div style={{
      width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: '#232e3c', borderRight: '1px solid #0f1923', height: '100%'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        background: '#202c33', borderBottom: '1px solid #0f1923'
      }}>
        <img
          src={currentUser?.image}
          alt={currentUser?.firstName}
          style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, color: '#e9edef', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser?.firstName} {currentUser?.lastName}
          </p>
          <p style={{ fontSize: 11, color: '#8a9bb0' }}>{currentUser?.accountType}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {connected
            ? <Wifi style={{ width: 14, height: 14, color: '#4ade80' }} />
            : <WifiOff style={{ width: 14, height: 14, color: '#ef4444' }} />
          }
          <button
            onClick={handleLogout}
            style={{
              padding: 8, borderRadius: 8, background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#5a6d80', display: 'flex', alignItems: 'center',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1c2733'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title="Logout"
          >
            <LogOut style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#202c33', borderBottom: '1px solid #0f1923', flexShrink: 0 }}>
        <button
          onClick={() => setView('chat')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 0', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            borderBottom: view === 'chat' ? '2px solid #5288c1' : '2px solid transparent',
            color: view === 'chat' ? '#5288c1' : '#8a9bb0',
            background: 'transparent', transition: 'color 0.15s'
          }}
        >
          <Hash style={{ width: 16, height: 16 }} /> Global Chat
        </button>
        <button
          onClick={() => setView('members')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 0', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            borderBottom: view === 'members' ? '2px solid #5288c1' : '2px solid transparent',
            color: view === 'members' ? '#5288c1' : '#8a9bb0',
            background: 'transparent', transition: 'color 0.15s'
          }}
        >
          <Users style={{ width: 16, height: 16 }} /> Members
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {view === 'chat' ? (
          /* Global chat room entry */
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: 'rgba(82,136,193,0.12)', borderLeft: '3px solid #5288c1',
              cursor: 'default'
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg,#5288c1,#2c5282)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <MessageSquare style={{ width: 24, height: 24, color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: 600, color: '#e9edef', fontSize: 15 }}>Global Chat</p>
                {lastMsg && <span style={{ fontSize: 11, color: '#5a6d80' }}>{formatTime(lastMsg.createdAt)}</span>}
              </div>
              <p style={{ fontSize: 13, color: '#8a9bb0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : 'Start chatting...'}
              </p>
            </div>
          </div>
        ) : (
          /* Members list */
          <div>
            <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users style={{ width: 14, height: 14, color: '#5288c1' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#5288c1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Online Members ({onlineUsers.length})
              </span>
            </div>
            {onlineUsers.length === 0 ? (
              <p style={{ padding: '20px 16px', fontSize: 13, color: '#5a6d80', textAlign: 'center' }}>No one else is online</p>
            ) : (
              onlineUsers.map((member) => (
                <div key={member.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={member.image || 'https://api.dicebear.com/5.x/initials/svg?seed=' + member.name}
                      alt={member.name}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute', bottom: 0, right: 0, width: 11, height: 11,
                      borderRadius: '50%', border: '2px solid #232e3c',
                      background: '#4ade80'
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#e9edef', margin: 0 }}>
                      {member.name}
                    </p>
                    <p style={{ fontSize: 12, color: '#4ade80', margin: '2px 0 0' }}>
                      Online
                    </p>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 99,
                    background: member.accountType === 'Instructor' ? 'rgba(251,191,36,0.15)' : 'rgba(74,222,128,0.15)',
                    color: member.accountType === 'Instructor' ? '#fbbf24' : '#4ade80'
                  }}>
                    {member.accountType}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid #0f1923', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#3a5068' }}>ChartAll Global Chat 💬</p>
      </div>
    </div>
  );
}
