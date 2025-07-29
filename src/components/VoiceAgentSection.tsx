import React, { useState } from 'react';
import { VoiceWidget } from './VoiceWidget';
import { VoiceAgentCustomizer } from './VoiceAgentCustomizer';
import { Copy, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedLanguage, setSelectedLanguage] = useState('html');
  const { toast } = useToast();

  const avatarUrl = avatarFile 
    ? URL.createObjectURL(avatarFile) 
    : '/lovable-uploads/48879003-fa58-48bb-a9a5-3e3f334800f9.png';

  // Get language display name
  const getLanguageDisplayName = (lang: string) => {
    const names: Record<string, string> = {
      html: 'HTML',
      'react-ts': 'React (TypeScript)',
      'react-js': 'React (JavaScript)',
      vue: 'Vue.js',
      dotnet: '.NET',
      angular: 'Angular'
    };
    return names[lang] || lang;
  };

  // Generate embed code based on language
  const generateCode = (language: string) => {
    const baseUrl = window.location.origin;
    const avatarUrlForEmbed = avatarFile ? '/lovable-uploads/48879003-fa58-48bb-a9a5-3e3f334800f9.png' : avatarUrl;
    
    const baseConfig = {
      agentId,
      title: title.replace(/"/g, '\\"'),
      description: description.replace(/"/g, '\\"'),
      buttonText: buttonText.replace(/"/g, '\\"'),
      buttonColor,
      backgroundColor,
      textColor,
      secondaryTextColor,
      borderColor,
      shadowColor,
      statusBgColor,
      statusTextColor,
      avatarUrl: avatarUrlForEmbed
    };

    const reactConfig = `  agentId: "${baseConfig.agentId}",
    title: "${baseConfig.title}",
    description: "${baseConfig.description}",
    buttonText: "${baseConfig.buttonText}",
    buttonColor: "${baseConfig.buttonColor}",
    backgroundColor: "${baseConfig.backgroundColor}",
    textColor: "${baseConfig.textColor}",
    secondaryTextColor: "${baseConfig.secondaryTextColor}",
    borderColor: "${baseConfig.borderColor}",
    shadowColor: "${baseConfig.shadowColor}",
    statusBgColor: "${baseConfig.statusBgColor}",
    statusTextColor: "${baseConfig.statusTextColor}",
    avatarUrl: "${baseConfig.avatarUrl}"`;

    switch (language) {
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voice Widget Integration</title>
    <link rel="stylesheet" href="${baseUrl}/voice-widget.css">
</head>
<body>
    <!-- Your page content -->
    
    <!-- Voice Widget -->
    <div id="voice-widget-container"></div>
    
    <script src="${baseUrl}/voice-widget.js"></script>
    <script>
        // Initialize the voice widget
        window.VoiceWidget.render('voice-widget-container', {
${reactConfig.split('\n').map(line => '            ' + line.trim()).join('\n')}
        });
    </script>
</body>
</html>`;

      case 'react-ts':
        return `import React from 'react';
import { VoiceWidget } from './components/VoiceWidget';

const App: React.FC = () => {
  return (
    <div className="App">
      {/* Your app content */}
      
      <VoiceWidget
${reactConfig}
      />
    </div>
  );
};

export default App;`;

      case 'react-js':
        return `import React from 'react';
import { VoiceWidget } from './components/VoiceWidget';

const App = () => {
  return (
    <div className="App">
      {/* Your app content */}
      
      <VoiceWidget
${reactConfig}
      />
    </div>
  );
};

export default App;`;

      case 'vue':
        return `<template>
  <div id="app">
    <!-- Your app content -->
    
    <VoiceWidget
      :agent-id="'${baseConfig.agentId}'"
      :title="'${baseConfig.title}'"
      :description="'${baseConfig.description}'"
      :button-text="'${baseConfig.buttonText}'"
      :button-color="'${baseConfig.buttonColor}'"
      :background-color="'${baseConfig.backgroundColor}'"
      :text-color="'${baseConfig.textColor}'"
      :secondary-text-color="'${baseConfig.secondaryTextColor}'"
      :border-color="'${baseConfig.borderColor}'"
      :shadow-color="'${baseConfig.shadowColor}'"
      :status-bg-color="'${baseConfig.statusBgColor}'"
      :status-text-color="'${baseConfig.statusTextColor}'"
      :avatar-url="'${baseConfig.avatarUrl}'"
    />
  </div>
</template>

<script>
import VoiceWidget from './components/VoiceWidget.vue';

export default {
  name: 'App',
  components: {
    VoiceWidget
  }
};
</script>`;

      case 'dotnet':
        return `@* Add this to your layout or page *@
<div id="voice-widget-container"></div>

@* Add these scripts before closing body tag *@
<script src="${baseUrl}/voice-widget.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        window.VoiceWidget.render('voice-widget-container', {
${reactConfig.split('\n').map(line => '            ' + line.trim()).join('\n')}
        });
    });
</script>`;

      case 'angular':
        return `// voice-widget.component.ts
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-voice-widget',
  template: '<div #voiceContainer id="voice-widget-container"></div>'
})
export class VoiceWidgetComponent implements OnInit {
  @ViewChild('voiceContainer', { static: true }) voiceContainer!: ElementRef;

  ngOnInit() {
    this.loadVoiceWidget();
  }

  private loadVoiceWidget() {
    const script = document.createElement('script');
    script.src = '${baseUrl}/voice-widget.js';
    script.onload = () => {
      (window as any).VoiceWidget.render('voice-widget-container', {
${reactConfig.split('\n').map(line => '        ' + line.trim()).join('\n')}
      });
    };
    document.head.appendChild(script);
  }
}`;

      default:
        return generateEmbedCode();
    }
  };

  // Legacy function for backward compatibility
  const generateEmbedCode = () => {
    return generateCode('html');
  };

  // Copy to clipboard function
  const copyToClipboard = async (language?: string) => {
    try {
      const code = language ? generateCode(language) : generateEmbedCode();
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      if (language) {
        toast({
          title: 'Code copied to clipboard!',
          description: `${getLanguageDisplayName(language)} integration code has been copied.`
        });
      }
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Integration Code</h2>
            <p className="text-gray-600">Choose your framework and copy the integration code</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Select Framework</h3>
              </div>
              
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="react-ts">React (TypeScript)</SelectItem>
                  <SelectItem value="react-js">React (JavaScript)</SelectItem>
                  <SelectItem value="vue">Vue.js</SelectItem>
                  <SelectItem value="dotnet">.NET</SelectItem>
                  <SelectItem value="angular">Angular</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={() => copyToClipboard(selectedLanguage)}
                className="bg-blue-600 text-white hover:bg-blue-700 gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy {getLanguageDisplayName(selectedLanguage)} Code
              </Button>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                <code>{generateCode(selectedLanguage)}</code>
              </pre>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Select your preferred framework from the dropdown above</li>
                <li>2. Copy the generated integration code</li>
                <li>3. Follow the framework-specific implementation guide</li>
                <li>4. Make sure to replace placeholder values with your actual configuration</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};