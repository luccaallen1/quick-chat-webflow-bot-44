
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Database, CheckCircle, ArrowRight, Globe, Users, Server, FileCheck, Zap } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const securityFeatures = [{
    icon: Globe,
    title: "Domain Validation with CORS",
    description: "Our chatbot validates allowed domains using Cross-Origin Resource Sharing (CORS) to ensure that the bot script runs only on approved web properties.",
    color: "from-cyan-500 to-blue-500"
  }, {
    icon: Users,
    title: "Session-Based Access Management",
    description: "Each conversation is tied to a unique session identifier, enabling contextual understanding while helping isolate user data securely during the chat flow.",
    color: "from-green-500 to-emerald-500"
  }, {
    icon: Lock,
    title: "Data Encryption",
    description: "All messages exchanged between the user and the bot are encrypted in transit. Sensitive data is encrypted at rest and contextualized using session-based logic to prevent unauthorized access.",
    color: "from-orange-500 to-amber-500"
  }, {
    icon: Database,
    title: "Minimal Data Retention",
    description: "We do not persist unnecessary user data. Only essential session-based data may be temporarily retained for performance, analytics, or product improvement, depending on the configuration.",
    color: "from-pink-500 to-rose-500"
  }, {
    icon: Shield,
    title: "Bot Visibility Controls",
    description: "Bot visibility and interaction logic can be customized per domain or page-level permissions, reducing unnecessary exposure and risk of misuse.",
    color: "from-indigo-500 to-blue-500"
  }, {
    icon: Server,
    title: "Flexible Hosting and Isolation Options",
    description: "Depending on your infrastructure or compliance requirements, we offer deployment flexibility including private cloud or containerized hosting.",
    color: "from-teal-500 to-cyan-500"
  }, {
    icon: Zap,
    title: "Enterprise-Grade Scalability",
    description: "Our infrastructure scales seamlessly with your needs. We customize our servers and deployment architecture to handle your specific requirements and traffic volumes.",
    color: "from-purple-500 to-violet-500"
  }, {
    icon: CheckCircle,
    title: "API Request Signing & Rate Limiting",
    description: "API communications follow request signing and throttling techniques to protect against abuse and ensure uptime under load.",
    color: "from-emerald-500 to-green-500"
  }, {
    icon: FileCheck,
    title: "Auditable Logging",
    description: "For enterprise clients, we offer activity logging for chatbot interactions to meet audit and compliance goals—without compromising user privacy.",
    color: "from-violet-500 to-purple-500"
  }];

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-950 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
            <Shield className="w-4 h-4 mr-2" />
            Security & Privacy
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent leading-tight px-0 text-center">
            Security & Privacy
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-center">
            We understand that security and privacy are critical—especially when integrating intelligent systems into healthcare, food chains, and other sensitive digital environments. Our chatbot solution is thoughtfully designed with a security-first approach, implementing the following measures to safeguard interactions:
          </p>
        </div>

        {/* Unified Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <Card key={feature.title} className="border-2 hover:border-primary/50 transition-all duration-300 group h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                    {React.createElement(feature.icon, {
                      className: 'w-6 h-6 text-white'
                    })}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-3 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
