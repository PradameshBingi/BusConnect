import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/app/components/header';
import { HelpCircle, User, Briefcase, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const passengerFaqs = [
  {
    question: "How do I book a ticket?",
    answer: "Navigate to 'Book Bus Tickets' from the home screen, select your bus type, choose your starting point and destination, add passengers, and generate your ticket. You can also use your wallet balance for payment."
  },
  {
    question: "How is the fare calculated?",
    answer: "Fares are based on distance. Women travel free on City Ordinary and Metro Express buses under the Maha Lakshmi scheme. Surcharges apply for men and children on premium services (Metro Express and Metro Deluxe), and for women on Metro Deluxe buses."
  },
  {
    question: "How do I cancel my ticket?",
    answer: "Go to your 'Booking History'. If a ticket is still valid (within 1 minute of booking), you'll see a 'Cancel Ticket' button. A 10% cancellation fee on the original fare is applied, and any amount you paid is credited automatically to your wallet."
  },
  {
    question: "What happens if my ticket expires?",
    answer: "If your ticket expires (after the 1-minute cancellation window), it can no longer be used for travel. However, the amount you paid, minus a 10% processing fee, will be automatically credited to your wallet since the ticket was not used."
  },
  {
    question: "How do I upgrade my ticket?",
    answer: "If you have a valid ticket and wish to travel on a higher-tier bus, you can upgrade it in 'Booking History'. The system calculates the fare difference, which you can pay digitally. Your ticket is updated instantly."
  },
  {
    question: "What if I have no mobile network while boarding?",
    answer: "Your ticket details are stored locally in your browser. Simply open your 'Booking History' to show the conductor your Ticket Code and Security PIN. An active internet connection is not required for verification once the ticket is booked."
  },
  {
    question: "Is the digital payment secure?",
    answer: "Yes. BusConnect uses a secure, simulated payment gateway that mimics industry-standard encryption. Your transactions are safe, and your sensitive data is never stored in plain text."
  },
  {
    question: "Can I book a ticket for someone else?",
    answer: "Yes! You can book a ticket on your device and share the 10-digit Ticket Code and 5-digit Security PIN with the person travelling. The conductor will use these codes to verify their journey."
  },
];

const conductorFaqs = [
  {
    question: "How do I verify a standard ticket?",
    answer: "Navigate to 'Ticket Tools' > 'Verify Ticket Code'. Enter the ticket code from the passenger's screen and press 'Verify'. The system will instantly show you if the ticket is valid. After verification, a digital receipt is generated."
  },
  {
    question: "What is 'Verify by Bus Type' used for?",
    answer: "This tool is for when a passenger boards a different bus type than booked (e.g., has an 'Ordinary' ticket but is on a 'Deluxe' bus). It calculates the fare difference."
  },
  {
    question: "How do I handle a fare difference?",
    answer: "After checking the fare in 'Verify by Bus Type', the system shows the difference. If it's a positive amount, collect it in cash. If it's negative, a refund is due. The refund code will be generated on the digital ticket after you validate it."
  },
  {
    question: "How do I verify a Bus Pass?",
    answer: "From the conductor dashboard, select 'Bus Pass Verification'. Enter the 10-digit code from the pass. The system will check its validity and display pass details like type (General/Route) and expiry."
  },
  {
    question: "What should I do if a ticket shows as 'Expired', 'Used', or 'Canceled'?",
    answer: "These tickets are not valid for travel. You should inform the passenger that their ticket cannot be accepted and they will need to book a new one. If the ticket just expired, their fare may have been auto-refunded to their wallet."
  },
  {
    question: "What if a passenger's security code doesn't match?",
    answer: "Politely ask the passenger to double-check the code on their ticket screen. If it still doesn't match, the ticket cannot be validated. This is a security measure to prevent fraud."
  },
];

const howItWorksSteps = [
  {
    title: "Book",
    description: "Select your route and bus type. Pay via UPI, Cards, or Wallet.",
  },
  {
    title: "Secure",
    description: "A 5-digit Security PIN is generated for your ticket to prevent fraud.",
  },
  {
    title: "Verify",
    description: "Show your unique Ticket Code to the conductor. They will verify it on their device using your PIN.",
  },
  {
    title: "Refunds",
    description: "If you change buses or cancel, credits are added to your wallet for future use.",
  },
];

export default function HelpPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/" title="Help & FAQs" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">Help & FAQs</h1>
        </div>

        {/* How It Works Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-primary font-headline">How It Works</h2>
          </div>
          <Card className="bg-slate-50/50 border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-4 space-y-2">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-[10px] mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-snug text-slate-700 font-body">
                    <span className="font-bold text-slate-900">{step.title}: </span>
                    {step.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <User className="h-6 w-6" />
              For Passengers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {passengerFaqs.map((faq, index) => (
                <AccordionItem value={`p-item-${index}`} key={index}>
                  <AccordionTrigger className="text-left font-semibold font-body">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-body">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Briefcase className="h-6 w-6" />
              For Conductors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {conductorFaqs.map((faq, index) => (
                <AccordionItem value={`c-item-${index}`} key={index}>
                  <AccordionTrigger className="text-left font-semibold font-body">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-body">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
