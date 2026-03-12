
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds

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
        {isLoading ? <SplashScreen /> : (
          <>
            <FirebaseClientProvider>
              {/* Added pb-20 for footer spacing */}
              <main className="flex-grow pb-20">{children}</main>
            </FirebaseClientProvider>
            <Toaster />
            <footer className="bg-footer p-4 text-center border-t fixed bottom-0 w-full z-10">
              <p className="text-sm text-footer-foreground">Powered by</p>
              <p className="font-bold text-lg" style={{ color: 'hsl(var(--footer-name-color))' }}>Bingi Pradamesh</p>
            </footer>
          </>
        )}
      </body>
    </html>
  );
}
