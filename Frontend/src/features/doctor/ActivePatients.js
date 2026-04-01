import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Users, Search, ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, AlertCircle, Heart, Activity, Clock, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'sonner';

const ActivePatients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadActivePatients = async () => {
      try {
        setLoading(true);
        const doctorId = user?.id || 'doc-1'; // Fallback for demo
        console.log('🔍 ActivePatients: Loading for doctorId:', doctorId);
        console.log('👤 ActivePatients: User context:', user);
        
        const activePatients = await getActivePatients(doctorId);
        console.log('👥 ActivePatients: Received patients:', activePatients);
        
        const enhancedPatients = activePatients.map(patient => {
          const patientAppointments = mockAppointments.filter(apt => apt.patientId === patient.id);
          const lastAppointment = patientAppointments
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          const upcomingAppointments = patientAppointments
            .filter(apt => new Date(apt.date) >= new Date())
            .length;
          
          return {
            ...patient,
            appointmentHistory: patientAppointments.length,
            lastAppointment: lastAppointment?.date,
            upcomingAppointments,
            riskLevel: patient.medicalHistory.length > 2 ? 'high' : 
                      patient.medicalHistory.length > 0 ? 'medium' : 'low'
          };
        });
        
        console.log('🔄 ActivePatients: Enhanced patients:', enhancedPatients);
        setPatients(enhancedPatients);
        setFilteredPatients(enhancedPatients);
      } catch (error) {
        console.error('Error loading active patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    loadActivePatients();
  }, [user]);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      (patient.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.medicalHistory || []).some(condition => 
        (condition || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Activity className="w-4 h-4" />;
      case 'low':
        return <Heart className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const handlePatientAction = (patientId, action) => {
    // In a real app, this would make API calls
    toast.success(`Patient ${action} initiated successfully!`);
  };

  const formatLastVisit = (dateString) => {
    if (!dateString) return 'No visits';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays/30)} months ago`;
    return `${Math.floor(diffDays/365)} years ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading active patients..." />
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Patients</h1>
          <p className="text-gray-600">Manage your active patient roster</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Active</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold">
                  {patients.filter(p => p.riskLevel === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">With Upcoming</p>
                <p className="text-2xl font-bold">
                  {patients.filter(p => p.upcomingAppointments > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Recent Visits</p>
                <p className="text-2xl font-bold">
                  {patients.filter(p => {
                    if (!p.lastVisit) return false;
                    const daysDiff = Math.abs(new Date() - new Date(p.lastVisit)) / (1000 * 60 * 60 * 24);
                    return daysDiff <= 7;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search patients by name, email, or medical condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Patient Roster ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No patients found' : 'No active patients'}
              </h3>
              <p>
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'You have no active patients at the moment'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Patient Basic Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={patient.avatar} />
                            <AvatarFallback className="text-lg">
                              {patient.name ? patient.name.split(' ').map(n => n[0]).join('') : 'UN'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-lg">{patient.name}</h4>
                            <p className="text-sm text-gray-600">
                              {calculateAge(patient.dateOfBirth)} years old • {patient.gender}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {getRiskIcon(patient.riskLevel)}
                              <Badge className={getRiskColor(patient.riskLevel)}>
                                {patient.riskLevel} risk
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-700">Contact Info</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{patient.phone}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                            <span className="text-gray-600 text-xs leading-4">
                              {patient.address}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Medical Information */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-700">Medical Info</h5>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-500">Medical History</p>
                            {patient.medicalHistory.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {patient.medicalHistory.map((condition, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {condition}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No known conditions</p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-gray-500">Allergies</p>
                            <p className="text-sm text-gray-600">
                              {patient.allergies.join(', ') || 'None known'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-gray-500">Last Visit</p>
                            <p className="text-sm text-gray-600">
                              {formatLastVisit(patient.lastVisit)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions and Stats */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-700">Actions</h5>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePatientAction(patient.id, 'appointment scheduled')}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Schedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePatientAction(patient.id, 'contacted')}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handlePatientAction(patient.id, 'records accessed')}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Records
                        </Button>
                        
                        <div className="text-xs text-gray-500 space-y-1 mt-4">
                          <p>Total Visits: {patient.appointmentHistory}</p>
                          <p>Upcoming: {patient.upcomingAppointments}</p>
                          <p>Patient ID: {patient.id}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivePatients;