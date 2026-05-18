
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const conn = await dbConnect();
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

    // If MongoDB is connected, save to DB
    if (conn) {
      const Ticket = getTicketModel();
      const ticket = new Ticket(ticketData);
      await ticket.save();
      return NextResponse.json({ status: "created", ticket: ticket.toObject() }, { status: 201 });
    } 
    
    // Fallback: Return simulated success for conceptual prototype
    console.log("✨ [Simulated Mode] Ticket Created:", ticketCode);
    return NextResponse.json({ status: "created", ticket: ticketData, simulated: true }, { status: 201 });

  } catch (err: any) {
    console.error("❌ API /create-ticket Error:", err);
    return NextResponse.json({ error: "Booking Failed", details: err.message }, { status: 500 });
  }
}
