import { NextResponse } from 'next/server';
import dbConnect, { getTicketModel } from '@/lib/mongodb';

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const Ticket = getTicketModel();
    const { code } = await params;
    
    if (!code) {
      return NextResponse.json({ error: "Missing ticket code" }, { status: 400 });
    }

    const ticketCode = code.toUpperCase();
    const ticket = await Ticket.findOne({ ticketCode });
    
    if (!ticket) {
      return NextResponse.json({ status: "invalid", message: "Ticket not found" }, { status: 404 });
    }

    let refundAmount = 0;

    // Auto-expiry logic: Mark as expired if not used within 10 minutes
    if (ticket.status === 'valid') {
        const now = new Date();
        const createdAt = new Date(ticket.createdAt);
        const expiryTime = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes window

        if (now > expiryTime) {
            ticket.status = 'expired';
            
            // Calculate refund (Total paid - 10% fee)
            const totalPaid = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));
            refundAmount = Math.max(0, totalPaid - Math.round(totalPaid * 0.10));
            
            await ticket.save();
            console.log(`⏰ Ticket ${ticketCode} automatically expired. Refund calculated: Rs. ${refundAmount}`);
        }
    }

    return NextResponse.json({ status: ticket.status, ticket, refundAmount });
  } catch (err: any) {
    console.error("❌ API /verify-ticket Error:", err);
    return NextResponse.json({ 
      error: "Server Error", 
      details: err.message 
    }, { status: 500 });
  }
}
