'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { CountdownTimer } from '@/app/components/countdown-timer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Ticket as TicketIcon, Copy, RefreshCw, Loader2, XCircle } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const fetchTicket = async (showToast = false) => {
    if (!id) return;
    if (showToast) setIsRefreshing(true);
    try {
        const response = await fetch(`${API_ENDPOINTS.VERIFY}/${id}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 404) throw new Error("Ticket not found in database.");
            throw new Error(errorData.error || "Server communication error.");
        }
        const result = await response.json();
        setTicket(result.ticket);
        if (showToast) toast({ title: "Status Updated", description: `Current status: ${result.status}` });
    } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
    } finally {
        setLoading(false);
        setIsRefreshing(false);
    }
  };

  useEffect(() => {
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
  // Standard 10 minute expiry
  const expiryTimestamp = issueDate.getTime() + 10 * 60 * 1000;
  const isCurrentlyExpired = ticket.status === 'expired' || (ticket.status === 'valid' && new Date().getTime() > expiryTimestamp);
  const totalCost = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));
  
  if (ticket.status === 'used') {
    return (
        <div className="flex flex-col items-center p-4 space-y-6">
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg font-bold text-center flex items-center justify-center gap-2 w-full max-w-md">
                <TicketIcon className="h-5 w-5" />
                JOURNEY VALIDATED
            </div>
            <Card className="w-full max-w-md border-t-8 border-t-slate-400">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl uppercase">Ticket Used</CardTitle>
                    <div className="flex justify-center mt-2">
                        <Badge className="bg-slate-500 hover:bg-slate-500 font-bold px-4 py-1">USED</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">This ticket has been validated by a conductor and is no longer valid for travel.</p>
                    <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg text-sm">
                        <div className="text-center"><p className="text-[10px] font-bold">FROM</p><p className="font-bold">{ticket.from}</p></div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="text-center"><p className="text-[10px] font-bold">TO</p><p className="font-bold">{ticket.to}</p></div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex flex-col gap-2 w-full max-w-md">
                <Button asChild variant="outline" className="h-12"><Link href="/booking-history">View History</Link></Button>
                <Button asChild className="w-full h-12"><Link href="/">Home</Link></Button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 md:p-8">
      <Card className={cn("w-full max-w-md border-t-8", {
        "border-t-green-600": ticket.status === 'valid' && !isCurrentlyExpired,
        "border-t-yellow-500": isCurrentlyExpired,
        "border-t-red-600": ticket.status === 'cancelled',
        "border-t-slate-400": ticket.status === 'used',
      })}>
        <CardHeader className="text-center relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={() => fetchTicket(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <CardTitle className="font-headline text-2xl uppercase">Digital Ticket</CardTitle>
          <div className="flex justify-center mt-2">
            <Badge className={cn("capitalize font-bold px-4 py-1", {
                "bg-green-600 hover:bg-green-600": ticket.status === 'valid' && !isCurrentlyExpired,
                "bg-yellow-500 hover:bg-yellow-500": isCurrentlyExpired,
                "bg-red-600 hover:bg-red-600": ticket.status === 'cancelled',
                "bg-slate-500 hover:bg-slate-500": ticket.status === 'used',
            })}>
                {isCurrentlyExpired ? 'expired' : ticket.status}
            </Badge>
          </div>
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