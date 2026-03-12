'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function CountdownTimer({ expiryTimestamp }: { expiryTimestamp: number }) {
  const calculateTimeLeft = () => {
    const difference = expiryTimestamp - new Date().getTime();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTimestamp]);

  if (!isClient) {
    return (
      <Card className="bg-destructive/10 border-destructive/50 text-destructive">
        <CardContent className="p-4 text-center">
            <div className="font-bold text-lg">Loading timer...</div>
        </CardContent>
      </Card>
    );
  }

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
      if (value === 0 && interval !== 'seconds' && timeLeft.days === 0 && (interval !== 'minutes' || timeLeft.hours === 0)) {
          return null;
      }
      return (
        <div key={interval} className="flex flex-col items-center">
          <span className="text-3xl font-bold tabular-nums text-foreground">{String(value).padStart(2, '0')}</span>
          <span className="text-xs uppercase text-muted-foreground">{interval}</span>
        </div>
      );
  });
  
  const isExpired = !Object.values(timeLeft).some(val => val > 0);

  if (isExpired) {
    return (
      <Card className="bg-destructive/10 border-destructive/50 text-destructive">
        <CardContent className="p-4 text-center">
            <div className="font-bold text-lg">TICKET EXPIRED</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-muted/40 border-border">
      <CardContent className="p-4">
        <div className="text-center text-sm font-medium mb-2 text-muted-foreground">Expires In</div>
        <div className="flex justify-center items-center gap-3">
          {timerComponents.filter(Boolean).map((component, index, arr) => (
            <React.Fragment key={(component as React.ReactElement).key}>
              {component}
              {index < arr.length - 1 && <span className="text-3xl font-bold text-muted-foreground -mt-3">:</span>}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
