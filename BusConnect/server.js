console.log(">>> SERVER INITIALIZING");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =========================
   🔥 STRONG CORS FIX (REAL FIX)
========================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// 🔥 HANDLE PREFLIGHT REQUESTS (IMPORTANT)
//app.options("*", cors());

app.use(express.json());

/* =========================
   🔍 REQUEST LOGGER (DEBUG)
========================= */
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

console.log("Express, Mongoose, CORS configured");

/* =========================
   🔗 MONGODB CONNECTION
========================= */
const MONGO_URL = "mongodb+srv://BusConnect:Qwer1234@cluster0.2e7tkui.mongodb.net/BusConnect?retryWrites=true&w=majority";

mongoose.connect(MONGO_URL, {
  serverSelectionTimeoutMS: 20000,
  connectTimeoutMS: 20000,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err.message));

/* =========================
   📦 SCHEMA
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
   🎫 CREATE TICKET
========================= */
app.post("/create-ticket", async (req, res) => {
  try {
    console.log("➡️ Incoming ticket request:", req.body);

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

    console.log("✅ Ticket saved:", ticketCode);

    res.status(201).json({ status: "created", ticket });

  } catch (err) {
    console.error("❌ Create Ticket Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   🔍 VERIFY TICKET
========================= */
app.get("/verify-ticket/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();

    console.log("🔎 Verifying:", code);

    const ticket = await Ticket.findOne({ ticketCode: code });

    if (!ticket) {
      return res.json({ status: "invalid" });
    }

    // ⏱ Expiry (10 minutes)
    const now = new Date();
    const expiry = new Date(ticket.createdAt.getTime() + 600000);

    if (ticket.status === "valid" && now > expiry) {
      ticket.status = "expired";
      await ticket.save();
    }

    res.json({ status: ticket.status, ticket });

  } catch (err) {
    console.error("❌ Verify Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ✅ USE TICKET
========================= */
app.post("/use-ticket/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();

    console.log("🧾 Using ticket:", code);

    const ticket = await Ticket.findOne({ ticketCode: code });

    if (!ticket) return res.status(404).json({ status: "invalid" });

    if (ticket.status === "used") {
      return res.json({ status: "already_used", ticket });
    }

    ticket.status = "used";
    ticket.validatedAt = new Date();

    await ticket.save();

    res.json({ status: "updated", ticket });

  } catch (err) {
    console.error("❌ Use Ticket Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   🌐 ROOT
========================= */
app.get("/", (req, res) => {
  res.send("BusConnect Server Running - Status OK");
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
