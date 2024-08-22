const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

require("dotenv").config();

const userRouter = require("./router/user");
const studentRouter = require("./router/student");
const centreRouter = require("./router/centre");
const levelRouter = require("./router/level");
const subjectRouter = require("./router/subject");
const paymentsRouter = require("./router/payment");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/students", studentRouter);
app.use("/api/centres", centreRouter);
app.use("/api/levels", levelRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/users", userRouter);
app.use("/api/payments", paymentsRouter);

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on("message", (data) => {
    console.log(`Message from ${socket.id}:`, data);

    io.emit("message", data);
  });
});


require('./jobs/createMonthlyFees')
// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
