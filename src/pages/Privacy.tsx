import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            The HIPAA Healthcare Agent ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal health information. This Privacy Policy explains how we collect, use, and safeguard your information when you use our healthcare appointment booking service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Personal Information:</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Name and contact information (phone number, email address)</li>
            <li>Appointment preferences and scheduling information</li>
            <li>Basic health symptoms for appointment categorization</li>
            <li>Google Calendar access (when you grant permission)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Technical Information:</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Browser information and device type</li>
            <li>IP address and general location</li>
            <li>Usage data and interaction logs</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Appointment Booking:</strong> To schedule and manage your healthcare appointments</li>
            <li><strong>Calendar Integration:</strong> To create events in your Google Calendar (with your permission)</li>
            <li><strong>Communication:</strong> To send appointment confirmations and reminders</li>
            <li><strong>Service Improvement:</strong> To enhance our AI assistant and booking system</li>
            <li><strong>Compliance:</strong> To maintain HIPAA compliance and audit trails</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">HIPAA Compliance</h2>
          <p className="text-gray-700 mb-4">
            We are committed to HIPAA (Health Insurance Portability and Accountability Act) compliance:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Encryption:</strong> All personal health information is encrypted using AES-256 encryption</li>
            <li><strong>Access Controls:</strong> Strict access controls limit who can view your information</li>
            <li><strong>Audit Logging:</strong> All access to your information is logged for compliance</li>
            <li><strong>Data Minimization:</strong> We only collect information necessary for appointment booking</li>
            <li><strong>Secure Transmission:</strong> All data is transmitted over secure HTTPS connections</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Google Calendar Integration</h2>
          <p className="text-gray-700 mb-4">
            When you choose to connect your Google Calendar:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>We request only calendar write permissions to create appointment events</li>
            <li>We do not read or access your existing calendar events</li>
            <li>You can revoke calendar access at any time through your Google Account settings</li>
            <li>Calendar events include appointment details necessary for your healthcare visit</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties except:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Healthcare Providers:</strong> Appointment information is shared with the clinic you're booking with</li>
            <li><strong>Service Providers:</strong> Trusted third-party services that help us operate (under strict confidentiality agreements)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your information for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Active Data:</strong> As long as you use our services</li>
            <li><strong>HIPAA Requirements:</strong> Up to 6 years as required by healthcare regulations</li>
            <li><strong>Deletion Requests:</strong> You can request deletion of your data at any time</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-2">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of communications</li>
            <li>Revoke Google Calendar permissions</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Security Measures</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>End-to-end encryption for all sensitive data</li>
            <li>Secure cloud infrastructure with regular security audits</li>
            <li>Multi-factor authentication for administrative access</li>
            <li>Regular security training for all team members</li>
            <li>Incident response procedures for any security events</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
          <p className="text-gray-700 mb-4">
            For questions about this Privacy Policy or your personal information:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> luccaallen1@gmail.com</p>
            <p><strong>Privacy Officer:</strong> Available for HIPAA-related inquiries</p>
            <p><strong>Response Time:</strong> We will respond within 30 days</p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </div>
      </div>
    </div>
  );
};