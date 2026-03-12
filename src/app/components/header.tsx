'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header({ showBackButton = false, backHref, title }: { showBackButton?: boolean; backHref?: string; title?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex h-16 items-center px-4">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9 mr-2 text-primary-foreground hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-primary-foreground font-headline"
        >
          <Bus className="h-7 w-7" />
          <span>{title || 'Digital Bus Ticketing'}</span>
        </Link>
      </div>
    </header>
  );
}