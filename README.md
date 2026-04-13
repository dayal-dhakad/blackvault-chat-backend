# Real-Time Chat App Backend

Production-ready backend for a one-to-one real-time chat application built with Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, and Socket.IO.

## Features

- User registration, login, refresh token flow, logout, and current-user endpoint
- JWT authentication with short-lived access tokens and long-lived refresh tokens
- One-to-one conversations with auto-create on first message
- Real-time messaging with Socket.IO
- Online/offline presence tracking
- Typing indicators
- Read receipts and unread counts
- Paginated message history
- Search users by name or email
- Modular architecture with controllers, services, middleware, validators, and socket layer
- Security middleware with `helmet`, `cors`, rate limiting, and centralized error handling

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Socket.IO
- JWT
- bcryptjs
- zod

## Project Structure

```txt
src
├── app.ts
├── server.ts
├── config
├── controllers
├── lib
├── middlewares
├── models
├── routes
├── scripts
├── services
├── socket
├── types
├── utils
└── validators
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm run dev
```

4. Optional seed test users:

```bash
npm run seed
```

## Environment Variables

See [.env.example](./.env.example).

Required values:

- `PORT`
- `MONGODB_URI`
- `CLIENT_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`

## REST API

Base URL:

```txt
http://localhost:5000/api
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Users

- `GET /users`
- `GET /users/search?q=john`

### Conversations

- `GET /conversations`
- `POST /conversations/access`

### Messages

- `GET /messages/:conversationId?page=1&limit=20`
- `POST /messages`
- `PATCH /messages/:messageId/read`

## Example Request Payloads

### Register

```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123",
  "avatar": "https://example.com/avatar.png"
}
```

### Login

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

### Refresh

```json
{
  "refreshToken": "your-refresh-token"
}
```

### Access Conversation

```json
{
  "targetUserId": "USER_ID_HERE"
}
```

### Send Message

```json
{
  "receiverId": "USER_ID_HERE",
  "conversationId": "OPTIONAL_CONVERSATION_ID",
  "text": "Hello there",
  "type": "text"
}
```

## Socket.IO Integration

Socket server URL:

```txt
http://localhost:5000
```

Connect from React with access token in `auth` payload:

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: accessToken
  },
  withCredentials: true
});
```

### Client Emits

- `setup`
- `join_conversation`
- `send_message`
- `typing`
- `stop_typing`
- `mark_read`

### Server Emits

- `connected`
- `receive_message`
- `user_online`
- `user_offline`
- `typing`
- `stop_typing`
- `message_read`
- `conversation_updated`

## Frontend Integration Notes

Use the access token in the `Authorization` header for protected REST endpoints:

```txt
Authorization: Bearer <access_token>
```

Suggested frontend flow:

1. Register or login using `/api/auth/register` or `/api/auth/login`
2. Store `accessToken` and `refreshToken`
3. Fetch current user with `/api/auth/me`
4. Load users with `/api/users`
5. Load chat list with `/api/conversations`
6. Open a chat with `/api/conversations/access`
7. Load messages with `/api/messages/:conversationId?page=1&limit=20`
8. Send messages with `POST /api/messages` or `send_message` socket event
9. Mark messages as read with `PATCH /api/messages/:messageId/read` or `mark_read`
10. Reconnect socket with the latest access token after refresh

## Notes

- Access tokens are meant for short-lived API and socket authentication.
- Refresh tokens are rotated on login and refresh.
- Conversations are sorted by latest activity.
- Unread counts are returned in the conversation list.
- Users cannot fetch conversations or messages they do not belong to.
