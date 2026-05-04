'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Tag, ArrowDown, ArrowUp, XCircle, CheckCircle, Clock, ArrowRight, Calendar, User, ShieldCheck, Bus, Wallet } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { calculateFare } from '@/lib/fare-calculator';
import { Separator } from '@/components/ui/separator';
import { API_ENDPOINTS } from '@/lib/api-config';

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
  const [refundCode, setRefundCode] = useState('');
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
    setRefundCode('');

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
            const actualFare = calculateFare(foundTicket.from, foundTicket.to, foundTicket.quantities, actualBusType);
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
    
    const actualFare = calculateFare(ticketDetails.from, ticketDetails.to, ticketDetails.quantities, actualBusType);

    try {
        const response = await fetch(`${API_ENDPOINTS.USE}/${ticketDetails.ticketCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                busType: actualBusType,
                totalFare: actualFare,
                fare: ticketDetails.fare + (fareDifference > 0 ? fareDifference : 0)
            })
        });

        if (!response.ok) throw new Error("Validation failed");
        const result = await response.json();

        if (fareDifference < 0) {
            const newRefundCode = `REF-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            setRefundCode(newRefundCode);
        }

        setStatus('validated');
        setTicketDetails(result.ticket);
        toast({ title: "Success", description: "Ticket validated with bus-specific fare adjustment." });
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
    setRefundCode('');
  }
  
  const getStatusContent = () => {
    if (status === 'idle' || status === 'loading') return null;
    
    if (status === 'validated') {
        return { icon: <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />, title: "Ticket Validated Successfully", description: "The ticket has been updated to mark the actual bus boarded." };
    }
    if (status === 'used') {
        return { icon: <XCircle className="h-12 w-12 text-orange-500 mx-auto" />, title: "Ticket Already Used", description: "This ticket cannot be re-validated." };
    }
    if (status === 'expired') {
        return { icon: <Clock className="h-12 w-12 text-yellow-500 mx-auto" />, title: "Ticket Expired", description: "This ticket is no longer valid." };
    }
    if (status === 'result' && ticketDetails) {
        if (fareDifference === 0) return { icon: <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />, title: "Ticket Valid & Fare Correct", description: "The booked fare matches the bus type." };
        if (fareDifference > 0) return { icon: <ArrowUp className="h-12 w-12 text-yellow-600 mx-auto" />, title: "Additional Fare Required", description: `Collect Rs. ${fareDifference.toFixed(2)} from the Passenger Before Validating.` };
        if (fareDifference < 0) return { icon: <ArrowDown className="h-12 w-12 text-primary mx-auto" />, title: "Refund Due", description: `A refund of Rs. ${Math.abs(fareDifference).toFixed(2)} will be issued upon validation.` };
    }
    return null;
  }
  
  const statusContent = getStatusContent();

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/ticket" title="Fare Check" />
      <div className="p-4 md:p-8 flex flex-col items-center gap-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Verify by Bus Type</CardTitle>
            <CardDescription>Server-side verification of fare differences.</CardDescription>
          </CardHeader>
          <form onSubmit={handleFareCheck}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-code">Ticket Code</Label>
                <Input id="ticket-code" placeholder="TKT-XX-XXXXX" value={ticketCode} onChange={e => setTicketCode(e.target.value)} required className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bus-type">Actual Bus Type</Label>
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
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? <Loader2 className="animate-spin" /> : <Search className="mr-2" />}
                Check Fare
              </Button>
            </CardFooter>
          </form>
        </Card>

        {status === 'not_found' && (
          <Card className="w-full max-w-md">
            <CardHeader className="items-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <CardTitle>Ticket Not Found</CardTitle>
              <CardDescription>The ticket code entered is invalid in our production system.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={reset}>Try Again</Button>
            </CardFooter>
          </Card>
        )}
        
        {ticketDetails && (status === 'result' || status === 'validated' || status === 'used' || status === 'expired') && (
            <Card className="w-full max-w-md mt-8">
                {statusContent && (
                    <CardHeader className="items-center text-center">
                        {statusContent.icon}
                        <CardTitle className="text-2xl font-bold">{statusContent.title}</CardTitle>
                        <CardDescription>{statusContent.description}</CardDescription>
                    </CardHeader>
                )}
                
                <CardContent className="p-6 pt-0">
                    <div className='space-y-4'>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">From</p>
                                <p className="font-bold text-lg">{ticketDetails.from}</p>
                            </div>
                            <ArrowRight className="h-6 w-6 text-primary" />
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">To</p>
                                <p className="font-bold text-lg">{ticketDetails.to}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                             <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <div><p className="font-bold text-xs">{new Date(ticketDetails.createdAt).toLocaleDateString()}</p></div>
                             </div>
                             <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground"/>
                                <div><p className="font-bold text-xs">{ticketDetails.passengers}</p></div>
                             </div>
                             <div className="flex items-center gap-2">
                               <Tag className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="font-bold text-sm">Rs. {(ticketDetails.totalFare || (ticketDetails.fare + (ticketDetails.walletAmountUsed || 0))).toFixed(2)}</p>
                                </div>
                             </div>
                              <div className="flex flex-col gap-1 text-[10px]">
                                  <p className="font-bold">Booked: {getFullBusType(ticketDetails.busType)}</p>
                                  {status === 'result' && <p className="font-bold text-primary">Actual: {getFullBusType(actualBusType)}</p>}
                              </div>
                          </div>
                    </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-2 p-6 pt-0">
                    {status === 'result' && (
                        <Button className="w-full" onClick={handleValidation}>Validate & Update</Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={reset}>Verify Next Ticket</Button>
                </CardFooter>
            </Card>
        )}
      </div>
    </>
  );
}
