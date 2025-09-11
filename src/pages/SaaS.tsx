import React, { useState, useEffect } from 'react';
import { EmbeddedChatbot } from '@/components/EmbeddedChatbot';
import { AuthModal } from '@/components/Auth/AuthModal';
import { GoogleCalendarConnection } from '@/components/GoogleCalendarConnection';
import { UnifiedIntegrations } from '@/components/UnifiedIntegrations';
import DeepgramVoiceAgent from '@/components/DeepgramVoiceAgent';
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
  const [activeTab, setActiveTab] = useState('configuration');
  
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

  const handleSaveCurrentConfiguration = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);
      
      if (activeConfigId && activeConfigId !== 'default') {
        // Update existing configuration
        const existingConfig = savedConfigurations.find(c => c.id === activeConfigId);
        if (existingConfig) {
          await configService.updateConfiguration(activeConfigId, botConfig);
          // Update the local state
          setSavedConfigurations(prev => 
            prev.map(c => c.id === activeConfigId 
              ? { ...c, ...configService.botToDatabase(botConfig, existingConfig.name), updatedAt: new Date().toISOString() }
              : c
            )
          );
          alert('Configuration updated successfully!');
        }
      } else {
        // Save as new configuration with auto-generated name
        const defaultName = botConfig.clinicName || `Configuration ${savedConfigurations.length + 1}`;
        const newConfig = await configService.saveConfiguration(botConfig, defaultName);
        setSavedConfigurations(prev => [...prev, newConfig]);
        setActiveConfigId(newConfig.id);
        alert(`Configuration saved as "${defaultName}"!`);
      }
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


      {/* Main Content Section */}
      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Configuration Management */}
          {savedConfigurations.length > 0 && (
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => user ? handleSaveCurrentConfiguration() : setShowAuthModal(true)}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {user ? 'Save' : 'Sign In to Save'}
                  </button>
                  {activeConfigId && (
                    <button
                      onClick={() => deleteConfiguration(activeConfigId)}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-t-lg shadow-sm">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('configuration')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'configuration'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Business Configuration
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'integrations'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Integrations
              </button>
              <button
                onClick={() => setActiveTab('chatbot')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'chatbot'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Chatbot Preview
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'voice'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                🎤 Voice AI
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-lg shadow-sm p-6">
            
            {/* Business Configuration Tab */}
            {activeTab === 'configuration' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h5>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                      <input
                        type="text"
                        value={botConfig.clinicName}
                        onChange={(e) => handleConfigChange('clinicName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your Business Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business ID</label>
                      <input
                        type="text"
                        value={botConfig.clinicId}
                        onChange={(e) => handleConfigChange('clinicId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Unique business identifier"
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
                        placeholder="contact@yourbusiness.com"
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

                  {/* Location & Services */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 border-b pb-2">Location & Services</h5>
                    
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
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4 pt-6 border-t">
                  <h5 className="font-semibold text-gray-900">Advanced Settings</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Booking Link</label>
                      <input
                        type="url"
                        value={botConfig.bookingLink}
                        onChange={(e) => handleConfigChange('bookingLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://calendly.com/yourname"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Booking Workflow ID</label>
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

                {/* Configuration Status */}
                <div className="text-center pt-4 border-t">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
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
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Integrations</h3>
                  <p className="text-gray-600">Connect external services for {botConfig.clinicName || 'your business'}</p>
                </div>
                
                <UnifiedIntegrations 
                  configurationId={activeConfigId}
                />
              </div>
            )}

            {/* Chatbot Preview Tab */}
            {activeTab === 'chatbot' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chatbot Preview</h3>
                  <p className="text-gray-600">
                    {isConfigComplete() 
                      ? `Test your AI assistant for ${botConfig.clinicName}`
                      : 'Complete the configuration to see your personalized chatbot'}
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <div className="bg-gray-900 rounded-t-3xl p-2">
                      <div className="bg-black rounded-3xl p-1">
                        <div className="bg-white rounded-3xl overflow-hidden" style={{ height: '600px' }}>
                          <EmbeddedChatbot 
                            webhookUrl="https://luccatora.app.n8n.cloud/webhook/webbot-test"
                            title={isConfigComplete() ? `${botConfig.clinicName}` : "Demo"}
                            primaryColor="#2563eb"
                            agentName="Alex"
                            welcomeMessage={isConfigComplete() 
                              ? `👋 Hi! I'm Alex, the AI assistant for ${botConfig.clinicName}. How can I help you today?`
                              : "👋 Hi! I'm Alex. Complete your configuration to see a personalized experience!"
                            }
                            placeholder={isConfigComplete() ? "Ask about appointments, hours..." : "Complete configuration first..."}
                            isVoiceEnabled={true}
                            userId={user?.id}
                            clinicId={botConfig.clinicId}
                            clinicName={botConfig.clinicName}
                            botConfiguration={botConfig}
                            config={{
                              primaryColor: "#2563eb",
                              assistantName: "Alex",
                              welcomeMessage: isConfigComplete() 
                                ? `👋 Hi! I'm Alex, the AI assistant for ${botConfig.clinicName}. How can I help you today?`
                                : "👋 Hi! I'm Alex. Complete your configuration to see a personalized experience!",
                              placeholder: isConfigComplete() ? "Ask about appointments, hours..." : "Complete configuration first...",
                              showVoiceButton: true,
                              enableNotifications: true,
                              position: "embedded"
                            }}
                            customization={{
                              borderRadius: "0px",
                              fontSize: "14px",
                              fontFamily: "Inter, system-ui, sans-serif"
                            }}
                            height="600px"
                            className="rounded-3xl"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-500 mt-4">
                      Mobile phone preview
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Voice AI Tab */}
            {activeTab === 'voice' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Deepgram Voice AI Assistant</h3>
                  <p className="text-gray-600">
                    Experience real-time voice conversations with your AI assistant powered by Deepgram
                  </p>
                </div>
                
                <DeepgramVoiceAgent 
                  apiKey="ed3fc0b2215c858ded6af1a2bba90f10cfb4f5cb"
                  onSessionStart={(sessionId) => {
                    console.log('Deepgram voice session started:', sessionId);
                  }}
                  onSessionEnd={() => {
                    console.log('Deepgram voice session ended');
                  }}
                />
              </div>
            )}

          </div>
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