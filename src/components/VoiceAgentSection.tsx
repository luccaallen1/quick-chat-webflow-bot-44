import React, { useState } from 'react';
import { VoiceWidget } from './VoiceWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Settings, Palette, Upload, Edit3, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageCropper } from '@/components/ui/image-cropper';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface VoiceAgentSectionProps {
  isDarkMode?: boolean;
}

export const VoiceAgentSection: React.FC<VoiceAgentSectionProps> = ({ isDarkMode = false }) => {
  console.log('VoiceAgentSection rendering - no VoiceAgentCustomizer here');
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
    <link rel="stylesheet" href="https://voice-agent-uvke.onrender.com/cdn/voice-widget.css">
</head>
<body>
    <!-- Your page content -->
    
    <!-- Voice Widget -->
    <div id="voice-widget-container"></div>
    
    <script src="https://voice-agent-uvke.onrender.com/cdn/voice-widget.js"></script>
    <script>
        // Initialize the voice widget
        window.VoiceWidget.render('voice-widget-container', {
${reactConfig.split('\n').map(line => '            ' + line.trim()).join('\n')}
        });
    </script>
</body>
</html>`;

      case 'react-ts':
        return `// Step 1: Create VoiceWidget.tsx component
import React, { useEffect, useRef } from 'react';

interface VoiceWidgetProps {
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
}

const VoiceWidget: React.FC<VoiceWidgetProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://voice-agent-uvke.onrender.com/cdn/voice-widget.css';
    document.head.appendChild(link);

    // Load JS and initialize
    const script = document.createElement('script');
    script.src = 'https://voice-agent-uvke.onrender.com/cdn/voice-widget.js';
    script.onload = () => {
      if (containerRef.current && (window as any).VoiceWidget) {
        (window as any).VoiceWidget.render(containerRef.current, props);
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, [props]);

  return <div ref={containerRef} />;
};

export default VoiceWidget;

// Step 2: Use in your App.tsx
import React from 'react';
import VoiceWidget from './components/VoiceWidget';

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
        return `// Step 1: Create VoiceWidget.jsx component
import React, { useEffect, useRef } from 'react';

const VoiceWidget = (props) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://voice-agent-uvke.onrender.com/cdn/voice-widget.css';
    document.head.appendChild(link);

    // Load JS and initialize
    const script = document.createElement('script');
    script.src = 'https://voice-agent-uvke.onrender.com/cdn/voice-widget.js';
    script.onload = () => {
      if (containerRef.current && window.VoiceWidget) {
        window.VoiceWidget.render(containerRef.current, props);
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, [props]);

  return <div ref={containerRef} />;
};

export default VoiceWidget;

// Step 2: Use in your App.jsx
import React from 'react';
import VoiceWidget from './components/VoiceWidget';

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
        return `<!-- Step 1: Create VoiceWidget.vue component -->
<template>
  <div ref="voiceContainer"></div>
</template>

<script>
export default {
  name: 'VoiceWidget',
  props: {
    agentId: { type: String, required: true },
    title: { type: String, default: 'AI Voice Assistant' },
    description: { type: String, default: 'Get instant answers to your questions.' },
    buttonText: { type: String, default: 'Talk to AI Agent' },
    buttonColor: { type: String, default: '#000000' },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#000000' },
    secondaryTextColor: { type: String, default: '#666666' },
    borderColor: { type: String, default: '#e5e7eb' },
    shadowColor: { type: String, default: 'rgba(0,0,0,0.08)' },
    statusBgColor: { type: String, default: '#f0fdf4' },
    statusTextColor: { type: String, default: '#15803d' },
    avatarUrl: { type: String, default: '' }
  },
  mounted() {
    this.loadVoiceWidget();
  },
  beforeUnmount() {
    // Cleanup if needed
  },
  methods: {
    loadVoiceWidget() {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://voice-agent-uvke.onrender.com/cdn/voice-widget.css';
      document.head.appendChild(link);

      // Load JS and initialize
      const script = document.createElement('script');
      script.src = 'https://voice-agent-uvke.onrender.com/cdn/voice-widget.js';
      script.onload = () => {
        if (this.$refs.voiceContainer && window.VoiceWidget) {
          window.VoiceWidget.render(this.$refs.voiceContainer, {
            agentId: this.agentId,
            title: this.title,
            description: this.description,
            buttonText: this.buttonText,
            buttonColor: this.buttonColor,
            backgroundColor: this.backgroundColor,
            textColor: this.textColor,
            secondaryTextColor: this.secondaryTextColor,
            borderColor: this.borderColor,
            shadowColor: this.shadowColor,
            statusBgColor: this.statusBgColor,
            statusTextColor: this.statusTextColor,
            avatarUrl: this.avatarUrl
          });
        }
      };
      document.head.appendChild(script);
    }
  }
};
</script>

<!-- Step 2: Use in your main App.vue -->
<template>
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
<script src="https://voice-agent-uvke.onrender.com/cdn/voice-widget.js"></script>
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
    script.src = 'https://voice-agent-uvke.onrender.com/cdn/voice-widget.js';
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

  const copyCode = async (language: string) => {
    try {
      const code = generateCode(language);
      await navigator.clipboard.writeText(code);
      
      toast({
        title: 'Code copied to clipboard!',
        description: `${getLanguageDisplayName(language)} integration code has been copied.`
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="px-[15px] mx-auto max-w-screen-2xl">
      <div className="space-y-8">
        {/* Voice Agent Widget Preview Section */}
        <section className="py-12">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Voice Agent Widget Configuration</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Customize your voice agent's appearance, behavior, and integration settings. 
              Preview changes in real-time and generate code for seamless integration.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="sticky top-4 z-50">
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
                    onClick={() => copyCode(selectedLanguage)} 
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

        {/* Integration Examples Section */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full mb-6">
              <Copy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300 font-medium">Easy Integration</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Integration Examples
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose your framework and get started in minutes. Our voice widget works seamlessly with any web technology.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-2">
                <Mic className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-2xl">Framework Integration</CardTitle>
              </div>
              <CardDescription>Easy integration into your website. Both CSS and JavaScript files are automatically minified and optimized.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="react-ts">React (TS)</TabsTrigger>
                  <TabsTrigger value="react-js">React (JS)</TabsTrigger>
                  <TabsTrigger value="vue">Vue.js</TabsTrigger>
                  <TabsTrigger value="dotnet">.NET</TabsTrigger>
                  <TabsTrigger value="angular">Angular</TabsTrigger>
                </TabsList>

                {['html', 'react-ts', 'react-js', 'vue', 'dotnet', 'angular'].map((framework) => (
                  <TabsContent key={framework} value={framework} className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold">{getLanguageDisplayName(framework)}</h4>
                        <Button
                          onClick={() => copyCode(framework)}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Code
                        </Button>
                      </div>
                      <div className="relative">
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm border max-h-80 overflow-y-auto">
                          <code>{generateCode(framework)}</code>
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📦 CDN Files Available:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                      https://voice-agent-uvke.onrender.com/cdn/voice-widget.js
                    </span>
                    <span className="text-blue-700 dark:text-blue-300">- JavaScript bundle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                      https://voice-agent-uvke.onrender.com/cdn/voice-widget.css
                    </span>
                    <span className="text-blue-700 dark:text-blue-300">- Minified styles</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};