import React, { useState } from 'react';
import { VoiceWidget } from './VoiceWidget';
import { VoiceAgentCustomizer } from './VoiceAgentCustomizer';

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

  const avatarUrl = avatarFile 
    ? URL.createObjectURL(avatarFile) 
    : '/lovable-uploads/46013ce6-0e78-4209-885a-6fc3259809c2.png';

  return (
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
    </section>
  );
};