import React from 'react';

// Types
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  showSuggestions?: boolean;
}

export interface WelcomeButton {
  id: string;
  text: string;
  message: string;
  icon?: string;
}

// Helper Functions
export const renderTextWithLineBreaks = (text: string) => {
  return text.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </span>
  ));
};

export const generateSessionId = () => {
  if (typeof window !== 'undefined') {
    try {
      return crypto.randomUUID();
    } catch {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return generateSessionId();
  let sessionId = sessionStorage.getItem('chatbot-session-id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('chatbot-session-id', sessionId);
  }
  return sessionId;
};

export const getHoverColor = (color: string) => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = Math.max(0, (num >> 16) - 20);
    const g = Math.max(0, (num >> 8 & 0x00FF) - 20);
    const b = Math.max(0, (num & 0x0000FF) - 20);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }
  return color;
};

// Error logging
export const logError = async (errorData: {
  from: 'webhook' | 'UI' | 'initialization';
  errorCode: number;
  errorMessage: string;
  errorStack: string;
  payloadToWebHook: any;
  initializationUrl: string;
}) => {
  try {
    await fetch('https://luccatora.app.n8n.cloud/webhook/webbot-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...errorData,
        timestamp: new Date().toISOString()
      })
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
};