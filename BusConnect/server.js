console.log(">>> BUSCONNECT SERVER INITIALIZING");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =========================
   🔥 ROBUST CORS FOR WORKSTATIONS
========================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true
}));

app.use(express.json());

/* =========================
   🔍 REQUEST LOGGER
========================= */
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log("📦 Body:", req.body);
  next();
});

/* =========================
   🔗 MONGODB CONNECTION
========================= */
const MONGO_URL = "mongodb+srv://BusConnect:Qwer1234@cluster0.2e7tkui.mongodb.net/BusConnect?retryWrites=true&w=majority";

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

/* =========================
   📦 TICKET SCHEMA
========================= */
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

/* =========================
   🎫 API: CREATE TICKET
========================= */
app.post("/api/create-ticket", async (req, res) => {
  try {
    const data = req.body;
    const routeNo = data.routeNo || "00";
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `TKT-${routeNo}-${randomSuffix}`;

    const ticket = new Ticket({
      ...data,
      ticketCode,
      status: "valid",
      createdAt: new Date()
    });

    await ticket.save();
    console.log("✨ Ticket Created in DB:", ticketCode);
    res.status(201).json({ status: "created", ticket });
  } catch (err) {
    console.error("❌ Create Ticket Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   🔍 API: VERIFY TICKET
========================= */
app.get("/api/verify-ticket/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    console.log("🔎 Verifying Ticket:", code);

    const ticket = await Ticket.findOne({ ticketCode: code });
    if (!ticket) {
      return res.status(404).json({ status: "invalid", message: "Ticket not found" });
    }

    // Check expiry (10 minutes for this demo)
    const now = new Date();
    const expiryTime = new Date(ticket.createdAt.getTime() + 600000);

    if (ticket.status === "valid" && now > expiryTime) {
      ticket.status = "expired";
      await ticket.save();
      console.log("⏰ Ticket Expired:", code);
    }

    res.json({ status: ticket.status, ticket });
  } catch (err) {
    console.error("❌ Verify Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ✅ API: USE TICKET
========================= */
app.post("/api/use-ticket/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    console.log("🧾 Validating Ticket Action:", code);

    const ticket = await Ticket.findOne({ ticketCode: code });
    if (!ticket) return res.status(404).json({ status: "invalid" });

    if (ticket.status === "used") {
      return res.status(400).json({ status: "already_used", message: "Ticket already validated" });
    }

    if (ticket.status === "expired" || ticket.status === "cancelled") {
      return res.status(400).json({ status: ticket.status, message: `Ticket is ${ticket.status}` });
    }

    ticket.status = "used";
    ticket.validatedAt = new Date();

    if (req.body.busType) ticket.busType = req.body.busType;
    if (req.body.totalFare) ticket.totalFare = req.body.totalFare;
    if (req.body.fare) ticket.fare = req.body.fare;

    await ticket.save();
    console.log("✅ Ticket marked as USED in DB:", code);
    res.json({ status: "updated", ticket });
  } catch (err) {
    console.error("❌ Use Ticket Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   🌐 ROOT & HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("BusConnect API Server - ONLINE on Port 5000");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 BusConnect Backend is running!`);
  console.log(`📡 Listening at http://0.0.0.0:${PORT}`);
  console.log(`🔒 CORS enabled for all origins\n`);
});
