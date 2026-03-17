
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { CountdownTimer } from '@/app/components/countdown-timer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Calendar, Clock, Ticket as TicketIcon, User, Tag, ShieldCheck, Copy, Bus, XCircle, Wallet, ArrowUpCircle, AlertCircle, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/app/components/header';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { GeneratedTicket } from '@/app/components/generated-ticket';
import { cn } from '@/lib/utils';

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
        setError('No ticket ID provided.');
        return;
    }

    let parsedTicket: Ticket | undefined;
    const ticketData = searchParams.get('data');
    if (ticketData) {
      try {
        const decodedData = atob(ticketData);
        parsedTicket = JSON.parse(decodedData) as Ticket;
      } catch (err) {
        setError('Failed to read ticket data.');
        setLoading(false);
        return;
      }
    } else {
      try {
          const storedTickets: Ticket[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
          parsedTicket = storedTickets.find(t => t.ticketCode === id);
          if (!parsedTicket) {
               setError('Ticket data not found.');
               setLoading(false);
               return;
          }
      } catch (e) {
          setError('Could not retrieve ticket.');
          setLoading(false);
          return;
      }
    }
    
    if (parsedTicket) {
        // Calculate dynamic expiry if still valid in data
        if (parsedTicket.status === 'valid') {
            const expiry = new Date(parsedTicket.createdAt).getTime() + 60000;
            if (new Date().getTime() > expiry) {
                parsedTicket.status = 'expired';
            }
        }
        setTicket(parsedTicket);
    }
    setLoading(false);
  }, [id, searchParams]);
  
  const handleCopy = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast({ title: "Copied!", description: `${fieldName} copied to clipboard.` });
      }).catch(() => {
        toast({ variant: 'destructive', title: "Copy Failed" });
      });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/40 p-4">
      <Card className="w-full max-w-md"><CardContent className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></CardContent></Card>
    </div>
  );

  if (error || !ticket) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/40 p-4">
      <Card className="w-full max-w-md"><CardContent className="p-6 text-center">{error || 'Ticket not found.'}</CardContent></Card>
    </div>
  );

  const issueDate = new Date(ticket.createdAt);
  const expiryTimestamp = issueDate.getTime() + 60 * 1000;
  const isCurrentlyExpired = ticket.status === 'expired' || new Date().getTime() > expiryTimestamp;
  const canShowUpgrade = ticket.status === 'valid' && !isCurrentlyExpired && ticket.busType !== 'deluxe';
  const totalCost = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));
  
  // If ticket is USED, show the realistic physical ticket
  if (ticket.status === 'used') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/40 p-4 md:p-8 space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold">
                    <History className="h-4 w-4" />
                    TICKET USED & VALIDATED
                </div>
                <p className="text-sm text-muted-foreground">This is your digital receipt for the journey.</p>
            </div>
            <GeneratedTicket ticket={ticket as any} />
            <Button asChild variant="outline" className="w-full max-w-sm">
                <Link href="/select-bus-type">Book Next Journey</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/40 p-4 md:p-8">
      <Card className={cn(
        "w-full max-w-md overflow-hidden shadow-xl border-t-8 transition-all",
        ticket.status === 'valid' ? "border-t-primary" : 
        ticket.status === 'cancelled' ? "border-t-destructive" : 
        "border-t-yellow-500"
      )}>
        <CardHeader className="bg-white text-primary text-center p-6 border-b">
          <div className="flex items-center justify-center gap-2">
            <TicketIcon className="h-7 w-7" />
            <CardTitle className="font-headline text-2xl font-bold uppercase tracking-tight">Your Digital Ticket</CardTitle>
          </div>
          {ticket.status === 'cancelled' && (
              <div className="mt-4 flex items-center justify-center gap-2 bg-destructive/10 text-destructive p-2 rounded font-bold text-sm">
                  <XCircle className="h-4 w-4" />
                  CANCELLED
              </div>
          )}
          {ticket.status === 'expired' && (
              <div className="mt-4 flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 p-2 rounded font-bold text-sm">
                  <Clock className="h-4 w-4" />
                  EXPIRED
              </div>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6 bg-white">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border border-primary/10">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">From</p>
              <p className="font-bold text-lg text-primary">{ticket.from}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">To</p>
              <p className="font-bold text-lg text-primary">{ticket.to}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
             <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary"/>
                <div><p className="text-[9px] uppercase">Date</p><p className="font-bold">{issueDate.toLocaleDateString()}</p></div>
             </div>
             <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary"/>
                <div><p className="text-[9px] uppercase">Time</p><p className="font-bold">{issueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
             </div>
             <div className="flex items-center gap-2 col-span-2 bg-muted/10 p-2 rounded">
                <User className="h-4 w-4 text-primary"/>
                <div><p className="text-[9px] uppercase">Passengers</p><p className="font-bold">{ticket.passengers}</p></div>
             </div>
             <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <div>
                    <p className="text-[9px] uppercase">Total Cost</p>
                    <p className="font-bold">Rs. {totalCost.toFixed(2)}</p>
                    {(ticket.walletAmountUsed || 0) > 0 ? (
                        <p className="text-[8px] text-primary font-medium">Wallet: Rs. {ticket.walletAmountUsed?.toFixed(2)}{ticket.fare > 0 ? ` + Paid: Rs. ${ticket.fare.toFixed(2)}` : ''}</p>
                    ) : (
                        <p className="text-[8px] text-muted-foreground italic">Paid: Rs. {ticket.fare.toFixed(2)}</p>
                    )}
                </div>
             </div>
              <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-primary"/>
                  <div><p className="text-[9px] uppercase">Bus Type</p><p className="font-bold text-primary">{getFullBusType(ticket.busType)}</p></div>
              </div>
          </div>

          <Separator />

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex justify-between items-center cursor-pointer" onClick={() => handleCopy(ticket.securityCode, 'Security PIN')}>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary"/>
              <div>
                <p className="text-[10px] uppercase">Security PIN</p>
                <p className="font-mono text-xl font-bold tracking-widest text-primary">{ticket.securityCode}</p>
              </div>
            </div>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="text-center p-4 bg-slate-900 text-white rounded-lg cursor-pointer" onClick={() => handleCopy(ticket.ticketCode, 'Ticket Code')}>
            <p className="text-[10px] uppercase text-slate-400 mb-1">Unique Ticket Code</p>
            <p className="font-mono text-xl font-bold tracking-widest break-all">{ticket.ticketCode}</p>
          </div>

          {ticket.status === 'valid' && !isCurrentlyExpired ? (
              <div className="space-y-4">
                <CountdownTimer expiryTimestamp={expiryTimestamp} />
                {canShowUpgrade && (
                  <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                    <Link href={`/upgrade-ticket?id=${ticket.ticketCode}`}>
                      <ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade to Premium Bus
                    </Link>
                  </Button>
                )}
              </div>
          ) : ticket.status === 'cancelled' ? (
              <div className="text-center p-4 bg-destructive/5 border-2 border-dashed border-destructive/20 rounded-lg">
                  <p className="text-destructive font-bold">TICKET VOIDED</p>
                  <p className="text-xs text-muted-foreground mt-1">Amount has been refunded to your wallet.</p>
              </div>
          ) : (
              <div className="text-center p-4 bg-yellow-500/5 border-2 border-dashed border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-600 font-bold uppercase">Ticket Expired</p>
                  <p className="text-xs text-muted-foreground mt-1">This ticket is no longer valid for travel.</p>
              </div>
          )}
        </CardContent>
         <CardFooter className="p-6 bg-muted/20 border-t">
          <Button asChild className="w-full font-bold uppercase bg-primary">
            <Link href="/select-bus-type">Order Another Ticket</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function TicketPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/select-ticket-type" title="Ticket Details" />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <TicketContent />
      </Suspense>
    </>
  );
}
