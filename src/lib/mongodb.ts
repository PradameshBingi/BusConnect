
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI || MONGODB_URI.trim() === "") {
    console.error("❌ MONGODB_URI is missing or empty in environment variables");
    throw new Error("Database configuration (MONGODB_URI) is missing.");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      tlsAllowInvalidCertificates: true,
      connectTimeoutMS: 20000, // Increased timeout for slower connections
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 15000,
    };

    console.log("📡 Attempting to connect to MongoDB...");
    // Ensure the URI is trimmed of any accidental whitespace
    const cleanUri = MONGODB_URI.trim();
    
    cached.promise = mongoose.connect(cleanUri, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB Connected Successfully");
      return mongooseInstance;
    }).catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
      cached.promise = null;
      throw new Error(`Failed to connect to database: ${err.message}`);
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

// Ticket Schema Definition
const TicketSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  routeNo: String,
  passengers: String,
  quantities: {
    Men: { type: Number, default: 0 },
    Child: { type: Number, default: 0 },
    Women: { type: Number, default: 0 }
  },
  totalFare: { type: Number, required: true },
  fare: { type: Number, required: true },
  ticketCode: { type: String, unique: true, required: true },
  securityCode: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['valid', 'used', 'expired', 'cancelled'], 
    default: 'valid' 
  },
  createdAt: { type: Date, default: Date.now },
  busType: { type: String, required: true },
  validatedAt: Date,
  walletAmountUsed: { type: Number, default: 0 }
});

export function getTicketModel() {
  // Use singleton pattern for the model to prevent OverwriteModelError
  return mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
}
