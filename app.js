const express = require("express");
const socketio = require("socket.io");
const app = express();
const http = require("http");
const { allowedOrigins } = require("./config/env/development");
const server = http.createServer(app);
const io = socketio(server);
let PORT = 8000;
require("dotenv").config();

require("./app-config")(app);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Server Testing
app.get("/", (req, res) => {
  res.send("heloo");
});

server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
