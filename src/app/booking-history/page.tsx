'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, ShieldCheck, Wallet, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { CountdownTimer } from '@/app/components/countdown-timer';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/lib/api-config';

type TicketDetails = {
  ticketCode: string;
  from: string;
  to: string;
  totalFare: number;
  fare: number;
  walletAmountUsed?: number;
  createdAt: string;
  status: 'valid' | 'expired' | 'used' | 'cancelled';
  busType: string;
  passengers: string;
  securityCode: string;
};

export default function BookingHistoryPage() {
  const [tickets, setTickets] = useState<TicketDetails[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const loadLocalTickets = () => {
    const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
    setTickets([...storedTickets].reverse());
  };

  useEffect(() => {
    setIsClient(true);
    loadLocalTickets();
  }, []);

  const syncStatuses = async () => {
    setIsRefreshing(true);
    try {
      const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const updatedTickets = await Promise.all(storedTickets.map(async (t) => {
        if (t.status === 'used' || t.status === 'cancelled') return t;
        
        try {
          const res = await fetch(`${API_ENDPOINTS.VERIFY}/${t.ticketCode}`);
          if (res.ok) {
            const data = await res.json();
            return { ...t, status: data.status };
          }
        } catch (e) {
          console.error("Sync failed for", t.ticketCode);
        }
        return t;
      }));

      localStorage.setItem('generatedTickets', JSON.stringify(updatedTickets));
      setTickets([...updatedTickets].reverse());
      toast({ title: "Updated", description: "Ticket statuses synced with server." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Sync Error", description: "Could not reach server." });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelTicket = (ticketCode: string) => {
    const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
    const index = storedTickets.findIndex(t => t.ticketCode === ticketCode);
    if (index === -1) return;

    const ticket = storedTickets[index];
    const totalPaid = (ticket.fare || 0) + (ticket.walletAmountUsed || 0);
    const refundAmount = Math.max(0, totalPaid - Math.round(ticket.totalFare * 0.10));

    storedTickets[index].status = 'cancelled';
    localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));

    if (refundAmount > 0) {
      const walletData = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions":[]}');
      walletData.balance += refundAmount;
      walletData.transactions = walletData.transactions || [];
      walletData.transactions.push({
        type: 'credit',
        description: `Refund for ${ticketCode}`,
        amount: refundAmount,
        date: new Date().toISOString(),
      });
      localStorage.setItem('userWallet', JSON.stringify(walletData));
    }

    setTickets([...storedTickets].reverse());
    toast({ title: 'Success', description: 'Ticket cancelled and refunded.' });
  };

  const getFullBusType = (type: string) => {
    switch (type) {
      case 'ordinary': return 'City Ordinary';
      case 'express': return 'Metro Express';
      case 'deluxe': return 'Metro Deluxe';
      default: return type;
    }
  };

  if (!isClient) return null;

  return (
    <>
      <Header showBackButton={true} backHref="/select-ticket-type" title="Booking History" />
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">Booking History</h1>
          </div>
          <Button variant="outline" size="sm" onClick={syncStatuses} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Sync
          </Button>
        </div>
        {tickets.length === 0 ? (
          <Card><CardContent className="p-6 text-center">No local booking history found.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => {
              // Standard 10 minute expiry logic for local display
              const expiry = new Date(ticket.createdAt).getTime() + (10 * 60 * 1000);
              const isExpired = new Date().getTime() > expiry && ticket.status === 'valid';
              const status = isExpired ? 'expired' : ticket.status;
              const totalCost = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));
              const canUpgrade = ticket.busType !== 'deluxe' && status === 'valid';

              return (
              <Card key={ticket.ticketCode} className={cn("border-l-4 shadow-sm", {
                "border-l-green-600": status === 'valid',
                "border-l-slate-400": status === 'used',
                "border-l-yellow-500": status === 'expired',
                "border-l-red-600": status === 'cancelled',
              })}>
                <CardHeader className="flex flex-row justify-between items-start p-4 pb-2">
                   <div>
                     <Link href={`/ticket?id=${ticket.ticketCode}`} className="font-mono font-bold text-primary hover:underline">{ticket.ticketCode}</Link>
                     <CardDescription className="text-xs">{new Date(ticket.createdAt).toLocaleString()}</CardDescription>
                   </div>
                   <Badge
                     className={cn("capitalize font-bold px-3 py-1 text-white border-transparent", {
                        "bg-yellow-500 hover:bg-yellow-500": status === 'expired',
                        "bg-red-600 hover:bg-red-600": status === 'cancelled',
                        "bg-green-600 hover:bg-green-600": status === 'valid',
                        "bg-slate-500 hover:bg-slate-500": status === 'used',
                     })}
                   >
                       {status}
                   </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="flex justify-between text-sm font-bold">
                        <p>From: {ticket.from}</p><p>To: {ticket.to}</p>
                    </div>
                     <div className="flex justify-between items-end mt-3 text-sm">
                        <div className="space-y-1">
                            <p className="font-bold">Total: Rs. {totalCost.toFixed(2)}</p>
                            {(ticket.walletAmountUsed || 0) > 0 ? (
                                <p className="text-[10px] text-primary flex items-center gap-1 font-medium">
                                    <Wallet className="h-3 w-3" /> Wallet: Rs. {ticket.walletAmountUsed?.toFixed(2)}
                                </p>
                            ) : null}
                        </div>
                        <Badge variant="outline">{getFullBusType(ticket.busType)}</Badge>
                     </div>
                     <div className="flex items-center text-xs mt-3 text-muted-foreground"><User className="h-3 w-3 mr-1"/> {ticket.passengers}</div>
                     <div className="flex items-center text-xs mt-1 text-muted-foreground"><ShieldCheck className="h-3 w-3 mr-1"/> PIN: <span className="font-bold text-primary">{ticket.securityCode}</span></div>
                    
                    {status === 'valid' && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <CountdownTimer expiryTimestamp={expiry} />
                        <div className={cn("grid gap-2", canUpgrade ? "grid-cols-2" : "grid-cols-1")}>
                          {canUpgrade && (
                            <Button asChild variant="outline" size="sm" className="border-primary text-primary">
                              <Link href={`/upgrade-ticket?id=${ticket.ticketCode}`}><ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade</Link>
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="w-full">Cancel</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Cancel Ticket?</AlertDialogTitle><AlertDialogDescription>10% fee applies. Refund to wallet.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction onClick={() => handleCancelTicket(ticket.ticketCode)}>Yes, Cancel</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                     )}
                </CardContent>
              </Card>
            )})}
          </div>
        )}
      </div>
    </>
  );
}
