import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Headphones, Calendar, Heart, Briefcase, GraduationCap, Clock, Zap } from 'lucide-react';
export const UseCasesSection: React.FC = () => {
  const useCases = [{
    icon: ShoppingCart,
    title: "Shopping Assistant",
    description: "Help website visitors find products that suit their needs, provide recommendations, and answer product questions",
    color: "from-green-500 to-emerald-500"
  }, {
    icon: Headphones,
    title: "Customer Service",
    description: "24/7 support for common questions, escalating complex issues to humans",
    color: "from-blue-500 to-cyan-500"
  }, {
    icon: Calendar,
    title: "Appointment Booking",
    description: "Schedule appointments, check availability, and send confirmations automatically",
    color: "from-purple-500 to-violet-500"
  }, {
    icon: Heart,
    title: "Healthcare Support",
    description: "Answer patient questions, appointment scheduling, and basic health info",
    color: "from-pink-500 to-rose-500"
  }, {
    icon: Briefcase,
    title: "Lead Generation",
    description: "Qualify prospects, collect contact info, and route to sales teams",
    color: "from-orange-500 to-amber-500"
  }, {
    icon: GraduationCap,
    title: "Educational Support",
    description: "Help students with course info, assignments, and academic resources",
    color: "from-indigo-500 to-blue-500"
  }];
  const features = [{
    icon: Clock,
    title: "2-Minute Setup",
    description: "Get your chatbot running in under 2 minutes with our simple integration"
  }, {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for performance with instant responses and smooth animations"
  }];
  return <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center py-[7px]">
            Perfect for Every Industry
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-center">
            Our chatbots are built for your specific needs, whether you're in retail, healthcare, education, or any other industry requiring customer interaction.
          </p>
        </div>
        
        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {useCases.map((useCase, index) => <Card key={useCase.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm animate-fade-in" style={{
          animationDelay: `${index * 100}ms`
        }}>
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">
                  {useCase.description}
                </p>
              </CardContent>
            </Card>)}
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => <Card key={feature.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm animate-fade-in" style={{
          animationDelay: `${(useCases.length + index) * 100}ms`
        }}>
              {/* Features content can be added here if needed */}
            </Card>)}
        </div>
      </div>
    </div>;
};