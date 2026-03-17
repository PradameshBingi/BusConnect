
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRightLeft, BusFront, Baby, PlusCircle, MinusCircle, Ticket, Wallet } from 'lucide-react';

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

type PassengerType = 'Men' | 'Child' | 'Women';

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
      toast({ variant: 'destructive', title: 'Invalid Selection', description: 'Locations cannot be the same.' });
      return;
    }
    
    const totalPassengers = Object.values(quantities).reduce((sum, q) => sum + q, 0);
    if (totalPassengers === 0) {
        toast({ variant: 'destructive', title: 'No Passengers', description: 'Please add at least one passenger.' });
        return;
    }

    if (!securityCode || securityCode.length !== 5 || !/^[a-zA-Z0-9]+$/.test(securityCode)) {
      toast({ variant: 'destructive', title: 'Invalid Security Code', description: 'Please enter a 5-digit alphanumeric code.' });
      return;
    }

    if (finalFare > 0) {
      setShowPayment(true);
    } else {
      finalizeBooking();
    }
  };

  const finalizeBooking = () => {
    setIsLoading(true);

    try {
      const fromLocality = hyderabadLocalities.find(l => l.name === from);
      const toLocality = hyderabadLocalities.find(l => l.name === to);

      if (!fromLocality || !toLocality) throw new Error("Invalid location selection.");

      const ticketCode = `TKT-${fromLocality.routeNumber}-${Math.floor(10000 + Math.random() * 90000)}`;
      const passengerSummary = Object.entries(quantities)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');

      const busType = searchParams.get('type') || 'ordinary';
      const walletAmountUsed = useWallet ? Math.min(totalFare, walletBalance) : 0;

      const newTicket = {
        from: from,
        to: to,
        routeNo: fromLocality.routeNumber,
        passengers: passengerSummary || 'None',
        quantities: quantities,
        totalFare: totalFare,
        fare: finalFare,
        walletAmountUsed: walletAmountUsed,
        ticketCode: ticketCode,
        securityCode: securityCode,
        status: 'valid' as const,
        createdAt: new Date().toISOString(),
        busType: busType,
      };
      
      const existingTickets = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      existingTickets.push(newTicket);
      localStorage.setItem('generatedTickets', JSON.stringify(existingTickets));

      if (useWallet && walletAmountUsed > 0) {
          const storedWallet = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions": []}');
          storedWallet.balance -= walletAmountUsed;
          storedWallet.transactions = storedWallet.transactions || [];
          storedWallet.transactions.push({
              type: 'debit',
              description: `Ticket booking ${ticketCode}`,
              amount: walletAmountUsed,
              date: new Date().toISOString(),
          });
          localStorage.setItem('userWallet', JSON.stringify(storedWallet));
      }

      const encodedData = btoa(JSON.stringify(newTicket));
      router.push(`/ticket?id=${ticketCode}&data=${encodedData}`);

    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Booking Failed', description: error.message || 'Could not generate ticket.' });
       setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="bg-primary text-primary-foreground text-center p-6">
          <div className="flex items-center justify-center gap-2">
              <BusFront className="h-7 w-7" />
              <CardTitle className="font-headline text-2xl">Book Your Digital Ticket</CardTitle>
          </div>
        </CardHeader>
        <form onSubmit={initiateBooking}>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <label htmlFor="from-location" className="text-sm font-medium">From</label>
                <Select value={from} onValueChange={setFrom} required>
                  <SelectTrigger id="from-location">
                    <SelectValue placeholder="Select from" />
                  </SelectTrigger>
                  <SelectContent>
                    {hyderabadLocalities.map((loc) => (
                      <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="ghost" size="icon" className="mt-6 shrink-0" onClick={handleSwap}>
                <ArrowRightLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 space-y-1">
                <label htmlFor="to-location" className="text-sm font-medium">To</label>
                <Select value={to} onValueChange={setTo} required>
                  <SelectTrigger id="to-location">
                    <SelectValue placeholder="Select to" />
                  </SelectTrigger>
                  <SelectContent>
                    {hyderabadLocalities.map((loc) => (
                       <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
               <Label className="text-sm font-medium mb-2 block">Passengers</Label>
                <div className="space-y-2">
                  {passengerMeta.map(({ type, icon }) => (
                    <div key={type} className="flex items-center justify-between rounded-lg border bg-card p-3">
                      <div className="flex items-center gap-3">
                        {icon}
                        <span className="font-medium">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(type, -1)}>
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-bold w-6 text-center">{quantities[type]}</span>
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(type, 1)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
            
            {walletBalance > 0 && (
              <div>
                  <Label className="text-sm font-medium mb-2 block">Use Wallet Balance</Label>
                  <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                      <div className="flex items-center gap-3">
                          <Wallet className="h-6 w-6 text-primary" />
                          <div>
                              <span className="font-medium">Available Balance</span>
                              <p className="text-sm text-muted-foreground">Rs. {walletBalance.toFixed(2)}</p>
                          </div>
                      </div>
                      <Switch checked={useWallet} onCheckedChange={setUseWallet} />
                  </div>
              </div>
            )}

            <div>
              <Label htmlFor="security-code" className="text-sm font-medium">Passenger Security Code</Label>
              <Input
                id="security-code"
                placeholder="5-digit alphanumeric code"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.toUpperCase())}
                maxLength={5}
                required
                className="mt-1"
              />
            </div>

             <div className="flex justify-between items-center rounded-lg bg-muted p-3">
                <span className="font-medium">Total Fare:</span>
                <span className="text-2xl font-bold">Rs. {finalFare}</span>
              </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Generating...' : (
                <><Ticket className="mr-2 h-4 w-4" /> {finalFare > 0 ? `Pay Rs. ${finalFare} & Generate` : 'Generate Ticket'}</>
              )}
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
