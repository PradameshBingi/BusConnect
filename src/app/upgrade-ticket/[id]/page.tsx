
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function UpgradeIDPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/upgrade-ticket?id=${id}`);
    } else {
      router.replace('/booking-history');
    }
  }, [id, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-bold mb-2">Preparing Upgrade...</h2>
      <p className="text-muted-foreground">Redirecting to the ticket upgrade portal.</p>
    </div>
  );
}
