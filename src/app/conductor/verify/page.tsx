
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, XCircle, Clock, Loader2, ArrowRight } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";

export default function VerifyTicketPage() {
    const [ticketCode, setTicketCode] = useState('');
    const [ticket, setTicket] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'found' | 'not_found'>('idle');
    const { toast } = useToast();

    const handleVerification = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        
        setTimeout(() => {
          const storedTickets = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
          const found = storedTickets.find((t: any) => t.ticketCode === ticketCode.toUpperCase());
          
          if (found) {
            setTicket(found);
            setStatus('found');
          } else {
            setStatus('not_found');
          }
          setIsLoading(false);
        }, 800);
    };

    const handleValidate = () => {
      const storedTickets = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const index = storedTickets.findIndex((t: any) => t.ticketCode === ticket.ticketCode);
      if (index > -1) {
        storedTickets[index].status = 'used';
        localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));
        setTicket({ ...ticket, status: 'used' });
        toast({ title: "Validated", description: "Journey started." });
      }
    };

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Verify Ticket" />
      <div className="flex flex-col items-center bg-muted/40 p-4 min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle>Verify Code</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="grid gap-4">
              <Input placeholder="TKT-01-XXXXX" value={ticketCode} onChange={(e) => setTicketCode(e.target.value)} required className="uppercase" />
              <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Verify"}</Button>
            </form>
          </CardContent>
        </Card>
        
        {status === 'not_found' && <Card className="w-full max-w-md mt-4 p-6 text-center text-destructive"><XCircle className="mx-auto mb-2" /> Ticket Not Found</Card>}

        {status === 'found' && (
          <Card className="w-full max-w-md mt-4">
            <CardHeader className="text-center">
              {ticket.status === 'valid' ? <CheckCircle className="mx-auto text-green-500 h-10 w-10" /> : <Clock className="mx-auto text-yellow-500 h-10 w-10" />}
              <CardTitle className="mt-2">{ticket.status.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>From: {ticket.from}</span> <ArrowRight className="h-4 w-4" /> <span>To: {ticket.to}</span></div>
              <p className="text-sm">Passengers: {ticket.passengers}</p>
              <p className="text-xl font-mono font-bold text-center border-t pt-2">PIN: {ticket.securityCode}</p>
            </CardContent>
            <CardFooter>
              {ticket.status === 'valid' && <Button onClick={handleValidate} className="w-full bg-green-600 hover:bg-green-700">Validate Boarding</Button>}
              <Button variant="outline" className="w-full mt-2" onClick={() => {setStatus('idle'); setTicketCode('');}}>Clear</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}
