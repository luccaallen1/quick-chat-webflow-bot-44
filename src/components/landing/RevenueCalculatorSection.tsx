import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator, DollarSign, TrendingUp, Users, Phone, MessageSquare } from 'lucide-react';

export const RevenueCalculatorSection = () => {
  const [monthlyVisitors, setMonthlyVisitors] = useState(10000);
  const [monthlyCalls, setMonthlyCalls] = useState(500); // Phone calls to the clinic
  const [averageOrderValue, setAverageOrderValue] = useState(100);
  const [chatVisitorPercentage, setChatVisitorPercentage] = useState(15); // % of website visitors who use chat

  // Voice (Phone Calls): 50% conversation rate
  const voiceConversions = monthlyCalls * 0.5; // 50% conversation rate for phone calls
  const voiceRevenue = voiceConversions * averageOrderValue;

  // Chat Agent: 30% click rate * 40% book rate = 12% total conversion
  const chatUsers = (monthlyVisitors * chatVisitorPercentage) / 100;
  const chatClicks = chatUsers * 0.3; // 30% click rate
  const chatConversions = chatClicks * 0.4; // 40% book rate from clicks
  const chatRevenue = chatConversions * averageOrderValue;

  // Combined totals
  const totalConversions = voiceConversions + chatConversions;
  const totalRevenue = voiceRevenue + chatRevenue;
  const annualRevenue = totalRevenue * 12;

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Revenue Calculator
            </h2>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See how much additional revenue our AI chatbot could generate for your business
          </p>
        </div>

        {/* Business Inputs */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Your Business Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Monthly Visitors */}
            <div className="space-y-4">
              <Label htmlFor="visitors" className="text-lg font-semibold">
                Monthly Website Visitors
              </Label>
              <Input
                id="visitors"
                type="number"
                value={monthlyVisitors}
                onChange={(e) => setMonthlyVisitors(parseInt(e.target.value) || 0)}
                className="text-lg p-4"
              />
            </div>

            {/* Monthly Phone Calls */}
            <div className="space-y-4">
              <Label htmlFor="calls" className="text-lg font-semibold">
                Monthly Phone Calls
              </Label>
              <Input
                id="calls"
                type="number"
                value={monthlyCalls}
                onChange={(e) => setMonthlyCalls(parseInt(e.target.value) || 0)}
                className="text-lg p-4"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Calls received at the clinic
              </p>
            </div>

            {/* Average Order Value */}
            <div className="space-y-4">
              <Label htmlFor="aov" className="text-lg font-semibold">
                Average Order Value ($)
              </Label>
              <Input
                id="aov"
                type="number"
                value={averageOrderValue}
                onChange={(e) => setAverageOrderValue(parseInt(e.target.value) || 0)}
                className="text-lg p-4"
              />
            </div>

            {/* Chat Usage */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Chat Users</Label>
                <span className="text-lg font-bold text-blue-600">{chatVisitorPercentage}%</span>
              </div>
              <Slider
                value={[chatVisitorPercentage]}
                onValueChange={(value) => setChatVisitorPercentage(value[0])}
                max={30}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                % of website visitors who use chat
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Side by Side Agent Results */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Voice Agent */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Phone className="h-6 w-6" />
                Phone Call Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">50%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Phone calls to bookings</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-purple-600 dark:text-purple-400">Monthly Phone Calls:</span>
                  <span className="font-bold text-lg">{Math.round(monthlyCalls).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-600 dark:text-purple-400">Phone Conversions:</span>
                  <span className="font-bold text-lg">{Math.round(voiceConversions).toLocaleString()}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">Monthly Revenue:</span>
                    <span className="font-bold text-2xl text-purple-700 dark:text-purple-300">
                      ${Math.round(voiceRevenue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Agent */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Chat Agent Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Click Rate</p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">30%</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Book Rate</p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">40%</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 dark:text-blue-400">Monthly Chat Users:</span>
                  <span className="font-bold text-lg">{Math.round(chatUsers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 dark:text-blue-400">Chat Clicks:</span>
                  <span className="font-bold text-lg">{Math.round(chatClicks).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 dark:text-blue-400">Chat Conversions:</span>
                  <span className="font-bold text-lg">{Math.round(chatConversions).toLocaleString()}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Monthly Revenue:</span>
                    <span className="font-bold text-2xl text-blue-700 dark:text-blue-300">
                      ${Math.round(chatRevenue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Combined Totals */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-3xl text-green-700 dark:text-green-300 flex items-center gap-3 justify-center">
              <DollarSign className="h-8 w-8" />
              Combined Revenue Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">Total Monthly Conversions</p>
                <p className="text-4xl font-bold text-green-700 dark:text-green-300">
                  {Math.round(totalConversions).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">Total Monthly Revenue</p>
                <p className="text-5xl font-bold text-green-700 dark:text-green-300">
                  ${Math.round(totalRevenue).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">Total Annual Revenue</p>
                <p className="text-4xl font-bold text-green-700 dark:text-green-300">
                  ${Math.round(annualRevenue).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-xl">
              <p className="text-green-800 dark:text-green-200 font-semibold text-lg">
                🚀 Combined AI agents could generate <span className="text-2xl">${Math.round(annualRevenue).toLocaleString()}</span> in additional annual revenue
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};