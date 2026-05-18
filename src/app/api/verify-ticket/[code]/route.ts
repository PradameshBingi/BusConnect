
import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET(
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

      let refundAmount = 0;
      if (ticket.status === 'valid') {
          const now = new Date();
          const createdAt = new Date(ticket.createdAt);
          const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000);

          if (now > expiryTime) {
              ticket.status = 'expired';
              const totalPaid = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0)) || 0;
              refundAmount = Math.max(0, totalPaid - Math.round(totalPaid * 0.10));
              await ticket.save();
          }
      }

      return NextResponse.json({ 
          status: ticket.status, 
          ticket: ticket.toObject(), 
          refundAmount 
      });
    }

    // SIMULATED MODE: Return a mock ticket if DB is missing
    // This allows the prototype to function for demonstration purposes.
    console.log("✨ [Simulated Mode] Verifying Ticket:", ticketCode);
    
    // Create a believable simulated ticket based on the code provided
    const mockTicket = {
      ticketCode,
      from: "Mehdipatnam",
      to: "Kukatpally",
      routeNo: "01",
      passengers: "Men: 1",
      quantities: { Men: 1, Child: 0, Women: 0 },
      totalFare: 25,
      fare: 25,
      securityCode: "12345",
      status: "valid",
      createdAt: new Date().toISOString(),
      busType: "ordinary",
      simulated: true
    };

    return NextResponse.json({ 
      status: "valid", 
      ticket: mockTicket,
      details: "Running in Simulated Mode (No MongoDB URI detected)"
    });

  } catch (err: any) {
    console.error("❌ API /verify-ticket Error:", err);
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });
  }
}
