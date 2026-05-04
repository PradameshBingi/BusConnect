console.log(">>> SERVER INITIALIZING");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Comprehensive CORS configuration for production
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

app.use(express.json());

// Log every request to help with debugging connection issues
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

console.log("Express, Mongoose, CORS configured");

const MONGO_URL = "mongodb+srv://BusConnect:Qwer1234@cluster0.2e7tkui.mongodb.net/BusConnect?retryWrites=true&w=majority";

console.log("Connecting to MongoDB...");

mongoose.connect(MONGO_URL, {
  serverSelectionTimeoutMS: 20000, 
  connectTimeoutMS: 20000,
})
.then(() => {
  console.log("MongoDB Connected Successfully");
})
.catch(err => {
  console.error("MongoDB Connection Error: ", err.message);
});

const ticketSchema = new mongoose.Schema({
  ticketCode: { type: String, unique: true, required: true },
  from: String,
  to: String,
  routeNo: String,
  passengers: String,
  quantities: Object,
  totalFare: Number,
  fare: Number,
  walletAmountUsed: { type: Number, default: 0 },
  securityCode: String,
  busType: String,
  status: { type: String, default: "valid" }, 
  createdAt: { type: Date, default: Date.now },
  validatedAt: Date
});

const Ticket = mongoose.model("Ticket", ticketSchema);

// CREATE TICKET API
app.post("/create-ticket", async (req, res) => {
  try {
    const data = req.body;
    
    // Backend generates the ticket code
    const routeNo = data.routeNo || '00';
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `TKT-${routeNo}-${randomSuffix}`;

    const ticket = new Ticket({
      ...data,
      ticketCode: ticketCode,
      createdAt: new Date(),
      status: "valid"
    });

    await ticket.save();
    console.log("Ticket saved successfully:", ticket.ticketCode);
    res.status(201).json({ status: "created", ticket });
  } catch (err) {
    console.error("Error creating ticket:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// VERIFY TICKET API
app.get("/verify-ticket/:code", async (req, res) => {
  const code = req.params.code.toUpperCase();
  try {
    const ticket = await Ticket.findOne({ ticketCode: code });

    if (!ticket) {
      return res.json({ status: "invalid" });
    }

    // Auto-expiry logic (10 minutes for digital tickets)
    const now = new Date();
    const expiryTime = new Date(ticket.createdAt.getTime() + 600000);
    
    if (ticket.status === "valid" && now > expiryTime) {
      ticket.status = "expired";
      await ticket.save();
    }

    res.json({ status: ticket.status, ticket });
  } catch (err) {
    console.error("Error verifying ticket:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// VALIDATE (USE) TICKET API
app.post("/use-ticket/:code", async (req, res) => {
  const code = req.params.code.toUpperCase();
  try {
    const ticket = await Ticket.findOne({ ticketCode: code });

    if (!ticket) return res.status(404).json({ status: "invalid" });
    if (ticket.status === "used") return res.json({ status: "already_used", ticket });

    ticket.status = "used";
    ticket.validatedAt = new Date();
    
    if (req.body.busType) ticket.busType = req.body.busType;
    if (req.body.totalFare) ticket.totalFare = req.body.totalFare;
    if (req.body.fare) ticket.fare = req.body.fare;

    await ticket.save();
    res.json({ status: "updated", ticket });
  } catch (err) {
    console.error("Error validating ticket:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("BusConnect Server Running - Status OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
