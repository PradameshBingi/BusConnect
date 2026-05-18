import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 503 });
    }

    const Ticket = getTicketModel();
    const { code } = await params;
    const ticketCode = code.toUpperCase();
    const updateData = await request.json().catch(() => ({}));
    
    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) return NextResponse.json({ status: "invalid" }, { status: 404 });

    if (ticket.status === "used") {
      return NextResponse.json({ status: "already_used", message: "Ticket already validated" }, { status: 400 });
    }

    if (ticket.status === "cancelled") {
      return NextResponse.json({ status: "cancelled", message: "Ticket is cancelled" }, { status: 400 });
    }

    const now = new Date();
    const createdAt = new Date(ticket.createdAt);
    const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000);
    
    if (now > expiryTime || ticket.status === 'expired') {
        ticket.status = 'expired';
        await ticket.save();
        return NextResponse.json({ status: "expired", message: "Ticket has expired and cannot be validated" }, { status: 400 });
    }

    ticket.status = "used";
    ticket.validatedAt = new Date();

    if (updateData.busType) ticket.busType = updateData.busType;
    if (updateData.totalFare) ticket.totalFare = updateData.totalFare;
    if (updateData.fare) ticket.fare = updateData.fare;

    await ticket.save();
    console.log(`✅ Ticket ${ticketCode} marked as USED`);
    
    return NextResponse.json({ status: "updated", ticket });
  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
