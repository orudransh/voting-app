require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const websocket = require('./websocket');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/users', require('./routes/user'));
app.use('/polls', require('./routes/poll'));
app.use('/votes', require('./routes/vote'));

// Basic health
app.get('/', (req, res) => res.json({ ok: true }));

// Start websocket logic
websocket(io, prisma);

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});