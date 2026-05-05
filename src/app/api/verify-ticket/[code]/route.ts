import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const Ticket = getTicketModel();
    const { code } = await params;
    
    if (!code) {
      return NextResponse.json({ error: "Missing ticket code in request" }, { status: 400 });
    }

    const ticketCode = code.toUpperCase();
    console.log("🔎 Searching Database for Ticket:", ticketCode);

    const ticket = await Ticket.findOne({ ticketCode });
    
    if (!ticket) {
      console.warn("⚠️ Ticket not found:", ticketCode);
      return NextResponse.json({ status: "invalid", message: "Ticket not found" }, { status: 404 });
    }

    // Auto-expiry logic (10 minutes)
    const now = new Date();
    const createdAt = new Date(ticket.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 600000); // 10 mins

    if (ticket.status === "valid" && now > expiryTime) {
      ticket.status = "expired";
      await ticket.save().catch(e => console.error("Failed to update status to expired:", e.message));
      console.log("⏰ Ticket automatically expired in DB:", ticketCode);
      return NextResponse.json({ status: "expired", ticket });
    }

    return NextResponse.json({ status: ticket.status, ticket });
  } catch (err: any) {
    console.error("❌ API /verify-ticket Error:", err);
    return NextResponse.json({ 
      error: "Could not retrieve ticket details", 
      details: err.message,
      help: "Ensure MongoDB connection is active and stable."
    }, { status: 500 });
  }
}
