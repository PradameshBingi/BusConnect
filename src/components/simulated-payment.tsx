
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  Loader2, 
  X,
  QrCode,
  SmartphoneNfc,
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type PaymentMethod = 'UPI' | 'Card' | 'Netbanking' | 'Wallet';
type PaymentStatus = 'idle' | 'processing' | 'success';

interface SimulatedPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  amount: number;
}

const processingSteps = [
  "Initializing secure connection...",
  "Authenticating payment details...",
  "Communicating with bank servers...",
  "Finalizing transaction..."
];

export function SimulatedPayment({ isOpen, onClose, onComplete, amount }: SimulatedPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= processingSteps.length - 1) {
            clearInterval(interval);
            setTimeout(() => setStatus('success'), 800);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        onComplete();
        onClose();
        setStatus('idle');
        setStepIndex(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onComplete, onClose]);

  const handlePay = () => {
    setStatus('processing');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-6 flex flex-col shrink-0">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg tracking-tight">SecurePay</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Payment Gateway</p>
          </div>

          <nav className="space-y-1">
            <MethodTab active={method === 'UPI'} onClick={() => setMethod('UPI')} icon={<Smartphone className="h-4 w-4" />} label="UPI" />
            <MethodTab active={method === 'Card'} onClick={() => setMethod('Card')} icon={<CreditCard className="h-4 w-4" />} label="Cards" />
            <MethodTab active={method === 'Netbanking'} onClick={() => setMethod('Netbanking')} icon={<Building2 className="h-4 w-4" />} label="Netbanking" />
            <MethodTab active={method === 'Wallet'} onClick={() => setMethod('Wallet')} icon={<Wallet className="h-4 w-4" />} label="Wallet" />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200">
             <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Lock className="h-3 w-3" />
                <span>SSL Secured</span>
             </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col bg-white relative min-w-0">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col p-8 h-full min-h-0"
              >
                <div className="mb-6 shrink-0">
                  <h2 className="text-2xl font-bold text-slate-900">Rs. {amount.toFixed(2)}</h2>
                  <p className="text-sm text-slate-500">Order ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {method === 'UPI' && <UPIDetails />}
                  {method === 'Card' && <CardDetails />}
                  {method === 'Netbanking' && <NetbankingDetails />}
                  {method === 'Wallet' && <WalletDetails />}
                </div>

                <Button 
                  onClick={handlePay}
                  className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 mt-6 shrink-0"
                >
                  Pay Rs. {amount.toFixed(2)}
                </Button>
              </motion.div>
            )}

            {status === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6 p-8"
              >
                <div className="relative">
                  <Loader2 className="h-20 w-20 text-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SmartphoneNfc className="h-8 w-8 text-primary/50" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Payment</h3>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={stepIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-slate-500 text-sm italic"
                    >
                      {processingSteps[stepIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6 p-8"
              >
                <motion.div
                  initial={{ rotate: -20, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="h-24 w-24 text-green-500" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful</h3>
                  <p className="text-slate-500">Redirecting to your ticket details...</p>
                </div>
                <div className="bg-slate-50 px-6 py-3 rounded-full text-sm font-medium text-slate-600 border border-slate-200">
                  Ref No: {Math.floor(100000000 + Math.random() * 900000000)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function MethodTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
        active 
          ? "bg-white text-primary shadow-sm border border-slate-200" 
          : "text-slate-500 hover:bg-slate-100"
      )}
    >
      <span className={cn(active ? "text-primary" : "text-slate-400")}>{icon}</span>
      {label}
      {active && <motion.div layoutId="active-indicator" className="ml-auto"><ChevronRight className="h-4 w-4" /></motion.div>}
    </button>
  );
}

function UPIDetails() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
        <QrCode className="h-32 w-32 text-slate-400 mb-2" />
        <p className="text-[10px] uppercase font-bold text-slate-400">Scan QR to pay</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <UpiApp label="GPay" selected={selectedApp === 'GPay'} onClick={() => setSelectedApp('GPay')} />
        <UpiApp label="PhonePe" selected={selectedApp === 'PhonePe'} onClick={() => setSelectedApp('PhonePe')} />
        <UpiApp label="Paytm" selected={selectedApp === 'Paytm'} onClick={() => setSelectedApp('Paytm')} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase text-slate-500 font-bold">Or enter UPI ID</Label>
        <div className="flex gap-2">
          <Input placeholder="user@upi" className="flex-1" />
          <Button variant="outline" size="sm">Verify</Button>
        </div>
      </div>
    </div>
  );
}

