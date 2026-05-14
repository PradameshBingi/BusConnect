'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { CountdownTimer } from '@/app/components/countdown-timer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Calendar, Clock, Ticket as TicketIcon, User, Tag, ShieldCheck, Copy, Bus, XCircle, Wallet, ArrowUpCircle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Header from '@/app/components/header';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { GeneratedTicket } from '@/app/components/generated-ticket';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/lib/api-config';

type Ticket = {
  from: string;
  to: string;
  routeNo: string;
  passengers: string;
  quantities: { Men: number, Child: number, Women: number };
  totalFare: number;
  fare: number; 
  ticketCode: string;
  securityCode: string;
  status: 'valid' | 'invalid' | 'used' | 'expired' | 'cancelled';
  createdAt: string;
  busType: string;
  walletAmountUsed?: number;
};

export const dynamic = "force-dynamic";

function TicketContent() {
  const searchParams = useSearchParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const id = searchParams.get('id');

  const getFullBusType = (type: string) => {
    switch (type) {
      case 'ordinary': return 'City Ordinary';
      case 'express': return 'Metro Express';
      case 'deluxe': return 'Metro Deluxe';
      default: return type;
    }
  };

  useEffect(() => {
    if (!id) {
        setLoading(false);
        return;
    }

    const fetchTicket = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.VERIFY}/${id}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 404) throw new Error("Ticket not found in database.");
                throw new Error(errorData.error || "Server communication error.");
            }
            const result = await response.json();
            setTicket(result.ticket);
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchTicket();
  }, [id]);
  
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${fieldName} copied.` });
  };

  if (!id || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
        <Card className="w-full max-w-md p-10">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="font-bold text-lg">{error || "No ticket ID provided."}</p>
            <Button asChild className="mt-4"><Link href="/">Go Home</Link></Button>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  if (!ticket) return null;

  const issueDate = new Date(ticket.createdAt);
  const expiryTimestamp = issueDate.getTime() + 60 * 1000 * 10;
  const isCurrentlyExpired = ticket.status === 'expired' || (ticket.status === 'valid' && new Date().getTime() > expiryTimestamp);
  const totalCost = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));
  
  if (ticket.status === 'used') {
    return (
        <div className="flex flex-col items-center p-4 space-y-6">
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">JOURNEY VALIDATED</div>
            <GeneratedTicket ticket={ticket as any} />
            <Button asChild variant="outline" className="w-full max-w-sm"><Link href="/">Home</Link></Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 md:p-8">
      <Card className={cn("w-full max-w-md border-t-8", 
        ticket.status === 'valid' ? "border-t-primary" : "border-t-destructive"
      )}>
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl uppercase">Digital Ticket</CardTitle>
          {ticket.status === 'cancelled' && <div className="text-destructive font-bold">CANCELLED</div>}
          {isCurrentlyExpired && <div className="text-yellow-600 font-bold">EXPIRED</div>}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
            <div className="text-center"><p className="text-[10px] font-bold">FROM</p><p className="font-bold">{ticket.from}</p></div>
            <ArrowRight className="h-4 w-4" />
            <div className="text-center"><p className="text-[10px] font-bold">TO</p><p className="font-bold">{ticket.to}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
             <div><p className="text-[9px]">DATE</p><p className="font-bold">{issueDate.toLocaleDateString()}</p></div>
             <div><p className="text-[9px]">TIME</p><p className="font-bold">{issueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
             <div className="col-span-2"><p className="text-[9px]">PASSENGERS</p><p className="font-bold">{ticket.passengers}</p></div>
             <div><p className="text-[9px]">FARE PAID</p><p className="font-bold">Rs. {totalCost.toFixed(2)}</p></div>
             <div><p className="text-[9px]">BUS TYPE</p><p className="font-bold text-primary">{getFullBusType(ticket.busType)}</p></div>
          </div>

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex justify-between items-center cursor-pointer" onClick={() => handleCopy(ticket.securityCode, 'PIN')}>
            <div><p className="text-[10px] uppercase">Passenger PIN</p><p className="font-mono text-xl font-bold tracking-widest text-primary">{ticket.securityCode}</p></div>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="text-center p-4 bg-slate-900 text-white rounded-lg cursor-pointer" onClick={() => handleCopy(ticket.ticketCode, 'Code')}>
            <p className="text-[10px] uppercase text-slate-400 mb-1">Ticket Code</p>
            <p className="font-mono text-xl font-bold break-all">{ticket.ticketCode}</p>
          </div>

          {ticket.status === 'valid' && !isCurrentlyExpired && <CountdownTimer expiryTimestamp={expiryTimestamp} />}
        </CardContent>
         <CardFooter>
          <Button asChild className="w-full"><Link href="/">Back to Home</Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function TicketPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/" title="My Ticket" />
      <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-primary" /></div>}>
        <TicketContent />
      </Suspense>
    </>
  );
}
