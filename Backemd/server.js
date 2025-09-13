// server.js

require("dotenv").config(); // <-- هذا هو السطر المفقود

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/eventdb")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Middlewares
app.use(express.json());
app.use(cors());

// Import routes
const userRoutes = require("./routes/userRoutes");
const conferenceRoutes = require("./routes/conferenceRoutes");

// Use routes
app.use("/api/auth", userRoutes);
app.use("/api/conferences", conferenceRoutes);

// A simple root route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
