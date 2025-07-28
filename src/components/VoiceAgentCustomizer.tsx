import React, { useState } from 'react';
import { Upload, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
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

  const ColorInput = ({ 
    label, 
    value, 
    onChange, 
    id 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void; 
    id: string; 
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex gap-2">
        <Input 
          id={id} 
          type="color" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
          }}
          onFocus={(e) => {
            e.stopPropagation();
          }}
          className="w-16 h-10 p-1 rounded-md border transition-all duration-200 hover:scale-105 cursor-pointer"
        />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-white border-gray-300 text-gray-900 text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="agentId" className="text-sm font-medium text-gray-700">Agent ID</Label>
        <Input
          id="agentId"
          value={agentId}
          onChange={(e) => onAgentIdChange(e.target.value)}
          placeholder="Enter ElevenLabs Agent ID"
          className="bg-white border-gray-300 text-gray-900 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Widget title"
            className="bg-white border-gray-300 text-gray-900 text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="buttonText" className="text-sm font-medium text-gray-700">Button Text</Label>
          <Input
            id="buttonText"
            value={buttonText}
            onChange={(e) => onButtonTextChange(e.target.value)}
            placeholder="Button text"
            className="bg-white border-gray-300 text-gray-900 text-sm"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Widget description"
          className="bg-white border-gray-300 text-gray-900 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarFile" className="text-sm font-medium text-gray-700">Avatar Image</Label>
        <div className="space-y-3">
          <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="w-full h-10 flex items-center justify-center gap-2 text-sm">
                <Upload className="h-4 w-4" />
                {avatarFile ? 'Change Avatar' : 'Upload & Crop Avatar'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <ImageCropper 
                onCrop={handleCroppedImage}
                onCancel={handleCropperCancel}
                initialImage={avatarFile}
                size={200}
              />
            </DialogContent>
          </Dialog>
          
          {avatarFile && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onAvatarFileChange(null)} 
                  className="flex-shrink-0 h-8 px-2 text-xs"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Color Customization Section */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="text-base font-semibold text-gray-900">Color Customization</h4>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Widget Colors</h5>
            <div className="grid grid-cols-1 gap-4">
              <ColorInput 
                label="Background" 
                value={backgroundColor} 
                onChange={onBackgroundColorChange} 
                id="backgroundColor" 
              />
              <ColorInput 
                label="Main Text" 
                value={textColor} 
                onChange={onTextColorChange} 
                id="textColor" 
              />
              <ColorInput 
                label="Secondary Text" 
                value={secondaryTextColor} 
                onChange={onSecondaryTextColorChange} 
                id="secondaryTextColor" 
              />
              <ColorInput 
                label="Border" 
                value={borderColor} 
                onChange={onBorderColorChange} 
                id="borderColor" 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Button & Status Colors</h5>
            <div className="grid grid-cols-1 gap-4">
              <ColorInput 
                label="Button" 
                value={buttonColor} 
                onChange={onButtonColorChange} 
                id="buttonColor" 
              />
              <ColorInput 
                label="Status Background" 
                value={statusBgColor} 
                onChange={onStatusBgColorChange} 
                id="statusBgColor" 
              />
              <ColorInput 
                label="Status Text" 
                value={statusTextColor} 
                onChange={onStatusTextColorChange} 
                id="statusTextColor" 
              />
              <div className="space-y-2">
                <Label htmlFor="shadowColor" className="text-sm font-medium text-gray-700">Shadow Color (rgba)</Label>
                <Input
                  id="shadowColor"
                  value={shadowColor}
                  onChange={(e) => onShadowColorChange(e.target.value)}
                  placeholder="rgba(0,0,0,0.08)"
                  className="bg-white border-gray-300 text-gray-900 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};