import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminConductorsPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 font-headline">Manage Conductors</h1>
      <Card>
        <CardHeader>
          <CardTitle>Conductor List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Conductor management interface will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
