
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { calculateFare } from '@/lib/fare-calculator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Wallet, ArrowUpCircle, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

type Ticket = {
  from: string;
  to: string;
  routeNo: string;
  passengers: string;
  quantities: { Men: number, Child: number, Women: number };
  totalFare: number;
  fare: number;
  ticketCode: string;
  securityCode: string;
  status: 'valid' | 'invalid' | 'used' | 'expired' | 'cancelled';
  createdAt: string;
  busType: 'ordinary' | 'express' | 'deluxe';
  walletAmountUsed?: number;
};

type BusType = 'ordinary' | 'express' | 'deluxe';

const busTypeMeta: { name: BusType, title: string, level: number }[] = [
    { name: 'ordinary', title: 'City Ordinary', level: 1 },
    { name: 'express', title: 'Metro Express', level: 2 },
    { name: 'deluxe', title: 'Metro Deluxe', level: 3 },
];

export function UpgradeForm({ ticket }: { ticket: Ticket }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<BusType | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [useWallet, setUseWallet] = useState(false);

    useEffect(() => {
        try {
            const storedWallet = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0}');
            setWalletBalance(storedWallet.balance || 0);
        } catch (e) {
            setWalletBalance(0);
        }
    }, []);

    const currentBusMeta = useMemo(() => busTypeMeta.find(b => b.name === ticket.busType)!, [ticket.busType]);

    const upgradeOptions = useMemo(() => {
        return busTypeMeta
            .filter(b => b.level > currentBusMeta.level)
            .map(upgradeBus => {
                const newTotalFare = calculateFare(ticket.from, ticket.to, ticket.quantities, upgradeBus.name);
                const fareDifference = newTotalFare - ticket.totalFare;
                let amountToPay = fareDifference;
                let walletUsedForUpgrade = 0;

                if (useWallet) {
                    walletUsedForUpgrade = Math.min(amountToPay, walletBalance);
                    amountToPay = Math.max(0, amountToPay - walletUsedForUpgrade);
                }

                return { ...upgradeBus, newTotalFare, fareDifference, amountToPay, walletUsedForUpgrade };
            });
    }, [ticket, currentBusMeta, walletBalance, useWallet]);

    const handleUpgrade = (selectedUpgrade: typeof upgradeOptions[0]) => {
        setIsLoading(selectedUpgrade.name);
        setTimeout(() => {
            try {
                const storedTickets: Ticket[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
                const ticketIndex = storedTickets.findIndex(t => t.ticketCode === ticket.ticketCode);
                if (ticketIndex === -1) throw new Error("Original ticket not found.");

                const upgradedTicket: Ticket = {
                    ...ticket,
                    busType: selectedUpgrade.name,
                    totalFare: selectedUpgrade.newTotalFare,
                    fare: ticket.fare + selectedUpgrade.amountToPay,
                    walletAmountUsed: (ticket.walletAmountUsed || 0) + selectedUpgrade.walletUsedForUpgrade,
                    createdAt: new Date().toISOString(), // Reset timer on upgrade
                };

                storedTickets[ticketIndex] = upgradedTicket;
                localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));

                if (useWallet && selectedUpgrade.walletUsedForUpgrade > 0) {
                    const storedWallet = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions": []}');
                    storedWallet.balance -= selectedUpgrade.walletUsedForUpgrade;
                    storedWallet.transactions.push({
                        type: 'debit',
                        description: `Upgrade to ${selectedUpgrade.title} for ${ticket.ticketCode}`,
                        amount: selectedUpgrade.walletUsedForUpgrade,
                        date: new Date().toISOString(),
                    });
                    localStorage.setItem('userWallet', JSON.stringify(storedWallet));
                }
                
                const encodedData = btoa(JSON.stringify(upgradedTicket));
                toast({ title: "Upgrade Successful!", description: `Upgraded to ${selectedUpgrade.title}. Timer restarted.` });
                router.push(`/ticket?id=${ticket.ticketCode}&data=${encodedData}`);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Upgrade Failed', description: error.message });
                setIsLoading(null);
            }
        }, 1000);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Upgrade Your Ticket</CardTitle>
                 <CardDescription>From {currentBusMeta.title} (Original Fare: Rs. {ticket.totalFare.toFixed(2)})</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Separator />
                {walletBalance > 0 && (
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                            <Wallet className="h-6 w-6 text-primary" />
                            <div>
                                <span className="font-medium">Use Wallet Balance</span>
                                <p className="text-sm text-muted-foreground">Rs. {walletBalance.toFixed(2)}</p>
                            </div>
                        </div>
                        <Switch checked={useWallet} onCheckedChange={setUseWallet} disabled={!!isLoading} />
                    </div>
                )}
                {upgradeOptions.length > 0 ? (
                    <div className="space-y-4">
                        {upgradeOptions.map(opt => (
                            <div key={opt.name} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xl font-bold text-primary">{opt.title}</h4>
                                    <p className="font-bold text-lg">+ Rs. {opt.fareDifference.toFixed(2)}</p>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span>New Total:</span> <span>Rs. {opt.newTotalFare.toFixed(2)}</span></div>
                                    {useWallet && opt.walletUsedForUpgrade > 0 && <div className="flex justify-between text-green-600"><span>From Wallet:</span> <span>- Rs. {opt.walletUsedForUpgrade.toFixed(2)}</span></div>}
                                    <div className="flex justify-between font-bold text-lg mt-2"><span>Pay:</span> <span>Rs. {opt.amountToPay.toFixed(2)}</span></div>
                                </div>
                                <Button className="w-full mt-4" disabled={!!isLoading} onClick={() => handleUpgrade(opt)}>
                                    {isLoading === opt.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUpCircle className="mr-2 h-4 w-4" />}
                                    {isLoading === opt.name ? 'Processing...' : (opt.amountToPay > 0 ? `Pay Rs. ${opt.amountToPay.toFixed(2)} & Upgrade` : 'Upgrade')}
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No further upgrades available.</p>
                )}
            </CardContent>
        </Card>
    );
}
