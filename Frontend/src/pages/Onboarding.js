import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
  Heart, 
  Calendar, 
  FileText, 
  Bell, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Users,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const onboardingSteps = [
  {
    title: 'Welcome to HealthCare!',
    description: 'We\'re excited to have you join our healthcare platform. Let\'s get you started.',
    icon: Heart,
    content: 'Your health journey begins here. Our platform connects patients and doctors for seamless healthcare management.',
  },
  {
    title: 'Dashboard Overview',
    description: 'Your dashboard is your central hub for all healthcare activities.',
    icon: Users,
    content: 'Here you\'ll find quick access to appointments, medical records, and important notifications.',
  },
  {
    title: 'Appointment Management',
    description: 'Easily schedule, reschedule, or cancel appointments.',
    icon: Calendar,
    content: 'Browse available doctors, select convenient time slots, and manage all your appointments in one place.',
  },
  {
    title: 'Medical Records',
    description: 'Access your complete medical history securely.',
    icon: FileText,
    content: 'View consultation notes, prescriptions, and lab results. All your medical information is encrypted and secure.',
  },
  {
    title: 'Notifications',
    description: 'Stay informed with appointment reminders and health updates.',
    icon: Bell,
    content: 'Receive timely notifications about appointments, medication reminders, and important health alerts.',
  },
  {
    title: 'Getting Started',
    description: 'You\'re all set! Let\'s explore your personalized dashboard.',
    icon: CheckCircle,
    content: 'Take a moment to explore the interface. If you need help, use the help section or contact support.',
  },
];

const doctorSteps = [
  {
    title: 'Welcome, Doctor!',
    description: 'Thank you for joining our healthcare platform. Let\'s set up your practice.',
    icon: Stethoscope,
    content: 'Manage your patients, appointments, and medical records all in one secure platform.',
  },
  {
    title: 'Doctor Dashboard',
    description: 'Your command center for patient care and practice management.',
    icon: Users,
    content: 'View today\'s appointments, manage patient records, and track your schedule efficiently.',
  },
  {
    title: 'Manage Availability',
    description: 'Set your working hours and availability for patient bookings.',
    icon: Calendar,
    content: 'Define your schedule, set recurring availability, and manage time slots for patient appointments.',
  },
  {
    title: 'Patient Records',
    description: 'Access and update patient medical records securely.',
    icon: FileText,
    content: 'Add consultation notes, prescriptions, and treatment plans. All data is HIPAA compliant and secure.',
  },
  {
    title: 'Notifications & Alerts',
    description: 'Stay updated with appointment changes and urgent patient needs.',
    icon: Bell,
    content: 'Receive notifications about new appointments, cancellations, and patient messages.',
  },
  {
    title: 'Ready to Practice',
    description: 'Your digital practice is ready! Start managing your patient care.',
    icon: CheckCircle,
    content: 'Begin by setting your availability and exploring your patient management tools.',
  },
];

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = user?.role === 'doctor' ? doctorSteps : onboardingSteps;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-blue-100 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-700">
                {currentStepData.title}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {currentStepData.description}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-6 mb-6">
                <p className="text-lg leading-relaxed">
                  {currentStepData.content}
                </p>
              </div>
              
              {user?.role === 'doctor' && currentStep === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">
                    Welcome Dr. {user.name}!
                  </h4>
                  <p className="text-green-700 text-sm">
                    Specialty: {user.specialty}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip Tutorial
              </Button>

              <Button
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep === steps.length - 1 ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}