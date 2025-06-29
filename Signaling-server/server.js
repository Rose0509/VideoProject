// server.js
const fs = require('fs');
const { WebSocketServer } = require('ws'); // Imports the WebSocket library

const key = fs.readFileSync('key.pem');
const cert = fs.readFileSync('cert.pem');

const wss = new WebSocketServer({
  port: 8080,
  cert,
  key,
});

// Use a Map to store rooms and the clients in them.
// Key: roomId, Value: Set of WebSocket clients
const rooms = new Map();

console.log('WebSocket signaling server started on wss://localhost:8080');

wss.on('connection', ws => {
  console.log('New WebSocket connection established.');
  
  // We need a way to associate a client with a room.
  // Let's store the roomId on the WebSocket object itself.
  let roomId = null;

  ws.on('message', messageBuffer => {
    let message;
    try {
      // Messages are expected to be JSON strings
      message = JSON.parse(messageBuffer.toString());
    } catch (e) {
      console.error('Failed to parse message as JSON:', messageBuffer.toString());
      return;
    }

    console.log(`Message received:`, message);

    // The first message from a client should be a 'join' message.
    if (message.type === 'join' && message.roomId) {
      roomId = message.roomId;
      ws.roomId = roomId; // Associate the room with the websocket connection

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      
      const room = rooms.get(roomId);
      if (room.size >= 2) {
        // For a 1:1 call, we can reject the third user.
        console.log(`Room ${roomId} is full. Connection rejected.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
        ws.close();
        return;
      }

      room.add(ws);
      console.log(`Client joined room: ${roomId}. Room size: ${room.size}`);
      return; // Don't relay the 'join' message
    }

    // For all other message types, relay them to the other client in the same room.
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
            console.log(`Message relayed in room ${roomId}.`);
          }
        });
      }
    } else {
      console.warn('Client sent a message before joining a room.');
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed.');
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.delete(ws);
        console.log(`Client removed from room: ${roomId}. Room size: ${room.size}`);
        if (room.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} is empty and has been deleted.`);
        }
      }
    }
  });

  ws.on('error', err => {
    console.error('WebSocket error:', err);
  });
});
