import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Rocket, MessageCircle, ExternalLink } from 'lucide-react';
import { DemoBookingForm } from '@/components/DemoBookingForm';
interface HeroSectionProps {
  onViewExample: () => void;
}
export const HeroSection: React.FC<HeroSectionProps> = ({
  onViewExample
}) => {
  return <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 opacity-50"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight py-4 text-center">NeuroChat</h1>
          
          <div className="mb-8">
            <p className="text-lg md:text-xl text-muted-foreground/80 font-medium">Enterprise Level Chatbots Powered by ToraTech AI</p>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed text-center">
            Add an intelligent chatbot to any website with minimal code. Automatically trained on your company's data, processes, and guidelines.
          </p>

          {/* Subtle Test Widget Message */}
          <div className="bg-muted/30 border border-border px-6 py-3 rounded-md mb-8 mx-auto max-w-lg">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <p className="text-sm">
                Test our chatbot using the widget in the bottom right corner
              </p>
            </div>
          </div>
          
          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <DemoBookingForm />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[{
            number: "5+",
            label: "Frameworks Supported"
          }, {
            number: "2min",
            label: "Setup Time"
          }, {
            number: "100%",
            label: "Customizable"
          }].map((stat, index) => <div key={stat.label} className="text-center animate-fade-in" style={{
            animationDelay: `${index * 200}ms`
          }}>
                {/* Stats content can be added here if needed */}
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};