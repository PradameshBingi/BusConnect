
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, BookUser, ChevronRight, Database } from 'lucide-react';
import Header from '@/app/components/header';

export default function ConductorDashboardPage() {
  const serviceLinks = [
    {
      href: '/conductor/ticket',
      title: 'Ticket Tools',
      description: 'Verify tickets, check fares, and view stats.',
      icon: <Ticket className="h-8 w-8 text-primary" />,
    },
    {
      href: '/conductor/bus-pass',
      title: 'Bus Pass Verification',
      description: 'Validate student and citizen bus passes.',
      icon: <BookUser className="h-8 w-8 text-accent" />,
    },
    {
      href: '/conductor/pass-data',
      title: 'Sample Bus Pass Data',
      description: 'View pass codes for testing verification.',
      icon: <Database className="h-8 w-8 text-yellow-500" />,
    },
  ];

  return (
    <>
      <Header showBackButton={true} backHref="/" title="Conductor Tools" />
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6 font-headline text-center">Conductor Dashboard</h1>
        <div className="space-y-4 max-w-lg mx-auto">
          {serviceLinks.map((link) => (
            <Link href={link.href} key={link.title} className="group block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  {link.icon}
                  <div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
