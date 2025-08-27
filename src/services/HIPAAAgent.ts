import OpenAI from 'openai';
import CryptoJS from 'crypto-js';
import HealthcareBooking from './HealthcareBooking';
import { EncryptedStorage } from './EncryptedStorage';

interface AgentConfig {
  openaiApiKey: string;
  encryptionKey: string;
  hipaaCompliance: boolean;
  auditLogging?: boolean;
}

interface MessageRequest {
  message: string;
  sessionId: string;
  patientData?: any;
  conversationPhase: 'greeting' | 'data_collection' | 'booking' | 'completed';
}

interface AgentResponse {
  message: string;
  classification: 'appointment' | 'medical' | 'general' | 'spam';
  extractedData?: any;
  nextPhase?: 'greeting' | 'data_collection' | 'booking' | 'completed';
  shouldBook?: boolean;
  confidence: number;
  toolsUsed?: string[];
}

interface PatientData {
  name?: string;
  phone?: string;
  email?: string;
  preferredTime?: string;
  symptoms?: string;
  location?: string;
  language?: string;
}

export class HIPAAAgent {
  private openai: OpenAI;
  private encryptionKey: string;
  private hipaaCompliant: boolean;
  private auditLog: any[] = [];
  private bookingService: HealthcareBooking | null = null;

