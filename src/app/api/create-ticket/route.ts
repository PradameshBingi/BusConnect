import { NextResponse } from 'next/server';
import dbConnect, { Ticket } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    
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
    console.log("✨ Ticket Created via API Route:", ticketCode);
    
    return NextResponse.json({ status: "created", ticket }, { status: 201 });
  } catch (err: any) {
    console.error("❌ API Route Create Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
