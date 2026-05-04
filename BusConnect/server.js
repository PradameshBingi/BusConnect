console.log(">>> STARTED FILE");

// Step 1
const express = require("express");
console.log("Express loaded");

// Step 2
const mongoose = require("mongoose");
console.log("Mongoose loaded");

// Step 3
const cors = require("cors");
console.log("CORS loaded");

const app = express();
app.use(express.json());
app.use(cors());

console.log("Middlewares set");

// 🔗 Hardcoded URL (no .env confusion)
const MONGO_URL = "mongodb+srv://BusConnect:Qwer1234@cluster0.2e7tkui.mongodb.net/BusConnect?retryWrites=true&w=majority";

console.log("Connecting to MongoDB...");

mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

app.get("/", (req, res) => {
  res.send("BusConnect Server Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
