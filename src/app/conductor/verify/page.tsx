
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

type VerificationStatus = 'valid' | 'invalid' | 'expired' | 'used' | 'cancelled' | 'idle' | 'validated' | 'used_and_expired';

const statusInfo: {[key in VerificationStatus]?: any} = {
  invalid: {
    icon: <XCircle className="h-16 w-16 text-red-500" />,
    title: 'Ticket Invalid',
    description: 'The ticket code entered could not be found. Please check the code and try again.',
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
    description: 'Details are available for one minute after validation.',
    color: 'text-orange-500',
  },
  used_and_expired: {
    icon: <Clock className="h-16 w-16 text-yellow-500" />,
    title: 'Ticket Already Used',
    description: 'The one-minute viewing window for this ticket has expired.',
    color: 'text-yellow-500',
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
    description: 'This ticket has been marked as used.',
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

    const renderTicketDetailsView = (ticket: TicketDetails) => {
        const totalCost = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));
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
                      <div className="flex-1">
                          <p className="font-semibold text-[10px] uppercase">Total Cost</p>
                          <p className="font-bold text-sm">Rs. {totalCost.toFixed(2)}</p>
                          {(ticket.walletAmountUsed || 0) > 0 && (
                            <p className="text-primary font-bold flex items-center gap-1 text-[8px] mt-0.5">
                                <Wallet className="h-3 w-3" /> Wallet: Rs. {ticket.walletAmountUsed?.toFixed(2)}
                            </p>
                          )}
                      </div>
                   </div>
                    <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-muted-foreground"/>
                        <div>
                            <p className="font-semibold text-[10px] uppercase">{ticket.status === 'valid' ? 'Boarding Bus' : ticket.status === 'used' ? 'Boarded Bus' : 'Booked Bus'}</p>
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
            </div>
        );
    };

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketCode) return;

        setIsLoading(true);
        setTicketDetails(null);
        setStatus('idle');
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const codeToVerify = ticketCode.trim().toUpperCase();
            
            const storedTickets: any[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
            const foundTicket = storedTickets.find(t => t.ticketCode === codeToVerify);
            
            if (foundTicket) {
                setTicketDetails(foundTicket);

                if (foundTicket.status === 'cancelled') {
                    setStatus('cancelled');
                } else if (foundTicket.status === 'used') {
                     try {
                        const storedStats: any[] = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
                        const verificationRecords = storedStats.filter(s => s.ticketCode === codeToVerify);
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
                } else if (new Date().getTime() - new Date(foundTicket.createdAt).getTime() > 60 * 1000) {
                    setStatus('expired');
                } else {
                    setStatus('valid');
                }
            } else {
                setStatus('invalid');
                setTicketDetails(null);
            }
        } catch (error) {
            console.error("Verification failed", error);
            setStatus('invalid');
            setTicketDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setStatus('idle');
        setTicketCode('');
        setTicketDetails(null);
    }

    const handleValidateTicket = () => {
        if (!ticketCode || !ticketDetails) return;
        
        const codeToUpdate = ticketCode.trim().toUpperCase();

        try {
            const storedTickets: any[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
            const ticketIndex = storedTickets.findIndex(t => t.ticketCode === codeToUpdate);

            if (ticketIndex > -1) {
                storedTickets[ticketIndex].status = 'used';
                localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));
            }

            try {
              const stats = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
              stats.push({
                  ticketCode: codeToUpdate,
                  quantities: ticketDetails.quantities,
                  verifiedAt: new Date().toISOString(),
                  refundCodeGenerated: null,
                  fareDifference: 0,
              });
              localStorage.setItem('conductorVerificationStats', JSON.stringify(stats));
            } catch (e) {
                console.error("Failed to update verification stats", e);
            }

            setStatus('validated');
            setTicketDetails(prev => prev ? {...prev, status: 'used'} : null);
        } catch (error) {
            console.error("Failed to validate ticket", error);
            toast({
                variant: 'destructive',
                title: 'Validation Failed',
                description: 'Could not update ticket status.',
            });
        }
    };

  const currentStatusInfo = status !== 'idle' ? statusInfo[status] : null;

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/ticket" title="Verify Ticket" />
      <div className="flex flex-col items-center bg-muted/40 p-4 md:p-8" style={{minHeight: 'calc(100vh - 8rem)'}}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Verify Ticket</CardTitle>
            <CardDescription>
              Enter the ticket code to verify its status.
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
                {ticketDetails && status === 'valid' && renderTicketDetailsView(ticketDetails)}
                {ticketDetails && status === 'validated' && <GeneratedTicket ticket={ticketDetails} />}
                {ticketDetails && (status === 'used' || status === 'cancelled') && renderTicketDetailsView(ticketDetails)}
            </CardContent>
              
            <CardFooter className="p-6 pt-2">
              {status === 'valid' ? (
                  <Button className="w-full" onClick={handleValidateTicket}>Validate Ticket</Button>
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
