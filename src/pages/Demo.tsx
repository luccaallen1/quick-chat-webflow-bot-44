import React, { useEffect } from 'react';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { Calendar, Clock, MapPin, Phone, Mail, Star, Users, TrendingUp, Shield } from 'lucide-react';

const Demo = () => {
  useEffect(() => {
    // Set page title
    document.title = 'MediFlow Clinic - Your Trusted Healthcare Partner';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900">MediFlow Clinic</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition">Services</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition">About</a>
              <a href="#team" className="text-gray-700 hover:text-blue-600 transition">Our Team</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Book Appointment
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience comprehensive healthcare with our team of dedicated professionals. 
              We're here to support your journey to better health.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition transform hover:scale-105">
                Schedule Consultation
              </button>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Family Medicine</h3>
              <p className="text-gray-600">Comprehensive care for patients of all ages, from preventive care to chronic disease management.</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Preventive Care</h3>
              <p className="text-gray-600">Regular check-ups, screenings, and immunizations to keep you healthy.</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Wellness Programs</h3>
              <p className="text-gray-600">Personalized wellness plans to help you achieve your health goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Years of Excellence</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="text-blue-100">Medical Specialists</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-blue-100">Patient Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Patients Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">"The staff at MediFlow is exceptional. They truly care about their patients and it shows in everything they do."</p>
              <div className="font-semibold">Sarah Johnson</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">"I've been coming here for years. The doctors are knowledgeable and the service is always prompt and professional."</p>
              <div className="font-semibold">Michael Chen</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">"Best healthcare experience I've had. The online booking and chat support make everything so convenient."</p>
              <div className="font-semibold">Emily Rodriguez</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Visit Us</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-gray-600">123 Health Street<br />Medical District, MD 12345</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Hours</h3>
              <p className="text-gray-600">Mon-Fri: 8:00 AM - 6:00 PM<br />Sat: 9:00 AM - 2:00 PM</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Contact</h3>
              <p className="text-gray-600">Phone: (555) 123-4567<br />Email: info@mediflow.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 MediFlow Clinic. All rights reserved.</p>
            <p className="mt-2 text-gray-400">This is a demo website showcasing the chat widget integration.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget
        webhookUrl="https://luccatora.app.n8n.cloud/webhook/webbot"
        title="Chat Support"
        bio="Online now"
        placeholder="Type your message..."
        position="bottom-right"
        primaryColor="#000000"
        secondaryColor="#f3f4f6"
        botTextColor="#1f2937"
        userTextColor="#ffffff"
        chatBackground="#ffffff"
        welcomeMessage="Hey, this is Jack, the Virtual Assistant from ToraTech AI. How can I help you today?"
        admin={false}
        isVoiceEnabled={false}
        isElevenLabsEnabled={true}
        elevenLabsAgentId="agent_01k04zwwq3fv5acgzdwmbvfk8k"
        headerGradientColor="#000000"
        headerMainColor="#262626"
        logoBackgroundColor="transparent"
        logoBorderColor="none"
        headerButtonColor="#ffffff"
        fontFamily="Inter"
        welcomeTooltipMessage="Click to start chatting with our AI assistant!"
        logoUrl="/lovable-uploads/0bece050-e33f-47c2-aeba-0088a17e5b93.png"
        avatarUrl="/lovable-uploads/0bece050-e33f-47c2-aeba-0088a17e5b93.png"
      />
    </div>
  );
};

export default Demo;