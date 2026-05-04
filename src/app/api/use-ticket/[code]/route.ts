import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const Ticket = getTicketModel();
    const { code } = await params;
    const ticketCode = code.toUpperCase();
    const updateData = await request.json().catch(() => ({}));
    
    console.log("🧾 Validating Ticket Action:", ticketCode);

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
    if (updateData.totalFare) ticket.totalFare = updateData.totalFare;
    if (updateData.fare) ticket.fare = updateData.fare;

    await ticket.save();
    console.log("✅ Ticket marked as USED:", ticketCode);
    
    return NextResponse.json({ status: "updated", ticket });
  } catch (err: any) {
    console.error("❌ API Use Ticket Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
