import { useState } from 'react';
import { VoiceAgentSection } from '@/components/VoiceAgentSection';
import { Button } from '@/components/ui/button';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const VoiceAgent = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Voice Agent</h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Voice Agent Section */}
      <VoiceAgentSection isDarkMode={isDarkMode} />
    </div>
  );
};

export default VoiceAgent;