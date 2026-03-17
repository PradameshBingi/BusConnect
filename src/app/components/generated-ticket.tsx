
'use client';

import { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { hyderabadLocalities } from '@/lib/locations';

type TicketDetails = {
    from: string;
    to: string;
    passengers: string;
    totalFare: number;
    fare: number;
    createdAt: string;
    busType: string;
    ticketCode: string;
    quantities: { Men: number, Child: number, Women: number };
    paymentMode?: string;
};

type GeneratedTicketProps = {
    ticket: TicketDetails;
    refundCode?: string | null;
};

const depotNames = [
    'Dilsukhnagar', 'Mehdipatnam', 'Secunderabad', 'Kukatpally', 'Uppal', 'LB Nagar', 'Charminar', 'Miyapur'
];

// A simple SVG to mimic the circular stamp
const BusStamp = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 text-red-600 pointer-events-none">
        <svg width="140" height="140" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <text x="50" y="40" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">TGSRTC</text>
            <text x="50" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">HYDERABAD</text>
        </svg>
    </div>
);


export function GeneratedTicket({ ticket, refundCode }: GeneratedTicketProps) {
    const issueDate = new Date(ticket.createdAt);
    
    const pseudoRandom = useMemo(() => {
        if (!ticket.ticketCode) return Math.random() * 100000;
        let hash = 0;
        for (let i = 0; i < ticket.ticketCode.length; i++) {
            const char = ticket.ticketCode.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; 
        }
        return Math.abs(hash);
    }, [ticket.ticketCode]);

    const depotName = useMemo(() => depotNames[pseudoRandom % depotNames.length], [pseudoRandom]);
    const serviceNumber = useMemo(() => `${ticket.from.substring(0,2)}${ticket.to.substring(0,2)}`.toUpperCase() + (pseudoRandom % 100), [pseudoRandom, ticket.from, ticket.to]);
    const tripNo = useMemo(() => (pseudoRandom % 5) + 1, [pseudoRandom]);

    const fromLocality = hyderabadLocalities.find(l => l.name === ticket.from);
    const toLocality = hyderabadLocalities.find(l => l.name === ticket.to);
    
    let menFare = 0;
    let childFare = 0;
    let womenFare = 0;

    if (fromLocality && toLocality) {
        const distance = Math.abs(parseInt(fromLocality.routeNumber, 10) - parseInt(toLocality.routeNumber, 10));
        const baseFare = 10 + distance * 1.5;
        
        const ordinaryAdultFare = Math.round(Math.max(10, baseFare));
        const ordinaryChildFare = Math.round(ordinaryAdultFare / 2);
        
        const expressSurcharge = 5;
        const deluxeSurcharge = 10;
        const deluxeChildSurcharge = 5;

        menFare = ordinaryAdultFare;
        childFare = ordinaryChildFare;
        
        if (ticket.busType === 'express') {
            menFare += expressSurcharge;
            childFare = Math.round(ordinaryChildFare + expressSurcharge / 2);
            womenFare = 0;
        } else if (ticket.busType === 'deluxe') {
            menFare += deluxeSurcharge;
            womenFare = ordinaryAdultFare + deluxeSurcharge;
            childFare = ordinaryChildFare + deluxeChildSurcharge;
        } else { // ordinary
             womenFare = 0;
        }
    }
    
    const getFullBusType = (type: string) => {
        switch (type) {
            case 'ordinary': return 'City Ordinary';
            case 'express': return 'Metro Express';
            case 'deluxe': return 'Metro Deluxe';
            default: return type;
        }
    };


    return (
        <div className="bg-white text-black p-4 font-mono max-w-sm mx-auto shadow-lg rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden">
             {/* Pink serrated edge effect */}
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-repeat-y" style={{backgroundImage: 'linear-gradient(135deg, #ffc0cb 50%, transparent 50%), linear-gradient(-135deg, #ffc0cb 50%, transparent 50%)', backgroundSize: '8px 8px'}}></div>
            <div className="absolute top-0 right-0 bottom-0 w-2 bg-repeat-y" style={{backgroundImage: 'linear-gradient(-45deg, #ffc0cb 50%, transparent 50%), linear-gradient(45deg, #ffc0cb 50%, transparent 50%)', backgroundSize: '8px 8px'}}></div>

            <div className="text-center relative z-10">
                <p className="font-bold">తెలంగాణ రాష్ట్ర రోడ్డు రవాణా సంస్థ</p>
                <p className="font-bold">{depotName} Depot</p>
                
                <div className="flex justify-between text-xs my-2">
                    <span>{ticket.ticketCode.substring(4,12)}</span>
                    <span>{issueDate.toLocaleDateString('en-GB')} {issueDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>

                <p className="text-xs">Service Number: {serviceNumber}</p>
                
                <div className="my-2 relative">
                    <BusStamp />
                    <p className="font-bold text-lg uppercase">{getFullBusType(ticket.busType)}</p>
                </div>
                
                <p className="text-xs">Trip No: {tripNo}</p>

                <div className="text-left my-3">
                    <div className="flex justify-between items-center font-bold text-sm">
                        <span>{ticket.from.toUpperCase()}</span>
                        <span>TO</span>
                        <span>{ticket.to.toUpperCase()}</span>
                    </div>
                </div>
                
                <div className="text-left my-2 text-sm">
                    {ticket.quantities.Men > 0 && <p>MEN: {ticket.quantities.Men} x {menFare.toFixed(2)} = {(ticket.quantities.Men * menFare).toFixed(2)}</p>}
                    {ticket.quantities.Child > 0 && <p>CHILD: {ticket.quantities.Child} x {childFare.toFixed(2)} = {(ticket.quantities.Child * childFare).toFixed(2)}</p>}
                    {ticket.quantities.Women > 0 && (
                        <p>WOMEN: {ticket.quantities.Women} x {womenFare.toFixed(2)} = {(ticket.quantities.Women * womenFare).toFixed(2)} {womenFare === 0 && ticket.quantities.Women > 0 && <span className="font-bold text-green-600 ml-2">FREE</span>}</p>
                    )}
                </div>

                <div className="border-t border-dashed border-gray-400 my-1"></div>

                <p className="text-2xl font-bold my-2">Total Rs. {ticket.totalFare.toFixed(2)}</p>
                <p className="text-sm">Payment Mode: {ticket.paymentMode || "DIGITAL"}</p>
                
                <div className="text-xs text-left my-3 grid grid-cols-2">
                    <p>CND: {Math.floor(100000 + Math.random() * 900000)}</p>
                    <p>DRV: DS{serviceNumber}</p>
                    <p>Waybill: {Math.floor(10000000 + Math.random() * 90000000)}</p>
                    <p>Bus: TS11UA{Math.floor(1000 + Math.random() * 9000)}</p>
                    <p>ETIM No: I062300078</p>
                    <p>v1.9.29</p>
                </div>

                {refundCode && (
                    <div className="border-t-2 border-dashed border-gray-400 pt-2 mt-2">
                        <p className="font-bold">REFUND CODE:</p>
                        <p className="text-lg font-bold tracking-widest text-blue-600">{refundCode}</p>
                    </div>
                )}
                
                <div className={cn("border-t-2 border-dashed border-gray-400 pt-2", refundCode ? "mt-2" : "mt-4")}>
                    <p className="font-bold">NOT TRANSFERABLE</p>
                    <p className="font-bold">HAPPY JOURNEY</p>
                    <p className="text-xs mt-1">HELP LINE NO</p>
                    <p className="text-xs">040 69440000</p>
                </div>
            </div>
        </div>
    );
}
