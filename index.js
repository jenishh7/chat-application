const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("join room", ({ username, room }) => {
    socket.join(room);
    socket.to(room).emit("user joined", { username, id: socket.id });
  });

  socket.on("chat message", ({ username, room, message }) => {
    io.to(room).emit("chat message", { username, message });
  });

  socket.on("signal", (data) => {
    io.to(data.userToSignal).emit("signal", {
      callerID: data.callerID,
      signal: data.signal
    });
  });

  socket.on("returning signal", (data) => {
    io.to(data.callerID).emit("receiving returned signal", {
      id: socket.id,
      signal: data.signal
    });
  });

  socket.on("disconnect", () => {
    io.emit("user disconnected", socket.id);
  });
});

const PORT = 3030;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
