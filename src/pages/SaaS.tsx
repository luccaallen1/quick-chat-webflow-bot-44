import React, { useState, useEffect } from 'react';
import { EmbeddedChatbot } from '@/components/EmbeddedChatbot';
import { AuthModal } from '@/components/Auth/AuthModal';
import { GoogleCalendarConnection } from '@/components/GoogleCalendarConnection';
import { useAuth } from '@/contexts/AuthContext';
import { BotConfiguration } from '@/types/botConfiguration';
import { configService, DatabaseBotConfiguration } from '@/services/configService';

const SaaS = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [showConfig, setShowConfig] = useState(false);
  const [savedConfigurations, setSavedConfigurations] = useState<DatabaseBotConfiguration[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string>('default');
  const [newConfigName, setNewConfigName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  
  const defaultConfig: BotConfiguration = {
    clinicId: '104',
    clinicName: 'Test',
    phoneNumber: '(256) 935-1911',
    operationHours: 'Monday - Friday: 10:00 AM - 2:00 PM, 2:45 PM - 7:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
    micrositeUrl: 'https://www.thejoint.com/alabama/gadsden/gadsden-22018',
    address: '510 E Meighan Blvd a10, Gadsden, AL 35903',
    addressDescription: 'The Joint Chiropractic Gadsden, AL is located in the River Trace Shopping center near Ross and Hobby Lobby.',
    state: 'AL',
    timeZone: 'America/Chicago',
    timeZoneOffset: '-5:00:00',
    bookingLink: 'https://calendly.com/jointgadsden/29-visit',
    availableTimeSlots: 'MONDAY-FRIDAY:\n- 10:00 AM\n- 10:30 AM\n- 11:00 AM\n- 11:30 AM\n- 12:00 PM\n- 12:30 PM\n- 1:00 PM\n- 3:00 PM\n- 3:30 PM\n- 4:00 PM\n- 4:30 PM\n- 5:00 PM\n- 5:30 PM\n- 6:00 PM\n\nSATURDAY:\n- 10:00 AM\n- 10:30 AM\n- 11:00 AM\n- 11:30 AM\n- 12:00 PM\n- 12:30 PM\n- 1:00 PM\n- 1:30 PM\n- 2:00 PM\n- 2:30 PM\n\nSUNDAY: Closed',
    timeIntervals: '30 minutes',
    wellnessPlanPrices: 'We offer a few options for affordable chiropractic care: • Monthly Wellness Plans: Up to 4 visits a month. Adult: $79/month, Military: $69/month, Youth: $49/month (each additional visit/single visit outside plan costs $10). New Patients are only $29 ($19 for military). Please let me know if you would like to find some time to visit us?',
    calendarId: 'c_5a963fc85f0485acb606fcf7ee902cbaf87c7f0c1e4cb36e6ef2e69769445f0c@group.calendar.google.com',
    bookingCalendarId: 'clinic22018@thejoint.com',
    clinicEmail: 'clinic22018@thejoint.com',
    baseId: 'app6JxlYdsejioVHm',
    tableId: 'tbloHNOhXs6H2TVi2',
    bookingWorkflow: 'pRHkQxSZqNUAO5au',
    planPrice: '$29'
  };

  const [botConfig, setBotConfig] = useState<BotConfiguration>(defaultConfig);

  // Load saved configurations when user is authenticated
  useEffect(() => {
    const loadConfigurations = async () => {
      if (user && !authLoading) {
        try {
          setLoading(true);
          const configs = await configService.getUserConfigurations();
          setSavedConfigurations(configs);
        } catch (error) {
          console.error('Error loading configurations:', error);
        } finally {
          setLoading(false);
        }
      } else if (!user && !authLoading) {
        // User not authenticated, clear saved configurations
        setSavedConfigurations([]);
        setActiveConfigId('default');
      }
    };

    loadConfigurations();
  }, [user, authLoading]);

  const handleConfigChange = (field: keyof BotConfiguration, value: string) => {
    setBotConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveConfiguration = async (name: string) => {
    if (!name.trim()) {
      alert('Please enter a name for this configuration');
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);
      const newConfig = await configService.saveConfiguration(botConfig, name);
      setSavedConfigurations(prev => [...prev, newConfig]);
      setActiveConfigId(newConfig.id);
      alert(`Configuration "${name}" saved successfully!`);
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguration = (configId: string) => {
    if (configId === 'default') {
      setBotConfig(defaultConfig);
      setActiveConfigId('default');
    } else {
      const config = savedConfigurations.find(c => c.id === configId);
      if (config) {
        const botConfig = configService.databaseToBot(config);
        setBotConfig(botConfig);
        setActiveConfigId(configId);
      }
    }
  };

  const deleteConfiguration = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      setLoading(true);
      await configService.deleteConfiguration(configId);
      setSavedConfigurations(prev => prev.filter(c => c.id !== configId));
      
      if (activeConfigId === configId) {
        loadConfiguration('default');
      }
      
      alert('Configuration deleted successfully');
    } catch (error) {
      console.error('Error deleting configuration:', error);
      alert('Failed to delete configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentConfigName = () => {
    if (activeConfigId === 'default') {
      return 'Default (The Joint Chiropractic)';
    }
    const config = savedConfigurations.find(c => c.id === activeConfigId);
    return config ? config.name : 'Unknown Configuration';
  };

  const handleSaveConfiguration = () => {
    if (!newConfigName.trim()) return;
    
    saveConfiguration(newConfigName.trim());
    setShowSaveDialog(false);
    setNewConfigName('');
  };

  const timezones = [
    { name: 'Eastern Time (ET)', value: 'America/New_York', offset: '-5:00' },
    { name: 'Central Time (CT)', value: 'America/Chicago', offset: '-6:00' },
    { name: 'Mountain Time (MT)', value: 'America/Denver', offset: '-7:00' },
    { name: 'Pacific Time (PT)', value: 'America/Los_Angeles', offset: '-8:00' },
    { name: 'Alaska Time (AKT)', value: 'America/Anchorage', offset: '-9:00' },
    { name: 'Hawaii Time (HST)', value: 'Pacific/Honolulu', offset: '-10:00' },
    { name: 'Atlantic Time (AT)', value: 'America/Halifax', offset: '-4:00' },
    { name: 'Arizona Time (MST)', value: 'America/Phoenix', offset: '-7:00' },
  ];

  const handleTimezoneChange = (timezone: string) => {
    const selectedTz = timezones.find(tz => tz.value === timezone);
    if (selectedTz) {
      setBotConfig(prev => ({
        ...prev,
        timeZone: selectedTz.value,
        timeZoneOffset: selectedTz.offset
      }));
    }
  };

  const isConfigComplete = () => {
    const requiredFields = ['clinicName', 'phoneNumber', 'address', 'clinicEmail'];
    return requiredFields.every(field => botConfig[field as keyof BotConfiguration].trim() !== '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">💬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ChatBot SaaS</h1>
                <p className="text-sm text-gray-600">Intelligent conversational AI for your business</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#demo" className="text-gray-600 hover:text-blue-600 transition-colors">Demo</a>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.user_metadata?.full_name || user.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Customer Experience with
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI Chat</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Deploy intelligent chatbots that understand your customers, automate support, and drive conversions 24/7. 
            No coding required - just smart conversations.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
              Start Free Trial
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features for Modern Businesses</h3>
            <p className="text-lg text-gray-600">Everything you need to build amazing customer experiences</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Conversations</h4>
              <p className="text-gray-600">Advanced NLP understands customer intent and provides accurate, helpful responses instantly.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Instant Deployment</h4>
              <p className="text-gray-600">Get your chatbot live in minutes with our simple embed code. No technical expertise required.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Analytics & Insights</h4>
              <p className="text-gray-600">Track conversations, measure performance, and optimize your bot with detailed analytics.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Easy Customization</h4>
              <p className="text-gray-600">Match your brand with custom colors, logos, and conversation flows that fit your business.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Seamless Integrations</h4>
              <p className="text-gray-600">Connect with CRM, email marketing, calendars, and 100+ other tools you already use.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h4>
              <p className="text-gray-600">Bank-level encryption, GDPR compliance, and SOC 2 certified infrastructure you can trust.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h3>
            <p className="text-lg text-gray-600">Try our chatbot right here on this page! Click the chat bubble in the bottom right corner.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-sm text-gray-600 text-center">
                Your Website
              </div>
            </div>
            
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h4 className="text-xl font-semibold text-gray-700 mb-2">Your Website Content Goes Here</h4>
              <p className="text-gray-500">The chatbot appears as a floating widget that doesn't interfere with your existing design.</p>
              <div className="mt-6 text-sm text-blue-600 font-medium">
                👉 Look for the chat bubble in the bottom right corner!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h3>
            <p className="text-lg text-gray-600">Choose the plan that fits your business needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Starter</h4>
              <div className="text-3xl font-bold text-blue-600 mb-4">$29<span className="text-sm text-gray-500">/month</span></div>
              <ul className="text-left space-y-2 text-gray-600 mb-6">
                <li>✓ Up to 1,000 conversations/month</li>
                <li>✓ Basic customization</li>
                <li>✓ Email support</li>
                <li>✓ Analytics dashboard</li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Start Free Trial
              </button>
            </div>

            <div className="border-2 border-blue-500 rounded-xl p-6 text-center relative hover:shadow-lg transition-shadow">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                Most Popular
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Professional</h4>
              <div className="text-3xl font-bold text-blue-600 mb-4">$99<span className="text-sm text-gray-500">/month</span></div>
              <ul className="text-left space-y-2 text-gray-600 mb-6">
                <li>✓ Up to 10,000 conversations/month</li>
                <li>✓ Advanced customization</li>
                <li>✓ Priority support</li>
                <li>✓ Advanced analytics</li>
                <li>✓ API access</li>
                <li>✓ Team collaboration</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </button>
            </div>

            <div className="border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h4>
              <div className="text-3xl font-bold text-blue-600 mb-4">Custom</div>
              <ul className="text-left space-y-2 text-gray-600 mb-6">
                <li>✓ Unlimited conversations</li>
                <li>✓ White-label solution</li>
                <li>✓ Dedicated support</li>
                <li>✓ Custom integrations</li>
                <li>✓ SLA guarantee</li>
                <li>✓ On-premise deployment</li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bot Configuration Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Configure Your Bot</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Set up your business information so your AI assistant can provide personalized responses to your customers.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-gray-900">Business Information</h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => user ? setShowSaveDialog(true) : setShowAuthModal(true)}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {user ? 'Save Configuration' : 'Sign In to Save'}
                  </button>
                  <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showConfig ? 'Hide Configuration' : 'Show Configuration'}
                  </button>
                </div>
              </div>

              {/* Configuration Management */}
              {savedConfigurations.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Active Configuration: {getCurrentConfigName()}
                      </label>
                      <select
                        value={activeConfigId || ''}
                        onChange={(e) => {
                          const configId = e.target.value;
                          if (configId) {
                            loadConfiguration(configId);
                          } else {
                            setActiveConfigId(null);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Default Configuration</option>
                        {savedConfigurations.map((config) => (
                          <option key={config.id} value={config.id}>
                            {config.name} (saved {new Date(config.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    {activeConfigId && (
                      <button
                        onClick={() => deleteConfiguration(activeConfigId)}
                        className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}

              {showConfig && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900 border-b pb-2">Basic Information</h5>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
                      <input
                        type="text"
                        value={botConfig.clinicName}
                        onChange={(e) => handleConfigChange('clinicName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your Business Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clinic ID</label>
                      <input
                        type="text"
                        value={botConfig.clinicId}
                        onChange={(e) => handleConfigChange('clinicId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Unique clinic identifier"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="text"
                        value={botConfig.phoneNumber}
                        onChange={(e) => handleConfigChange('phoneNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={botConfig.clinicEmail}
                        onChange={(e) => handleConfigChange('clinicEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="contact@yourclilnic.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Operation Hours</label>
                      <textarea
                        value={botConfig.operationHours}
                        onChange={(e) => handleConfigChange('operationHours', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                      />
                    </div>
                  </div>

                  {/* Location & Booking */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900 border-b pb-2">Location & Booking</h5>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        type="text"
                        value={botConfig.address}
                        onChange={(e) => handleConfigChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Main St, City, State 12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Description</label>
                      <input
                        type="text"
                        value={botConfig.addressDescription}
                        onChange={(e) => handleConfigChange('addressDescription', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Near shopping mall, second floor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={botConfig.state}
                        onChange={(e) => handleConfigChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="California"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                      <select
                        value={botConfig.timeZone}
                        onChange={(e) => handleTimezoneChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select timezone...</option>
                        {timezones.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.name} (UTC{tz.offset})
                          </option>
                        ))}
                      </select>
                    </div>

                    {botConfig.timeZone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">TZ Offset</label>
                        <input
                          type="text"
                          value={botConfig.timeZoneOffset}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                          placeholder="Auto-filled"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Booking Link</label>
                      <input
                        type="url"
                        value={botConfig.bookingLink}
                        onChange={(e) => handleConfigChange('bookingLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://calendly.com/yourname"
                      />
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="md:col-span-2 space-y-4">
                    <h5 className="font-medium text-gray-900 border-b pb-2">Advanced Settings</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Time Slots</label>
                        <input
                          type="text"
                          value={botConfig.availableTimeSlots}
                          onChange={(e) => handleConfigChange('availableTimeSlots', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="9:00 AM - 12:00 PM, 2:00 PM - 6:00 PM"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 9:00 AM - 5:00 PM</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Duration</label>
                        <select
                          value={botConfig.timeIntervals}
                          onChange={(e) => handleConfigChange('timeIntervals', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select duration...</option>
                          <option value="15 minutes">15 minutes</option>
                          <option value="30 minutes">30 minutes</option>
                          <option value="45 minutes">45 minutes</option>
                          <option value="60 minutes">1 hour</option>
                          <option value="90 minutes">1.5 hours</option>
                          <option value="120 minutes">2 hours</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={botConfig.planPrice.replace('$', '')}
                            onChange={(e) => handleConfigChange('planPrice', `$${e.target.value}`)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="99"
                            min="0"
                            step="1"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Starting price for services</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Calendar ID</label>
                        <input
                          type="text"
                          value={botConfig.calendarId}
                          onChange={(e) => handleConfigChange('calendarId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Booking Calendar ID</label>
                        <input
                          type="text"
                          value={botConfig.bookingCalendarId}
                          onChange={(e) => handleConfigChange('bookingCalendarId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="booking@clinic.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base ID</label>
                        <input
                          type="text"
                          value={botConfig.baseId}
                          onChange={(e) => handleConfigChange('baseId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="appABC123"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Table ID</label>
                        <input
                          type="text"
                          value={botConfig.tableId}
                          onChange={(e) => handleConfigChange('tableId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="tblDEF456"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Booking Workflow</label>
                        <input
                          type="text"
                          value={botConfig.bookingWorkflow}
                          onChange={(e) => handleConfigChange('bookingWorkflow', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="workflow_id"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  isConfigComplete() 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isConfigComplete() 
                    ? '✅ Configuration Complete' 
                    : '⚠️ Please fill required fields'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Calendar Integration Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Google Calendar Integration</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect your Google Calendar to enable automatic appointment booking and calendar management through your AI assistant.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <GoogleCalendarConnection onConnectionChange={setGoogleCalendarConnected} />
            
            {googleCalendarConnected && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-green-800">Calendar Integration Active</h4>
                </div>
                <p className="text-green-700 text-sm">
                  Your AI assistant can now help customers book appointments directly to your Google Calendar. 
                  The calendar credentials will be securely sent to n8n for booking operations.
                </p>
              </div>
            )}

            {!googleCalendarConnected && user && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-blue-800">Calendar Integration Available</h4>
                </div>
                <p className="text-blue-700 text-sm mb-3">
                  Connect your Google Calendar to enable appointment booking features in your chatbot.
                </p>
                <div className="text-sm text-blue-600">
                  <strong>Benefits:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Automatic appointment scheduling</li>
                    <li>Real-time availability checking</li>
                    <li>Calendar conflict prevention</li>
                    <li>Email confirmations and reminders</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Live Chat Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Try Your AI Assistant Live</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {isConfigComplete() 
                ? `Experience your personalized AI assistant for ${botConfig.clinicName}. The bot now knows your business information and can provide accurate responses.`
                : 'Complete the configuration above to see your personalized AI assistant. The bot will use your business information to provide accurate responses.'}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <EmbeddedChatbot 
              webhookUrl="https://luccatora.app.n8n.cloud/webhook/webbot-test"
              title={isConfigComplete() ? `${botConfig.clinicName} AI Assistant` : "ChatBot SaaS Demo"}
              primaryColor="#2563eb"
              agentName="Alex"
              welcomeMessage={isConfigComplete() 
                ? `👋 Hi! I'm Alex, the AI assistant for ${botConfig.clinicName}. I can help you with appointments, questions about our services, hours, and location. How can I assist you today?`
                : "👋 Hi! I'm Alex, your AI assistant. I can help you learn about our ChatBot SaaS platform, answer questions about pricing, features, or get you started with a demo. How can I help you today?"
              }
              placeholder={isConfigComplete() ? "Ask about appointments, hours, services..." : "Ask me anything about our chatbot platform..."}
              isVoiceEnabled={true}
              botConfiguration={botConfig}
              config={{
                primaryColor: "#2563eb",
                assistantName: "Alex",
                welcomeMessage: isConfigComplete() 
                  ? `👋 Hi! I'm Alex, the AI assistant for ${botConfig.clinicName}. I can help you with appointments, questions about our services, hours, and location. How can I assist you today?`
                  : "👋 Hi! I'm Alex, your AI assistant. I can help you learn about our ChatBot SaaS platform, answer questions about pricing, features, or get you started with a demo. How can I help you today?",
                placeholder: isConfigComplete() ? "Ask about appointments, hours, services..." : "Ask me anything about our chatbot platform...",
                showVoiceButton: true,
                enableNotifications: true,
                position: "embedded"
              }}
              customization={{
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "Inter, system-ui, sans-serif"
              }}
              height="700px"
              className="shadow-2xl"
            />
          </div>

          <div className="mt-8 text-center">
            <div className="bg-blue-50 rounded-xl p-6 max-w-2xl mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
              <p className="text-blue-800 text-sm">
                This chatbot is powered by the same technology you'll get with our platform. 
                Try asking about "pricing plans", "implementation process", or "custom features" to see how it handles different types of queries!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Customer Experience?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our AI chatbots to automate support and increase conversions.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg">
            Start Your Free Trial Today
          </button>
        </div>
      </section>

      {/* Save Configuration Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save Configuration</h3>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewConfigName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration Name
              </label>
              <input
                type="text"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                placeholder="e.g., Test Clinic, Production Setup"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newConfigName.trim()) {
                    handleSaveConfiguration();
                  }
                }}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewConfigName('');
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfiguration}
                disabled={!newConfigName.trim()}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">💬</span>
              </div>
              <h5 className="text-xl font-bold text-white">ChatBot SaaS</h5>
            </div>
            <p className="text-gray-400 mb-6">Intelligent conversations for modern businesses</p>
            <div className="flex justify-center space-x-8 mb-6">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
            </div>
            <p className="text-gray-500 text-sm">© 2024 ChatBot SaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="signin"
      />

    </div>
  );
};

export default SaaS;