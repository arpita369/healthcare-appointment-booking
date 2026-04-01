import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Heart,
  Shield,
  Zap,
  Brain,
  Baby,
  Pill,
  ArrowLeft,
  PhoneCall,
  Info,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';

import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EmergencyContacts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load emergency contacts
  useEffect(() => {
    const loadEmergencyContacts = async () => {
      setLoading(true);
      try {
        const contacts = await getEmergencyContacts();
        setEmergencyContacts(contacts);
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
        toast.error('Error loading emergency contacts');
      } finally {
        setLoading(false);
      }
    };
    
    loadEmergencyContacts();
  }, []);

  const getContactIcon = (type) => {
    const icons = {
      'emergency': AlertTriangle,
      'hospital': Heart,
      'poison': Pill,
      'mental': Brain,
      'urgent': Zap,
      'pediatric': Baby
    };
    
    const IconComponent = icons[type] || Phone;
    return <IconComponent className="w-6 h-6" />;
  };

  const getContactColor = (type) => {
    const colors = {
      'emergency': 'bg-red-100 text-red-800 border-red-200',
      'hospital': 'bg-blue-100 text-blue-800 border-blue-200',
      'poison': 'bg-purple-100 text-purple-800 border-purple-200',
      'mental': 'bg-green-100 text-green-800 border-green-200',
      'urgent': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pediatric': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleCall = (number, name) => {
    // In a real app, this would initiate a phone call
    // For demo purposes, we'll show a confirmation
    if (confirm(`Call ${name} at ${number}?`)) {
      toast.success(`Calling ${name}...`, {
        description: `Dialing ${number}`,
        duration: 2000
      });
      
      // Simulate call initiation
      window.open(`tel:${number}`, '_self');
    }
  };

  const handleGetDirections = (address, name) => {
    if (address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(mapsUrl, '_blank');
      toast.info(`Opening directions to ${name}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading emergency contacts..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/app/${user?.role}/dashboard`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
        <Badge className="bg-red-100 text-red-800">
          Important Numbers
        </Badge>
      </div>

      {/* Emergency Banner */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900 mb-2">
                In Case of Life-Threatening Emergency
              </h2>
              <p className="text-red-700 mb-4">
                If you or someone else is experiencing a life-threatening emergency, 
                call 112 immediately or go to your nearest emergency room.
              </p>
              <Button
                onClick={() => handleCall('112', 'Emergency Services')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call 112 Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emergencyContacts.map((contact) => (
          <Card 
            key={contact.id} 
            className={`hover:shadow-lg transition-all duration-200 border-2 ${
              contact.type === 'emergency' ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    contact.type === 'emergency' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {getContactIcon(contact.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">
                      {contact.name}
                    </CardTitle>
                    <Badge className={`${getContactColor(contact.type)} mt-1`}>
                      {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-600">
                {contact.description}
              </p>

              {/* Phone Number */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{contact.number}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCall(contact.number, contact.name)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PhoneCall className="w-4 h-4 mr-1" />
                  Call
                </Button>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  <strong>Available:</strong> {contact.available}
                </span>
              </div>

              {/* Address (if available) */}
              {contact.address && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{contact.address}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGetDirections(contact.address, contact.name)}
                    className="w-full"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              )}

              {/* Priority indicator */}
              {contact.type === 'emergency' && (
                <div className="flex items-center gap-2 p-2 bg-red-100 rounded border border-red-200">
                  <Zap className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Immediate Response
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* When to Call Each Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              When to Call Each Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">112 Emergency Services</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Life-threatening injuries or illness</li>
                  <li>• Chest pain or difficulty breathing</li>
                  <li>• Severe allergic reactions</li>
                  <li>• Loss of consciousness</li>
                  <li>• Suspected stroke or heart attack</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Poison Control</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Suspected poisoning</li>
                  <li>• Overdose situations</li>
                  <li>• Chemical exposure</li>
                  <li>• Questions about medications</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Mental Health Crisis</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Suicidal thoughts</li>
                  <li>• Mental health emergencies</li>
                  <li>• Crisis intervention needed</li>
                  <li>• Emotional support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Preparation Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Emergency Preparation Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Keep This Information Ready</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your current medications</li>
                  <li>• Medical conditions and allergies</li>
                  <li>• Emergency contact person</li>
                  <li>• Insurance information</li>
                  <li>• Doctor's contact information</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Before Calling 112</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Stay calm and speak clearly</li>
                  <li>• Provide your exact location</li>
                  <li>• Describe the emergency</li>
                  <li>• Follow dispatcher instructions</li>
                  <li>• Don't hang up until told to do so</li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Save these numbers in your phone contacts for quick access during emergencies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Bar */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Need Non-Emergency Medical Help?
              </h3>
              <p className="text-sm text-blue-700">
                Contact your primary care physician or schedule an appointment through the dashboard.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/app/${user?.role}/appointments/book`)}
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Book Appointment
              </Button>
              <Button
                onClick={() => navigate('/app/contact')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyContacts;