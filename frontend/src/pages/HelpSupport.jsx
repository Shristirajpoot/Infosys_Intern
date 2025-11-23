import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  FileText,
  Users,
  Truck,
  Recycle
} from 'lucide-react';
import { toast } from 'react-toastify';

const HelpSupport = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      id: 1,
      question: "How do I schedule a waste pickup?",
      answer: "To schedule a waste pickup, navigate to the 'Pickup Schedule' page from your dashboard. Click 'Schedule Pickup', fill in the date, time, location, and select the types of waste you need collected. Our team will confirm your pickup within 24 hours.",
      category: "pickup"
    },
    {
      id: 2,
      question: "What types of waste do you collect?",
      answer: "We collect various types of waste including plastic, organic waste, paper, glass, metal, and e-waste. Each waste type is handled with appropriate recycling and disposal methods to minimize environmental impact.",
      category: "waste-types"
    },
    {
      id: 3,
      question: "How can I become a volunteer?",
      answer: "To become a volunteer, create an account and select 'Volunteer' as your role. Complete your profile with your skills, availability, and areas of interest. You can then browse and apply for volunteer opportunities in your area.",
      category: "volunteer"
    },
    {
      id: 4,
      question: "How do I register my NGO on the platform?",
      answer: "NGOs can register by selecting 'NGO' during account creation. You'll need to provide official documentation, including registration certificates. After verification, you can post opportunities and manage volunteers.",
      category: "ngo"
    },
    {
      id: 5,
      question: "What are eco opportunities?",
      answer: "Eco opportunities are environmental volunteer activities posted by NGOs. These include tree planting, beach cleanups, recycling drives, awareness campaigns, and other sustainability initiatives you can join.",
      category: "opportunities"
    },
    {
      id: 6,
      question: "How does the messaging system work?",
      answer: "Our messaging system allows secure communication between volunteers and NGOs. You can chat about opportunities, coordinate activities, and share updates. Messages are real-time and include features like typing indicators.",
      category: "messaging"
    },
    {
      id: 7,
      question: "Is there a mobile app available?",
      answer: "Currently, we offer a responsive web application that works seamlessly on mobile devices. A dedicated mobile app is in development and will be available soon for both iOS and Android platforms.",
      category: "technical"
    },
    {
      id: 8,
      question: "How do I track my environmental impact?",
      answer: "Your dashboard displays your environmental impact through statistics like waste recycled, volunteer hours, and CO2 offset. We track your contributions across all activities to show your positive environmental impact.",
      category: "impact"
    }
  ];

  const categories = [
    { id: 'pickup', label: 'Waste Pickup', icon: Truck },
    { id: 'waste-types', label: 'Waste Types', icon: Recycle },
    { id: 'volunteer', label: 'Volunteering', icon: Users },
    { id: 'ngo', label: 'NGO Registration', icon: FileText },
    { id: 'opportunities', label: 'Eco Opportunities', icon: HelpCircle },
    { id: 'messaging', label: 'Messaging', icon: MessageCircle },
    { id: 'technical', label: 'Technical Support', icon: Phone },
    { id: 'impact', label: 'Impact Tracking', icon: FileText }
  ];

  const contactCategories = [
    'General Inquiry',
    'Technical Support',
    'Pickup Issues',
    'Account Problems',
    'Volunteer Questions',
    'NGO Support',
    'Billing',
    'Feedback'
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFaqToggle = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Your message has been sent successfully! We\'ll get back to you within 24 hours.');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Help & Support
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Help
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.slice(0, 4).map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Frequently Asked Questions
                </h2>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="p-6">
                    <button
                      onClick={() => handleFaqToggle(faq.id)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 pr-4">
                        {faq.question}
                      </h3>
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedFaq === faq.id && (
                      <div className="mt-4 text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
                
                {filteredFaqs.length === 0 && (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No FAQs found matching your search.
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Contact Us
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Can't find what you're looking for? Send us a message.
                </p>
              </div>
              
              <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="">Select a category</option>
                      {contactCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Describe your question or issue in detail..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">support@wastezero.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Phone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Address</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      123 Green Street<br />
                      Visakhapatnam, Andhra Pradesh<br />
                      India - 530001
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Support Hours</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mon - Fri: 9:00 AM - 6:00 PM<br />
                      Sat - Sun: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Links
              </h3>
              
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  User Guide
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Community Forum
                </a>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                System Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Platform</span>
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API</span>
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                  <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
