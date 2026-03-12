import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Ticket, Users, Route } from "lucide-react";

const stats = [
  { title: "Total Revenue", value: "Rs. 1,25,430", icon: <TrendingUp className="h-6 w-6 text-muted-foreground" /> },
  { title: "Tickets Sold", value: "4,521", icon: <Ticket className="h-6 w-6 text-muted-foreground" /> },
  { title: "Active Conductors", value: "128", icon: <Users className="h-6 w-6 text-muted-foreground" /> },
  { title: "Managed Routes", value: "42", icon: <Route className="h-6 w-6 text-muted-foreground" /> },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 font-headline">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">More detailed analytics and charts will be displayed here.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
