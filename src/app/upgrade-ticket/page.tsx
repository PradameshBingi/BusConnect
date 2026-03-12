
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UpgradeForm } from './upgrade-form';

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
  busType: 'ordinary' | 'express' | 'deluxe';
  walletAmountUsed?: number;
};

function UpgradeTicketContent() {
  const searchParams = useSearchParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = searchParams.get('id');

  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError('No ticket ID provided.');
        return;
    }
    try {
        const storedTickets: Ticket[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
        const foundTicket = storedTickets.find(t => t.ticketCode === id);

        if (!foundTicket) {
            setError('Ticket not found.');
        } else if (foundTicket.status !== 'valid' || new Date().getTime() > new Date(foundTicket.createdAt).getTime() + 60 * 1000) {
            setError('This ticket is no longer valid for an upgrade as it has expired or been used.');
        } else if (foundTicket.busType === 'deluxe') {
            setError('This ticket is already the highest tier and cannot be upgraded.');
        } else {
            setTicket(foundTicket);
        }
    } catch (e) {
        setError('Could not retrieve ticket data.');
    } finally {
        setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    );
  }

  if (error) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Upgrade Unavailable</CardTitle>
                <CardDescription>This ticket cannot be upgraded.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">{error}</p>
            </CardContent>
        </Card>
    );
  }

  return ticket ? <UpgradeForm ticket={ticket} /> : null;
}

export default function UpgradeTicketPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/booking-history" title="Upgrade Ticket" />
      <div className="flex flex-col items-center justify-center p-4 md:p-8">
        <Suspense fallback={<div>Loading...</div>}>
            <UpgradeTicketContent />
        </Suspense>
      </div>
    </>
  );
}
