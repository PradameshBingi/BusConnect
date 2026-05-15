'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Tag, ArrowDown, ArrowUp, XCircle, CheckCircle, Clock, ArrowRight, User } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { calculateFare } from '@/lib/fare-calculator';
import { Separator } from '@/components/ui/separator';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BusType = 'ordinary' | 'express' | 'deluxe';
type Quantities = { Men: number; Child: number; Women: number; };

type TicketDetails = {
  from: string;
  to: string;
  passengers: string;
  quantities: Quantities;
  totalFare: number;
  fare: number;
  createdAt: string;
  status: 'valid' | 'expired' | 'used' | 'cancelled';
  securityCode: string;
  routeNo?: string;
  busType: BusType;
  ticketCode: string;
  walletAmountUsed?: number;
  validatedAt?: string;
};

type VerificationStatus = 'idle' | 'loading' | 'not_found' | 'result' | 'validated' | 'used' | 'expired' | 'cancelled' | 'error';

export default function FareCheckPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [actualBusType, setActualBusType] = useState<BusType | ''>('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [fareDifference, setFareDifference] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getFullBusType = (type: string) => {
    switch (type) {
      case 'ordinary': return 'City Ordinary';
      case 'express': return 'Metro Express';
      case 'deluxe': return 'Metro Deluxe';
      default: return type;
    }
  };

  const handleFareCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode || !actualBusType) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter a ticket code and select the bus type.' });
      return;
    }
    
    setStatus('loading');
    setTicketDetails(null);
    setFareDifference(0);

    try {
        const response = await fetch(`${API_ENDPOINTS.VERIFY}/${ticketCode.trim().toUpperCase()}`);
        
        if (response.status === 404) {
            setStatus('not_found');
            return;
        }

        if (!response.ok) throw new Error("Server communication failure");
        
        const result = await response.json();
        const foundTicket = result.ticket;
        setTicketDetails(foundTicket);

        if (foundTicket.status === 'valid') {
            const actualFare = calculateFare(foundTicket.from, foundTicket.to, foundTicket.quantities, actualBusType as BusType);
            const currentTotalPaid = foundTicket.totalFare || (foundTicket.fare + (foundTicket.walletAmountUsed || 0));
            const difference = actualFare - currentTotalPaid;
            setFareDifference(difference);
            setCalculatedTotal(actualFare);
            setStatus('result');
        } else {
            setStatus(foundTicket.status as any);
        }
    } catch (error) {
        console.error("Fare check error", error);
        setStatus('error');
    }
  };
  
  const handleValidation = async () => {
    if (!ticketDetails || !actualBusType) return;
    setIsLoading(true);
    
    try {
        const response = await fetch(`${API_ENDPOINTS.USE}/${ticketDetails.ticketCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                busType: actualBusType,
                totalFare: calculatedTotal,
                fare: (ticketDetails.fare || 0) + (fareDifference > 0 ? fareDifference : 0)
            })
        });

        if (!response.ok) throw new Error("Validation failed");
        
        setStatus('validated');
        toast({ title: "Success", description: "Journey validated and database updated." });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update database.' });
    } finally {
        setIsLoading(false);
    }
  }

  const reset = () => {
    setTicketCode('');
    setActualBusType('');
    setStatus('idle');
    setTicketDetails(null);
    setFareDifference(0);
  }
  
  const getStatusContent = () => {
    if (status === 'idle' || status === 'loading') return null;
    
    if (status === 'validated' || status === 'used' || status === 'cancelled' || status === 'expired') {
        return (
            <div className="space-y-4 w-full max-w-md text-center">
                <h1 className={cn("text-4xl font-bold uppercase tracking-widest", 
                    status === 'used' || status === 'validated' ? "text-slate-500" : 
                    status === 'cancelled' ? "text-red-600" : "text-yellow-500"
                )}>
                    TICKET {status === 'validated' ? 'USED' : status.toUpperCase()}
                </h1>
            </div>
        );
    }

    if (status === 'not_found') {
        return (
            <Card className="w-full max-w-md p-6 text-center text-destructive border-destructive/20 bg-destructive/5">
                <XCircle className="mx-auto mb-2 h-8 w-8" />
                <p className="font-bold">Ticket Not Found</p>
                <p className="text-sm">Verify the code and try again.</p>
            </Card>
        );
    }
    
    if (status === 'result' && ticketDetails) {
        return (
            <Card className="w-full max-w-md mt-8">
                <CardHeader className="items-center text-center">
                    {fareDifference === 0 ? <CheckCircle className="h-12 w-12 text-green-500" /> : fareDifference > 0 ? <ArrowUp className="h-12 w-12 text-yellow-600" /> : <ArrowDown className="h-12 w-12 text-primary" />}
                    <CardTitle className="text-2xl font-bold font-headline">
                        {fareDifference === 0 ? "Fare Correct" : fareDifference > 0 ? "Collect Difference" : "Fare Upgrade Available"}
                    </CardTitle>
                    <CardDescription>
                        {fareDifference === 0 ? "Booked fare matches bus type." : fareDifference > 0 ? `Collect Rs. ${fareDifference.toFixed(2)} cash from passenger.` : `Fare difference will be refunded to wallet.`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className='space-y-4'>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Booked Bus</p>
                                <p className="font-bold text-primary">{getFullBusType(ticketDetails.busType)}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Boarding Bus</p>
                                <p className="font-bold text-accent">{getFullBusType(actualBusType as BusType)}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center px-4">
                            <div className="text-center">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">From</p>
                                <p className="font-bold text-sm">{ticketDetails.from}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-primary" />
                            <div className="text-center">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">To</p>
                                <p className="font-bold text-sm">{ticketDetails.to}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-xs">
                             <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground"/>
                                <p className="font-medium">{ticketDetails.passengers}</p>
                             </div>
                             <div className="flex items-center justify-end gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <div className="text-right">
                                    <p className="text-muted-foreground text-[10px]">NEW TOTAL:</p>
                                    <p className="font-bold text-lg">Rs. {calculatedTotal.toFixed(2)}</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full h-12 text-lg" onClick={handleValidation} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Validate & Mark as USED"}
                    </Button>
                </CardFooter>
            </Card>
        );
    }
    return null;
  }

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/ticket" title="Fare Check" />
      <div className="p-4 md:p-8 flex flex-col items-center gap-8 min-h-screen bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Verify Boarding Category</CardTitle>
            <CardDescription>Adjust fare if passenger boards a different bus type.</CardDescription>
          </CardHeader>
          <form onSubmit={handleFareCheck}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-code">Ticket Code</Label>
                <Input 
                  id="ticket-code" 
                  placeholder="TKT-XX-XXXXX" 
                  value={ticketCode} 
                  onChange={e => setTicketCode(e.target.value)} 
                  required 
                  disabled={status === 'loading'}
                  className="uppercase font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bus-type">Actual Boarding Bus Type</Label>
                <Select value={actualBusType} onValueChange={(v) => setActualBusType(v as BusType)} required disabled={status === 'loading'}>
                  <SelectTrigger id="bus-type">
                    <SelectValue placeholder="Select current bus..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordinary">City Ordinary</SelectItem>
                    <SelectItem value="express">Metro Express</SelectItem>
                    <SelectItem value="deluxe">Metro Deluxe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-12" disabled={status === 'loading'}>
                {status === 'loading' ? <Loader2 className="animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Calculate Fare Difference
              </Button>
            </CardFooter>
          </form>
        </Card>

        {getStatusContent()}

        {(status === 'validated' || status === 'used' || status === 'expired' || status === 'not_found' || status === 'cancelled') && (
            <Button variant="outline" className="w-full max-w-md bg-white h-12 border-primary text-primary hover:bg-primary/5" onClick={reset}>Verify Another Ticket</Button>
        )}
      </div>
    </>
  );
}
