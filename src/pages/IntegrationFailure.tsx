import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IntegrationFailure: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect back to SaaS page after showing error message
    const timer = setTimeout(() => {
      navigate('/saas');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Connection Failed
        </h2>

        <p className="text-gray-600 mb-6">
          We couldn't connect your Google Calendar. This might be due to permission denial or a temporary issue.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/saas')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <div className="text-sm text-gray-500">
            Automatically redirecting in 5 seconds...
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
            <h4 className="font-semibold text-yellow-800 text-sm">Common Issues</h4>
          </div>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Make sure to grant calendar permissions</li>
            <li>• Check your Google account access</li>
            <li>• Try again with a stable internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntegrationFailure;