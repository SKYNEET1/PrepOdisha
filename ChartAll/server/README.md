# OdishaPrep Chat Service

A real-time chat microservice built for the **OdishaPrep** platform. Students can discuss courses in group chats or send private direct messages — all secured by the same JWT auth system PrepOdisha already uses.

---

## Features

| Feature | Details |
|---|---|
| **Group Chat** | One chat room auto-created per course |
| **Direct Messages** | Student-to-student private 1-to-1 DMs |
| **Enrollment Guard** | Only enrolled students can join a course chat |
| **Instructor Block** | Instructors cannot read or join any chat |
| **Chat Admins** | Students can be promoted to admin by existing admins |
| **Admin Actions** | Kick members, promote others, pin messages |
| **Edit & Delete** | Soft-delete + edit (isEdited flag shown in UI) |
| **Typing Indicators** | Real-time "is typing..." via Socket.IO |
| **Online Presence** | Online/offline dots via /presence namespace |
| **Pagination** | Infinite scroll via page/limit query params |
| **Shared DB** | Reads PrepOdisha's User & Course collections directly |

---

## Architecture

```
odishaprep-chat/
├── index.js                  ← Entry point: Express + Socket.IO server
├── .env.example              ← Environment variable template
├── package.json
│
├── config/
│   └── database.js           ← MongoDB connection (shared with PrepOdisha DB)
│
├── models/
│   ├── Message.js            ← Stores all messages (group + DM)
│   └── ChatRoom.js           ← One room per course, tracks members & admins
│
├── controllers/
│   ├── roomController.js     ← REST: open/create room, kick, promote, pin
│   └── messageController.js  ← REST: get history, edit, delete
│
├── routes/
│   └── chat.js               ← All /api/v1/chat/* REST endpoints
│
├── sockets/
│   ├── groupChat.js          ← /group namespace: real-time group chat
│   ├── dmChat.js             ← /dm namespace: real-time direct messages
│   └── presence.js           ← /presence namespace: online status
│
├── middlewares/
│   ├── auth.js               ← HTTP middleware: verifyToken, isStudentOrAdmin, isChatAdmin
│   └── socketAuth.js         ← Socket.IO middleware: JWT verification for sockets
│
└── utils/
    ├── userRef.js            ← Re-exports PrepOdisha "user" Mongoose model
    ├── courseRef.js          ← Re-exports PrepOdisha "Course" Mongoose model
    └── onlineUsers.js        ← In-memory Map: userId → socketId
```

---

## Setup

### 1. Install dependencies
```bash
cd odishaprep-chat
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5001
MONGODB_URL=mongodb+srv://...      # Same URI as PrepOdisha
JWT_KEY=your_jwt_secret            # Must match PrepOdisha's JWT_KEY exactly
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

> ⚠️ `JWT_KEY` **must be identical** to the one in PrepOdisha's `.env`. The chat service verifies the same tokens PrepOdisha issues at login.

### 3. Run
```bash
# Development
npm run dev

# Production
npm start
```

---

## REST API Reference

All routes require `Authorization: Bearer <token>` header (the JWT from PrepOdisha login).

### Rooms

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/chat/rooms/:courseId` | Open/create room for a course. Returns room info + last 30 messages |
| `GET` | `/api/v1/chat/rooms/:courseId/members` | List all members |
| `POST` | `/api/v1/chat/rooms/:roomId/promote` | Promote a student to chat admin |
| `DELETE` | `/api/v1/chat/rooms/:roomId/kick` | Kick a member |
| `PATCH` | `/api/v1/chat/rooms/:roomId/pin` | Pin a message |

### Messages

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/chat/messages/room/:roomId?page=1&limit=30` | Paginated room message history |
| `GET` | `/api/v1/chat/messages/dm/:otherUserId?page=1&limit=30` | Paginated DM history |
| `PATCH` | `/api/v1/chat/messages/:messageId` | Edit a message `{ text }` |
| `DELETE` | `/api/v1/chat/messages/:messageId` | Soft-delete a message |

---

## Socket.IO Reference

Connect from the frontend:
```js
import { io } from "socket.io-client";

