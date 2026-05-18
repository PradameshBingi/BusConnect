
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, XCircle, Clock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { GeneratedTicket } from '@/app/components/generated-ticket';
import { logEvent } from 'firebase/analytics';
import { useAnalytics } from '@/firebase';

// Strictly enforce dynamic rendering to avoid prerender errors with Firebase/Analytics
export const dynamic = "force-dynamic";

export default function VerifyTicketPage() {
    const [ticketCode, setTicketCode] = useState('');
    const [ticket, setTicket] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'found' | 'not_found'>('idle');
    const [showPin, setShowPin] = useState(false);
    const [justValidated, setJustValidated] = useState(false);
    const { toast } = useToast();
    const analytics = useAnalytics();

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        setShowPin(false);
        setJustValidated(false);
        
        try {
            const response = await fetch(`${API_ENDPOINTS.VERIFY}/${ticketCode.trim().toUpperCase()}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setStatus('not_found');
                    return;
                }
                throw new Error("Server error");
            }
            const result = await response.json();
            setTicket(result.ticket);
            setStatus('found');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to database.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!ticket) return;
        setIsLoading(true);

        try {
            const response = await fetch(`${API_ENDPOINTS.USE}/${ticket.ticketCode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error("Validation failed");
            
            const result = await response.json();
            const updatedTicket = result.ticket;
            
            // Analytics: Track Validation if service is available
            if (analytics) {
              logEvent(analytics, 'ticket_validated', {
                ticket_code: updatedTicket.ticketCode,
                bus_type: updatedTicket.busType,
                route: `${updatedTicket.from} - ${updatedTicket.to}`
              });
            }

            setTicket(updatedTicket);
            setJustValidated(true);
            toast({ title: "Validated", description: "Ticket status updated to USED in database." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update ticket status.' });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Verify Ticket" />
      <div className="flex flex-col items-center bg-muted/40 p-4 min-h-screen space-y-4">
        <Card className="w-full max-w-md">
          <CardHeader>
              <CardTitle className="font-headline">Verify Ticket Code</CardTitle>
              <CardDescription>Check live status from database</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="grid gap-4">
              <Input 
                placeholder="TKT-01-XXXXX" 
                value={ticketCode} 
                onChange={(e) => setTicketCode(e.target.value)} 
                required 
                className="uppercase" 
              />
              <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
                  Verify
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {status === 'not_found' && (
            <Card className="w-full max-w-md p-6 text-center text-destructive border-destructive/20 bg-destructive/5">
                <XCircle className="mx-auto mb-2 h-8 w-8" />
                <p className="font-bold">Ticket Not Found</p>
                <p className="text-sm">This code does not exist in the system.</p>
            </Card>
        )}

        {status === 'found' && ticket && (
          <div className="w-full max-w-md space-y-4">
            {(ticket.status === 'used' || ticket.status === 'cancelled' || ticket.status === 'expired') && !justValidated ? (
                <Card className="overflow-hidden">
                    <CardHeader className="text-center bg-muted/10 py-12">
                        <h1 className={cn("text-4xl font-bold uppercase tracking-widest", 
                            ticket.status === 'used' ? "text-slate-500" : 
                            ticket.status === 'cancelled' ? "text-red-600" : "text-yellow-500"
                        )}>
                            TICKET {ticket.status}
                        </h1>
                    </CardHeader>
                </Card>
            ) : justValidated ? (
                <div className="space-y-4">
                    <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="mx-auto text-green-500 h-10 w-10 mb-2" />
                        <h2 className="text-2xl font-bold text-green-700">TICKET VALIDATED</h2>
                        <p className="text-sm text-green-600">Journey started successfully.</p>
                    </div>
                    <GeneratedTicket ticket={ticket} />
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <CardHeader className="text-center bg-muted/30">
                        <CheckCircle className="mx-auto text-green-500 h-12 w-12" />
                        <CardTitle className="mt-2 text-2xl font-bold uppercase tracking-wider text-green-600">VALID</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">FROM</p>
                                <p className="font-bold">{ticket.from}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-primary" />
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">TO</p>
                                <p className="font-bold">{ticket.to}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <p className="text-muted-foreground">Passengers:</p>
                            <p className="font-bold text-right">{ticket.passengers}</p>
                            <p className="text-muted-foreground">Fare Paid:</p>
                            <p className="font-bold text-right text-primary">Rs. {ticket.totalFare?.toFixed(2)}</p>
                        </div>
                        <div className="border-t pt-4">
                            <p className="text-[10px] text-center text-muted-foreground uppercase font-bold mb-2">Security PIN</p>
                            <div className="flex flex-col items-center gap-2">
                                {showPin && (
                                    <p className="text-4xl font-mono font-bold text-center tracking-[0.3em] text-primary mb-2">
                                        {ticket.securityCode}
                                    </p>
                                )}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="font-bold" 
                                    onClick={() => setShowPin(!showPin)}
                                >
                                    {showPin ? <><EyeOff className="mr-2 h-4 w-4" /> Hide</> : <><Eye className="mr-2 h-4 w-4" /> Show</>}
                                    {" "} Security Code
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 bg-muted/10">
                        <Button onClick={handleValidate} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                            Validate Boarding
                        </Button>
                    </CardFooter>
                </Card>
            )}
            <Button variant="outline" className="w-full bg-white h-12" onClick={() => {setStatus('idle'); setTicketCode(''); setTicket(null); setShowPin(false); setJustValidated(false);}}>
                Clear and Search Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
