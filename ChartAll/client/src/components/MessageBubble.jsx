import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Reply, Edit2, Trash2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useChatStore } from '../store';
import { api } from '../lib/api';
import { formatTime, getInitials } from '../lib/utils';
import Avatar from './Avatar';

export default function MessageBubble({ message, isMine, onReply, isGroup, roomId, token, chatUserId }) {
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const [copied, setCopied] = useState(false);
  const { updateRoomMessage, deleteRoomMessage } = useChatStore();

  if (message.deleted) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className="bg-[#182533] text-[#5a6d80] text-xs italic px-4 py-2 rounded-2xl max-w-xs">
          🚫 Message was deleted
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
    setShowMenu(false);
  };

  const handleEdit = async () => {
    if (!editText.trim() || editText === message.text) { setEditing(false); return; }
    try {
      await api.editMessage(message._id, editText.trim(), token);
      updateRoomMessage(roomId, message._id, { text: editText.trim(), edited: true });
      toast.success('Message edited');
    } catch (err) {
      toast.error(err.message || 'Failed to edit');
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    setShowMenu(false);
    try {
      await api.deleteMessage(message._id, token);
      deleteRoomMessage(roomId, message._id);
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const senderName = message.sender
    ? `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim()
    : 'Unknown';

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`flex w-full mb-1 px-3 sm:px-4 ${isMine ? 'justify-end' : 'justify-start'} group`}
    >
      {/* Incoming: avatar on left */}
      {!isMine && isGroup && (
        <div className="flex-shrink-0 mr-2 self-end mb-1">
          <div className="w-8 h-8 rounded-full bg-[#5288c1] flex items-center justify-center text-white text-xs font-bold select-none">
            {getInitials(senderName)}
          </div>
        </div>
      )}

      {/* Bubble wrapper — max 65% width */}
      <div className={`flex flex-col gap-0.5 max-w-[65%] ${isMine ? 'items-end' : 'items-start'}`}>

        {/* Sender name (incoming group) */}
        {!isMine && isGroup && (
          <span className="text-[12px] font-semibold text-[#7dafda] ml-1 leading-none mb-0.5">
            {senderName}
          </span>
        )}

        {/* Reply context */}
        {message.replyTo && (
          <div className={`w-full border-l-4 rounded-lg px-3 py-1.5 mb-1 ${
            isMine ? 'bg-[#004039] border-[#25d366]' : 'bg-[#1d2f3a] border-[#5288c1]'
          }`}>
            <p className={`text-[11px] font-bold truncate ${isMine ? 'text-[#25d366]' : 'text-[#5288c1]'}`}>
              {message.replyTo.sender?.firstName || 'User'}
            </p>
            <p className="text-[12px] text-[#aab8c2] truncate">{message.replyTo.text}</p>
          </div>
        )}

        {/* Main Bubble Content */}
        <div
          className={`relative rounded-2xl px-4 py-2 text-[14.5px] leading-snug break-words ${
            isMine
              ? 'bg-[#005c4b] text-[#e9edef] rounded-br-[4px]'
              : 'bg-[#283940] text-[#e9edef] rounded-bl-[4px]'
          }`}
          style={{ minWidth: '70px', wordBreak: 'break-word' }}
          onMouseLeave={() => setShowMenu(false)}
        >
          {editing ? (
            <div className="flex items-center gap-2 min-w-[180px]">
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit();
                  if (e.key === 'Escape') setEditing(false);
                }}
                className="flex-1 bg-transparent outline-none text-white text-sm border-b border-[#5288c1] pb-0.5"
              />
              <button onClick={handleEdit} className="text-[#5288c1] hover:text-white transition-colors">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p>{message.text}</p>
          )}

          {/* Time + double tick */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[10px] text-[#8696a0] font-medium">{formatTime(message.createdAt)}</span>
            {isMine && <Check className="w-3 h-3 text-[#53bdeb]" />}
          </div>

          {/* Hover menu button */}
          <div className={`absolute top-1 ${isMine ? '-left-9' : '-right-9'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 rounded-full bg-[#202c33] flex items-center justify-center text-[#8696a0] hover:text-white border border-white/5 shadow"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Context menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 6 }}
              transition={{ duration: 0.12 }}
              className={`${isMine ? 'right-0' : 'left-0'} mt-1 bg-[#233240] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[160px]`}
            >
              <button onClick={() => { onReply(); setShowMenu(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#e8f1f9] hover:bg-[#2a3b4d] transition-colors">
                <Reply className="w-4 h-4 text-[#5288c1]" /> Reply
              </button>
              <button onClick={handleCopy} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#e8f1f9] hover:bg-[#2a3b4d] transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#8a9bb0]" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              {isMine && (
                <>
                  <div className="h-px bg-white/5 mx-3" />
                  <button onClick={() => { setEditing(true); setShowMenu(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#e8f1f9] hover:bg-[#2a3b4d] transition-colors">
                    <Edit2 className="w-4 h-4 text-[#8a9bb0]" /> Edit
                  </button>
                  <button onClick={handleDelete} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
