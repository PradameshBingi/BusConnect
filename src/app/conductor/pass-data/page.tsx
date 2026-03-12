
import Header from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { busPasses } from '@/lib/bus-passes';
import { Database, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SamplePassDataPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Sample Bus Pass Data" />
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">Sample Bus Pass Data</h1>
        </div>
        <CardDescription className="mb-6 text-center">
            Use these sample pass codes to test the 'Bus Pass Verification' tool.
        </CardDescription>
        <div className="space-y-4">
          {busPasses.map(pass => {
             const isExpired = new Date(pass.validTo).getTime() < new Date().getTime();
            return (
            <Card key={pass.passCode}>
              <CardHeader className="flex flex-row justify-between items-start p-4 pb-2">
                 <div>
                   <CardTitle className="text-lg font-mono flex items-center gap-2">
                       {pass.passCode}
                   </CardTitle>
                   <CardDescription className="flex items-center gap-1"><User className="h-4 w-4" />{pass.holderName}</CardDescription>
                 </div>
                 <Badge
                   variant={'default'}
                   className={cn({
                     'bg-yellow-400 text-yellow-950 border-transparent hover:bg-yellow-400/80': isExpired,
                     'bg-green-500 text-white border-transparent hover:bg-green-500/80': !isExpired,
                   })}
                 >
                     {isExpired ? 'Expired' : 'Active'}
                 </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <p>Category: <span className="font-semibold text-card-foreground">{pass.category}</span></p>
                      <p>Type: <span className="font-semibold text-card-foreground">{pass.passType}</span></p>
                  </div>
              </CardContent>
            </Card>
          )})}
        </div>
      </div>
    </>
  );
}
