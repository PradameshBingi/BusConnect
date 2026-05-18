
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const { code } = await params;
    const ticketCode = code.toUpperCase();
    
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

  } catch (err: any) {
    console.error("❌ API /cancel-ticket Error:", err);
    return NextResponse.json({ 
      error: "Database Unreachable", 
      details: err.message 
    }, { status: 500 });
  }
}
