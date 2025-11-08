import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Création du WebSocketServer
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());

    // Echo du message à tous les clients
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(`Server echo: ${message}`);
      }
    });
  });

  ws.send("Welcome to ChessLite WebSocket server!");
});
