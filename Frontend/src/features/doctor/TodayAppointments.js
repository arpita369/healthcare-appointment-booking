import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Calendar, Clock, User, ArrowLeft, Phone, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'sonner';
import { appointmentApi, userMgmtApi } from '../../services/api';

const tokenHeader = () => {
  const token = localStorage.getItem('healthcare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const TodayAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayAppointments = async () => {
      try {
        setLoading(true);
        let healthcare_user = JSON.parse(localStorage.getItem("healthcare_user"));
        if (!healthcare_user || !healthcare_user.id) {
            throw new Error("User data not found in local storage.");
        }
        
        const headers = tokenHeader();
        const userEmail = healthcare_user.id; // This is the email
        
        // Get Doctor ID
        const userRes = await userMgmtApi.get(`/app2/api/v1/doctors/email/${encodeURIComponent(userEmail)}`, { headers });
        const userDto = userRes.data || {};
        const doctorId = userDto.id;
        if (!doctorId) throw new Error("Could not find doctor profile.");
        
        // Get All Appointments
        const res = await appointmentApi.get('/app3/api/v1/appointments', { headers });
        const allAppointments = res.data || [];

        // Filter for this Doctor
        const drAppoinments = allAppointments.filter(a => String(a.doctorId) === String(doctorId));

        // Filter for Today
        const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
        const todays = drAppoinments.filter(a => a.appointmentDate === today);
        
        // Set state with raw data (no more buggy mapping)
        setAppointments(todays);

      } catch (error) {
        console.error('Error loading today appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    loadTodayAppointments();
  }, [user]);

  const formatTime = (time) => {
    if (!time) return 'Time TBD';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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

  const getStatusIcon = (status) => {
    const lowerStatus = (status || '').toLowerCase();
    switch (lowerStatus) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const lowerStatus = (status || '').toLowerCase();
    switch (lowerStatus) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAppointmentAction = (appointmentId, action) => {
    toast.success(`Appointment ${action} successfully!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading today's appointments..." />
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
          onClick={() => navigate(`/app/${user?.role}/appointments`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Appointments
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today's Appointments</h1>
          <p className="text-gray-600">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(apt => (apt.status || '').toLowerCase() === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(apt => (apt.status || '').toLowerCase() === 'cancelled').length}
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
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">
                  {(appointments.reduce((total, apt) => total + (apt.duration || 30), 0) / 60).toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
              <p>You have no appointments scheduled for today. Enjoy your free time!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments
                .sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''))
                .map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Time and Status */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-semibold text-lg">{formatTime(appointment.timeSlot)}</p>
                              <p className="text-sm text-gray-500">{appointment.duration || 30} minutes</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(appointment.status)}
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status || 'Pending'}
                            </Badge>
                          </div>
                        </div>

                        {/* Patient Information */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.patientName || 'unknown'}`} />
                              <AvatarFallback>
                                {appointment.patientName ? appointment.patientName.split(' ').map(n => n[0]).join('') : 'UN'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{appointment.patientName || `Patient ID: ${appointment.patientId}`}</h4>
                              <p className="text-sm text-gray-600 capitalize">
                                {appointment.appointmentType || 'consultation'}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-gray-500 mt-1" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Chief Complaint:</p>
                                <p className="text-sm text-gray-600">{appointment.symptoms || 'No symptoms specified'}</p>
                              </div>
                            </div>
                            {appointment.additionalNotes && (
                              <div className="flex items-start gap-2">
                                <User className="w-4 h-4 text-gray-500 mt-1" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Notes:</p>
                                  <p className="text-sm text-gray-600">{appointment.additionalNotes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, 'started')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Start
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, 'rescheduled')}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Reschedule
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => toast.info('Patient contact feature coming soon')}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Contact Patient
                          </Button>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Booked: {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'Date TBD'}</p>
                            <p>Type: {appointment.appointmentType || 'consultation'}</p>
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

export default TodayAppointments;