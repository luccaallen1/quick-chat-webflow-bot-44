import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IntegrationSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect back to SaaS page after showing success message
    const timer = setTimeout(() => {
      navigate('/saas');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Google Calendar Connected!
        </h2>

        <p className="text-gray-600 mb-6">
          Your Google Calendar has been successfully connected. You can now use calendar booking features in your chatbot.
        </p>

        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            Redirecting you back to the configuration page...
          </div>
          
          <button
            onClick={() => navigate('/saas')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Configuration
          </button>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h4 className="font-semibold text-green-800 text-sm">What's Next?</h4>
          </div>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Select your preferred calendar for bookings</li>
            <li>• Test your chatbot with calendar integration</li>
            <li>• Customers can now book appointments automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSuccess;