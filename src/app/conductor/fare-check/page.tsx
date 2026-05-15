'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Tag, ArrowDown, ArrowUp, XCircle, CheckCircle, Clock, ArrowRight, Calendar, User, Bus } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { calculateFare } from '@/lib/fare-calculator';
import { Separator } from '@/components/ui/separator';
import { API_ENDPOINTS } from '@/lib/api-config';
import { GeneratedTicket } from '@/app/components/generated-ticket';

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
};

type VerificationStatus = 'idle' | 'loading' | 'not_found' | 'result' | 'validated' | 'used' | 'expired' | 'cancelled' | 'error';

export default function FareCheckPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [actualBusType, setActualBusType] = useState<BusType | ''>('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [fareDifference, setFareDifference] = useState(0);
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
        if (!response.ok) throw new Error("Server error");
        
        const result = await response.json();
        
        if (result.status === 'invalid') {
            setStatus('not_found');
            return;
        }

        const foundTicket = result.ticket;
        setTicketDetails(foundTicket);

        if (foundTicket.status === 'valid') {
            const actualFare = calculateFare(foundTicket.from, foundTicket.to, foundTicket.quantities, actualBusType as BusType);
            const currentTotalPaid = foundTicket.totalFare || (foundTicket.fare + (foundTicket.walletAmountUsed || 0));
            const difference = actualFare - currentTotalPaid;
            setFareDifference(difference);
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
    
    const actualFare = calculateFare(ticketDetails.from, ticketDetails.to, ticketDetails.quantities, actualBusType as BusType);

    try {
        const response = await fetch(`${API_ENDPOINTS.USE}/${ticketDetails.ticketCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                busType: actualBusType,
                fare: (ticketDetails.fare || 0) + (fareDifference > 0 ? fareDifference : 0)
            })
        });

        if (!response.ok) throw new Error("Validation failed");
        const result = await response.json();

        setStatus('validated');
        setTicketDetails(result.ticket);
        toast({ title: "Success", description: "Ticket validated and marked as USED in database." });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not validate ticket on server.' });
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
    
    if (status === 'validated' && ticketDetails) {
        return (
            <div className="space-y-4 w-full max-w-md">
                <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    TICKET VALIDATED - USED
                </div>
                <GeneratedTicket ticket={ticketDetails as any} />
            </div>
        );
    }
    if (status === 'used') {
        return (
            <div className="space-y-4 w-full max-w-md">
                <div className="bg-slate-200 text-slate-700 px-4 py-3 rounded-lg font-bold text-center flex items-center justify-center gap-2">
                    <XCircle className="h-5 w-5" />
                    TICKET ALREADY USED
                </div>
                {ticketDetails && <GeneratedTicket ticket={ticketDetails as any} />}
            </div>
        );
    }
    
    if (status === 'result' && ticketDetails) {
        return (
            <Card className="w-full max-w-md mt-8">
                <CardHeader className="items-center text-center">
                    {fareDifference === 0 ? <CheckCircle className="h-12 w-12 text-green-500" /> : fareDifference > 0 ? <ArrowUp className="h-12 w-12 text-yellow-600" /> : <ArrowDown className="h-12 w-12 text-primary" />}
                    <CardTitle className="text-2xl font-bold">
                        {fareDifference === 0 ? "Fare Correct" : fareDifference > 0 ? "Collect Difference" : "Refund Due"}
                    </CardTitle>
                    <CardDescription>
                        {fareDifference === 0 ? "Booked fare matches bus type." : fareDifference > 0 ? `Collect Rs. ${fareDifference.toFixed(2)} from passenger.` : `Rs. ${Math.abs(fareDifference).toFixed(2)} will be refunded.`}
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
                        <div className="flex justify-between items-center">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">From</p>
                                <p className="font-bold">{ticketDetails.from}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-primary" />
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">To</p>
                                <p className="font-bold">{ticketDetails.to}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                             <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <p className="font-bold">{new Date(ticketDetails.createdAt).toLocaleDateString()}</p>
                             </div>
                             <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground"/>
                                <p className="font-bold">{ticketDetails.passengers}</p>
                             </div>
                             <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <p className="font-bold">Paid: Rs. {ticketDetails.totalFare?.toFixed(2)}</p>
                             </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full h-12 text-lg" onClick={handleValidation}>Validate & Mark as USED</Button>
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
            <CardTitle className="font-headline text-2xl">Verify by Bus Type</CardTitle>
            <CardDescription>Check for fare differences across bus categories.</CardDescription>
          </CardHeader>
          <form onSubmit={handleFareCheck}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-code">Ticket Code</Label>
                <Input id="ticket-code" placeholder="TKT-XX-XXXXX" value={ticketCode} onChange={e => setTicketCode(e.target.value)} required className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bus-type">Actual Boarding Bus Type</Label>
                <Select value={actualBusType} onValueChange={(v) => setActualBusType(v as BusType)} required>
                  <SelectTrigger id="bus-type">
                    <SelectValue placeholder="Select bus type..." />
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
                Check Fare Difference
              </Button>
            </CardFooter>
          </form>
        </Card>

        {getStatusContent()}

        {(status === 'validated' || status === 'used' || status === 'expired' || status === 'not_found') && (
            <Button variant="outline" className="w-full max-w-md bg-white h-12" onClick={reset}>Verify Next Ticket</Button>
        )}
      </div>
    </>
  );
}
