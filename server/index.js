const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// roomCode -> [{ id, name }]
const usersInRoom = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ name, room }) => {
    socket.join(room);

    if (!usersInRoom[room]) {
      usersInRoom[room] = [];
    }

    usersInRoom[room].push({ id: socket.id, name });

    io.to(room).emit("roomUsers", usersInRoom[room]);

    socket.to(room).emit("message", {
      name: "System",
      message: `${name} joined the room`
    });
  });

  socket.on("sendMessage", ({ name, room, message }) => {
    io.to(room).emit("message", { name, message });
  });

  socket.on("disconnect", () => {
    for (const room in usersInRoom) {
      const user = usersInRoom[room].find(
        (u) => u.id === socket.id
      );

      usersInRoom[room] = usersInRoom[room].filter(
        (u) => u.id !== socket.id
      );

      io.to(room).emit("roomUsers", usersInRoom[room]);

      if (user) {
        io.to(room).emit("message", {
          name: "System",
          message: `${user.name} left the room`
        });
      }
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
