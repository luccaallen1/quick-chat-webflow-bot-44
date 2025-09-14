import { WelcomeButton } from './utils';

export interface ChatbotWidgetProps {
  webhookUrl?: string;
  title?: string;
  bio?: string;
  placeholder?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  secondaryColor?: string;
  chatBackground?: string;
  botTextColor?: string;
  userTextColor?: string;
  headerGradientColor?: string;
  headerMainColor?: string;
  userId?: string;
  clinicName?: string;
  clinicId?: string;
  logoUrl?: string;
  logoFile?: File;
  avatarUrl?: string;
  avatarFile?: File;
  welcomeMessage?: string;
  bubbleMessage?: string;
  welcomeTooltipMessage?: string;
  admin?: boolean;
  isVoiceEnabled?: boolean;
  isElevenLabsEnabled?: boolean;
  elevenLabsAgentId?: string;
  logoBackgroundColor?: string;
  logoBorderColor?: string;
  headerButtonColor?: string;
  fontFamily?: string;
  companyName?: string;
  agentName?: string;
  callToAction?: string;
  showWelcomeScreen?: boolean;
  companyLogo?: string;
  welcomeButtons?: WelcomeButton[];
}

export interface ChatbotState {
  isOpen: boolean;
  hasError: boolean;
  isLoading: boolean;
  isTyping: boolean;
  inputMessage: string;
  showingWelcomeScreen: boolean;
  editingMessageId: string | null;
  editingText: string;
  editingError: string;
  hasUnreadMessages: boolean;
  playingMessageId: string | null;
  isNotificationEnabled: boolean;
  suggestionsDisabled: boolean;
  isAtBottom: boolean;
  showNewMessageIndicator: boolean;
  isMobile: boolean;
  isSmallMobile: boolean;
  showWelcomeTooltip: boolean;
  chatButtonClickCount: number;
  isVoiceMode: boolean;
  autoPlayResponses: boolean;
  isCallMode: boolean;
}