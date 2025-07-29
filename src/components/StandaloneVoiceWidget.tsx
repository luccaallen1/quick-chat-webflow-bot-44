import React from 'react';
import { createRoot } from 'react-dom/client';
import { VoiceWidget } from './VoiceWidget';
import './VoiceWidget.css';

// Global interface for window object
declare global {
  interface Window {
    VoiceWidget: {
      VoiceManager: typeof VoiceManager;
      init: (config: any) => void;
      destroy: () => void;
    };
  }
}

class VoiceManager {
  private container: HTMLDivElement | null = null;
  private root: any = null;

  init(config: {
    agentId: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonColor?: string;
    backgroundColor?: string;
    textColor?: string;
    secondaryTextColor?: string;
    borderColor?: string;
    shadowColor?: string;
    statusBgColor?: string;
    statusTextColor?: string;
    avatarUrl?: string;
    containerId?: string;
  }) {
    // Clean up existing instance
    this.destroy();

    // Check if a container ID was provided, otherwise create one
    if (config.containerId) {
      // Use existing container
      const existingContainer = document.getElementById(config.containerId);
      if (existingContainer) {
        this.container = existingContainer as HTMLDivElement;
      } else {
        console.error(`Container with ID '${config.containerId}' not found`);
        return;
      }
    } else {
      // Create new container
      this.container = document.createElement('div');
      this.container.id = 'voice-widget-container';
      this.container.className = 'voice-widget-container';
      this.container.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 20px;
      `;
      document.body.appendChild(this.container);
    }

    // Create root and render with all config options
    this.root = createRoot(this.container);
    this.root.render(React.createElement(VoiceWidget, {
      agentId: config.agentId,
      title: config.title,
      description: config.description,
      buttonText: config.buttonText,
      buttonColor: config.buttonColor,
      backgroundColor: config.backgroundColor,
      textColor: config.textColor,
      secondaryTextColor: config.secondaryTextColor,
      borderColor: config.borderColor,
      shadowColor: config.shadowColor,
      statusBgColor: config.statusBgColor,
      statusTextColor: config.statusTextColor,
      avatarUrl: config.avatarUrl
    }));

    console.log('VoiceWidget initialized with 11Labs integration');
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.container && !this.container.id.includes('custom')) {
      // Only remove if we created it
      if (this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.container = null;
    }
  }
}

// Create the manager instance for backward compatibility
const manager = new VoiceManager();

// Initialize global object immediately
if (typeof globalThis !== 'undefined') {
  globalThis.VoiceWidget = {
    VoiceManager: VoiceManager,
    init: (config) => manager.init(config),
    destroy: () => manager.destroy()
  };
}

// Also set on window for browser environments
if (typeof window !== 'undefined') {
  window.VoiceWidget = {
    VoiceManager: VoiceManager,
    init: (config) => manager.init(config),
    destroy: () => manager.destroy()
  };
  
  console.log('VoiceWidget methods available:', {
    VoiceManager: typeof window.VoiceWidget.VoiceManager,
    init: typeof window.VoiceWidget.init,
    destroy: typeof window.VoiceWidget.destroy
  });
}

export { VoiceManager };