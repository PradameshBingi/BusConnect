
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

    // Fallback for Simulated Mode: In a real prototype, you might use a local session or memory cache.
    // For now, we return a 404 if MongoDB is missing since we can't "find" what we didn't "save" persistent.
    return NextResponse.json({ 
      error: "Database Unreachable", 
      details: "Simulated mode does not support cross-session verification. Please set MONGODB_URI." 
    }, { status: 503 });

  } catch (err: any) {
    console.error("❌ API /verify-ticket Error:", err);
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });
  }
}
