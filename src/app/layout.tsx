
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
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>BusConnect</title>
        <meta name="description" content="Hyderabad Public Bus Transport System" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        {mounted && isLoading ? <SplashScreen /> : null}
        <div style={{ visibility: (mounted && !isLoading) ? 'visible' : 'hidden', display: 'contents' }}>
          <FirebaseClientProvider>
            <main className="flex-grow pb-24">{children}</main>
            <Toaster />
            <footer className="bg-white p-4 text-center border-t fixed bottom-0 w-full z-40">
              <p className="text-xs text-muted-foreground">Powered by</p>
              <p className="font-bold text-lg text-primary">Bingi Pradamesh</p>
            </footer>
          </FirebaseClientProvider>
        </div>
      </body>
    </html>
  );
}
