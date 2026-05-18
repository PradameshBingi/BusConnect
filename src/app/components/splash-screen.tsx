
import { Bus } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary text-primary-foreground p-4 overflow-hidden">
      <div className="w-full h-20 mb-4">
          <Bus className="h-20 w-20 animate-move-bus mx-auto" />
      </div>
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold font-headline tracking-widest">TGSRTC</h1>
        <p className="text-xl font-medium">Digital Ticket Booking</p>
      </div>
      <div className="absolute bottom-12 text-center">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2 text-primary-foreground/80">Conceptualized and Developed by</p>
        <p className="font-bold text-4xl tracking-tighter" style={{ color: '#0A2B70' }}>BINGI PRADAMESH</p>
      </div>
    </div>
  );
}
