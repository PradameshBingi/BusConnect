'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Tag, ArrowDown, ArrowUp, Gift, XCircle, CheckCircle, Clock, ArrowRight, Calendar, User, ShieldCheck, Bus, Wallet } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { calculateFare } from '@/lib/fare-calculator';
import { Separator } from '@/components/ui/separator';
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

type VerificationStatus = 'idle' | 'loading' | 'not_found' | 'result' | 'validated' | 'used' | 'expired' | 'cancelled' | 'used_and_expired';

type WalletData = {
  balance: number;
  refunds: { code: string; amount: number; status: 'unclaimed' | 'claimed', ticketCode: string }[];
};

export default function FareCheckPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [actualBusType, setActualBusType] = useState<BusType | ''>('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [fareDifference, setFareDifference] = useState(0);
  const [refundCode, setRefundCode] = useState('');
  const { toast } = useToast();

  const getFullBusType = (type: BusType | '') => {
    switch (type) {
      case 'ordinary':
        return 'City Ordinary';
      case 'express':
        return 'Metro Express';
      case 'deluxe':
        return 'Metro Deluxe';
      default:
        return type;
    }
  };
  
  const renderTicketDetailsView = (ticket: TicketDetails, refundCodeGenerated?: string) => {
    return (
        <div className='space-y-4'>
            <Separator/>
            <div className="flex justify-between items-center">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-bold text-lg">{ticket.from}</p>
                </div>
                <ArrowRight className="h-6 w-6 text-primary" />
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-bold text-lg">{ticket.to}</p>
                </div>
            </div>
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground"/>
                  <div>
                      <p className="font-semibold text-[10px] uppercase">Date</p>
                      <p className="text-muted-foreground font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground"/>
                  <div>
                      <p className="font-semibold text-[10px] uppercase">Passengers</p>
                      <p className="text-muted-foreground font-bold">{ticket.passengers}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                 <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                      <p className="font-semibold text-[10px] uppercase">Payment</p>
                      {((ticket.walletAmountUsed || 0) > 0 && (ticket.fare || 0) === 0) ? (
                        <p className="text-primary font-bold flex items-center gap-1 text-[10px]"><Wallet className="h-3 w-3" /> Wallet: Rs. {(ticket.walletAmountUsed || 0).toFixed(2)}</p>
                      ) : (
                        <p className="text-muted-foreground font-bold">Rs. {(ticket.fare || 0).toFixed(2)}</p>
                      )}
                  </div>
               </div>
                <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold text-[10px] uppercase">Boarded Bus</p>
                        <p className="text-muted-foreground font-bold">{getFullBusType(ticket.busType)}</p>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-muted-foreground"/>
                <div>
                    <p className="font-semibold text-[10px] uppercase">Passenger Security PIN</p>
                    <p className="font-mono text-lg font-bold tracking-widest text-primary">{ticket.securityCode}</p>
                </div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/20">
              <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold">Unique Smart Ticket Code</p>
              <p className="font-mono text-xl font-bold tracking-widest text-primary break-all">{ticket.ticketCode}</p>
            </div>
            
            {refundCodeGenerated && (
                <div className="text-center p-3 mt-2 bg-blue-100 text-blue-800 font-medium rounded-md border border-blue-200">
                    <p className="font-bold">REFUND CODE:</p>
                    <p className="text-lg font-bold tracking-widest">{refundCodeGenerated}</p>
                    <p className="text-xs mt-1">Passenger must use this code in their wallet to claim the refund.</p>
                </div>
            )}
        </div>
    );
  };

  const handleFareCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode || !actualBusType) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter a ticket code and select the bus type.' });
      return;
    }
    
    setStatus('loading');
    setTicketDetails(null);
    setFareDifference(0);
    setRefundCode('');

    setTimeout(() => {
      try {
        const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
        const foundTicket = storedTickets.find(t => t.ticketCode === ticketCode.toUpperCase());

        if (!foundTicket) {
          setStatus('not_found');
          return;
        }

        setTicketDetails(foundTicket);

        if(foundTicket.status === 'cancelled') {
            setStatus('cancelled');
            return;
        }

        if(foundTicket.status === 'used') {
            try {
                const storedStats: any[] = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
                const verificationRecords = storedStats.filter(s => s.ticketCode === ticketCode.toUpperCase());
                const lastVerification = verificationRecords.pop();
                
                if (lastVerification && lastVerification.verifiedAt) {
                    const validatedAt = new Date(lastVerification.verifiedAt).getTime();
                    if (new Date().getTime() - validatedAt < 60 * 1000) {
                        setStatus('used');
                    } else {
                        setStatus('used_and_expired');
                    }
                } else {
                    setStatus('used_and_expired');
                }
            } catch {
                setStatus('used_and_expired');
            }
            return;
        }

        const isBookingExpired = new Date().getTime() - new Date(foundTicket.createdAt).getTime() > 60 * 1000;
        if (foundTicket.status === 'valid' && isBookingExpired) {
          setTicketDetails({...foundTicket, status: 'expired'});
          setStatus('expired');
          return;
        }

        if (foundTicket.status === 'valid') {
            const actualFare = calculateFare(foundTicket.from, foundTicket.to, foundTicket.quantities, actualBusType);
            const difference = actualFare - (foundTicket.totalFare ?? foundTicket.fare);
            setFareDifference(difference);
            setStatus('result');
            return;
        }
        
        setStatus('not_found');

      } catch (error) {
        console.error("Fare check failed", error);
        toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        setStatus('idle');
      }
    }, 1000);
  };
  
  const handleValidation = () => {
    if (!ticketDetails || !actualBusType) return;
    
    const actualFare = calculateFare(ticketDetails.from, ticketDetails.to, ticketDetails.quantities, actualBusType);

    const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
    const ticketIndex = storedTickets.findIndex(t => t.ticketCode === ticketDetails.ticketCode);
    
    let generatedRefundCode: string | null = null;
    if (ticketIndex > -1) {
      const ticketToUpdate = storedTickets[ticketIndex];
      ticketToUpdate.status = 'used';
      ticketToUpdate.busType = actualBusType;
      ticketToUpdate.totalFare = actualFare;
      ticketToUpdate.fare += (fareDifference > 0 ? fareDifference : 0);

      localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));
    }
    
    if (fareDifference < 0) {
      const newRefundCode = `REF-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      setRefundCode(newRefundCode);
      generatedRefundCode = newRefundCode;
      
      const storedWallet = localStorage.getItem('userWallet');
      const wallet: WalletData = storedWallet ? JSON.parse(storedWallet) : { balance: 0, refunds: [] };
      
      wallet.refunds.push({ code: newRefundCode, amount: Math.abs(fareDifference), status: 'unclaimed' as 'unclaimed', ticketCode: ticketDetails.ticketCode });
      localStorage.setItem('userWallet', JSON.stringify(wallet));
    }

    try {
      const stats = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
      stats.push({
          ticketCode: ticketDetails.ticketCode,
          quantities: ticketDetails.quantities,
          verifiedAt: new Date().toISOString(),
          refundCodeGenerated: generatedRefundCode,
          fareDifference: fareDifference,
      });
      localStorage.setItem('conductorVerificationStats', JSON.stringify(stats));
    } catch (e) {
        console.error("Failed to update verification stats", e);
    }
    
    setStatus('validated');
    setTicketDetails(prev => prev ? {
        ...prev, 
        status: 'used',
        busType: actualBusType,
        totalFare: actualFare,
        fare: prev.fare + (fareDifference > 0 ? fareDifference : 0),
    } : null);
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
        return { icon: <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />, title: "Ticket Validated Successfully", description: "The ticket has been successfully validated and marked as used." };
    }
    if (status === 'cancelled') {
        return { icon: <XCircle className="h-12 w-12 text-orange-500 mx-auto" />, title: "Ticket Canceled", description: "This ticket has been canceled and is no longer valid." };
    }
    if (status === 'used') {
        return { icon: <XCircle className="h-12 w-12 text-orange-500 mx-auto" />, title: "Ticket Already Used", description: "Details are available for one minute after validation." };
    }
    if (status === 'used_and_expired') {
        return { icon: <Clock className="h-12 w-12 text-yellow-500 mx-auto" />, title: "Ticket Already Used", description: "The viewing window for this ticket has expired." };
    }
    if (status === 'expired') {
        return { icon: <Clock className="h-12 w-12 text-yellow-500 mx-auto" />, title: "Ticket Expired", description: "This ticket is no longer valid." };
    }
    if (status === 'result' && ticketDetails) {
        if (fareDifference === 0) return { icon: <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />, title: "Ticket Valid & Fare Correct", description: "The booked fare matches the bus type." };
        if (fareDifference > 0) return { icon: <ArrowUp className="h-12 w-12 text-yellow-600 mx-auto" />, title: "Additional Fare Required", description: `Collect Rs. ${fareDifference.toFixed(2)} from the Passenger Before Validating this Ticket.` };
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
            <CardDescription>Check for fare differences based on the actual bus boarded.</CardDescription>
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
              <CardDescription>The ticket code entered is invalid. Please check and try again.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={reset}>Try Again</Button>
            </CardFooter>
          </Card>
        )}
        
        {ticketDetails && (status === 'result' || status === 'validated' || status === 'used' || status === 'expired' || status === 'cancelled' || status === 'used_and_expired') && (
            <Card className="w-full max-w-md mt-8">
                {statusContent && (
                    <CardHeader className="items-center text-center">
                        {statusContent.icon}
                        <CardTitle className="text-2xl font-bold">{statusContent.title}</CardTitle>
                        <CardDescription>{statusContent.description}</CardDescription>
                    </CardHeader>
                )}
                
                <CardContent className="p-6 pt-0">
                    {status === 'validated' && <GeneratedTicket ticket={ticketDetails} refundCode={refundCode} />}
                    {ticketDetails && (status === 'used' || status === 'cancelled') && renderTicketDetailsView(ticketDetails)}
                    {status === 'result' && (
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
                                    <div>
                                        <p className="font-semibold text-[10px] uppercase">Date</p>
                                        <p className="text-muted-foreground font-bold">{new Date(ticketDetails.createdAt).toLocaleDateString()}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground"/>
                                    <div>
                                        <p className="font-semibold text-[10px] uppercase">Passengers</p>
                                        <p className="text-muted-foreground font-bold">{ticketDetails.passengers}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <Tag className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold text-[10px] uppercase">Payment</p>
                                        {((ticketDetails.walletAmountUsed || 0) > 0 && (ticketDetails.fare || 0) === 0) ? (
                                            <p className="text-primary font-bold flex items-center gap-1 text-[10px]"><Wallet className="h-3 w-3" /> Wallet: Rs. {(ticketDetails.walletAmountUsed || 0).toFixed(2)}</p>
                                        ) : (
                                            <p className="text-muted-foreground font-bold">Rs. {(ticketDetails.fare || 0).toFixed(2)}</p>
                                        )}
                                    </div>
                                 </div>
                                  <div className="flex items-center gap-2">
                                      <Bus className="h-4 w-4 text-muted-foreground"/>
                                      <div>
                                          <p className="font-semibold text-[10px] uppercase">Booked Bus</p>
                                          <p className="text-muted-foreground font-bold">{getFullBusType(ticketDetails.busType)}</p>
                                      </div>
                                  </div>
                              </div>
                        </div>
                    )}
                </CardContent>
                
                <CardFooter className="flex flex-col gap-2 p-6 pt-0">
                    {status === 'result' && (
                        <Button className="w-full" onClick={handleValidation}>
                            {fareDifference < 0 ? 'Issue Code & Validate' : 'Validate Ticket'}
                        </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={reset}>
                        {status === 'result' ? 'Cancel' : 'Verify Next Ticket'}
                    </Button>
                </CardFooter>
            </Card>
        )}
      </div>
    </>
  );
}