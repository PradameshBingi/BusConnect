
'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, User, Baby, PersonStanding, Gift, IndianRupee, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { hyderabadLocalities } from '@/lib/locations';

type FullStats = {
  totalTickets: number;
  totalMen: number;
  totalWomen: number;
  totalChildren: number;
  refundsIssued: number;
  totalRevenue: number;
  revenueByMen: number;
  revenueByWomen: number;
  revenueByChildren: number;
  totalRefundAmount: number;
  totalCollectedDifference: number;
};

export default function ConductorStatsPage() {
  const [stats, setStats] = useState<FullStats | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedStats: any[] = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
      const storedTickets: any[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const ticketsMap = new Map(storedTickets.map((t: any) => [t.ticketCode, t]));
      
      let totalTickets = storedStats.length;
      let totalMen = 0;
      let totalWomen = 0;
      let totalChildren = 0;
      let refundsIssued = 0;
      let totalRevenue = 0;
      let revenueByMen = 0;
      let revenueByWomen = 0;
      let revenueByChildren = 0;
      let totalRefundAmount = 0;
      let totalCollectedDifference = 0;

      for (const record of storedStats) {
        totalMen += record.quantities.Men || 0;
        totalWomen += record.quantities.Women || 0;
        totalChildren += record.quantities.Child || 0;
        
        if (record.refundCodeGenerated) {
          refundsIssued++;
        }

        if (record.fareDifference && record.fareDifference > 0) {
          totalCollectedDifference += record.fareDifference;
        } else if (record.fareDifference && record.fareDifference < 0) {
          totalRefundAmount += Math.abs(record.fareDifference);
        }

        const ticket = ticketsMap.get(record.ticketCode);
        if (ticket) {
          totalRevenue += ticket.fare;

          // Proportional revenue breakdown
          const fromLocality = hyderabadLocalities.find(l => l.name === ticket.from);
          const toLocality = hyderabadLocalities.find(l => l.name === ticket.to);

          if (fromLocality && toLocality) {
            const distance = Math.abs(parseInt(fromLocality.routeNumber, 10) - parseInt(toLocality.routeNumber, 10));
            const baseFare = 10 + distance * 1.5;
            const adultFare = Math.max(10, Math.floor(baseFare));
            const childFare = Math.floor(adultFare / 2);
            let womenFare = ticket.busType === 'deluxe' ? adultFare : 0;
            
            const menTheoretical = (ticket.quantities.Men || 0) * adultFare;
            const womenTheoretical = (ticket.quantities.Women || 0) * womenFare;
            const childTheoretical = (ticket.quantities.Child || 0) * childFare;
            const totalTheoretical = menTheoretical + womenTheoretical + childTheoretical;

            if (totalTheoretical > 0) {
                revenueByMen += (menTheoretical / totalTheoretical) * ticket.fare;
                revenueByWomen += (womenTheoretical / totalTheoretical) * ticket.fare;
                revenueByChildren += (childTheoretical / totalTheoretical) * ticket.fare;
            }
          }
        }
      }
      
      setStats({
        totalTickets,
        totalMen,
        totalWomen,
        totalChildren,
        refundsIssued,
        totalRevenue: Math.round(totalRevenue),
        revenueByMen: Math.round(revenueByMen),
        revenueByWomen: Math.round(revenueByWomen),
        revenueByChildren: Math.round(revenueByChildren),
        totalRefundAmount: Math.round(totalRefundAmount),
        totalCollectedDifference: Math.round(totalCollectedDifference)
      });

    } catch (error) {
      console.error("Failed to load conductor stats:", error);
    }
  }, []);

  const statCards = stats ? [
    { title: "Tickets Verified", value: stats.totalTickets, subValue: `Total Revenue: Rs. ${stats.totalRevenue}`, icon: <BarChart className="h-6 w-6 text-muted-foreground" /> },
    { title: "Men Boarded", value: stats.totalMen, subValue: `Revenue: Rs. ${stats.revenueByMen}`, icon: <User className="h-6 w-6 text-muted-foreground" /> },
    { title: "Women Boarded", value: stats.totalWomen, subValue: `Revenue: Rs. ${stats.revenueByWomen}`, icon: <PersonStanding className="h-6 w-6 text-muted-foreground" /> },
    { title: "Children Boarded", value: stats.totalChildren, subValue: `Revenue: Rs. ${stats.revenueByChildren}`, icon: <Baby className="h-6 w-6 text-muted-foreground" /> },
    { title: "Fare Difference Collected", value: `Rs. ${stats.totalCollectedDifference}`, subValue: "Physically collected", icon: <TrendingUp className="h-6 w-6 text-muted-foreground" /> },
    { title: "Refunds Issued", value: `${stats.refundsIssued} codes`, subValue: `Total Value: Rs. ${stats.totalRefundAmount}`, icon: <Gift className="h-6 w-6 text-muted-foreground" /> },
  ] : [];

  if (!isClient) {
    return (
      <>
        <Header showBackButton={true} backHref="/conductor/dashboard" title="Verification Stats" />
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <BarChart className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold font-headline">Verification Stats</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
    </>
    );
  }

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Verification Stats" />
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">Verification Stats</h1>
        </div>
        
        {stats && stats.totalTickets > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.subValue && <p className="text-sm text-muted-foreground">{stat.subValue}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
           <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No verification data found. Start verifying tickets to see your stats.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
