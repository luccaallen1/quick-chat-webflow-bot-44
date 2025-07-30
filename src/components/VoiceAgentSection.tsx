import React, { useState } from 'react';
import { VoiceWidget } from './VoiceWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Settings, Palette, Upload, Edit3, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageCropper } from '@/components/ui/image-cropper';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

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
  const [selectedLanguage, setSelectedLanguage] = useState('html');
  const [isAvatarCropperOpen, setIsAvatarCropperOpen] = useState(false);
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
    <div className="space-y-8">
      {/* Voice Agent Widget Preview Section */}
      <section className="py-12 px-4">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Voice Agent Widget Configuration</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Customize your voice agent's appearance, behavior, and integration settings. 
            Preview changes in real-time and generate code for seamless integration.
          </p>
        </div>
        
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

      {/* Configuration Cards */}
      <div className="w-full">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Configuration */}
          <Card className="border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl animate-slide-in-left">
            <CardHeader className="bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label htmlFor="agentId" className="text-sm font-medium">Agent ID</Label>
                <Input 
                  id="agentId" 
                  value={agentId} 
                  onChange={e => setAgentId(e.target.value)} 
                  placeholder="agent_01k04zwwq3fv5acgzdwmbvfk8k" 
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" 
                />
                <p className="text-xs text-gray-500">Your ElevenLabs Agent ID</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Voice Agent Title</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="AI Voice Assistant" 
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buttonText" className="text-sm font-medium">Button Text</Label>
                  <Input 
                    id="buttonText" 
                    value={buttonText} 
                    onChange={e => setButtonText(e.target.value)} 
                    placeholder="Talk to AI Agent" 
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Get instant answers to your questions. Our AI assistant is ready to help you 24/7." 
                  className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" 
                />
                <p className="text-xs text-gray-500">Description shown to users</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarFile" className="text-sm font-medium">Avatar Image (optional)</Label>
                <div className="space-y-3">
                  <Dialog open={isAvatarCropperOpen} onOpenChange={setIsAvatarCropperOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" className="w-full h-10 flex items-center justify-center gap-2">
                        <Upload className="h-4 w-4" />
                        {avatarFile ? 'Change Avatar' : 'Upload & Crop Avatar'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <ImageCropper 
                        onCrop={(croppedFile) => {
                          setAvatarFile(croppedFile);
                          setIsAvatarCropperOpen(false);
                        }} 
                        onCancel={() => setIsAvatarCropperOpen(false)} 
                        initialImage={avatarFile} 
                        size={200} 
                      />
                    </DialogContent>
                  </Dialog>
                  
                  {avatarFile && (
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50">
                          <img src={URL.createObjectURL(avatarFile)} alt="Avatar preview" className="w-full h-full object-contain" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 truncate">{avatarFile.name}</p>
                        <p className="text-xs text-gray-400">Avatar preview</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setIsAvatarCropperOpen(true)} className="flex-shrink-0">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarFile(null)} className="flex-shrink-0">
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Avatar displayed for the voice agent</p>
              </div>

              {/* Integration Code Generator */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-sm font-medium">Generate Integration Code</Label>
                <div className="space-y-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a language" />
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
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy {getLanguageDisplayName(selectedLanguage)} Integration Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Customization */}
          <Card className="border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl animate-slide-in-right">
            <CardHeader className="bg-gradient-to-r from-purple-500/5 to-pink-500/5">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Color Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {[
                {
                  id: 'buttonColor',
                  label: 'Button Color',
                  value: buttonColor,
                  setter: setButtonColor,
                  desc: 'Main action button color'
                },
                {
                  id: 'backgroundColor',
                  label: 'Background Color',
                  value: backgroundColor,
                  setter: setBackgroundColor,
                  desc: 'Widget background color'
                },
                {
                  id: 'textColor',
                  label: 'Text Color',
                  value: textColor,
                  setter: setTextColor,
                  desc: 'Primary text color'
                },
                {
                  id: 'secondaryTextColor',
                  label: 'Secondary Text Color',
                  value: secondaryTextColor,
                  setter: setSecondaryTextColor,
                  desc: 'Description and secondary text'
                },
                {
                  id: 'borderColor',
                  label: 'Border Color',
                  value: borderColor,
                  setter: setBorderColor,
                  desc: 'Widget border color'
                },
                {
                  id: 'shadowColor',
                  label: 'Shadow Color',
                  value: shadowColor,
                  setter: setShadowColor,
                  desc: 'Widget shadow color'
                },
                {
                  id: 'statusBgColor',
                  label: 'Status Background',
                  value: statusBgColor,
                  setter: setStatusBgColor,
                  desc: 'Status indicator background'
                },
                {
                  id: 'statusTextColor',
                  label: 'Status Text Color',
                  value: statusTextColor,
                  setter: setStatusTextColor,
                  desc: 'Status indicator text'
                }
              ].map((color, index) => (
                <div key={color.id} className="space-y-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <Label htmlFor={color.id} className="text-sm font-medium">{color.label}</Label>
                  <div className="flex gap-2">
                    <Input 
                      id={color.id} 
                      type="color" 
                      value={color.value} 
                      onChange={e => color.setter(e.target.value)} 
                      className="w-16 h-10 p-1 rounded-md border transition-all duration-200 hover:scale-105" 
                    />
                    <Input 
                      value={color.value} 
                      onChange={e => color.setter(e.target.value)} 
                      className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{color.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Integration Code Section */}
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
    </div>
  );
};