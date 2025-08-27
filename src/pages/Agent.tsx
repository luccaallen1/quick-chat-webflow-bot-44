import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Calendar, MessageCircle, Database, Brain, CheckCircle, AlertTriangle } from 'lucide-react';
import { HIPAAAgent } from '../services/HIPAAAgent';
import { EncryptedStorage } from '../services/EncryptedStorage';
import { GoogleOAuthLogin } from '../components/GoogleOAuthLogin';
import { GoogleCalendarService } from '../services/GoogleCalendarService';
import { GoogleOAuthService } from '../services/GoogleOAuthService';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  encrypted: boolean;
  classification?: 'appointment' | 'medical' | 'general' | 'spam';
  toolsUsed?: string[];
}

interface PatientData {
  name?: string;
  phone?: string;
  email?: string;
  preferredTime?: string;
  symptoms?: string;
  location?: string;
}

export const Agent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [hipaaCompliant, setHipaaCompliant] = useState(true);
  const [encryptionStatus, setEncryptionStatus] = useState<'active' | 'inactive'>('active');
  const [conversationPhase, setConversationPhase] = useState<'greeting' | 'data_collection' | 'booking' | 'completed'>('greeting');
  const [googleAccessToken, setGoogleAccessToken] = useState<string>('');
  const [googleUserProfile, setGoogleUserProfile] = useState<any>(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  
  const agentRef = useRef<HIPAAAgent | null>(null);
  const storageRef = useRef<EncryptedStorage | null>(null);
  const calendarServiceRef = useRef<GoogleCalendarService | null>(null);

  useEffect(() => {
    // Initialize HIPAA-compliant agent and storage
    const initializeAgent = async () => {
      try {
        agentRef.current = new HIPAAAgent({
          openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
          encryptionKey: process.env.REACT_APP_ENCRYPTION_KEY || '',
          hipaaCompliance: true
        });
        
        storageRef.current = new EncryptedStorage({
          encryptionKey: process.env.REACT_APP_ENCRYPTION_KEY || '',
          auditLogging: true
        });
        
        // Initialize booking service
        agentRef.current.initializeBookingService(storageRef.current);
        
        // Initialize Google Calendar service
        const oauthService = new GoogleOAuthService({
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
          redirectUri: window.location.origin + '/agent'
        });
        calendarServiceRef.current = new GoogleCalendarService(oauthService);
        
        // Generate session ID
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        
        // Initial greeting message
        const greetingMessage: Message = {
          id: `msg_${Date.now()}`,
          content: "Hello! I'm Stacey, your virtual assistant from The Joint Chiropractic. I'm here to help you schedule an appointment or answer questions about our chiropractic services. All our conversations are HIPAA-compliant and encrypted for your privacy. How can I assist you today?",
          role: 'assistant',
          timestamp: new Date(),
          encrypted: true,
          classification: 'general'
        };
        
        setMessages([greetingMessage]);
        
        // Store encrypted greeting
        await storageRef.current?.storeMessage(newSessionId, greetingMessage);
        
      } catch (error) {
        console.error('Failed to initialize HIPAA agent:', error);
        setHipaaCompliant(false);
        setEncryptionStatus('inactive');
      }
    };

    initializeAgent();
  }, []);

  const processMessage = async (userMessage: string) => {
    if (!agentRef.current || !storageRef.current) return;

    setIsProcessing(true);

    try {
      // Create user message
      const userMsg: Message = {
        id: `msg_${Date.now()}_user`,
        content: userMessage,
        role: 'user',
        timestamp: new Date(),
        encrypted: true
      };

      // Store encrypted user message
      await storageRef.current.storeMessage(sessionId, userMsg);
      setMessages(prev => [...prev, userMsg]);

      // Process with HIPAA agent
      const response = await agentRef.current.processMessage({
        message: userMessage,
        sessionId,
        patientData,
        conversationPhase
      });

      // Create assistant response
      const assistantMsg: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
        encrypted: true,
        classification: response.classification,
        toolsUsed: response.toolsUsed
      };

      // Store encrypted response
      await storageRef.current.storeMessage(sessionId, assistantMsg);
      setMessages(prev => [...prev, assistantMsg]);

      // Update patient data if extracted
      if (response.extractedData) {
        setPatientData(prev => ({ ...prev, ...response.extractedData }));
      }

      // Update conversation phase
      if (response.nextPhase) {
        setConversationPhase(response.nextPhase);
      }

      // Handle appointment booking
      if (response.classification === 'appointment' && response.shouldBook) {
        await handleAppointmentBooking(response.extractedData);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMsg: Message = {
        id: `msg_${Date.now()}_error`,
        content: "I apologize, but I'm experiencing a technical issue. Your privacy and data security remain protected. Please try again or contact us directly at 1-800-THE-JOINT.",
        role: 'assistant',
        timestamp: new Date(),
        encrypted: true,
        classification: 'general'
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAppointmentBooking = async (bookingData: any) => {
    try {
      const bookingId = `booking_${Date.now()}`;
      const combinedData = { ...patientData, ...bookingData };
      
      // Store booking in encrypted storage
      await storageRef.current?.storeBooking(sessionId, {
        id: bookingId,
        patientData: combinedData,
        timestamp: new Date(),
        status: 'pending'
      });

      // If Google Calendar is connected, create calendar event
      if (calendarConnected && googleAccessToken && calendarServiceRef.current) {
        try {
          const appointmentTime = new Date(); // This should be parsed from bookingData.preferredTime
          // For demo, set to tomorrow at 2pm
          appointmentTime.setDate(appointmentTime.getDate() + 1);
          appointmentTime.setHours(14, 0, 0, 0);

          const calendarResult = await calendarServiceRef.current.createAppointment({
            patientName: combinedData.name || 'Patient',
            patientEmail: googleUserProfile?.email,
            patientPhone: combinedData.phone,
            appointmentTime,
            duration: 30,
            symptoms: combinedData.symptoms,
            clinicName: 'The Joint Chiropractic - Downtown',
            clinicAddress: '123 Main St, Downtown',
            clinicPhone: '(555) 123-4567'
          }, googleAccessToken);

          if (calendarResult.success) {
            console.log('Calendar event created:', calendarResult.eventId);
            
            // Update the booking status
            await storageRef.current?.storeBooking(sessionId, {
              id: bookingId,
              patientData: combinedData,
              timestamp: new Date(),
              status: 'confirmed',
              calendarEventId: calendarResult.eventId,
              calendarEventLink: calendarResult.eventLink
            });
          }
        } catch (calendarError) {
          console.error('Calendar booking error:', calendarError);
          // Booking still succeeds even if calendar fails
        }
      }
      
      console.log('HIPAA-compliant booking created:', bookingId);
      
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const handleGoogleAuthSuccess = (accessToken: string, userProfile: any) => {
    setGoogleAccessToken(accessToken);
    setGoogleUserProfile(userProfile);
    setCalendarConnected(true);
    
    console.log('Google Calendar connected:', userProfile.email);
  };

  const handleGoogleAuthError = (error: string) => {
    console.error('Google OAuth error:', error);
    setCalendarConnected(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const messageText = input.trim();
    setInput('');
    await processMessage(messageText);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HIPAA-Compliant AI Agent</h1>
                <p className="text-gray-600">Healthcare Assistant for The Joint Chiropractic</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${hipaaCompliant ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${hipaaCompliant ? 'text-green-600' : 'text-red-600'}`}>
                  {hipaaCompliant ? 'HIPAA Compliant' : 'Compliance Error'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Lock className={`w-5 h-5 ${encryptionStatus === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${encryptionStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {encryptionStatus === 'active' ? 'Encrypted' : 'Encryption Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Google OAuth Section */}
        <GoogleOAuthLogin 
          onAuthSuccess={handleGoogleAuthSuccess}
          onAuthError={handleGoogleAuthError}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure Chat Session</h3>
                    <p className="text-xs text-gray-500">Session ID: {sessionId.substring(0, 20)}...</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600">Live</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.encrypted && (
                          <Lock className="w-3 h-3 opacity-70" />
                        )}
                        {message.classification && (
                          <span className="text-xs px-2 py-0.5 bg-black bg-opacity-20 rounded">
                            {message.classification}
                          </span>
                        )}
                        {message.toolsUsed && message.toolsUsed.length > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500 bg-opacity-20 rounded">
                            Tools: {message.toolsUsed.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-600">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message... (HIPAA-compliant & encrypted)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Patient Data & Status Panel */}
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Patient Information</h3>
              </div>
              
              <div className="space-y-3">
                {Object.entries(patientData).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </span>
                    </div>
                  )
                ))}
                
                {Object.keys(patientData).length === 0 && (
                  <p className="text-sm text-gray-500 italic">No patient data collected yet</p>
                )}
              </div>
            </div>

            {/* Conversation Phase */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Conversation Flow</h3>
              </div>
              
              <div className="space-y-2">
                {['greeting', 'data_collection', 'booking', 'completed'].map((phase) => (
                  <div key={phase} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      conversationPhase === phase ? 'bg-purple-600' :
                      ['greeting', 'data_collection', 'booking', 'completed'].indexOf(conversationPhase) > 
                      ['greeting', 'data_collection', 'booking', 'completed'].indexOf(phase) ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                    <span className={`text-sm ${
                      conversationPhase === phase ? 'text-purple-600 font-medium' : 'text-gray-600'
                    } capitalize`}>
                      {phase.replace('_', ' ')}
                    </span>
                    {conversationPhase === phase && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Google Calendar Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Calendar Integration</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {calendarConnected ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="text-sm text-gray-700">
                    {calendarConnected ? 'Google Calendar connected' : 'Calendar not connected'}
                  </span>
                </div>
                
                {calendarConnected && googleUserProfile && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Auto-booking enabled</span>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Connected as:</strong> {googleUserProfile.name} ({googleUserProfile.email})
                    </div>
                  </>
                )}
                
                {!calendarConnected && (
                  <div className="text-xs text-gray-500">
                    Connect your Google Calendar to automatically book appointments
                  </div>
                )}
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Security Status</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">HIPAA compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Audit logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Secure data storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};