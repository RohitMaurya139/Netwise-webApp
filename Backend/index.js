import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import connectionRouter from "./routes/connectionRoutes.js";
import http from "http";
import { Server } from "socket.io";
import notificationRouter from "./routes/notificationRoutes.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// Change these to match your deployment domains
const allowedOrigins = [
  "https://netwise-webapp-frontend.onrender.com",
  "https://netwise-web-app.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

// CORS middleware for REST API
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter);

// Socket.IO server with CORS
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Socket.IO event handlers
export const userSocketMap = new Map();
io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
startServer();