const CHAT_URL = "http://localhost:5001";
const token = "Bearer " + yourJwtToken;

// Group chat socket
const groupSocket = io(`${CHAT_URL}/group`, { auth: { token } });

// DM socket
const dmSocket = io(`${CHAT_URL}/dm`, { auth: { token } });

// Presence socket
const presenceSocket = io(`${CHAT_URL}/presence`, { auth: { token } });
```

### /group — Group Chat Namespace

| Direction | Event | Payload | Description |
|---|---|---|---|
| emit | `joinRoom` | `{ roomId }` | Join a course chat room |
| emit | `leaveRoom` | `{ roomId }` | Leave a room |
| emit | `sendMessage` | `{ roomId, text }` | Send a message |
| emit | `typing` | `{ roomId }` | Start typing indicator |
| emit | `stopTyping` | `{ roomId }` | Stop typing |
| emit | `editMessage` | `{ messageId, newText }` | Edit own message |
| emit | `deleteMessage` | `{ messageId }` | Delete own message |
| on | `message` | `message object` | New message broadcast |
| on | `messageEdited` | `{ messageId, newText }` | Edit broadcast |
| on | `messageDeleted` | `{ messageId }` | Delete broadcast |
| on | `userJoined` | `{ userId, name }` | Someone joined |
| on | `userLeft` | `{ userId, name }` | Someone left |
| on | `userTyping` | `{ userId, name }` | Typing indicator |
| on | `userStopTyping` | `{ userId }` | Stop typing |
| on | `error` | `{ message }` | Error feedback |

### /dm — Direct Message Namespace

| Direction | Event | Payload | Description |
|---|---|---|---|
| emit | `sendDM` | `{ toUserId, text }` | Send a DM |
| emit | `typing` | `{ toUserId }` | Typing indicator to recipient |
| emit | `stopTyping` | `{ toUserId }` | Stop typing |
| emit | `editDM` | `{ messageId, newText }` | Edit own DM |
| emit | `deleteDM` | `{ messageId }` | Delete own DM |
| on | `dm` | `message object` | Incoming DM |
| on | `dmEdited` | `{ messageId, newText }` | DM edit notification |
| on | `dmDeleted` | `{ messageId }` | DM delete notification |
| on | `userTyping` | `{ userId, name }` | Recipient is typing |
| on | `userStopTyping` | `{ userId }` | Typing stopped |

### /presence — Presence Namespace

| Direction | Event | Payload | Description |
|---|---|---|---|
| on | `onlineUsers` | `{ userIds: string[] }` | Full online list on connect |
| on | `userOnline` | `{ userId }` | Someone came online |
| on | `userOffline` | `{ userId }` | Someone went offline |

---

## Frontend Integration Flow

```
1. Student logs in via PrepOdisha → receives JWT
2. Student opens a Course detail page
3. Frontend calls:
   GET /api/v1/chat/rooms/:courseId   (with JWT)
   → Returns roomId + recent messages
4. Frontend connects sockets with the JWT
5. Frontend emits joinRoom({ roomId })
6. Messages flow via sendMessage / on("message")
```

---

## Access Control Summary

| Role | Group Chat | DMs | Admin Actions |
|---|---|---|---|
| Student (enrolled) | ✅ Read + Write | ✅ | ❌ (unless promoted) |
| Student (chat admin) | ✅ Read + Write | ✅ | ✅ Kick, Promote, Pin |
| Student (not enrolled) | ❌ Blocked | ✅ | ❌ |
| Instructor | ❌ Blocked entirely | ❌ | ❌ |
| OdishaPrep Admin | ✅ All rooms | ✅ | ✅ |

---

## Notes

- **Shared Database**: This service connects to the same MongoDB as PrepOdisha. No data duplication.
- **Soft Delete**: Messages are never hard-deleted. `deletedAt` is set and the UI hides them.
- **Scaling**: The in-memory `onlineUsers` map works for a single server instance. For multi-instance deployments, replace it with Redis (ioredis).
- **Message Encryption**: Not implemented. Add at-rest encryption on the `text` field if needed.
