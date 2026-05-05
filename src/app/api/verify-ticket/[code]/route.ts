
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

// FORCE dynamic mode to prevent static export errors
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const Ticket = getTicketModel();
    const { code } = await context.params;
    
    if (!code) {
      return NextResponse.json({ error: "Missing ticket code" }, { status: 400 });
    }

    const ticketCode = code.toUpperCase();
    console.log("🔎 Verifying Ticket:", ticketCode);

    const ticket = await Ticket.findOne({ ticketCode });
    
    if (!ticket) {
      return NextResponse.json({ status: "invalid", message: "Ticket not found" }, { status: 404 });
    }

    // Auto-expiry logic (10 minutes for prototype)
    const now = new Date();
    const createdAt = new Date(ticket.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 600000); 

    if (ticket.status === "valid" && now > expiryTime) {
      ticket.status = "expired";
      await ticket.save().catch(e => console.error("Expiry update failed:", e.message));
      return NextResponse.json({ status: "expired", ticket });
    }

    return NextResponse.json({ status: ticket.status, ticket });
  } catch (err: any) {
    console.error("❌ API /verify-ticket Error:", err);
    return NextResponse.json({ 
      error: "Server Error", 
      details: err.message 
    }, { status: 500 });
  }
}
