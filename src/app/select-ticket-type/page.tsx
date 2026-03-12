
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Route, FileX, HelpCircle, ChevronRight, History } from 'lucide-react';
import Header from '@/app/components/header';

const serviceLinks = [
  { 
    href: '/select-bus-type', 
    title: 'Select Route', 
    icon: <Route className="h-7 w-7 text-blue-600" /> 
  },
  { 
    href: '/booking-history', 
    title: 'Booking History', 
    icon: <History className="h-7 w-7 text-yellow-600" /> 
  },
];

export default function SelectTicketTypePage() {
  return (
    <>
      <Header showBackButton={true} backHref="/" title="Book Tickets" />
      <main className="p-4 space-y-3 pt-8">
        {serviceLinks.map((link) => (
          <Link href={link.href} key={link.title} className="group">
            <Card className="flex items-center p-4 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-card max-w-md mx-auto">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mr-4">
                  {link.icon}
              </div>
              <span className="flex-grow font-semibold text-gray-800 text-md">{link.title}</span>
              <ChevronRight className="text-gray-400" />
            </Card>
          </Link>
        ))}
      </main>
    </>
  );
}
