import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://BusConnect:Qwer1234@cluster0.2e7tkui.mongodb.net/BusConnect?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected via Next.js API");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

// Ticket Model Schema
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

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
