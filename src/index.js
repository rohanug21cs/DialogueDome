// Import necessary modules
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

// Creating an Express application
const app = express();
// Creating an HTTP server using the Express app
const server = http.createServer(app);
// Create a Socket.IO instance attached to the server
const io = socketio(server);
// Load environment variables from a .env file
require("dotenv").config();
// Define the port for the server, defaulting to 3000
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

// Serve static files from the public directory
app.use(express.static(publicDirectoryPath));

// Event listener for a new WebSocket connection
io.on("connection", socket => {
  console.log("New WebSocket connection");

  // Event listener for a user joining a room
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    } else {
      // Add the user to the room
      socket.join(user.room);

      socket.emit("message", generateMessage("Admin", "Welcome!"));
      // Broadcast to all users in the room that a new user has joined
      socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`));
      // Update room data and send it to all clients in the room
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });

      callback(); // Callback to acknowledge successful join
    }
  });

  // Event listener for sending text messages
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    // Check for profanity in the message
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    } else {
      // Broadcast the message to all users in the room
      io.to(user.room).emit("message", generateMessage(user.username, message));
      // Callback to acknowledge successful message sending
      callback();
    }
  });

  // Event listener for sending location messages
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback(); // Callback to acknowledge successful location sharing
  });

  // Event listener for a user disconnecting
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      // Broadcast a message to the room when a user leaves
      io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left!`));
      // Update room data and send it to all clients in the room
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
