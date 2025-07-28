import React, { useState } from 'react';
import { VoiceWidget } from './VoiceWidget';
import { VoiceAgentCustomizer } from './VoiceAgentCustomizer';
import { Copy, Check } from 'lucide-react';

interface VoiceAgentSectionProps {
  isDarkMode?: boolean;
}

export const VoiceAgentSection: React.FC<VoiceAgentSectionProps> = ({ isDarkMode = false }) => {
  const [agentId, setAgentId] = useState('agent_01k04zwwq3fv5acgzdwmbvfk8k');
  const [buttonText, setButtonText] = useState('Talk to AI Agent');
  const [buttonColor, setButtonColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [secondaryTextColor, setSecondaryTextColor] = useState('#666666');
  const [borderColor, setBorderColor] = useState('#e5e7eb');
  const [shadowColor, setShadowColor] = useState('rgba(0,0,0,0.08)');
  const [statusBgColor, setStatusBgColor] = useState('#f0fdf4');
  const [statusTextColor, setStatusTextColor] = useState('#15803d');
  const [title, setTitle] = useState('AI Voice Assistant');
  const [description, setDescription] = useState('Get instant answers to your questions. Our AI assistant is ready to help you 24/7.');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const avatarUrl = avatarFile 
    ? URL.createObjectURL(avatarFile) 
    : '/lovable-uploads/48879003-fa58-48bb-a9a5-3e3f334800f9.png';

  // Generate embed code with current settings
  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const avatarUrlForEmbed = avatarFile ? '/lovable-uploads/48879003-fa58-48bb-a9a5-3e3f334800f9.png' : avatarUrl;
    
    return `<!-- Voice Widget Embed Code -->
<div id="voice-widget-container"></div>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script>
  // Voice Widget Configuration
  const voiceWidgetConfig = {
    agentId: "${agentId}",
    title: "${title.replace(/"/g, '\\"')}",
    description: "${description.replace(/"/g, '\\"')}",
    buttonText: "${buttonText.replace(/"/g, '\\"')}",
    buttonColor: "${buttonColor}",
    backgroundColor: "${backgroundColor}",
    textColor: "${textColor}",
    secondaryTextColor: "${secondaryTextColor}",
    borderColor: "${borderColor}",
    shadowColor: "${shadowColor}",
    statusBgColor: "${statusBgColor}",
    statusTextColor: "${statusTextColor}",
    avatarUrl: "${avatarUrlForEmbed}"
  };
  
  // Load the voice widget
  fetch('${baseUrl}/voice-widget.js')
    .then(response => response.text())
    .then(script => {
      eval(script);
      if (window.VoiceWidget) {
        window.VoiceWidget.render('voice-widget-container', voiceWidgetConfig);
      }
    })
    .catch(error => console.error('Failed to load voice widget:', error));
</script>`;
  };

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <>
      {/* Voice Agent Widget Section */}
      <section className="py-12 px-4">
        <div className="flex justify-center">
          <VoiceWidget
            agentId={agentId}
            title={title}
            description={description}
            buttonText={buttonText}
            buttonColor={buttonColor}
            backgroundColor={backgroundColor}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            borderColor={borderColor}
            shadowColor={shadowColor}
            statusBgColor={statusBgColor}
            statusTextColor={statusTextColor}
            avatarUrl={avatarUrl}
          />
        </div>
      </section>

      {/* Customization Section */}
      <section className="py-12 px-4 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Voice Assistant</h2>
            <p className="text-gray-600">Personalize the appearance and settings to match your brand</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <VoiceAgentCustomizer
              agentId={agentId}
              onAgentIdChange={setAgentId}
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
              buttonText={buttonText}
              onButtonTextChange={setButtonText}
              buttonColor={buttonColor}
              onButtonColorChange={setButtonColor}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              textColor={textColor}
              onTextColorChange={setTextColor}
              secondaryTextColor={secondaryTextColor}
              onSecondaryTextColorChange={setSecondaryTextColor}
              borderColor={borderColor}
              onBorderColorChange={setBorderColor}
              shadowColor={shadowColor}
              onShadowColorChange={setShadowColor}
              statusBgColor={statusBgColor}
              onStatusBgColorChange={setStatusBgColor}
              statusTextColor={statusTextColor}
              onStatusTextColorChange={setStatusTextColor}
              avatarFile={avatarFile}
              onAvatarFileChange={setAvatarFile}
            />
          </div>
        </div>
      </section>

      {/* Embed Code Section */}
      <section className="py-12 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Embed Code</h2>
            <p className="text-gray-600">Copy this code and paste it into your website to add the voice widget</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">HTML Embed Code</h3>
              <button
                onClick={copyToClipboard}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  copied 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600'
                }`}
                style={{ zIndex: 10 }}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                <code>{generateEmbedCode()}</code>
              </pre>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Copy the embed code above</li>
                <li>2. Paste it into your website's HTML where you want the widget to appear</li>
                <li>3. Make sure you have internet connection for the widget to load external dependencies</li>
                <li>4. The widget will automatically inherit your current customization settings</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};