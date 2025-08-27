
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, ChevronRight } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How do I integrate the chatbot into my website?",
      answer: "Integration is seamless. We provide a single-line <script> tag that you can paste into the <head> or <body> section of your website. Once added, the chatbot will automatically appear based on the configuration provided."
    },
    {
      question: "Can I customize the chatbot's look and feel?",
      answer: "Yes! Our chatbot is fully customizable—colors, logo, avatar, positioning, welcome message, and tone of conversation can all be tailored to match your brand's identity."
    },
    {
      question: "Is the chatbot compatible with all website platforms?",
      answer: "Our chatbot works across all modern web platforms including WordPress, Shopify, Wix, Webflow, React.js, and more. If your website supports adding JavaScript, you're good to go."
    },
    {
      question: "Does the chatbot support multilingual interactions?",
      answer: "Absolutely. The bot can be configured to support multiple languages and can auto-detect the user's browser language or allow manual language selection."
    },
    {
      question: "How secure is the chatbot for collecting user information?",
      answer: "We use domain-level validation via CORS, secure session-based communication, and encryption for data in transit and at rest. You can also configure which data is collected, if any."
    },
    {
      question: "Can the chatbot handle appointment bookings or lead capture?",
      answer: "Yes. Our chatbot can be integrated with your CRM or appointment system and supports form-based inputs, lead capture, and webhook/API submissions."
    },
    {
      question: "Is there analytics available for the chatbot?",
      answer: "Yes. You can access a detailed dashboard that includes conversation logs, user engagement metrics, popular questions, and conversion tracking."
    },
    {
      question: "Can I train the chatbot with my own content?",
      answer: "Of course. You can feed the chatbot your FAQs, help docs, or knowledge base content. We also support advanced AI training with documents, URLs, or even custom APIs."
    },
    {
      question: "Is there a voice-based chatbot option available?",
      answer: "Yes. We offer integrated AI voice agent capabilities, allowing users to interact with the bot via voice for a more natural conversation experience."
    },
    {
      question: "Do you offer support and onboarding?",
      answer: "Yes. Our team provides technical onboarding, training, and post-deployment support to ensure your chatbot is set up for success."
    }
  ];

  return (
    <div className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section with better spacing and no clipping */}
        <div className="text-center mb-16">
          <Badge className="mb-6 px-4 py-2 bg-primary text-primary-foreground border-0">
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground pb-2 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
            Everything you need to know about our chatbot integration and features
          </p>
        </div>

        {/* Two-column layout for better visual hierarchy */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left column - First 5 FAQs */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.slice(0, 5).map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border rounded-xl px-6 bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20"
                >
                  <AccordionTrigger className="text-left font-semibold text-base hover:no-underline py-6 group">
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-6 pl-11">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Right column - Remaining FAQs */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.slice(5).map((faq, index) => (
                <AccordionItem 
                  key={index + 5} 
                  value={`item-${index + 5}`}
                  className="border border-border rounded-xl px-6 bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20"
                >
                  <AccordionTrigger className="text-left font-semibold text-base hover:no-underline py-6 group">
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {String(index + 6).padStart(2, '0')}
                      </span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-6 pl-11">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Call to action section */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
          <h3 className="text-2xl font-bold text-foreground mb-4 pb-1">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you get started with your chatbot integration
          </p>
          <a 
            href="mailto:lucca@toratech.ai"
            className="inline-flex items-center justify-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300 cursor-pointer"
          >
            Contact our support team
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
