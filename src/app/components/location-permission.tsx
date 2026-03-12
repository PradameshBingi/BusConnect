'use client';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function LocationPermission() {
  const { toast } = useToast();

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: 'Location Access Granted',
            description: 'We can now find bus stops near you.',
          });
        },
        (error) => {
          toast({
            variant: 'destructive',
            title: 'Location Access Denied',
            description: 'Please enable location services in your browser settings to find nearby bus stops.',
          });
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLocationRequest}>
      <MapPin className="mr-2 h-4 w-4" />
      Find Nearby Stops
    </Button>
  );
}
