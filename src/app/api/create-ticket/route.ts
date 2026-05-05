
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const Ticket = getTicketModel();
    const data = await request.json();
    
    // Server-side generation of Ticket Code
    const routeNo = data.routeNo || "00";
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `TKT-${routeNo}-${randomSuffix}`;

    const ticket = new Ticket({
      ...data,
      ticketCode,
      status: "valid",
      createdAt: new Date()
    });

    await ticket.save();
    console.log("✨ Ticket Created successfully:", ticketCode);
    
    return NextResponse.json({ status: "created", ticket }, { status: 201 });
  } catch (err: any) {
    console.error("❌ API /create-ticket Error:", err);
    return NextResponse.json({ 
      error: "Database operation failed", 
      details: err.message 
    }, { status: 500 });
  }
}
