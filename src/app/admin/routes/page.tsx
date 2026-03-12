import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminRoutesPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 font-headline">Manage Routes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Route List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Route management interface (add/edit routes) will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
