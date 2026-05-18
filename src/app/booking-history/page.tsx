
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, ShieldCheck, Wallet, ArrowUpCircle, RefreshCw, Loader2, ChevronRight } from 'lucide-react';
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

  const syncStatuses = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      let autoRefundTotal = 0;
      let refundsCount = 0;
      
      const updatedTickets = await Promise.all(storedTickets.map(async (t) => {
        if (t.status === 'valid') {
          try {
            const res = await fetch(`${API_ENDPOINTS.VERIFY}/${t.ticketCode}`);
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'expired' && data.refundAmount > 0) {
                 autoRefundTotal += data.refundAmount;
                 refundsCount++;
              }
              return { ...t, status: data.status };
            }
          } catch (e) {
            console.error("Sync failed for", t.ticketCode);
          }
        }
        return t;
      }));

      if (autoRefundTotal > 0) {
          const walletData = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions":[]}');
          walletData.balance += autoRefundTotal;
          walletData.transactions.push({
            type: 'credit',
            description: `Auto-Refund for Expired Ticket(s)`,
            amount: autoRefundTotal,
            date: new Date().toISOString(),
          });
          localStorage.setItem('userWallet', JSON.stringify(walletData));
          toast({ 
            title: "Auto-Refund Applied", 
            description: `Rs. ${autoRefundTotal.toFixed(2)} refunded to wallet.` 
          });
      }

      localStorage.setItem('generatedTickets', JSON.stringify(updatedTickets));
      setTickets([...updatedTickets].reverse());
      if (!silent) toast({ title: "Updated", description: "Status synced with database." });
    } catch (error) {
      if (!silent) toast({ variant: 'destructive', title: "Sync Error", description: "Could not reach server." });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadLocalTickets();
    setTimeout(() => syncStatuses(true), 500);
  }, []);

  const handleCancelTicket = async (ticketCode: string) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.CANCEL}/${ticketCode}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to cancel ticket");
      }

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
        walletData.transactions.push({
          type: 'credit',
          description: `Refund for Cancelled Ticket ${ticketCode}`,
          amount: refundAmount,
          date: new Date().toISOString(),
        });
        localStorage.setItem('userWallet', JSON.stringify(walletData));
      }

      setTickets([...storedTickets].reverse());
      toast({ title: 'Success', description: 'Ticket cancelled and refunded.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
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
      <div className="p-4 md:p-8 max-w-2xl mx-auto pb-32">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">Booking History</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => syncStatuses(false)} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Sync
          </Button>
        </div>
        {tickets.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No recent bookings found.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => {
              const status = ticket.status;
              const totalCost = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));
              const canUpgrade = ticket.busType !== 'deluxe' && status === 'valid';

              return (
              <Card key={ticket.ticketCode} className={cn("border-l-4 shadow-sm group hover:shadow-md transition-shadow", {
                "border-l-green-600": status === 'valid',
                "border-l-slate-500": status === 'used',
                "border-l-yellow-500": status === 'expired',
                "border-l-red-600": status === 'cancelled',
              })}>
                <CardHeader className="flex flex-row justify-between items-start p-4 pb-2">
                   <div className="flex-grow">
                     <Link href={`/ticket?id=${ticket.ticketCode}`} className="font-mono font-bold text-primary hover:underline flex items-center gap-1">
                        {ticket.ticketCode}
                        <ChevronRight className="h-4 w-4" />
                     </Link>
                     <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">{new Date(ticket.createdAt).toLocaleString()}</CardDescription>
                   </div>
                   <Badge
                     className={cn("capitalize font-bold px-3 py-1 text-white border-transparent", {
                        "bg-green-600 hover:bg-green-600": status === 'valid',
                        "bg-slate-500 hover:bg-slate-500": status === 'used',
                        "bg-yellow-500 hover:bg-yellow-500": status === 'expired',
                        "bg-red-600 hover:bg-red-600": status === 'cancelled',
                     })}
                   >
                       {status}
                   </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="flex justify-between text-sm font-bold text-slate-900">
                        <p>{ticket.from}</p>
                        <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                        <p>{ticket.to}</p>
                    </div>
                     <div className="flex justify-between items-end mt-4 text-sm">
                        <div className="space-y-1">
                            <p className="font-bold text-slate-800">Total: Rs. {totalCost.toFixed(2)}</p>
                            {(ticket.walletAmountUsed || 0) > 0 ? (
                                <p className="text-[10px] text-primary flex items-center gap-1 font-bold">
                                    <Wallet className="h-3 w-3" /> Wallet Used: Rs. {ticket.walletAmountUsed?.toFixed(2)}
                                </p>
                            ) : null}
                        </div>
                        <Badge variant="outline" className="border-primary text-primary font-bold text-[10px] uppercase">{getFullBusType(ticket.busType)}</Badge>
                     </div>
                     <div className="flex items-center text-[11px] mt-4 text-muted-foreground font-medium"><User className="h-3.5 w-3.5 mr-1.5 text-slate-400"/> {ticket.passengers}</div>
                    
                    {status === 'valid' && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <CountdownTimer expiryTimestamp={new Date(ticket.createdAt).getTime() + (10 * 60 * 1000)} />
                        <div className={cn("grid gap-2", canUpgrade ? "grid-cols-2" : "grid-cols-1")}>
                          {canUpgrade && (
                            <Button asChild variant="outline" size="sm" className="border-primary text-primary font-bold">
                              <Link href={`/upgrade-ticket?id=${ticket.ticketCode}`}><ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade</Link>
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="w-full font-bold">Cancel</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Cancel Journey?</AlertDialogTitle><AlertDialogDescription>10% fee applies. Refund added to wallet.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction onClick={() => handleCancelTicket(ticket.ticketCode)} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction></AlertDialogFooter>
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
