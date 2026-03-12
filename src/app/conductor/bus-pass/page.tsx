
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, XCircle, Clock, Loader2, Calendar, User, Users, Bus, MapPin, BadgeHelp, ArrowRight } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { busPasses, type BusPass } from '@/lib/bus-passes';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type VerificationStatus = 'idle' | 'loading' | 'not_found' | 'expired' | 'valid';

export default function BusPassPage() {
    const [passCode, setPassCode] = useState('');
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [passDetails, setPassDetails] = useState<BusPass | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passCode) {
            toast({ variant: 'destructive', title: 'Missing Code', description: 'Please enter a bus pass code.' });
            return;
        }

        setIsLoading(true);
        setPassDetails(null);
        setStatus('loading');
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const codeToVerify = passCode.trim().toUpperCase();
            const foundPass = busPasses.find(p => p.passCode === codeToVerify);
            
            if (foundPass) {
                const now = new Date();
                const validToDate = new Date(foundPass.validTo);
                
                setPassDetails(foundPass);
                if (now > validToDate) {
                    setStatus('expired');
                } else {
                    setStatus('valid');
                }
            } else {
                setStatus('not_found');
                setPassDetails(null);
            }
        } catch (error) {
            console.error("Verification failed", error);
            setStatus('not_found');
            setPassDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setStatus('idle');
        setPassCode('');
        setPassDetails(null);
    }

    const getStatusInfo = () => {
        switch(status) {
            case 'valid': return { icon: <CheckCircle className="h-16 w-16 text-green-500" />, title: 'Bus Pass is Valid', description: 'This pass is valid and can be used for travel.', color: 'text-green-500' };
            case 'expired': return { icon: <Clock className="h-16 w-16 text-yellow-500" />, title: 'Bus Pass Expired', description: 'This pass is no longer valid.', color: 'text-yellow-500' };
            case 'not_found': return { icon: <XCircle className="h-16 w-16 text-red-500" />, title: 'Bus Pass Not Found', description: 'Please check the code and try again.', color: 'text-red-500' };
            default: return null;
        }
    }
    
    const statusInfo = getStatusInfo();

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Verify Bus Pass" />
      <div className="flex flex-col items-center bg-muted/40 p-4 md:p-8" style={{minHeight: 'calc(100vh - 8rem)'}}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Verify Bus Pass</CardTitle>
            <CardDescription>
              Enter the bus pass code to verify its status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pass-code">Bus Pass Code</Label>
                <Input
                  id="pass-code"
                  placeholder="Enter pass code"
                  value={passCode}
                  onChange={(e) => setPassCode(e.target.value)}
                  required
                  disabled={isLoading}
                  className="uppercase"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Verify Pass
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {status !== 'idle' && !isLoading && (
          <Card className="w-full max-w-md mt-8">
              {statusInfo && (
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                        {statusInfo.icon}
                    </div>
                    <CardTitle className={cn("text-2xl font-bold", statusInfo.color)}>{statusInfo.title}</CardTitle>
                    <CardDescription>{statusInfo.description}</CardDescription>
                </CardHeader>
              )}

              {passDetails && status === 'valid' && (
                <CardContent className="p-6 pt-4 border-t">
                    <div className="border p-4 rounded-lg bg-pink-700 text-white">
                         <CardTitle className="text-center text-xl mb-6 font-bold text-pink-300">{passDetails.category} {passDetails.passType} Bus Pass</CardTitle>
                        <div className="flex items-start gap-4">
                            <div className="space-y-2 text-sm flex-1">
                                <div>
                                    <p className="font-semibold text-pink-300 text-xs">Name</p>
                                    <p>{passDetails.holderName}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-pink-300 text-xs">Pass Code</p>
                                    <p>{passDetails.passCode}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-pink-300 text-xs">Valid Till</p>
                                    <p>{new Date(passDetails.validTo).toLocaleDateString('en-GB')}</p>
                                </div>
                                {passDetails.passType === 'Route' && passDetails.route && (
                                    <div>
                                      <p className="font-semibold text-pink-300 text-xs">Route</p>
                                      <div className="flex items-center gap-1">
                                          <span>{passDetails.route.from}</span>
                                          <ArrowRight className="h-3 w-3"/>
                                          <span>{passDetails.route.to}</span>
                                      </div>
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-pink-300 text-xs">Bus Types</p>
                                    <p>{passDetails.validBusTypes.join(', ')}</p>
                                </div>
                            </div>
                            <div className="w-24 h-32 bg-gray-200 border-2 border-dashed border-gray-400 rounded-md flex-shrink-0">
                                {/* Empty passport photo box */}
                            </div>
                        </div>
                    </div>
                </CardContent>
              )}
              
              <CardFooter className="p-6 pt-2">
                 <Button variant="outline" className="w-full" onClick={resetState}>Verify Another Pass</Button>
              </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}
