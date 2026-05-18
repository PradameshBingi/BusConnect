
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    if (!data.from || !data.to || !data.securityCode) {
      return NextResponse.json({ error: "Missing required booking data" }, { status: 400 });
    }

    const routeNo = data.routeNo || "00";
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `TKT-${routeNo}-${randomSuffix}`;

    const ticketData = {
      ...data,
      ticketCode,
      status: "valid",
      createdAt: new Date()
    };

    const Ticket = getTicketModel();
    const ticket = new Ticket(ticketData);
    await ticket.save();
    
    return NextResponse.json({ status: "created", ticket: ticket.toObject() }, { status: 201 });

  } catch (err: any) {
    console.error("❌ API /create-ticket Error:", err);
    return NextResponse.json({ 
      error: "Booking Failed", 
      details: err.message || "Database unreachable. Ensure MONGODB_URI is set correctly." 
    }, { status: 500 });
  }
}
