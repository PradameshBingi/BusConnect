
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const conn = await dbConnect();
    const { code } = await params;
    const ticketCode = code.toUpperCase();
    
    if (conn) {
      const Ticket = getTicketModel();
      const ticket = await Ticket.findOne({ ticketCode });
      if (!ticket) {
        return NextResponse.json({ status: "invalid", message: "Ticket not found" }, { status: 404 });
      }

      if (ticket.status === "used") {
        return NextResponse.json({ status: "already_used", message: "Cannot cancel a validated ticket" }, { status: 400 });
      }

      if (ticket.status === "cancelled") {
        return NextResponse.json({ status: "already_cancelled", message: "Ticket is already cancelled" }, { status: 400 });
      }

      ticket.status = "cancelled";
      await ticket.save();
      
      return NextResponse.json({ status: "cancelled", ticket: ticket.toObject() });
    }

    // SIMULATED MODE: Return success even if DB is missing
    console.log("✨ [Simulated Mode] Cancelling Ticket:", ticketCode);
    return NextResponse.json({ 
      status: "cancelled", 
      ticket: { ticketCode, status: "cancelled" },
      simulated: true 
    });

  } catch (err: any) {
    console.error("❌ API /cancel-ticket Error:", err);
    return NextResponse.json({ error: "Database operation failed", details: err.message }, { status: 500 });
  }
}
