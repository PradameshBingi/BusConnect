import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://BusConnect:Qwer1234@cluster0.2e7tkui.mongodb.net/BusConnect?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

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

    console.log("📡 Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully");
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

const TicketSchema = new mongoose.Schema({
  from: String,
  to: String,
  routeNo: String,
  passengers: String,
  quantities: {
    Men: Number,
    Child: Number,
    Women: Number
  },
  totalFare: Number,
  fare: Number,
  ticketCode: { type: String, unique: true },
  securityCode: String,
  status: { type: String, default: 'valid' },
  createdAt: { type: Date, default: Date.now },
  busType: String,
  validatedAt: Date,
  walletAmountUsed: Number
});

export function getTicketModel() {
  return mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
}
