'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart as BarChartIcon, 
  User, 
  Baby, 
  PersonStanding, 
  IndianRupee, 
  TrendingUp, 
  MapPin, 
  Ticket as TicketIcon,
  RefreshCw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { hyderabadLocalities } from '@/lib/locations';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RouteStat = {
  route: string;
  bookings: number;
};

type FullStats = {
  totalTickets: number;
  totalRevenue: number;
  totalMen: number;
  totalWomen: number;
  totalChildren: number;
  topRoutes: RouteStat[];
  // Verification specific stats
  verifiedTickets: number;
  totalCollectedDifference: number;
  totalRefundAmount: number;
  refundsIssuedCount: number;
};

export default function ConductorStatsPage() {
  const [stats, setStats] = useState<FullStats | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = () => {
    setIsLoading(true);
    try {
      const storedTickets: any[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const verificationStats: any[] = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
      
      // 1. General Booking Stats (from all generated tickets)
      let totalTickets = storedTickets.length;
      let totalRevenue = 0;
      let totalMen = 0;
      let totalWomen = 0;
      let totalChildren = 0;
      const routeMap = new Map<string, number>();

      for (const ticket of storedTickets) {
        totalRevenue += (ticket.totalFare || 0);
        totalMen += (ticket.quantities?.Men || 0);
        totalWomen += (ticket.quantities?.Women || 0);
        totalChildren += (ticket.quantities?.Child || 0);

        const routeKey = `${ticket.from} ➔ ${ticket.to}`;
        routeMap.set(routeKey, (routeMap.get(routeKey) || 0) + 1);
      }

      // 2. Top 5 Routes
      const topRoutes = Array.from(routeMap.entries())
        .map(([route, bookings]) => ({ route, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      // 3. Verification Stats (from conductor specific actions)
      let verifiedTickets = verificationStats.length;
      let totalCollectedDifference = 0;
      let totalRefundAmount = 0;
      let refundsIssuedCount = 0;

      for (const record of verificationStats) {
        if (record.fareDifference && record.fareDifference > 0) {
          totalCollectedDifference += record.fareDifference;
        } else if (record.fareDifference && record.fareDifference < 0) {
          totalRefundAmount += Math.abs(record.fareDifference);
        }
        if (record.refundCodeGenerated) {
          refundsIssuedCount++;
        }
      }

      setStats({
        totalTickets,
        totalRevenue: Math.round(totalRevenue),
        totalMen,
        totalWomen,
        totalChildren,
        topRoutes,
        verifiedTickets,
        totalCollectedDifference: Math.round(totalCollectedDifference),
        totalRefundAmount: Math.round(totalRefundAmount),
        refundsIssuedCount
      });
    } catch (error) {
      console.error("Failed to load conductor stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    calculateStats();
  }, []);

  if (!isClient) return null;

  const chartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Verification & Booking Stats" />
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BarChartIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-headline">Conductor Insights</h1>
              <p className="text-sm text-muted-foreground">Analytics for all generated and verified tickets.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={calculateStats} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh Data
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="p-6 space-y-2"><Skeleton className="h-4 w-2/3"/><Skeleton className="h-8 w-1/2"/></CardContent></Card>
            ))}
          </div>
        ) : stats && stats.totalTickets > 0 ? (
          <>
            {/* Primary Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Bookings</CardTitle>
                  <TicketIcon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTickets}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">All generated tickets in history</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
                  <IndianRupee className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Total fare collected digitally</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tickets Verified</CardTitle>
                  <RefreshCw className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.verifiedTickets}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Validated during boarding</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fare Difference</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {stats.totalCollectedDifference.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Collected physically (upgrades)</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Top 5 Routes Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Top 5 Popular Routes
                  </CardTitle>
                  <CardDescription>Routes with the highest number of bookings.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  {stats.topRoutes.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topRoutes} layout="vertical" margin={{ left: 40, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="route" 
                            type="category" 
                            width={120} 
                            fontSize={10} 
                            tick={{ fill: 'currentColor' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                            {stats.topRoutes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No route data available yet.</div>
                  )}
                </CardContent>
              </Card>

              {/* Passenger Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Passenger Split</CardTitle>
                  <CardDescription>Demographics of your travellers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="font-bold text-slate-700">Men</span>
                    </div>
                    <span className="text-xl font-bold text-blue-700">{stats.totalMen}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PersonStanding className="h-5 w-5 text-pink-600" />
                      <span className="font-bold text-slate-700">Women</span>
                    </div>
                    <span className="text-xl font-bold text-pink-700">{stats.totalWomen}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Baby className="h-5 w-5 text-amber-600" />
                      <span className="font-bold text-slate-700">Children</span>
                    </div>
                    <span className="text-xl font-bold text-amber-700">{stats.totalChildren}</span>
                  </div>

                  <div className="pt-4 border-t text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Headcount</p>
                    <p className="text-3xl font-bold text-primary">{stats.totalMen + stats.totalWomen + stats.totalChildren}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Secondary Verification Metrics */}
            <div className="grid gap-4 md:grid-cols-2">
               <Card className="bg-slate-900 text-white">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Refund Liability</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-3xl font-bold">Rs. {stats.totalRefundAmount.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1">Processed for {stats.refundsIssuedCount} expired/cancelled tickets</p>
                 </CardContent>
               </Card>
               <Card className="bg-primary/5 border-primary/20">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-primary">Average Booking Value</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      Rs. {stats.totalTickets > 0 ? (stats.totalRevenue / stats.totalTickets).toFixed(2) : "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Per unique ticket code generated</p>
                 </CardContent>
               </Card>
            </div>
          </>
        ) : (
           <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center space-y-4">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <BarChartIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">No Statistics Available</h3>
                <p className="text-sm text-muted-foreground">Start generating and verifying tickets to see your analytics dashboard here.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
