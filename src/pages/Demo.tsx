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
      <section className="relative py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
            AI Chat Agents: <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Capture Leads From Every Angle, 24/7</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed text-gray-700">
            Turn every customer touchpoint into a sales opportunity. Deploy one intelligent AI chat system across every franchise location — Instagram, Facebook, TikTok, websites, QR codes, and SMS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 text-lg font-semibold">
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
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why AI Chat Agents Make <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Business Sense</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">Meet Customers Where They Are</h3>
              <p className="text-gray-600 text-center">
                Deploy on social platforms where your customers spend time. No app downloads needed—just instant conversations on Facebook Messenger, Instagram DMs, TikTok, or your website.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">Instant Response = Higher Conversions</h3>
              <p className="text-gray-600 text-center">
                78% of customers buy from businesses that respond first. AI chat agents reply in milliseconds, capturing leads while they're hot and interested.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">One Link, Endless Opportunities</h3>
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
            Use AI Chat Agents <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Everywhere Your Customers Are</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
              <thead className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Where It Works</th>
                  <th className="px-6 py-4 text-left font-semibold">What It Does</th>
                  <th className="px-6 py-4 text-left font-semibold">Why It Matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
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
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{row.where}</td>
                    <td className="px-6 py-4 text-gray-700">{row.what}</td>
                    <td className="px-6 py-4 text-gray-600">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-lg text-gray-800 mt-8 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            While competitors take hours or days to respond, your AI chat agent captures every opportunity instantly.
          </p>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Use Case - <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">The Joint Chiropractic</span>
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Conversational Booking Agent - Deployed across 117 Franchisees
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <h4 className="text-xl font-semibold mb-4 text-red-700">Pain Points</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Delayed responses from front desk led to lost appointments</li>
                    <li>• Static booking links couldn't answer specific patient questions</li>
                    <li>• Staff became overwhelmed by fragmented calls, texts, and DMs</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-xl font-semibold mb-4 text-blue-700">Solution</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Launched custom AI chat agent trained on The Joint's knowledge base</li>
                    <li>• Replaced static booking links with interactive conversations</li>
                    <li>• Integrated into Facebook & Instagram for auto-booking</li>
                    <li>• Seamlessly synced with calendar & CRM systems</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="text-xl font-semibold mb-4 text-green-700">Results</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• <strong className="text-green-800">Up to 440% ROI</strong> from chatbot-driven bookings</li>
                    <li>• <strong className="text-green-800">Zero missed leads</strong> with 24/7 instant response</li>
                    <li>• <strong className="text-green-800">45% booking rate</strong> from conversational interactions</li>
                    <li>• <strong className="text-green-800">2,000+ patient questions</strong> answered automatically each month</li>
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
            Pricing Plans for <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Franchisees</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-300 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Starter Plan</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">$399</div>
                <div className="text-gray-600 mb-6">per month</div>
                <p className="text-sm text-gray-600 mb-6">For businesses starting with AI chat agents</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">Up to 300 conversations/month</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">Website Widget + Link to AI chat agent</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Get Started</Button>
              </div>
            </div>
            <div className="bg-white border-2 border-purple-600 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Professional Plan</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">$599</div>
                <div className="text-gray-600 mb-6">per month</div>
                <p className="text-sm text-gray-600 mb-6">Everything in starter +</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">Up to 2,000 conversations/month</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">Social platform integrations</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">Internal Insight Dashboard</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Get Started</Button>
              </div>
            </div>
            <div className="bg-white border border-slate-300 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Complete AI Suite</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">$879</div>
                <div className="text-gray-600 mb-6">per month</div>
                <p className="text-sm text-gray-600 mb-6">Everything in professional +</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">Unlimited AI chat agent conversations</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">2,700 voice minutes/month</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Get Started</Button>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-700 mt-8 font-medium">
            <span className="text-green-600">✓</span> No setup fees | <span className="text-green-600">✓</span> No contracts | <span className="text-green-600">✓</span> Cancel anytime
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