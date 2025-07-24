
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Database, Code, TestTube, Rocket, HeadphonesIcon, ArrowRight, Settings } from 'lucide-react';

export const WhatWeDoSection: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState(0);

  const processes = [{
    icon: FileText,
    title: "Requirements Gathering",
    description: "We collect your basic information and understand your chatbot goals",
    details: "We start by understanding what you want your bot to achieve, then gather your FAQs, product information, services, opening hours, and any other context needed to make your bot an expert on your company.",
    color: "from-blue-500 to-cyan-500"
  }, {
    icon: Database,
    title: "Knowledge Base Creation",
    description: "We build and vectorize your company's knowledge base",
    details: "We process your website content, documents, and information to create a comprehensive, searchable knowledge base. Our system vectorizes this data so your bot becomes a true expert on your business.",
    color: "from-green-500 to-emerald-500"
  }, {
    icon: Code,
    title: "Development & Integration",
    description: "We build your custom chatbot and integrate with your existing tools",
    details: "We develop a branded chatbot tailored to your needs and seamlessly integrate it with your existing platforms - whether that's Google Calendar for bookings, Slack for reports, Airtable CRM, or any other tools you use.",
    color: "from-orange-500 to-amber-500"
  }, {
    icon: Settings,
    title: "Bot Configuration & Customization",
    description: "We customize the chatbot's appearance, behavior, and functionality to match your brand",
    details: "We configure everything from the chatbot's colors, logo, and positioning to its tone of conversation and welcome messages. The bot can be set up to handle multilingual interactions, form submissions, appointment bookings, and integrate with your specific business workflows.",
    color: "from-purple-500 to-violet-500"
  }, {
    icon: TestTube,
    title: "Testing & Training Environment",
    description: "We provide you with a sandbox to test and refine your bot",
    details: "You get access to a private testing environment where you can interact with your bot, refine its responses, and train it further. This ensures everything works perfectly before launch.",
    color: "from-pink-500 to-rose-500"
  }, {
    icon: Rocket,
    title: "Launch & Deployment",
    description: "We deploy your chatbot and ensure a smooth go-live",
    details: "We handle the complete deployment process and monitor the initial launch to ensure your customers have a flawless experience from day one.",
    color: "from-indigo-500 to-blue-500"
  }, {
    icon: HeadphonesIcon,
    title: "Ongoing Monitoring & Support",
    description: "We continuously monitor and optimize your bot's performance",
    details: "Our backend systems audit every conversation transcript and run ongoing tests to ensure your bot always provides accurate, helpful responses. We're here for continuous support and improvements.",
    color: "from-teal-500 to-cyan-500"
  }];

  return (
    <div className="min-h-screen py-24 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-950 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-slate-500 to-gray-500 text-white border-0">
            <Code className="w-4 h-4 mr-2" />
            Our Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent text-center">
            What We Do
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-center">
            We handle everything from initial setup to ongoing optimization, creating AI-powered chatbots that become true experts on your business and integrate seamlessly with your existing workflows.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Process Steps */}
          <div className="space-y-4 flex flex-col justify-center py-8" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
            <div className="space-y-3 py-6">
              {processes.map((process, index) => (
                <div
                  key={process.title}
                  onClick={() => setSelectedStep(index)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group ${
                    selectedStep === index
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${process.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-sm">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div>
                        <h4 className={`font-semibold transition-colors ${
                          selectedStep === index ? 'text-primary' : 'text-foreground'
                        }`}>
                          {process.title}
                        </h4>
                      </div>
                    </div>
                    <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                      selectedStep === index
                        ? 'text-primary translate-x-1'
                        : 'text-muted-foreground group-hover:translate-x-1'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Selected Content */}
          <div className="flex items-start justify-center h-full max-h-[500px] py-8">
            <Card className="border-2 hover:border-primary/50 transition-all duration-500 overflow-hidden w-full max-w-lg min-h-[600px] flex flex-col">
              <CardContent className="p-8 flex-1 flex flex-col justify-center">
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${processes[selectedStep].color} flex items-center justify-center mb-4`}>
                    {React.createElement(processes[selectedStep].icon, {
                      className: 'w-8 h-8 text-white'
                    })}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {processes[selectedStep].title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    {processes[selectedStep].description}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {processes[selectedStep].details}
                  </p>
                </div>

                {/* Progress indicator */}
                <div className="flex space-x-2 mt-8">
                  {processes.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === selectedStep ? 'bg-primary flex-1' : 'bg-muted w-2'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
