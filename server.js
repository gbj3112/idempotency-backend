const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

app.use(express.json());
app.use(cors());

// Needed for TEST 1
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server running" });
});

// Routes
app.use("/orders", require("./routes/orderRoutes"));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});