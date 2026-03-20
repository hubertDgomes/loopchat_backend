import express from "express";
import "dotenv/config";
import dbConnector from "./config/dbConnector.js";
import router from "./routes/allRoutes.js";
import session from "express-session";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.set("trust proxy", 1);

app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, sameSite: "lax", httpOnly: false }
}));

// Routes
app.get("/", (req, res) => {
  res.send("The server is working!");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", router);

// DB
dbConnector();


// 🔥 CREATE HTTP SERVER
const server = http.createServer(app);

// 🔥 SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

// 🔥 SOCKET LOGIC
io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

  // Join Room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Send Message
  socket.on("send_message", (data) => {
    // { room, message, author }
    console.log(data);
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ❗ USE server.listen instead of app.listen
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});