
import { hyderabadLocalities } from '@/lib/locations';

type PassengerType = 'Men' | 'Child' | 'Women';
type Quantities = { [key in PassengerType]: number };
type BusType = 'ordinary' | 'express' | 'deluxe';

export function calculateFare(
  from: string,
  to: string,
  quantities: Quantities,
  busType: BusType
): number {
  if (!from || !to || from === to) {
    return 0;
  }

  const fromLocality = hyderabadLocalities.find(l => l.name === from);
  const toLocality = hyderabadLocalities.find(l => l.name === to);

  if (!fromLocality || !toLocality) {
    return 0;
  }

  // Simple distance-based fare calculation
  const distance = Math.abs(parseInt(fromLocality.routeNumber, 10) - parseInt(toLocality.routeNumber, 10));
  const baseFare = 10 + distance * 1.5; // Base fare of 10, plus 1.5 per 'stop' difference

  const ordinaryAdultFare = Math.round(Math.max(10, baseFare));
  const ordinaryChildFare = Math.round(ordinaryAdultFare / 2);

  let menFare = ordinaryAdultFare;
  let childFare = ordinaryChildFare;
  let womenFare = 0; // Default to 0

  if(!quantities) return 0;
  
  const expressSurcharge = 5;
  const deluxeSurcharge = 10;
  const deluxeChildSurcharge = 5;

  if (busType === 'express') {
      menFare += expressSurcharge;
      womenFare = 0; // Free for express
      childFare = Math.round(ordinaryChildFare + expressSurcharge / 2);
  } else if (busType === 'deluxe') {
      menFare += deluxeSurcharge;
      womenFare = ordinaryAdultFare + deluxeSurcharge; // Chargable for deluxe
      childFare = ordinaryChildFare + deluxeChildSurcharge;
  } else { // ordinary
      womenFare = 0; // Free for ordinary
  }

  const totalFare = (quantities.Men * menFare) + (quantities.Child * childFare) + (quantities.Women * womenFare);

  return Math.round(totalFare);
}
