'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, XCircle, Clock, ArrowRight, Loader2, Calendar, User, Tag, ShieldCheck, Bus, Wallet } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { GeneratedTicket } from '@/app/components/generated-ticket';
import { API_ENDPOINTS } from '@/lib/api-config';

type TicketDetails = {
  from: string;
  to: string;
  passengers: string;
  quantities: { Men: number; Child: number; Women: number; };
  totalFare: number;
  fare: number;
  createdAt: string;
  status: 'valid' | 'expired' | 'used' | 'cancelled';
  securityCode: string;
  routeNo?: string;
  busType: string;
  ticketCode: string;
  walletAmountUsed?: number;
};

type VerificationStatus = 'valid' | 'invalid' | 'expired' | 'used' | 'cancelled' | 'idle' | 'validated' | 'used_and_expired' | 'error';

const statusInfo: {[key in VerificationStatus]?: any} = {
  invalid: {
    icon: <XCircle className="h-16 w-16 text-red-500" />,
    title: 'Ticket Invalid',
    description: 'The ticket code entered could not be found in the official records.',
    color: 'text-red-500',
  },
  expired: {
    icon: <Clock className="h-16 w-16 text-yellow-500" />,
    title: 'Ticket Expired',
    description: 'This ticket has expired and is no longer valid for travel.',
    color: 'text-yellow-500',
  },
  used: {
    icon: <XCircle className="h-16 w-16 text-orange-500" />,
    title: 'Ticket Already Used',
    description: 'This ticket has already been validated and cannot be reused.',
    color: 'text-orange-500',
  },
  error: {
    icon: <XCircle className="h-16 w-16 text-destructive" />,
    title: 'Server Error',
    description: 'Could not connect to the ticketing server. Please try again.',
    color: 'text-destructive',
  },
  cancelled: {
    icon: <XCircle className="h-16 w-16 text-orange-500" />,
    title: 'Ticket Canceled',
    description: 'This ticket has been canceled and is no longer valid.',
    color: 'text-orange-500',
  },
  valid: {
    icon: <CheckCircle className="h-16 w-16 text-green-500" />,
    title: 'Ticket Valid',
    description: 'This ticket is valid for travel.',
    color: 'text-green-500',
  },
  validated: {
    icon: <CheckCircle className="h-16 w-16 text-green-500" />,
    title: 'Ticket Validated Successfully',
    description: 'This ticket has been marked as used in the database.',
    color: 'text-green-500',
  },
};

export default function VerifyTicketPage() {
    const [ticketCode, setTicketCode] = useState('');
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
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

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketCode) return;

        setIsLoading(true);
        setTicketDetails(null);
        setStatus('idle');
        
        try {
            const response = await fetch(API_ENDPOINTS.VERIFY(ticketCode.trim()));
            if (!response.ok) throw new Error("Server error");
            
            const result = await response.json();
            
            if (result.status === 'invalid') {
                setStatus('invalid');
            } else {
                setTicketDetails(result.ticket);
                setStatus(result.status);
            }
        } catch (error) {
            console.error("Verification failed", error);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidateTicket = async () => {
        if (!ticketCode || !ticketDetails) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.USE(ticketDetails.ticketCode), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error("Validation failed");

            const result = await response.json();
            setStatus('validated');
            setTicketDetails(result.ticket);
            toast({ title: "Validated", description: "Ticket marked as used successfully." });
        } catch (error) {
            console.error("Failed to validate ticket", error);
            toast({ variant: 'destructive', title: 'Validation Failed', description: 'Server communication error.' });
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setStatus('idle');
        setTicketCode('');
        setTicketDetails(null);
    }

  const currentStatusInfo = status !== 'idle' ? statusInfo[status] : null;

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/ticket" title="Verify Ticket" />
      <div className="flex flex-col items-center bg-muted/40 p-4 md:p-8" style={{minHeight: 'calc(100vh - 8rem)'}}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Verify Ticket</CardTitle>
            <CardDescription>
              Enter the unique ticket code for production verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ticket-code">Ticket Code</Label>
                <Input
                  id="ticket-code"
                  placeholder="Enter unique ticket code"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  required
                  disabled={isLoading}
                  className="uppercase"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Verify Code
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {status !== 'idle' && !isLoading && (
          <Card className="w-full max-w-md mt-8">
            {currentStatusInfo && (
              <CardHeader>
                  <div className="flex justify-center mb-2">
                      {currentStatusInfo.icon}
                  </div>
                  <CardTitle className={`text-center text-2xl font-bold ${currentStatusInfo.color}`}>{currentStatusInfo.title}</CardTitle>
                  <CardDescription className="text-center mt-2">{currentStatusInfo.description}</CardDescription>
              </CardHeader>
            )}

            <CardContent className="p-6 pt-0">
                {ticketDetails && (
                    <div className='space-y-4'>
                        <Separator/>
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
                              <div className="flex-1">
                                  <p className="font-semibold text-[10px] uppercase">Total Cost</p>
                                  <p className="font-bold text-sm">Rs. {(ticketDetails.totalFare || (ticketDetails.fare + (ticketDetails.walletAmountUsed || 0))).toFixed(2)}</p>
                                  {(ticketDetails.walletAmountUsed || 0) > 0 && (
                                    <p className="text-primary font-bold flex items-center gap-1 text-[8px] mt-0.5">
                                        <Wallet className="h-3 w-3" /> Wallet: Rs. {ticketDetails.walletAmountUsed?.toFixed(2)}
                                    </p>
                                  )}
                              </div>
                           </div>
                            <div className="flex items-center gap-2">
                                <Bus className="h-4 w-4 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold text-[10px] uppercase">{ticketDetails.status === 'valid' ? 'Boarding Bus' : ticketDetails.status === 'used' ? 'Boarded Bus' : 'Booked Bus'}</p>
                                    <p className="text-muted-foreground font-bold">{getFullBusType(ticketDetails.busType)}</p>
                                </div>
                            </div>
                        </div>
            
                        <Separator />
            
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-muted-foreground"/>
                            <div>
                                <p className="font-semibold text-[10px] uppercase">Passenger PIN</p>
                                <p className="font-mono text-lg font-bold tracking-widest text-primary">{ticketDetails.securityCode}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
              
            <CardFooter className="p-6 pt-2">
              {status === 'valid' ? (
                  <Button className="w-full" onClick={handleValidateTicket} disabled={isLoading}>
                      {isLoading ? <Loader2 className="animate-spin" /> : "Validate Ticket"}
                  </Button>
              ) : (
                  <Button variant="outline" className="w-full" onClick={resetState}>Verify Another Ticket</Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}
