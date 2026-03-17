
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Gift, History, ArrowDown, ArrowUp, CreditCard } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { SimulatedPayment } from '@/components/simulated-payment';

type Refund = {
  code: string;
  amount: number;
  status: 'unclaimed' | 'claimed';
  ticketCode: string;
};

type Transaction = {
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
};

type Wallet = {
  balance: number;
  refunds: Refund[];
  transactions: Transaction[];
};

type Ticket = {
  ticketCode: string;
  securityCode: string;
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, refunds: [], transactions: [] });
  const [refundCode, setRefundCode] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedWallet = localStorage.getItem('userWallet');
      if (storedWallet) {
        const parsedWallet = JSON.parse(storedWallet);
        setWallet({
          ...parsedWallet,
          transactions: (parsedWallet.transactions || []).sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
        });
      }
    } catch (error) {
      console.error("Failed to load wallet from localStorage", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load your wallet data.' });
    }
  }, [toast]);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundCode || !securityCode) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter both refund and security codes.' });
      return;
    }
    
    let walletData: Wallet = { balance: 0, refunds: [], transactions: [] };
    try {
      const storedWalletJSON = localStorage.getItem('userWallet');
      if (storedWalletJSON) walletData = JSON.parse(storedWalletJSON);

      const allTickets: Ticket[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');

      const refundIndex = walletData.refunds.findIndex(r => r.code === refundCode && r.status === 'unclaimed');

      if (refundIndex === -1) {
        toast({ variant: 'destructive', title: 'Invalid Code', description: 'This refund code is either invalid or has already been claimed.' });
        return;
      }
      
      const refundToClaim = walletData.refunds[refundIndex];
      const originalTicket = allTickets.find(t => t.ticketCode === refundToClaim.ticketCode);

      if (!originalTicket) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the original ticket for this refund.' });
        return;
      }
      
      if(originalTicket.securityCode !== securityCode.toUpperCase()) {
        toast({ variant: 'destructive', title: 'Security Mismatch', description: 'The passenger security code is incorrect for this refund.' });
        return;
      }

      const refundAmount = refundToClaim.amount;
      walletData.balance += refundAmount;
      walletData.refunds[refundIndex].status = 'claimed';
      
      walletData.transactions = walletData.transactions || [];
      walletData.transactions.push({
          type: 'credit',
          description: `Redeemed code ${refundCode}`,
          amount: refundAmount,
          date: new Date().toISOString(),
      });
      
      localStorage.setItem('userWallet', JSON.stringify(walletData));
      setWallet({ 
        ...walletData,
        transactions: walletData.transactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
      });
      setRefundCode('');
      setSecurityCode('');

      toast({
        title: 'Success!',
        description: `Rs. ${refundAmount.toFixed(2)} has been added to your wallet.`,
      });

    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while redeeming the code.' });
    }
  };

  const initiateAddMoney = () => {
    const amount = parseFloat(addAmount);
    if(isNaN(amount)) {
        toast({variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount.'});
        return;
    }

    if (amount < 50) {
      toast({
          variant: 'destructive',
          title: 'Minimum Amount',
          description: 'The minimum amount to add is Rs. 50.',
      });
      return;
    }

    if (amount > 2000) {
      toast({
          variant: 'destructive',
          title: 'Limit Exceeded',
          description: 'You can only add up to Rs. 2000 at a time.',
      });
      return;
    }

    if (wallet.balance + amount > 5000) {
      toast({
          variant: 'destructive',
          title: 'Wallet Limit Reached',
          description: 'Your total wallet balance cannot exceed Rs. 5000.',
      });
      return;
    }
    
    setShowPayment(true);
  };

  const finalizeAddMoney = () => {
    const amount = parseFloat(addAmount);
    try {
        let walletData: Wallet = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "refunds":[], "transactions":[]}');
        
        walletData.balance += amount;
        walletData.transactions = walletData.transactions || [];
        walletData.transactions.push({
            type: 'credit',
            description: `Added via Online Payment`,
            amount: amount,
            date: new Date().toISOString(),
        });
        
        localStorage.setItem('userWallet', JSON.stringify(walletData));
        setWallet({
            ...walletData,
            transactions: walletData.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        });
        setAddAmount('');
        
        toast({
            title: 'Success!',
            description: `Rs. ${amount.toFixed(2)} has been added to your wallet.`,
        });
    } catch (error) {
        console.error("Failed to add money to wallet", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add money to your wallet.',
        });
    }
  };

  if (!isClient) return null;

  return (
    <>
      <Header showBackButton={true} backHref="/" title="My Wallet" />
      <div className="p-4 md:p-8">
        <div className="max-w-md mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Tag className="h-6 w-6" />
                Wallet Balance
              </CardTitle>
              <CardDescription>Your current redeemable balance.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">Rs. {wallet.balance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-2">Maximum wallet limit: Rs. 5000.00</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                Add Money to Wallet
              </CardTitle>
              <CardDescription>
                Add balance using Digital Payment (Min Rs. 50, Max Rs. 2000).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-amount">Amount (Rs.)</Label>
                  <Input
                    id="add-amount"
                    type="number"
                    placeholder="e.g., 100"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                  />
                  <div className="space-y-1 mt-2">
                    <p className="text-[10px] text-muted-foreground italic">• Minimum addition: Rs. 50</p>
                    <p className="text-[10px] text-muted-foreground italic">• Maximum addition: Rs. 2000 per transaction</p>
                    <p className="text-[10px] text-muted-foreground italic">• Total wallet cap: Rs. 5000</p>
                  </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className='w-full' onClick={initiateAddMoney}>Add Funds</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-primary" />
                Redeem a Code
              </CardTitle>
              <CardDescription>
                Enter the refund and ticket security codes to add funds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRedeem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="refund-code">Refund Code</Label>
                  <Input
                    id="refund-code"
                    placeholder="e.g., REF-XXXXX"
                    value={refundCode}
                    onChange={e => setRefundCode(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="security-code">Passenger Security Code</Label>
                  <Input
                    id="security-code"
                    placeholder="Original 5-digit ticket code"
                    value={securityCode}
                    onChange={e => setSecurityCode(e.target.value.toUpperCase())}
                    className="uppercase"
                    maxLength={5}
                  />
                </div>
                <Button type="submit" className="w-full">Redeem</Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-6 w-6 text-primary" />
                    Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                 {wallet.transactions.length > 0 ? (
                    <ul className="space-y-3">
                    {wallet.transactions.map((tx, index) => (
                        <li key={index} className="flex justify-between items-start text-sm p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                           {tx.type === 'credit' ? <ArrowDown className="h-5 w-5 text-green-500"/> : <ArrowUp className="h-5 w-5 text-red-500"/>}
                            <div>
                                <p className="font-semibold">{tx.description}</p>
                                <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={cn("font-semibold", {
                                "text-green-600": tx.type === 'credit',
                                "text-red-600": tx.type === 'debit',
                            })}>
                            {tx.type === 'credit' ? '+' : '-'} Rs. {tx.amount.toFixed(2)}
                            </p>
                        </div>
                        </li>
                    ))}
                    </ul>
                 ) : (
                    <p className="text-sm text-muted-foreground text-center">No transactions yet.</p>
                 )}
              </CardContent>
            </Card>
        </div>
      </div>

      <SimulatedPayment 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={finalizeAddMoney}
        amount={parseFloat(addAmount) || 0}
      />
    </>
  );
}
