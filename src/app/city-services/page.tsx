'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

const SearchFromToIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13C10 11.3431 8.65685 10 7 10C5.34315 10 4 11.3431 4 13C4 15.5 7 19 7 19C7 19 10 15.5 10 13Z" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M28 13C28 11.3431 26.6569 10 25 10C23.3431 10 22 11.3431 22 13C22 15.5 25 19 25 19C25 19 28 15.5 28 13Z" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 19C10.3333 23.3333 21.6667 23.3333 25 19" stroke="black" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3"/>
    </svg>
)

const SearchBusIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_bus_search)">
        <path d="M21 11H7C6.44772 11 6 11.4477 6 12V21C6 21.5523 6.44772 22 7 22H21C21.5523 22 22 21.5523 22 21V12C22 11.4477 21.5523 11 21 11Z" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 15H22" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 22V24" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 22V24" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="9" r="4" stroke="#4A90E2" strokeWidth="2"/>
        <path d="M23 12L25 14" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round"/>
    </g>
    <defs>
        <clipPath id="clip0_bus_search">
        <rect width="24" height="24" fill="white" transform="translate(4 4)"/>
        </clipPath>
    </defs>
  </svg>
);


const serviceLinks = [
  { 
    href: '#', 
    title: 'Search From and To', 
    icon: <SearchFromToIcon />
  },
  { 
    href: '#', 
    title: 'Search by Route Number', 
    icon: <SearchBusIcon />
  },
  { 
    href: '#', 
    title: 'Search by City Bus Numbers', 
    icon: <SearchBusIcon />
  },
];

export default function CityServicesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-primary text-primary-foreground p-4 flex items-center shadow-md">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex items-center gap-1">
          <h1 className="text-lg font-semibold">HYDERABAD</h1>
          <ChevronDown className="h-5 w-5" />
        </div>
      </header>
      <main className="p-4 space-y-4">
        {serviceLinks.map((link) => (
          <Link href={link.href} key={link.title} className="group block">
            <Card className="flex items-center p-4 shadow-sm hover:shadow-md transition-shadow rounded-xl bg-card">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mr-4">
                  {link.icon}
              </div>
              <span className="flex-grow font-medium text-gray-800">{link.title}</span>
              <ChevronRight className="text-gray-400" />
            </Card>
          </Link>
        ))}
      </main>
    </div>
  );
}