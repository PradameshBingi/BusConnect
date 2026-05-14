'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileX, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api-config';
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

type TicketStatus = 'loading' | 'found' | 'not_found' | 'already_used' | 'cancelled' | 'idle' | 'invalid_security';

export default function TicketCancellationPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [status, setStatus] = useState<TicketStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode || !securityCode) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter both the ticket and security codes.' });
      return;
    }
    
    setIsLoading(true);
    setStatus('loading');

    setTimeout(() => {
      try {
        const storedTickets = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
        const foundTicket = storedTickets.find((t: any) => t.ticketCode === ticketCode.toUpperCase());

        if (!foundTicket) {
          setStatus('not_found');
        } else if (foundTicket.securityCode !== securityCode.toUpperCase()) {
            setStatus('invalid_security');
        } else if (foundTicket.status === 'used' || foundTicket.status === 'expired' || foundTicket.status === 'cancelled') {
          setStatus('already_used');
        } else {
          setStatus('found');
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not process your request.' });
        setStatus('idle');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleCancellation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.CANCEL}/${ticketCode.toUpperCase()}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Server rejected cancellation");
      }

      const storedTickets: any[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const ticketIndex = storedTickets.findIndex(t => t.ticketCode === ticketCode.toUpperCase());

      if (ticketIndex > -1) {
        const ticketToCancel = storedTickets[ticketIndex];
        const fare = ticketToCancel.totalFare || ticketToCancel.fare || 0;
        let refundAmount = 0;
        
        const cancellationFee = fare > 0 ? fare * 0.10 : 0;
        const amountPaid = ticketToCancel.fare;
        if (amountPaid > 0) {
            refundAmount = Math.max(0, amountPaid - cancellationFee);
        }

        storedTickets[ticketIndex].status = 'cancelled';
        localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));
        
        if (refundAmount > 0) {
            const walletData = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions":[]}');
            walletData.balance += refundAmount;
            walletData.transactions = walletData.transactions || [];
            walletData.transactions.push({
                type: 'credit',
                description: `Refund for ${ticketCode.toUpperCase()}`,
                amount: refundAmount,
                date: new Date().toISOString(),
            });
            localStorage.setItem('userWallet', JSON.stringify(walletData));
        }

        setStatus('cancelled');
        toast({ title: 'Success', description: `Ticket cancelled. Refund of Rs. ${refundAmount.toFixed(2)} added to wallet.` });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    switch (status) {
      case 'not_found':
        return (
          <div className="text-center text-destructive flex flex-col items-center gap-2">
            <XCircle className="h-10 w-10" />
            <p>Ticket not found in local history.</p>
          </div>
        );
       case 'invalid_security':
        return (
          <div className="text-center text-destructive flex flex-col items-center gap-2">
            <XCircle className="h-10 w-10" />
            <p>The security code is incorrect.</p>
          </div>
        );
      case 'already_used':
        return (
          <div className="text-center text-orange-500 flex flex-col items-center gap-2">
            <XCircle className="h-10 w-10" />
            <p>This ticket cannot be cancelled as it's already used or expired.</p>
          </div>
        );
      case 'cancelled':
        return (
          <div className="text-center text-green-500 flex flex-col items-center gap-2">
            <CheckCircle className="h-10 w-10" />
            <p>Your ticket has been successfully cancelled.</p>
          </div>
        );
      case 'found':
        return (
          <div className="text-center text-foreground">
            <p className="mb-4">Are you sure you want to cancel ticket <span className="font-bold">{ticketCode.toUpperCase()}</span>?</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                  Confirm Cancellation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
                  <AlertDialogDescription>
                    A 10% fee applies. Remaining amount will be credited to your wallet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Go Back</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancellation}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header showBackButton={true} backHref="/select-ticket-type" title="Ticket Cancellation" />
      <div className="p-4 md:p-8 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <FileX />
              Ticket Cancellation
            </CardTitle>
            <CardDescription>
              Enter your ticket and security code to request cancellation.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSearch}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-code">Ticket Code</Label>
                <Input
                  id="ticket-code"
                  placeholder="TKT-XX-XXXXX"
                  value={ticketCode}
                  onChange={e => setTicketCode(e.target.value)}
                  required
                  disabled={isLoading}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="security-code">Passenger Security Code</Label>
                <Input
                  id="security-code"
                  placeholder="5-digit alphanumeric code"
                  value={securityCode}
                  onChange={e => setSecurityCode(e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={5}
                  className="uppercase"
                />
              </div>
              {status !== 'idle' && !isLoading && <div className="pt-4">{renderResult()}</div>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading || status === 'found' || status === 'cancelled'}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Find Ticket'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
