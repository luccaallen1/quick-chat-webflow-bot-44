
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Volume2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface VoiceSettingsProps {
  selectedVoice: 'bark' | 'tortoise';
  onVoiceChange: (voice: 'bark' | 'tortoise') => void;
  autoPlayResponses: boolean;
  onAutoPlayToggle: () => void;
  primaryColor: string;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  selectedVoice,
  onVoiceChange,
  autoPlayResponses,
  onAutoPlayToggle,
  primaryColor
}) => {
  const [showAutoPlayTooltip, setShowAutoPlayTooltip] = useState(false);
  const [showSettingsTooltip, setShowSettingsTooltip] = useState(false);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if any popup/dialog is open
  const isPopupOpen = () => {
    return document.querySelector('[data-state="open"]') !== null ||
           document.querySelector('.dialog-overlay') !== null ||
           document.querySelector('[role="dialog"]') !== null;
  };

  const handleAutoPlayTooltipShow = () => {
    if (isPopupOpen()) return;
    
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    setShowAutoPlayTooltip(true);
    
    autoPlayTimeoutRef.current = setTimeout(() => {
      setShowAutoPlayTooltip(false);
    }, 15000);
  };

  const handleSettingsTooltipShow = () => {
    if (isPopupOpen()) return;
    
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
    }
    setShowSettingsTooltip(true);
    
    settingsTimeoutRef.current = setTimeout(() => {
      setShowSettingsTooltip(false);
    }, 15000);
  };

  const handleAutoPlayTooltipHide = () => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    autoPlayTimeoutRef.current = setTimeout(() => {
      setShowAutoPlayTooltip(false);
    }, 15000);
  };

  const handleSettingsTooltipHide = () => {
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
    }
    settingsTimeoutRef.current = setTimeout(() => {
      setShowSettingsTooltip(false);
    }, 15000);
  };

  // Hide tooltips when popup opens
  useEffect(() => {
    const checkForPopups = () => {
      if (isPopupOpen()) {
        setShowAutoPlayTooltip(false);
        setShowSettingsTooltip(false);
        if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
        if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current);
      }
    };

    const observer = new MutationObserver(checkForPopups);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['data-state', 'role'] 
    });

    return () => {
      observer.disconnect();
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
      if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 p-2 border-t border-gray-200">
      <TooltipProvider>
        <Tooltip open={showAutoPlayTooltip}>
          <TooltipTrigger asChild>
            <button
              onClick={onAutoPlayToggle}
              onMouseEnter={handleAutoPlayTooltipShow}
              onMouseLeave={handleAutoPlayTooltipHide}
              onFocus={handleAutoPlayTooltipShow}
              onBlur={handleAutoPlayTooltipHide}
              className={`p-1.5 rounded transition-colors ${
                autoPlayResponses 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              style={{ 
                backgroundColor: autoPlayResponses ? primaryColor : 'transparent' 
              }}
            >
              <Volume2 size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{autoPlayResponses ? 'Disable' : 'Enable'} auto-play responses</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <select
        value={selectedVoice}
        onChange={(e) => onVoiceChange(e.target.value as 'bark' | 'tortoise')}
        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
      >
        <option value="bark">Bark (Fast & Natural)</option>
        <option value="tortoise">Tortoise (High Quality)</option>
      </select>

      <TooltipProvider>
        <Tooltip open={showSettingsTooltip}>
          <TooltipTrigger asChild>
            <div
              onMouseEnter={handleSettingsTooltipShow}
              onMouseLeave={handleSettingsTooltipHide}
              onFocus={handleSettingsTooltipShow}
              onBlur={handleSettingsTooltipHide}
              tabIndex={0}
            >
              <Settings size={12} className="text-gray-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice powered by Together AI</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
