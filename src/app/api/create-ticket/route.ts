
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Establish Database Connection
    await dbConnect();

    const Ticket = getTicketModel();
    const data = await request.json();
    
    // 2. Validate essential data
    if (!data.from || !data.to || !data.securityCode) {
      return NextResponse.json({ error: "Missing required booking data (From, To, or Security Code)" }, { status: 400 });
    }

    // 3. Generate unique ticket code
    const routeNo = data.routeNo || "00";
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `TKT-${routeNo}-${randomSuffix}`;

    // 4. Create and Save Ticket
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
    
    // Provide a descriptive error message to the client
    const errorMessage = err.message || "Unknown database error";
    
    return NextResponse.json({ 
      error: "Database operation failed", 
      details: errorMessage 
    }, { status: 500 });
  }
}
