# Real-Time Polling Backend (Move37 Ventures Challenge)

Backend service built with Node.js, Express, PostgreSQL, Prisma and Socket.IO.

## Features
- REST API for Users, Polls and Votes
- Prisma schema modeling User, Poll, PollOption and Vote (many-to-many via Vote)
- Real-time broadcasting of poll results via WebSocket (Socket.IO)

## Files
- `prisma/schema.prisma` - Prisma schema
- `src/index.js` - App entry (Express + Socket.IO)
- `src/websocket.js` - Socket helper
- `src/routes/*.js` - Route definitions
- `src/controllers/*.js` - Controllers
- `.env.example` - Example environment variables

## Setup (local)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` from `.env.example` and set `DATABASE_URL`.
   Example:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/voting"
   ```
3. Initialize Prisma and run migration:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Start server:
   ```bash
   npm run dev
   ```
   The server runs on port `4000` by default.

## API Endpoints (summary)
- `POST /users` - create user `{ name, email, password }`
- `GET /users/:id` - fetch user
- `POST /polls` - create poll with options:
  ```json
  {
    "question": "Your question?",
    "creatorId": 1,
    "options": ["A", "B", "C"]
  }
  ```
- `GET /polls/:id` - get poll with options and vote counts
- `POST /votes` - submit vote:
  ```json
  { "userId": 1, "pollOptionId": 2 }
  ```

## Real-time
- Clients should connect to Socket.IO on the same host (port 4000).
- To subscribe to updates for a poll, emit: `joinPoll` with payload `{ pollId }`.
- When a vote is cast, the server emits `pollUpdated` to that poll room with updated counts.

## Deployment
- Push repository to GitHub and use Render / Railway / Heroku.
- Ensure `DATABASE_URL` env var is set in hosting provider.
- Start command: `node src/index.js`

## Notes
- This project uses simple password hashing with `bcryptjs`. For production, implement full auth (JWT, refresh tokens) and secure env handling.