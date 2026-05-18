
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRightLeft, BusFront, Baby, PlusCircle, MinusCircle, Ticket, Wallet, Loader2 } from 'lucide-react';
import { logEvent } from 'firebase/analytics';
import { useAnalytics } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { hyderabadLocalities } from '@/lib/locations';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { calculateFare } from '@/lib/fare-calculator';
import { Switch } from '@/components/ui/switch';
import { SimulatedPayment } from '@/components/simulated-payment';
import { API_ENDPOINTS } from '@/lib/api-config';

type PassengerType = 'Men' | 'Child' | 'Women';

const ManIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M12 11v10" />
    </svg>
);

const WomanIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M12 11v4" />
        <path d="M8 15l-2 5h12l-2-5" />
        <path d="M6 15h12" />
    </svg>
);

const passengerMeta: { type: PassengerType; icon: React.ReactNode }[] = [
    { type: 'Men', icon: <ManIcon className="h-6 w-6" /> },
    { type: 'Child', icon: <Baby className="h-6 w-6" /> },
    { type: 'Women', icon: <WomanIcon className="h-6 w-6" /> },
];

export function BookingForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [quantities, setQuantities] = useState({ Men: 0, Child: 0, Women: 0 });
  const [securityCode, setSecurityCode] = useState('');
  const [totalFare, setTotalFare] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const analytics = useAnalytics();

  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [finalFare, setFinalFare] = useState(0);

  useEffect(() => {
    const busType = (searchParams.get('type') as any) || 'ordinary';
    const newFare = calculateFare(from, to, quantities, busType);
    setTotalFare(newFare);
  }, [from, to, quantities, searchParams]);

  useEffect(() => {
    try {
      const storedWallet = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0}');
      setWalletBalance(storedWallet.balance || 0);
    } catch (e) {
      setWalletBalance(0);
    }
  }, []);

  useEffect(() => {
    if (useWallet && walletBalance > 0) {
      const remainingFare = Math.max(0, totalFare - walletBalance);
      setFinalFare(remainingFare);
    } else {
      setFinalFare(totalFare);
    }
  }, [totalFare, walletBalance, useWallet]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleQuantityChange = (type: PassengerType, delta: number) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      const currentQuantity = newQuantities[type];
      const newQuantity = currentQuantity + delta;
      if (newQuantity < 0) return prev;
      newQuantities[type] = newQuantity;
      return newQuantities;
    });
  };

  const initiateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select both locations.' });
      return;
    }
    if (from === to) {
      toast({ 
        variant: 'destructive', 
        title: 'Attention', 
        description: 'Source and Destination cannot be the same. Please select a valid route.' 
      });
      return;
    }
    const totalPassengers = Object.values(quantities).reduce((sum, q) => sum + q, 0);
    if (totalPassengers === 0) {
        toast({ variant: 'destructive', title: 'No Passengers', description: 'Please add at least one passenger.' });
        return;
    }
    if (!securityCode || securityCode.length !== 5) {
      toast({ variant: 'destructive', title: 'Invalid Security Code', description: 'Please enter a 5-digit code.' });
      return;
    }

    if (finalFare > 0) {
      setShowPayment(true);
    } else {
      finalizeBooking();
    }
  };

  const finalizeBooking = async () => {
    setIsLoading(true);
    try {
      const busType = searchParams.get('type') || 'ordinary';
      const routeNo = hyderabadLocalities.find(l => l.name === from)?.routeNumber || "00";
      
      const passengerSummary = Object.entries(quantities)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');

      const bookingData = {
        from,
        to,
        routeNo,
        passengers: passengerSummary,
        quantities,
        totalFare,
        fare: finalFare,
        walletAmountUsed: useWallet ? Math.min(totalFare, walletBalance) : 0,
        securityCode: securityCode.toUpperCase(),
        busType
      };

      const response = await fetch(API_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server failed to create ticket");
      }
      
      const result = await response.json();
      const ticket = result.ticket;

      // Analytics: Track Booking
      if (analytics) {
        logEvent(analytics, 'ticket_booked', {
          from: ticket.from,
          to: ticket.to,
          bus_type: ticket.busType,
          total_fare: ticket.totalFare,
          passenger_count: Object.values(quantities).reduce((a, b) => a + b, 0)
        });
      }

      // Deduct wallet if used
      if (useWallet && ticket.walletAmountUsed > 0) {
          const storedWallet = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions": []}');
          storedWallet.balance -= ticket.walletAmountUsed;
          storedWallet.transactions.push({
              type: 'debit',
              description: `Ticket booking ${ticket.ticketCode}`,
              amount: ticket.walletAmountUsed,
              date: new Date().toISOString(),
          });
          localStorage.setItem('userWallet', JSON.stringify(storedWallet));
      }

      // Save to local history for quick access
      const storedTickets = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      storedTickets.push(ticket);
      localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));

      router.push(`/ticket?id=${ticket.ticketCode}`);
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Booking Failed', 
        description: error.message || 'Could not communicate with server.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="bg-primary text-primary-foreground text-center p-6 rounded-t-lg">
          <div className="flex items-center justify-center gap-2">
              <BusFront className="h-7 w-7" />
              <CardTitle className="font-headline text-2xl">Book Digital Ticket</CardTitle>
          </div>
        </CardHeader>
        <form onSubmit={initiateBooking}>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium">From</label>
                <Select value={from} onValueChange={setFrom} required>
                  <SelectTrigger><SelectValue placeholder="From" /></SelectTrigger>
                  <SelectContent>
                    {hyderabadLocalities.map((loc) => (
                      <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={handleSwap}>
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium">To</label>
                <Select value={to} onValueChange={setTo} required>
                  <SelectTrigger><SelectValue placeholder="To" /></SelectTrigger>
                  <SelectContent>
                    {hyderabadLocalities.map((loc) => (
                       <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
                <Label>Passengers</Label>
                {passengerMeta.map(({ type, icon }) => (
                  <div key={type} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">{icon}<span className="text-sm">{type}</span></div>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(type, -1)}>-</Button>
                      <span className="font-bold">{quantities[type]}</span>
                      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(type, 1)}>+</Button>
                    </div>
                  </div>
                ))}
            </div>
            
            {walletBalance > 0 && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div className="text-xs">
                          <p className="font-bold">Use Wallet</p>
                          <p className="text-muted-foreground">Bal: Rs. {walletBalance.toFixed(2)}</p>
                      </div>
                  </div>
                  <Switch checked={useWallet} onCheckedChange={setUseWallet} />
              </div>
            )}

            <div>
              <Label>Security Code (5 chars)</Label>
              <Input
                placeholder="ABC12"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.toUpperCase())}
                maxLength={5}
                required
              />
            </div>

             <div className="flex justify-between items-center rounded-lg bg-muted p-3">
                <span className="font-bold">Total Fare:</span>
                <span className="text-2xl font-bold">Rs. {finalFare}</span>
              </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Ticket className="mr-2 h-4 w-4" /> Generate Ticket</>}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <SimulatedPayment 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={finalizeBooking}
        amount={finalFare}
      />
    </>
  );
}
