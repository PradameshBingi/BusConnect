import { NextResponse } from 'next/server';
import dbConnect, { Ticket } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const { code } = await params;
    const ticketCode = code.toUpperCase();
    
    console.log("🔎 API Route Verifying Ticket:", ticketCode);

    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) {
      return NextResponse.json({ status: "invalid", message: "Ticket not found" }, { status: 404 });
    }

    // Check expiry (10 minutes)
    const now = new Date();
    const expiryTime = new Date(ticket.createdAt.getTime() + 600000);

    if (ticket.status === "valid" && now > expiryTime) {
      ticket.status = "expired";
      await ticket.save();
      console.log("⏰ Ticket Expired:", ticketCode);
    }

    return NextResponse.json({ status: ticket.status, ticket });
  } catch (err: any) {
    console.error("❌ API Route Verify Error:", err);
    return NextResponse.json({ error: "Connection issue" }, { status: 500 });
  }
}
