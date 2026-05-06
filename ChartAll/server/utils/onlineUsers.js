/**
 * onlineUsers.js
 * ──────────────────────────────────────────────────────────────
 * Simple in-memory Map that tracks which users are currently
 * connected (online) via Socket.IO.
 *
 * Structure: Map<userId (string), socketId (string)>
 *
 * This is intentionally kept in-memory (not Redis) for simplicity.
 * If you scale to multiple server instances later, swap this out
 * for a Redis-backed approach using ioredis.
 */

const onlineUsers = new Map();

module.exports = {
  /**
   * Mark a user as online when their socket connects.
   * @param {string} userId
   * @param {string} socketId
   */
  setOnline(userId, socketId) {
    onlineUsers.set(userId, socketId);
  },

  /**
   * Remove a user when their socket disconnects.
   * @param {string} userId
   */
  setOffline(userId) {
    onlineUsers.delete(userId);
  },

  /**
   * Check if a user is currently connected.
   * @param {string} userId
   * @returns {boolean}
   */
  isOnline(userId) {
    return onlineUsers.has(userId);
  },

  /**
   * Get the socketId for a given user (useful for targeted DM delivery).
   * @param {string} userId
   * @returns {string|undefined}
   */
  getSocketId(userId) {
    return onlineUsers.get(userId);
  },

  /**
   * Get all currently online user IDs (for presence broadcasts).
   * @returns {string[]}
   */
  getAllOnline() {
    return Array.from(onlineUsers.keys());
  },
};
