
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bus, ChevronRight } from 'lucide-react';
import Header from '@/app/components/header';

const busTypes = [
  {
    href: '/book-ticket?type=ordinary',
    title: 'City Ordinary Bus Ticket',
    description: 'Standard buses for everyday travel.',
    fareInfo: 'Women travel free under the Maha Lakshmi scheme.'
  },
  {
    href: '/book-ticket?type=express',
    title: 'Metro Express Bus Ticket',
    description: 'Faster routes with fewer stops.',
    fareInfo: 'Women travel free. Surcharges apply for men & children.'
  },
  {
    href: '/book-ticket?type=deluxe',
    title: 'Metro Deluxe Bus Ticket',
    description: 'Comfortable, air-conditioned travel.',
    fareInfo: 'Surcharge of Rs. 10/adult (men & women) & Rs. 5/child.'
  },
];

export default function SelectBusTypePage() {
  return (
    <>
      <Header showBackButton={true} backHref="/select-ticket-type" title="Select Bus Type" />
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6 font-headline text-center">Select Your Bus Type</h1>
        <div className="space-y-4 max-w-lg mx-auto">
          {busTypes.map((bus) => (
            <Link href={bus.href} key={bus.title} className="group block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Bus className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{bus.title}</CardTitle>
                    <CardDescription>{bus.description}</CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                   <p className="text-sm text-green-600 font-medium">{bus.fareInfo}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
