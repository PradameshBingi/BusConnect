
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const Ticket = getTicketModel();
    const { code } = await context.params;
    const ticketCode = code.toUpperCase();
    const updateData = await request.json().catch(() => ({}));
    
    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) return NextResponse.json({ status: "invalid" }, { status: 404 });

    if (ticket.status === "used") {
      return NextResponse.json({ status: "already_used", message: "Ticket already validated" }, { status: 400 });
    }

    if (ticket.status === "expired" || ticket.status === "cancelled") {
      return NextResponse.json({ status: ticket.status, message: `Ticket is ${ticket.status}` }, { status: 400 });
    }

    ticket.status = "used";
    ticket.validatedAt = new Date();

    if (updateData.busType) ticket.busType = updateData.busType;
    if (updateData.fare) ticket.fare = updateData.fare;

    await ticket.save();
    console.log("✅ Ticket Validated:", ticketCode);
    
    return NextResponse.json({ status: "updated", ticket });
  } catch (err: any) {
    console.error("❌ API /use-ticket Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
