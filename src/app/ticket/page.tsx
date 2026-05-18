
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { CountdownTimer } from '@/app/components/countdown-timer';
import { GeneratedTicket } from '@/app/components/generated-ticket';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Copy, RefreshCw, Loader2, XCircle, Eye } from 'lucide-react';
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
  const [showPin, setShowPin] = useState(false);
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
            if (response.status === 404) {
              setError("Ticket not found in database.");
              setLoading(false);
              return;
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Server communication error.");
        }
        const result = await response.json();
        setTicket(result.ticket);
        if (showToast) toast({ title: "Status Updated", description: `Current status: ${result.status}` });
    } catch (err: any) {
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
        <Card className="w-full max-w-md p-10 border-t-8 border-red-600">
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
  const expiryTimestamp = issueDate.getTime() + 10 * 60 * 1000;
  const isCurrentlyExpired = ticket.status === 'expired' || (ticket.status === 'valid' && new Date().getTime() > expiryTimestamp);
  const displayStatus = isCurrentlyExpired ? 'expired' : ticket.status;

  const totalCost = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));
  
  // Rule: Show generated (pink) ticket for Valid and Used only.
  const showGeneratedTicket = displayStatus === 'valid' || displayStatus === 'used';

  return (
    <div className="flex flex-col items-center p-4 md:p-8 space-y-6">
      
      {/* 1. Details Card - Always visible for context per new instruction */}
      <Card className={cn("w-full max-w-md border-t-8", {
          "border-t-green-600": displayStatus === 'valid',
          "border-t-slate-500": displayStatus === 'used',
          "border-t-yellow-500": displayStatus === 'expired',
          "border-t-red-600": displayStatus === 'cancelled',
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
          <CardTitle className="font-headline text-2xl uppercase tracking-wider">Journey Details</CardTitle>
          <div className="flex justify-center mt-2">
            <Badge className={cn("capitalize font-bold px-4 py-1 border-transparent text-white", {
                "bg-green-600 hover:bg-green-600": displayStatus === 'valid',
                "bg-slate-500 hover:bg-slate-500": displayStatus === 'used',
                "bg-yellow-500 hover:bg-yellow-500": displayStatus === 'expired',
                "bg-red-600 hover:bg-red-600": displayStatus === 'cancelled',
            })}>
                {displayStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                <div className="text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">From</p>
                    <p className="font-bold text-slate-900">{ticket.from}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary" />
                <div className="text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">To</p>
                    <p className="font-bold text-slate-900">{ticket.to}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Issue Date</p>
                    <p className="font-bold">{issueDate.toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Issue Time</p>
                    <p className="font-bold">{issueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Passengers</p>
                    <p className="font-bold">{ticket.passengers}</p>
                </div>
                <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Fare Paid</p>
                    <p className="font-bold text-primary">Rs. {totalCost.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Bus Category</p>
                    <p className="font-bold text-primary">{getFullBusType(ticket.busType)}</p>
                </div>
            </div>

            {/* PIN Hidden behind button as requested */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex flex-col items-center gap-2">
                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Security Code</p>
                {showPin ? (
                  <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => handleCopy(ticket.securityCode, 'PIN')}>
                    <p className="font-mono text-3xl font-bold tracking-[0.3em] text-primary flex-grow text-center">{ticket.securityCode}</p>
                    <Copy className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full border-primary text-primary font-bold hover:bg-primary/5" onClick={() => setShowPin(true)}>
                    <Eye className="mr-2 h-4 w-4" /> Show Security Code
                  </Button>
                )}
            </div>

            <div className="text-center p-4 bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => handleCopy(ticket.ticketCode, 'Code')}>
                <p className="text-[10px] uppercase text-slate-400 mb-1 font-bold">Registration Code</p>
                <p className="font-mono text-xl font-bold break-all tracking-wider">{ticket.ticketCode}</p>
            </div>

            {displayStatus === 'valid' && <CountdownTimer expiryTimestamp={expiryTimestamp} />}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full h-11"><Link href="/">Back to Dashboard</Link></Button>
        </CardFooter>
      </Card>

      {/* 2. Pink Ticket - Only for Valid (Preview) and Used (Receipt) */}
      {showGeneratedTicket && (
        <div className="w-full max-w-md pb-10 flex flex-col items-center">
            <p className="text-center text-sm font-bold text-muted-foreground mb-4 uppercase tracking-widest opacity-80">
                {displayStatus === 'used' ? "Journey Receipt" : "Journey Preview"}
            </p>
            <GeneratedTicket ticket={ticket as any} />
        </div>
      )}
      
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
