import React, { useEffect, useState } from 'react';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { ArrowRight, MessageSquare, Zap, QrCode, Globe, Users, TrendingUp, Clock, Star } from 'lucide-react';
import { SecuritySection } from '../components/landing/SecuritySection';
import { FAQSection } from '../components/landing/FAQSection';
import { VoiceWidget } from '../components/VoiceWidget';

const Demo = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.title = 'AI Chat Agent - Capture Leads From Every Angle, 24/7';
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleViewExample = () => {
    window.open('https://chirodashboard-chat.onrender.com/cdn-example.html', '_blank');
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Dark Mode Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="relative overflow-hidden transition-all duration-300 hover:scale-110 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          <div className={`absolute inset-0 transition-transform duration-500 ${isDarkMode ? 'translate-y-0' : 'translate-y-full'}`}>
            <Moon className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className={`absolute inset-0 transition-transform duration-500 ${isDarkMode ? '-translate-y-full' : 'translate-y-0'}`}>
            <Sun className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-blue-800"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            AI Chat Agents: Capture Leads From Every Angle, 24/7
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
            Turn every customer touchpoint into a sales opportunity. Deploy one intelligent AI chat system across every franchise location — Instagram, Facebook, TikTok, websites, QR codes, and SMS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Voice Widget Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <VoiceWidget
            agentId="agent_01k04zwwq3fv5acgzdwmbvfk8k"
            buttonText="Talk to AI Agent"
            buttonColor="#000000"
            backgroundColor="#ffffff"
            textColor="#000000"
            secondaryTextColor="#666666"
            borderColor="#e5e7eb"
            shadowColor="rgba(0,0,0,0.08)"
            statusBgColor="#f0fdf4"
            statusTextColor="#15803d"
            title="AI Voice Assistant"
            description="Get instant answers to your questions. Our AI assistant is ready to help you 24/7."
            avatarUrl="/lovable-uploads/0bece050-e33f-47c2-aeba-0088a17e5b93.png"
          />
        </div>
      </section>

      {/* Why AI Chat Agents Make Business Sense */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why AI Chat Agents Make Business Sense
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Meet Customers Where They Are</h3>
              <p className="text-gray-600 text-center">
                Deploy on social platforms where your customers spend time. No app downloads needed—just instant conversations on Facebook Messenger, Instagram DMs, TikTok, or your website.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Instant Response = Higher Conversions</h3>
              <p className="text-gray-600 text-center">
                78% of customers buy from businesses that respond first. AI chat agents reply in milliseconds, capturing leads while they're hot and interested.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">One Link, Endless Opportunities</h3>
              <p className="text-gray-600 text-center">
                Share your AI chat agent via URL or QR code anywhere—email signatures, SMS campaigns, print ads, store displays, or social media bios. Every scan or click starts a conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use AI Chat Agents Everywhere */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Use AI Chat Agents Everywhere Your Customers Are
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Where It Works</th>
                  <th className="px-6 py-4 text-left font-semibold">What It Does</th>
                  <th className="px-6 py-4 text-left font-semibold">Why It Matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { where: "Instagram", what: "Replies instantly to DMs & comments", why: "Never miss a customer inquiry" },
                  { where: "Facebook", what: "Automates Messenger & post replies", why: "Engage customers the moment they reach out" },
                  { where: "TikTok", what: "Handles business messages & comments", why: "Convert viral attention into leads" },
                  { where: "Ad Campaigns", what: "Swap static forms for AI chat", why: "Boost conversions with instant interaction" },
                  { where: "QR Codes", what: "Launches chat from any scan", why: "Connect offline audiences to online sales" },
                  { where: "Email Signature", what: "Adds chat link to every email sent", why: "Turn routine emails into new conversations" },
                  { where: "SMS Campaigns", what: "Links text messages to live chat", why: "Reactivate your customer database" },
                  { where: "Website", what: "24/7 website chat widget", why: "Capture leads & support visitors instantly" }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.where}</td>
                    <td className="px-6 py-4 text-gray-600">{row.what}</td>
                    <td className="px-6 py-4 text-gray-600">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-lg text-gray-700 mt-8 font-semibold">
            While competitors take hours or days to respond, your AI chat agent captures every opportunity instantly.
          </p>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Use Case - The Joint Chiropractic
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-center mb-8 text-blue-600">
                Conversational Booking Agent - Deployed across 117 Franchisees
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-xl font-semibold mb-4 text-red-600">Pain Points</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Delayed responses from front desk led to lost appointments</li>
                    <li>• Static booking links couldn't answer specific patient questions</li>
                    <li>• Staff became overwhelmed by fragmented calls, texts, and DMs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-4 text-blue-600">Solution</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Launched custom AI chat agent trained on The Joint's knowledge base</li>
                    <li>• Replaced static booking links with interactive conversations</li>
                    <li>• Integrated into Facebook & Instagram for auto-booking</li>
                    <li>• Seamlessly synced with calendar & CRM systems</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-4 text-green-600">Results</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Up to 440% ROI</strong> from chatbot-driven bookings</li>
                    <li>• <strong>Zero missed leads</strong> with 24/7 instant response</li>
                    <li>• <strong>45% booking rate</strong> from conversational interactions</li>
                    <li>• <strong>2,000+ patient questions</strong> answered automatically each month</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <SecuritySection />

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Pricing Plans for Franchisees
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Starter Plan</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$399</div>
                <div className="text-gray-600 mb-6">per month</div>
                <p className="text-sm text-gray-600 mb-6">For businesses starting with AI chat agents</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Up to 300 conversations/month
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Website Widget + Link to AI chat agent
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>
            <div className="bg-white border-2 border-blue-600 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Professional Plan</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$599</div>
                <div className="text-gray-600 mb-6">per month</div>
                <p className="text-sm text-gray-600 mb-6">Everything in starter +</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Up to 2,000 conversations/month
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Social platform integrations
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Internal Insight Dashboard
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Complete AI Suite</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$879</div>
                <div className="text-gray-600 mb-6">per month</div>
                <p className="text-sm text-gray-600 mb-6">Everything in professional +</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Unlimited AI chat agent conversations
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    2,700 voice minutes/month
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8">
            ✓ No setup fees | ✓ No contracts | ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Chatbot Widget */}
      <ChatbotWidget
        webhookUrl="https://luccatora.app.n8n.cloud/webhook/webbot"
        title="Chat Support"
        bio="Online now"
        placeholder="Type your message..."
        position="bottom-right"
        primaryColor="#000000"
        secondaryColor="#f3f4f6"
        botTextColor="#1f2937"
        userTextColor="#ffffff"
        chatBackground="#ffffff"
        welcomeMessage="Hey, this is Jack, the Virtual Assistant from ToraTech AI. How can I help you today?"
        admin={false}
        isVoiceEnabled={false}
        isElevenLabsEnabled={true}
        elevenLabsAgentId="agent_01k04zwwq3fv5acgzdwmbvfk8k"
        headerGradientColor="#000000"
        headerMainColor="#262626"
        logoBackgroundColor="transparent"
        logoBorderColor="none"
        headerButtonColor="#ffffff"
        fontFamily="Inter"
        welcomeTooltipMessage="Click to start chatting with our AI assistant!"
        logoUrl="/lovable-uploads/0bece050-e33f-47c2-aeba-0088a17e5b93.png"
        avatarUrl="/lovable-uploads/0bece050-e33f-47c2-aeba-0088a17e5b93.png"
      />
    </div>
  );
};

export default Demo;