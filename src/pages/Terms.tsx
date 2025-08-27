import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using the HIPAA Healthcare Agent service ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Service Description</h2>
          <p className="text-gray-700 mb-4">
            The HIPAA Healthcare Agent is an AI-powered appointment booking service that helps patients schedule appointments with healthcare providers. Our service includes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Conversational AI assistant for appointment scheduling</li>
            <li>HIPAA-compliant data handling and storage</li>
            <li>Google Calendar integration (optional)</li>
            <li>Secure communication with healthcare facilities</li>
            <li>Appointment confirmation and reminder services</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Eligibility and Registration</h2>
          <p className="text-gray-700 mb-4">
            To use this Service:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>You must be at least 18 years old or have parental/guardian consent</li>
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You must have legal authority to make healthcare decisions for yourself or others you represent</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Healthcare Disclaimer</h2>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
            <p className="text-gray-800 font-semibold mb-2">IMPORTANT MEDICAL DISCLAIMER:</p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>This Service is for appointment booking only and does not provide medical advice</li>
              <li>Our AI assistant is not a substitute for professional medical consultation</li>
              <li>In case of medical emergency, call 911 immediately</li>
              <li>Always consult with qualified healthcare professionals for medical decisions</li>
              <li>We do not diagnose, treat, or provide medical opinions</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">User Responsibilities</h2>
          <p className="text-gray-700 mb-2">You agree to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Provide accurate and truthful information</li>
            <li>Use the Service only for legitimate appointment booking purposes</li>
            <li>Respect the privacy and confidentiality of others</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Attend scheduled appointments or provide adequate notice for cancellations</li>
            <li>Not attempt to circumvent security measures or access unauthorized areas</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Prohibited Uses</h2>
          <p className="text-gray-700 mb-2">You may not use the Service to:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Submit false or misleading information</li>
            <li>Impersonate another person or entity</li>
            <li>Engage in fraudulent activities</li>
            <li>Violate any laws or regulations</li>
            <li>Interfere with the proper operation of the Service</li>
            <li>Attempt to gain unauthorized access to systems or data</li>
            <li>Use the Service for commercial purposes without permission</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Google Calendar Integration</h2>
          <p className="text-gray-700 mb-4">
            By connecting your Google Calendar:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>You authorize us to create calendar events for your appointments</li>
            <li>You can revoke this permission at any time through your Google Account</li>
            <li>We will only create events related to appointments you book through our Service</li>
            <li>Google's Terms of Service also apply to the calendar integration</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">HIPAA Compliance</h2>
          <p className="text-gray-700 mb-4">
            We are committed to HIPAA compliance:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>All protected health information (PHI) is encrypted and secured</li>
            <li>Access to your information is limited to authorized personnel only</li>
            <li>We maintain audit logs of all access to your information</li>
            <li>You have rights under HIPAA to access and control your health information</li>
            <li>We will notify you of any breaches as required by law</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Service Availability</h2>
          <p className="text-gray-700 mb-4">
            While we strive for continuous availability:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>The Service may be temporarily unavailable for maintenance or updates</li>
            <li>We do not guarantee 100% uptime or uninterrupted service</li>
            <li>Some features may be limited during peak usage times</li>
            <li>We reserve the right to modify or discontinue features with notice</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the fullest extent permitted by law:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>We provide the Service "as is" without warranties of any kind</li>
            <li>We are not liable for any indirect, incidental, or consequential damages</li>
            <li>Our total liability shall not exceed the amount paid for the Service</li>
            <li>We are not responsible for third-party actions or services</li>
            <li>Users assume all risks associated with using the Service</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Indemnification</h2>
          <p className="text-gray-700 mb-4">
            You agree to indemnify and hold harmless the HIPAA Healthcare Agent and its affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Privacy</h2>
          <p className="text-gray-700 mb-4">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Modifications to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify these Terms at any time. We will notify users of significant changes by:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Posting updated Terms on our website</li>
            <li>Updating the "Last updated" date</li>
            <li>Providing notice for material changes that affect your rights</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Termination</h2>
          <p className="text-gray-700 mb-4">
            Either party may terminate this agreement:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>You may stop using the Service at any time</li>
            <li>We may terminate access for violations of these Terms</li>
            <li>Termination does not affect previously scheduled appointments</li>
            <li>Certain provisions will survive termination (privacy, indemnification)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Governing Law</h2>
          <p className="text-gray-700 mb-4">
            These Terms shall be governed by and construed in accordance with applicable healthcare privacy laws including HIPAA, and the laws of the jurisdiction where the Service operates.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
          <p className="text-gray-700 mb-4">
            For questions about these Terms of Service:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> luccaallen1@gmail.com</p>
            <p><strong>Legal Department:</strong> Available for terms-related inquiries</p>
            <p><strong>Response Time:</strong> We will respond within 7 business days</p>
          </div>

          <p className="text-gray-700 mt-8 text-sm">
            By using the HIPAA Healthcare Agent service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};