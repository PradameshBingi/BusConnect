import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminBookingsPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 font-headline">Manage Bookings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Booking management interface will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
