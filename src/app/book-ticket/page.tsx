'use client';

import { useSearchParams } from 'next/navigation';
import { BookingForm } from './booking-form';
import Header from '@/app/components/header';
import { Suspense } from 'react';

function BookTicketContent() {
  const searchParams = useSearchParams();
  const busType = searchParams.get('type') || '';

  const getTitle = (type: string) => {
    switch (type) {
      case 'ordinary':
        return 'City Ordinary Bus Ticket';
      case 'express':
        return 'Metro Express Bus Ticket';
      case 'deluxe':
        return 'Metro Deluxe Bus Ticket';
      default:
        return 'Book Ticket';
    }
  };

  const title = getTitle(busType);

  return (
    <>
      <Header showBackButton={true} backHref="/select-bus-type" title={title} />
      <div className="flex flex-col items-center justify-center p-4 md:p-8">
        <BookingForm />
      </div>
    </>
  );
}

export default function BookTicketPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading booking form...</p>
      </div>
    }>
      <BookTicketContent />
    </Suspense>
  );
}
