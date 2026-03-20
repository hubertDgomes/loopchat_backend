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
import messageSchema from "./model/messageSchema.js";
import { log } from "console";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://loopchat-client.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.set("trust proxy", 1);

app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, sameSite: "none", httpOnly: true }
  // cookie: { secure: false, sameSite: "lax", httpOnly: false }
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
  cors: corsOptions
});

// 🔥 SOCKET LOGIC
io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

  // Join Room
  socket.on("join_room", (room) => {
    socket.join(room);
    // console.log(`User joined room: ${room}`);
  });

  // Send Message
  socket.on("send_message", async (data) => {
    // data is { room, text, sender }
    const msg = await messageSchema.create({ room: data.room, sender: data.sender, text: data.text });
    // Emit the exact message document created in the DB back to the clients
    io.to(data.room).emit("receive_message", msg);
  });

  //Fetch old message 
  socket.on("get_message" , async (roomId)=> {
    const message = await messageSchema.find({room : roomId}).sort({createdAt  : 1})
    socket.emit("load_message" , message)
    console.log(message);
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ❗ USE server.listen instead of app.listen
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});