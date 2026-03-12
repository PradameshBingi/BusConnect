import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLocationsPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 font-headline">Manage Locations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Location List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Location management interface (add/edit Hyderabad localities) will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
