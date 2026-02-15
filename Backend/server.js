require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors"); // ✅ Import CORS
const connectDB = require("./config/db");
const logger = require("./controllers/logger");
const requestLogger = require("./middleware/requestLogger");
const { initializeSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

// ✅ List of allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

// ✅ CORS middleware usage
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check against allowed origins list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow ngrok domains dynamically
    if (origin.endsWith('.ngrok-free.app') || origin.endsWith('.ngrok.io') || origin.endsWith('.ngrok-free.dev')) {
      return callback(null, true);
    }

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: "GET,POST,PUT,PATCH,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

// Connect to MongoDB
connectDB();

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(requestLogger);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
const orderRoutes = require('./routes/ordersRoutes');
app.use('/api/orders', orderRoutes);
const favoritesRoutes = require('./routes/favoritesRoutes');
app.use('/api/favorites', favoritesRoutes);
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// Initialize Socket.IO
initializeSocket(server, allowedOrigins);

// Default route for testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server (use `server.listen` instead of `app.listen` for Socket.IO)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.success(`Server running on port ${PORT}`));