function UpiApp({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer group",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 hover:border-primary hover:bg-slate-50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
        selected ? "bg-primary/20" : "bg-slate-200 group-hover:bg-primary/10"
      )}>
        <Smartphone className={cn(
          "h-5 w-5 transition-colors",
          selected ? "text-primary" : "text-slate-400 group-hover:text-primary"
        )} />
      </div>
      <span className={cn(
        "text-[10px] font-bold transition-colors",
        selected ? "text-primary" : "text-slate-600"
      )}>{label}</span>
    </div>
  );
}

function CardDetails() {
  return (
    <div className="space-y-4 pb-4">
      <div className="space-y-2">
        <Label className="text-xs uppercase text-slate-500 font-bold">Card Number</Label>
        <div className="relative">
          <Input placeholder="0000 0000 0000 0000" />
          <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase text-slate-500 font-bold">Expiry Date</Label>
          <Input placeholder="MM / YY" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase text-slate-500 font-bold">CVV</Label>
          <Input placeholder="***" type="password" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase text-slate-500 font-bold">Cardholder Name</Label>
        <Input placeholder="NAME ON CARD" />
      </div>
    </div>
  );
}

function NetbankingDetails() {
  const banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank'];
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  return (
    <div className="space-y-4 pb-4">
      <Label className="text-xs uppercase text-slate-500 font-bold">Popular Banks</Label>
      <div className="grid grid-cols-1 gap-2">
        {banks.map(bank => (
          <div 
            key={bank} 
            onClick={() => setSelectedBank(bank)}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
              selectedBank === bank ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 hover:border-primary hover:bg-slate-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded flex items-center justify-center transition-colors",
                selectedBank === bank ? "bg-primary/20" : "bg-slate-100"
              )}>
                <Building2 className={cn(
                  "h-4 w-4 transition-colors",
                  selectedBank === bank ? "text-primary" : "text-slate-400"
                )} />
              </div>
              <span className={cn(
                "text-sm font-medium transition-colors",
                selectedBank === bank ? "text-primary font-bold" : "text-slate-700"
              )}>{bank}</span>
            </div>
            <ChevronRight className={cn(
              "h-4 w-4 transition-colors",
              selectedBank === bank ? "text-primary" : "text-slate-300"
            )} />
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletDetails() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  return (
    <div className="space-y-4 pb-4">
      <p className="text-sm text-slate-500">Pay using your saved digital wallets.</p>
      <div className="grid grid-cols-1 gap-2">
        <WalletOption label="Amazon Pay" selected={selectedWallet === 'Amazon Pay'} onClick={() => setSelectedWallet('Amazon Pay')} />
        <WalletOption label="Mobikwik" selected={selectedWallet === 'Mobikwik'} onClick={() => setSelectedWallet('Mobikwik')} />
        <WalletOption label="Freecharge" selected={selectedWallet === 'Freecharge'} onClick={() => setSelectedWallet('Freecharge')} />
      </div>
    </div>
  );
}

function WalletOption({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 hover:border-primary hover:bg-slate-50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded flex items-center justify-center transition-colors",
          selected ? "bg-primary/20" : "bg-slate-100"
        )}>
          <Wallet className={cn(
            "h-4 w-4 transition-colors",
            selected ? "text-primary" : "text-slate-400"
          )} />
        </div>
        <span className={cn(
          "text-sm font-medium transition-colors",
          selected ? "text-primary font-bold" : "text-slate-700"
        )}>{label}</span>
      </div>
      <ChevronRight className={cn(
        "h-4 w-4 transition-colors",
        selected ? "text-primary" : "text-slate-300"
      )} />
    </div>
  );
}
