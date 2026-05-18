
'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SplashScreen } from '@/app/components/splash-screen';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>BusConnect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <FirebaseClientProvider>
          {mounted && isLoading ? <SplashScreen /> : null}
          <div style={{ display: mounted && !isLoading ? 'block' : 'none' }} className="flex-grow">
            <main className="pb-24">{children}</main>
            <Toaster />
            <footer className="bg-white p-4 text-center border-t fixed bottom-0 w-full z-40">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Powered by</p>
              <p className="font-bold text-xl tracking-tight" style={{ color: '#0A2B70' }}>BINGI PRADAMESH</p>
            </footer>
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
