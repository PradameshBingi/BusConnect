import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://BusConnect:Qwer1234@cluster0.2e7tkui.mongodb.net/BusConnect?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

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

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10s timeout
    };

    console.log("📡 Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB Connected Successfully");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    // Register the model if it hasn't been registered yet
    if (!mongoose.models.Ticket) {
      mongoose.model('Ticket', ticketSchema);
    }
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Failure:", e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

/**
 * Helper to get the Ticket model safely
 */
export function getTicketModel() {
  return mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
}