  constructor(config: AgentConfig) {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
      dangerouslyAllowBrowser: true // Only for demo - use backend in production
    });
    this.encryptionKey = config.encryptionKey;
    this.hipaaCompliant = config.hipaaCompliance;
  }

  initializeBookingService(storage: EncryptedStorage): void {
    this.bookingService = new HealthcareBooking(storage);
  }

  async processMessage(request: MessageRequest): Promise<AgentResponse> {
    try {
      // Log audit trail
      this.logAuditEvent('message_received', {
        sessionId: request.sessionId,
        timestamp: new Date(),
        messageLength: request.message.length,
        phase: request.conversationPhase
      });

      // Use GPT-4o with function calling for intelligent processing
      const response = await this.processWithGPT4o(request);
      
      this.logAuditEvent('message_processed', {
        sessionId: request.sessionId,
        classification: response.classification,
        nextPhase: response.nextPhase,
        dataExtracted: Object.keys(response.extractedData || {}).length > 0,
        toolsUsed: response.toolsUsed || []
      });

      return response;

    } catch (error) {
      console.error('HIPAAAgent processing error:', error);
      
      return {
        message: "I apologize, but I'm experiencing a technical issue. Your privacy and data remain secure. Please try again or contact The Joint Chiropractic directly at 1-800-THE-JOINT.",
        classification: 'general',
        confidence: 0.0
      };
    }
  }

  private async processWithGPT4o(request: MessageRequest): Promise<AgentResponse> {
    const tools = this.getAvailableTools();
    const systemPrompt = this.getSystemPrompt(request);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Using GPT-4o as requested
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.message }
        ],
        tools,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 500
      });

      const message = response.choices[0]?.message;
      let finalResponse = message?.content || "I'm here to help you with scheduling an appointment at The Joint Chiropractic. How can I assist you today?";
      let extractedData = {};
      let classification: 'appointment' | 'medical' | 'general' | 'spam' = 'general';
      let shouldBook = false;
      const toolsUsed: string[] = [];

      // Process tool calls if any
      if (message?.tool_calls && message.tool_calls.length > 0) {
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          
          toolsUsed.push(toolName);
          
          console.log(`[HIPAA-AGENT] Using tool: ${toolName}`, toolArgs);
          
          switch (toolName) {
            case 'extract_patient_data':
              extractedData = await this.executeExtractPatientData(toolArgs, request.patientData);
              break;
              
            case 'classify_message_intent':
              classification = await this.executeClassifyMessage(toolArgs);
              break;
              
            case 'book_appointment':
              if (this.bookingService) {
                const bookingResult = await this.bookingService.bookAppointment({
                  patientName: toolArgs.name,
                  phone: toolArgs.phone,
                  email: toolArgs.email,
                  preferredTime: toolArgs.preferredTime,
                  symptoms: toolArgs.symptoms,
                  location: toolArgs.location,
                  language: toolArgs.language
                });
                
                if (bookingResult.success) {
                  finalResponse = bookingResult.message;
                  shouldBook = true;
                } else {
                  finalResponse = bookingResult.message;
                }
              }
              break;
              
            case 'get_clinic_availability':
              const availability = await this.executeGetClinicAvailability(toolArgs);
              finalResponse += `\n\nAvailable times: ${availability.join(', ')}`;
              break;
          }
        }
      }

      // Determine next phase
      const nextPhase = this.determineNextPhase(request.conversationPhase, classification, extractedData);

      return {
        message: finalResponse,
        classification,
        extractedData,
        nextPhase,
        shouldBook,
        confidence: 0.9,
        toolsUsed
      };

    } catch (error) {
      console.error('GPT-4o processing error:', error);
      throw error;
    }
  }

  private getSystemPrompt(request: MessageRequest): string {
    return `You are Stacey, a HIPAA-compliant virtual assistant for The Joint Chiropractic. You help patients schedule appointments and answer questions about chiropractic services.

IMPORTANT GUIDELINES:
- Always maintain HIPAA compliance - never store or transmit sensitive medical information insecurely
- Be professional, empathetic, and helpful
- Focus on scheduling appointments and general service information
- Don't provide medical advice or diagnose conditions
- If medical questions arise, refer to licensed chiropractors
- Keep responses concise but informative
- Ask for necessary information step by step

Current conversation phase: ${request.conversationPhase}
Patient data collected so far: ${JSON.stringify(request.patientData || {})}

AVAILABLE TOOLS:
- extract_patient_data: Extract patient information from messages
- classify_message_intent: Classify the intent of user messages
- book_appointment: Book appointments when all required data is collected
- get_clinic_availability: Check available time slots

Use the appropriate tools to help process the user's request effectively while maintaining HIPAA compliance.`;
  }

  private getAvailableTools() {
    return [
      {
        type: 'function' as const,
        function: {
          name: 'extract_patient_data',
          description: 'Extract patient information from the user message',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Patient full name' },
              phone: { type: 'string', description: 'Phone number' },
              email: { type: 'string', description: 'Email address' },
              preferredTime: { type: 'string', description: 'Preferred appointment time/date' },
              symptoms: { type: 'string', description: 'Pain or symptoms mentioned' },
              location: { type: 'string', description: 'Preferred clinic location' },
              language: { type: 'string', description: 'Preferred language' }
            },
            required: []
          }
        }
      },
      {
        type: 'function' as const,
        function: {
          name: 'classify_message_intent',
          description: 'Classify the intent of the user message',
          parameters: {
            type: 'object',
            properties: {
              intent: { 
                type: 'string', 
                enum: ['appointment', 'medical', 'general', 'spam'],
                description: 'The classified intent of the message'
              },
              confidence: { type: 'number', description: 'Confidence score 0-1' }
            },
            required: ['intent']
          }
        }
      },
      {
        type: 'function' as const,
        function: {
          name: 'book_appointment',
          description: 'Book an appointment when all required information is available',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Patient full name' },
              phone: { type: 'string', description: 'Phone number' },
              email: { type: 'string', description: 'Email address' },
              preferredTime: { type: 'string', description: 'Preferred appointment time' },
              symptoms: { type: 'string', description: 'Symptoms or pain description' },
              location: { type: 'string', description: 'Preferred clinic location' },
              language: { type: 'string', description: 'Preferred language' }
            },
            required: ['name', 'preferredTime']
          }
        }
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_clinic_availability',
          description: 'Get available appointment slots for a specific date',
          parameters: {
            type: 'object',
            properties: {
              date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
              clinicId: { type: 'string', description: 'Clinic ID (optional)' }
            },
            required: ['date']
          }
        }
      }
    ];
  }

  private async executeExtractPatientData(args: any, existingData?: any): Promise<any> {
    // Validate and sanitize extracted data
    return this.validateAndSanitizeData({ ...existingData, ...args });
  }

  private async executeClassifyMessage(args: any): Promise<'appointment' | 'medical' | 'general' | 'spam'> {
    const validIntents = ['appointment', 'medical', 'general', 'spam'];
    if (validIntents.includes(args.intent)) {
      return args.intent as 'appointment' | 'medical' | 'general' | 'spam';
    }
    return 'general';
  }

  private async executeGetClinicAvailability(args: any): Promise<string[]> {
    if (this.bookingService) {
      const date = new Date(args.date);
      return await this.bookingService.getClinicAvailability(args.clinicId || 'clinic_001', date);
    }
    return ['9:00 AM', '2:00 PM', '5:00 PM']; // Default availability
  }

  private async classifyMessage(message: string): Promise<'appointment' | 'medical' | 'general' | 'spam'> {
    try {
      const prompt = `
Classify this message into one of these categories: appointment, medical, general, or spam.

Message: "${message}"

Classification rules:
- appointment: mentions scheduling, booking, appointment times, availability
- medical: discusses symptoms, pain, treatment, health conditions
- general: general questions about services, locations, hours, pricing
- spam: irrelevant, promotional, or potentially harmful content

Respond with only the classification word.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1
      });

      const classification = response.choices[0]?.message?.content?.toLowerCase().trim();
      
      if (['appointment', 'medical', 'general', 'spam'].includes(classification || '')) {
        return classification as 'appointment' | 'medical' | 'general' | 'spam';
      }
      
      return 'general';
    } catch (error) {
      console.error('Classification error:', error);
      return 'general';
    }
  }

  private async extractPatientData(message: string, existingData?: PatientData): Promise<PatientData> {
    try {
      const prompt = `
Extract patient information from this message and return as JSON. Only include information that is explicitly mentioned.

Existing data: ${JSON.stringify(existingData || {})}
New message: "${message}"

Extract these fields if mentioned:
- name (full name)
- phone (phone number)
- email (email address)
- preferredTime (preferred appointment time/date)
- symptoms (pain or symptoms mentioned)
- location (clinic location or area preference)
- language (if they specify a preferred language)

Return only JSON with the extracted fields, or empty object if nothing found.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const extracted = JSON.parse(content);
          
          // Validate extracted data for HIPAA compliance
          return this.validateAndSanitizeData(extracted);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return {};
        }
      }
      
      return {};
    } catch (error) {
      console.error('Data extraction error:', error);
      return {};
    }
  }

  private async generateContextualResponse(
    request: MessageRequest, 
    classification: string, 
    extractedData: PatientData
  ): Promise<string> {
    try {
      const systemPrompt = `
You are Stacey, a HIPAA-compliant virtual assistant for The Joint Chiropractic. You help patients schedule appointments and answer questions about chiropractic services.

IMPORTANT GUIDELINES:
- Always maintain HIPAA compliance - never store or transmit sensitive medical information insecurely
- Be professional, empathetic, and helpful
- Focus on scheduling appointments and general service information
- Don't provide medical advice or diagnose conditions
- If medical questions arise, refer to licensed chiropractors
- Keep responses concise but informative
- Ask for necessary information step by step

Current conversation phase: ${request.conversationPhase}
Message classification: ${classification}
Patient data collected: ${JSON.stringify(request.patientData || {})}
New data extracted: ${JSON.stringify(extractedData)}

Respond naturally and helpfully to continue the conversation toward scheduling an appointment.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.message }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || 
        "Thank you for contacting The Joint Chiropractic. How can I help you today?";

    } catch (error) {
      console.error('Response generation error:', error);
      return "I'm here to help you with scheduling an appointment at The Joint Chiropractic. What can I assist you with today?";
    }
  }

  private determineNextPhase(
    currentPhase: string, 
    classification: string, 
    extractedData: PatientData
  ): 'greeting' | 'data_collection' | 'booking' | 'completed' {
    
    // Phase progression logic
    switch (currentPhase) {
      case 'greeting':
        if (classification === 'appointment') {
          return 'data_collection';
        }
        return 'greeting';

      case 'data_collection':
        const hasRequiredData = extractedData.name && (extractedData.phone || extractedData.email);
        if (hasRequiredData && extractedData.preferredTime) {
          return 'booking';
        }
        return 'data_collection';

      case 'booking':
        return 'completed';

      default:
        return currentPhase as any;
    }
  }

  private shouldInitiateBooking(classification: string, extractedData: PatientData): boolean {
    return classification === 'appointment' && 
           !!(extractedData.name && (extractedData.phone || extractedData.email) && extractedData.preferredTime);
  }

  private validateAndSanitizeData(data: any): PatientData {
    const sanitized: PatientData = {};

    // Validate and sanitize each field
    if (data.name && typeof data.name === 'string' && data.name.length < 100) {
      sanitized.name = data.name.replace(/[<>]/g, ''); // Basic XSS prevention
    }

    if (data.phone && typeof data.phone === 'string') {
      // Basic phone validation
      const phoneRegex = /[\d\s\-\(\)\+]/;
      if (phoneRegex.test(data.phone) && data.phone.length < 20) {
        sanitized.phone = data.phone.replace(/[<>]/g, '');
      }
    }

    if (data.email && typeof data.email === 'string') {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(data.email) && data.email.length < 100) {
        sanitized.email = data.email.toLowerCase().replace(/[<>]/g, '');
      }
    }

    if (data.preferredTime && typeof data.preferredTime === 'string' && data.preferredTime.length < 200) {
      sanitized.preferredTime = data.preferredTime.replace(/[<>]/g, '');
    }

    if (data.symptoms && typeof data.symptoms === 'string' && data.symptoms.length < 500) {
      sanitized.symptoms = data.symptoms.replace(/[<>]/g, '');
    }

    if (data.location && typeof data.location === 'string' && data.location.length < 100) {
      sanitized.location = data.location.replace(/[<>]/g, '');
    }

    if (data.language && typeof data.language === 'string' && data.language.length < 50) {
      sanitized.language = data.language.replace(/[<>]/g, '');
    }

    return sanitized;
  }

  private logAuditEvent(event: string, data: any): void {
    if (this.hipaaCompliant) {
      const auditEntry = {
        timestamp: new Date(),
        event,
        data: this.encryptData(JSON.stringify(data)),
        sessionHash: this.hashSessionId(data.sessionId)
      };
      
      this.auditLog.push(auditEntry);
      
      // In production, this would be sent to secure audit logging system
      console.log('[AUDIT]', event, auditEntry.timestamp);
    }
  }

  private encryptData(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return '[ENCRYPTION_FAILED]';
    }
  }

  private decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return '[DECRYPTION_FAILED]';
    }
  }

  private hashSessionId(sessionId: string): string {
    return CryptoJS.SHA256(sessionId + this.encryptionKey).toString();
  }

  getAuditLog(): any[] {
    return this.auditLog.map(entry => ({
      ...entry,
      data: '[ENCRYPTED]' // Don't expose encrypted data in logs
    }));
  }
}

export default HIPAAAgent;