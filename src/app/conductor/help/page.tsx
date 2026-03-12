

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/app/components/header';
import { HelpCircle, User, Briefcase } from "lucide-react";
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
    question: "What if I board a different bus than the one I booked?",
    answer: "Please inform the conductor immediately. They will use their 'Verify by Bus Type' tool to check for any fare difference. If you paid less than required, you'll need to pay the difference in cash. If you overpaid, the conductor will issue a refund code which you can redeem in your wallet."
  },
  {
    question: "What is my Wallet?",
    answer: "The wallet holds your balance from refunds (from both manual cancellations and expired tickets). You can use this balance to pay for new tickets. You can also add funds to your wallet by redeeming refund codes provided by conductors."
  },
  {
    question: "I received a refund code. How do I use it?",
    answer: "Go to the 'My Wallet' section. Enter the refund code along with the original ticket's 5-digit security code to add the credited amount to your wallet balance."
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

export default function ConductorHelpPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Help & FAQs" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">Help & FAQs</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase />
              For Conductors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {conductorFaqs.map((faq, index) => (
                <AccordionItem value={`c-item-${index}`} key={index}>
                  <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User />
              For Passengers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {passengerFaqs.map((faq, index) => (
                <AccordionItem value={`p-item-${index}`} key={index}>
                  <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
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
