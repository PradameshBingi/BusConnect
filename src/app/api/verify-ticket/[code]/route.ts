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
      return NextResponse.json({ error: "Missing ticket code" }, { status: 400 });
    }

    const ticketCode = code.toUpperCase();
    console.log("🔎 Verifying Ticket:", ticketCode);

    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) {
      return NextResponse.json({ status: "invalid", message: "Ticket not found" }, { status: 404 });
    }

    // Check expiry logic (10 minutes)
    const now = new Date();
    const createdAt = new Date(ticket.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 600000);

    if (ticket.status === "valid" && now > expiryTime) {
      try {
        ticket.status = "expired";
        await ticket.save();
        console.log("⏰ Auto-expired ticket:", ticketCode);
      } catch (saveErr) {
        console.warn("⚠️ Could not update expiry status in DB, but returning as expired in response.");
      }
      return NextResponse.json({ status: "expired", ticket });
    }

    return NextResponse.json({ status: ticket.status, ticket });
  } catch (err: any) {
    console.error("❌ API Verify Error:", err);
    return NextResponse.json({ 
      error: err.message || "Database connection error",
      details: "Ensure your MongoDB IP whitelist includes this environment."
    }, { status: 500 });
  }
}
