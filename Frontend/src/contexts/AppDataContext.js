import React, { createContext, useContext } from 'react';
import { Calendar, Shield, FileText, Users, Clock, Heart, Star } from 'lucide-react';

const AppDataContext = createContext();

const AppDataProvider = ({ children }) => {
  // Shared features data
  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments with your preferred doctors in just a few clicks. Real-time availability and instant confirmation.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical data is protected with enterprise-grade security and HIPAA compliance standards.'
    },
    {
      icon: FileText,
      title: 'Digital Medical Records',
      description: 'Access your complete medical history, prescriptions, and test results anytime, anywhere.'
    },
    {
      icon: Users,
      title: 'Expert Healthcare Team',
      description: 'Connect with certified healthcare professionals and specialists across multiple disciplines.'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support and emergency consultation services when you need them most.'
    },
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Tailored healthcare recommendations based on your medical history and health goals.'
    }
  ];

  // Shared testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Patient',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      rating: 5,
      comment: 'The platform has revolutionized how I manage my healthcare. Booking appointments is so easy, and I can access all my records in one place.'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      rating: 5,
      comment: 'This system has streamlined my practice significantly. Managing patient records and appointments has never been more efficient.'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Patient',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
      rating: 5,
      comment: 'Excellent service! The doctors are professional, and the digital system makes everything transparent and convenient.'
    }
  ];

  // Shared stats data
  const stats = [
    { number: '50,000+', label: 'Patients Served' },
    { number: '500+', label: 'Healthcare Providers' },
    { number: '1M+', label: 'Appointments Booked' },
    { number: '99.9%', label: 'Uptime Guarantee' }
  ];

  // Common utility functions
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return 'Time TBD';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'completed': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const value = {
    features,
    testimonials,
    stats,
    scrollToSection,
    formatDate,
    formatTime,
    getStatusColor
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataProvider;

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};