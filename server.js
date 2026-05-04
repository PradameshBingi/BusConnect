console.log(">>> STARTED FILE");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

console.log("Express, Mongoose, CORS loaded");
// Hardcoded MongoDB URL for project consistency
const MONGO_URL = "mongodb+srv://BusConnect:Qwer1234@cluster0.2e7tkui.mongodb.net/BusConnect?retryWrites=true&w=majority";

console.log("Connecting to MongoDB...");

mongoose.connect(MONGO_URL, {
  serverSelectionTimeoutMS: 10000
})
.then(() => {
  console.log("MongoDB Connected ");
})
.catch(err => {
  console.log("MongoDB Connection Error ");
  console.log(err);
});

mongoose.connection.on("error", err => {
  console.log("MongoDB Runtime Error:", err);
});

// Expanded Schema to support all high-fidelity features
const ticketSchema = new mongoose.Schema({
  ticketCode: { type: String, unique: true },
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
  status: { type: String, default: "valid" }, // valid, used, expired, cancelled
  createdAt: { type: Date, default: Date.now },
  validatedAt: Date
});

const Ticket = mongoose.model("Ticket", ticketSchema);

// CREATE TICKET API
app.post("/create-ticket", async (req, res) => {
  try {
    const data = req.body;

    // The frontend sends the unique ticketCode generated based on route
    const ticket = new Ticket({
      ...data,
      createdAt: new Date(),
      status: "valid"
    });

    await ticket.save();
    res.json({ status: "created", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY TICKET API (Fetches details and checks status)
app.get("/verify-ticket/:code", async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketCode: req.params.code.toUpperCase() });

    if (!ticket) return res.json({ status: "invalid" });

    // Handle auto-expiry logic (1 minute window for demo purposes as per current requirements)
    const now = new Date();
    const expiryTime = new Date(ticket.createdAt.getTime() + 60000);
    
    if (ticket.status === "valid" && now > expiryTime) {
      ticket.status = "expired";
      await ticket.save();
    }

    res.json({ status: ticket.status, ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VALIDATE (USE) TICKET API
app.post("/use-ticket/:code", async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketCode: req.params.code.toUpperCase() });

    if (!ticket) return res.json({ status: "invalid" });
    if (ticket.status === "used") return res.json({ status: "already_used", ticket });

    ticket.status = "used";
    ticket.validatedAt = new Date();
    
    // If the conductor passed a new bus type or fare difference during validation (Fare Check tool)
    if (req.body.busType) ticket.busType = req.body.busType;
    if (req.body.totalFare) ticket.totalFare = req.body.totalFare;
    if (req.body.fare) ticket.fare = req.body.fare;

    await ticket.save();

    res.json({ status: "updated", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("BusConnect Server Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000 ");
});
