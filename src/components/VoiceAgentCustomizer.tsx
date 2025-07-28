import React, { useState } from 'react';
import { Upload, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ImageCropper } from '@/components/ui/image-cropper';

interface VoiceAgentCustomizerProps {
  agentId: string;
  onAgentIdChange: (agentId: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  buttonText: string;
  onButtonTextChange: (buttonText: string) => void;
  buttonColor: string;
  onButtonColorChange: (color: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  secondaryTextColor: string;
  onSecondaryTextColorChange: (color: string) => void;
  borderColor: string;
  onBorderColorChange: (color: string) => void;
  shadowColor: string;
  onShadowColorChange: (color: string) => void;
  statusBgColor: string;
  onStatusBgColorChange: (color: string) => void;
  statusTextColor: string;
  onStatusTextColorChange: (color: string) => void;
  avatarFile: File | null;
  onAvatarFileChange: (file: File | null) => void;
}

export const VoiceAgentCustomizer: React.FC<VoiceAgentCustomizerProps> = ({
  agentId,
  onAgentIdChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  buttonText,
  onButtonTextChange,
  buttonColor,
  onButtonColorChange,
  backgroundColor,
  onBackgroundColorChange,
  textColor,
  onTextColorChange,
  secondaryTextColor,
  onSecondaryTextColorChange,
  borderColor,
  onBorderColorChange,
  shadowColor,
  onShadowColorChange,
  statusBgColor,
  onStatusBgColorChange,
  statusTextColor,
  onStatusTextColorChange,
  avatarFile,
  onAvatarFileChange
}) => {
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const handleCroppedImage = (croppedFile: File) => {
    onAvatarFileChange(croppedFile);
    setIsCropperOpen(false);
  };

  const handleCropperCancel = () => {
    setIsCropperOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Basic Configuration */}
        <Card className="border-2 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500/5 to-pink-500/5">
            <CardTitle>Basic Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="agentId" className="text-sm font-medium">Agent ID</Label>
              <Input
                id="agentId"
                value={agentId}
                onChange={(e) => onAgentIdChange(e.target.value)}
                placeholder="Enter ElevenLabs Agent ID"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Widget title"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buttonText" className="text-sm font-medium">Button Text</Label>
                <Input
                  id="buttonText"
                  value={buttonText}
                  onChange={(e) => onButtonTextChange(e.target.value)}
                  placeholder="Button text"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Widget description"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Avatar Configuration */}
        <Card className="border-2 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <CardTitle>Avatar Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-3">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-10 flex items-center justify-center gap-2 text-sm transition-all duration-200 hover:scale-105"
                onClick={() => setIsCropperOpen(true)}
              >
                <Upload className="h-4 w-4" />
                {avatarFile ? 'Change Avatar' : 'Upload & Crop Avatar'}
              </Button>
              
              {avatarFile && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full border-2 border-gray-200 overflow-hidden bg-white">
                      <img 
                        src={URL.createObjectURL(avatarFile)} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">{avatarFile.name}</p>
                    <p className="text-xs text-gray-400">Cropped avatar preview</p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsCropperOpen(true)} 
                      className="flex-shrink-0 h-8 w-8 p-0 hover:scale-110 transition-all duration-200"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onAvatarFileChange(null)} 
                      className="flex-shrink-0 h-8 px-2 text-xs hover:scale-110 transition-all duration-200"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Color Customization */}
        <Card className="border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500/5 to-pink-500/5">
            <CardTitle>Color Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {[{
              id: 'backgroundColor',
              label: 'Background Color',
              value: backgroundColor,
              setter: onBackgroundColorChange,
              desc: 'Main widget background'
            }, {
              id: 'textColor',
              label: 'Main Text Color',
              value: textColor,
              setter: onTextColorChange,
              desc: 'Primary text color'
            }, {
              id: 'secondaryTextColor',
              label: 'Secondary Text Color',
              value: secondaryTextColor,
              setter: onSecondaryTextColorChange,
              desc: 'Secondary text elements'
            }, {
              id: 'borderColor',
              label: 'Border Color',
              value: borderColor,
              setter: onBorderColorChange,
              desc: 'Widget border color'
            }, {
              id: 'buttonColor',
              label: 'Button Color',
              value: buttonColor,
              setter: onButtonColorChange,
              desc: 'Primary button background'
            }, {
              id: 'statusBgColor',
              label: 'Status Background',
              value: statusBgColor,
              setter: onStatusBgColorChange,
              desc: 'Status indicator background'
            }, {
              id: 'statusTextColor',
              label: 'Status Text Color',
              value: statusTextColor,
              setter: onStatusTextColorChange,
              desc: 'Status indicator text'
            }].map((color, index) => (
              <div key={color.id} className="space-y-2 animate-fade-in" style={{
                animationDelay: `${index * 100}ms`
              }}>
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
            
            {/* Shadow Color (special case for rgba) */}
            <div className="space-y-2">
              <Label htmlFor="shadowColor" className="text-sm font-medium">Shadow Color (rgba)</Label>
              <Input
                id="shadowColor"
                value={shadowColor}
                onChange={(e) => onShadowColorChange(e.target.value)}
                placeholder="rgba(0,0,0,0.08)"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
              />
              <p className="text-xs text-muted-foreground">Widget shadow effect</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog moved completely outside the main component structure */}
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="max-w-lg">
          <ImageCropper 
            onCrop={handleCroppedImage}
            onCancel={handleCropperCancel}
            initialImage={avatarFile}
            size={200}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};