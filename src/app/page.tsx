'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Ticket, Info, ChevronRight, Bell, MessageSquare, Globe, User, Wallet, HelpCircle } from 'lucide-react';

export default function Home() {
  const serviceLinks = [
    { href: '/city-services', title: 'City Services', description: 'Find routes and bus numbers.', icon: <Building2 className="h-7 w-7 text-green-600" /> },
    { href: '/select-ticket-type', title: 'Book Bus Tickets', description: 'Buy, cancel, and manage tickets.', icon: <Ticket className="h-7 w-7 text-purple-600" /> },
    { href: '/conductor/dashboard', title: 'Conductor Tools', description: 'Verify tickets and check fares.', icon: <User className="h-7 w-7 text-red-500" /> },
    { href: '/wallet', title: 'My Wallet', description: 'Manage your balance and refunds.', icon: <Wallet className="h-7 w-7 text-orange-500" /> },
    { href: '/help', title: 'Help & FAQs', description: 'Find answers to your questions.', icon: <HelpCircle className="h-7 w-7 text-gray-600" /> },
    { href: '/about', title: 'About This App', description: 'Learn more about this project.', icon: <Info className="h-7 w-7 text-blue-600" /> },
  ];
    
  return (
    <div className="bg-background">
      <header className="bg-primary text-primary-foreground p-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-sm">
            <div className="w-8 h-8 flex flex-col items-center justify-center bg-red-600 text-white rounded-sm text-[5px] font-bold leading-none">
              <span>TSRTC</span>
              <span>GAMYAM</span>
              <span className="text-[4px]">Track and Active</span>
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-wider">TGSRTC</h1>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="h-6 w-6" />
          <MessageSquare className="h-6 w-6" />
          <Globe className="h-6 w-6" />
        </div>
      </header>

      <main className="p-4 space-y-3">
        {serviceLinks.map((link) => (
          <Link href={link.href} key={link.title} className="group">
            <Card className="flex items-center p-3 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-card">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mr-4">
                  {link.icon}
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-gray-800 text-md">{link.title}</p>
                {link.description && <p className="text-sm text-muted-foreground">{link.description}</p>}
              </div>
              <ChevronRight className="text-gray-400 ml-2" />
            </Card>
          </Link>
        ))}

        <div className="pt-6 grid grid-cols-2 gap-4">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base rounded-lg">
            Flag a Bus
          </Button>
          <Button size="lg" variant="destructive" className="py-6 text-base rounded-lg">
            Emergency?
          </Button>
        </div>

      </main>
    </div>
  );
}
