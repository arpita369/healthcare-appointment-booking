import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
// Removed Tabs imports as they are no longer needed
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Phone,
  CheckCircle,
  AlertCircle,
  FileText,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
 
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'sonner';
import { appointmentApi, userMgmtApi } from '../services/api';
 
const tokenHeader = () => {
  const token = localStorage.getItem('healthcare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
 
export default function AppointmentScheduling() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';
 
  async function getAllAppointments() {
    const headers = tokenHeader();
    const res = await appointmentApi.get('/app3/api/v1/appointments', { headers });
    return res.data || [];
  }
 
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        let healthcare_user = JSON.parse(localStorage.getItem("healthcare_user"));
        if (!healthcare_user || !healthcare_user.id) {
            throw new Error("User data not found in local storage.");
        }
       
        const headers = tokenHeader();
        const userEmail = healthcare_user.id; // This is the email
 
        if (isPatient) {
          // For patients, show their upcoming appointments
          const userRes = await userMgmtApi.get(`/app2/api/v1/patients/email/${encodeURIComponent(userEmail)}`, { headers });
          console.log(userRes);
          const userDto = userRes.data || {};
          const patientId = userDto.id;
          if (!patientId) throw new Error("Could not find patient profile.");
         
          const allAppoinments = await getAllAppointments();
          const ptAppoinments = allAppoinments.filter(a => String(a.patientId) === String(patientId));
          setAllAppointments(ptAppoinments);
 
        } else if (isDoctor) {
          // For doctors, show their patients' appointments
          const userRes = await userMgmtApi.get(`/app2/api/v1/doctors/email/${encodeURIComponent(userEmail)}`, { headers });
          const userDto = userRes.data || {};
          const doctorId = userDto.id;
          if (!doctorId) throw new Error("Could not find doctor profile.");
         
          const allAppoinments = await getAllAppointments();
          const drAppoinments = allAppoinments.filter(a => String(a.doctorId) === String(doctorId));
 
          setAllAppointments(drAppoinments);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
 
    loadAppointments();
  }, [user, isPatient, isDoctor]);
 
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
    // Normalize status to lowercase for reliable switching
    const lowerCaseStatus = (status || 'pending').toLowerCase();
   
    switch (lowerCaseStatus) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };
 
  const getStatusColor = (status) => {
    // Normalize status to lowercase for reliable switching
    const lowerCaseStatus = (status || 'pending').toLowerCase();
 
    switch (lowerCaseStatus) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
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
        <LoadingSpinner size="lg" text="Loading appointments..." />
      </div>
    );
  }
 
  // Render patient view
  if (isPatient) {
    return (
      <div className="space-y-6">
        {/* Patient Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">View your appointments and book new ones</p>
          </div>
          <Button
            onClick={() => navigate('/app/patient/appointments/book')}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Book New Appointment
          </Button>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold">
                    
                    {allAppointments.filter(apt => (apt.status || '').toLowerCase() === 'confirmed').length}
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
                    {/* --- CORRECTED LOGIC --- */}
                    {allAppointments.filter(apt => (apt.status || '').toLowerCase() === 'cancelled').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
 
        {/* Patient Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Appointments
            </CardTitle>
            <CardDescription>
              View and manage your scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allAppointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
                <p>Book your first appointment to get started</p>
                <Button
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/app/patient/appointments/book')}
                >
                  Book Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {allAppointments
                  .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                  .map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-semibold">{appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'Date TBD'}</p>
                            <p className="text-sm text-gray-500">{appointment.timeSlot ? formatTime(appointment.timeSlot) : 'Time TBD'}</p>
                          </div>
                        </div>
 
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=doctor-${appointment.doctorId}`} />
                            <AvatarFallback className="text-xs">DR</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{appointment.doctorName || `Doctor ID: ${appointment.doctorId}`}</h4>
                            <p className="text-sm text-gray-600 capitalize">{appointment.appointmentType || 'consultation'}</p>
                          </div>
                        </div>
 
                        <div className="col-span-1">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {appointment.symptoms || 'No symptoms specified'}
                          </p>
                        </div>
 
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(appointment.status || 'pending')}>
                            {appointment.status || 'Pending'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <FileText className="w-4 h-4" />
                            </Button>
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
  }
 
  // Render doctor view
  return (
    <div className="space-y-6">
      {/* Doctor Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your appointments and schedule</p>
        </div>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold">
                  {/* --- CORRECTED LOGIC --- */}
                  {allAppointments.filter(apt => (apt.status || '').toLowerCase() === 'cancelled').length}
                </p>
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
                  {/* --- CORRECTED LOGIC --- */}
                  {allAppointments.filter(apt => (apt.status || '').toLowerCase() === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
 
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{allAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
 
      {/* Main Content - "All Appointments" directly */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Appointments
            </CardTitle>
            <CardDescription>
              Complete list of your appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                </div>
            ) : (
              <div className="space-y-4">
                {allAppointments
                  .sort((a, b) => new Date(b.appointmentDate || '1900-01-01') - new Date(a.appointmentDate || '1900-01-01'))
                  .map((appointment) => (
                    <Card key={appointment.id} className="border-l-4 border-l-gray-300">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-semibold">{appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'Date TBD'}</p>
                              <p className="text-sm text-gray-500">{appointment.timeSlot ? formatTime(appointment.timeSlot) : 'Time TBD'}</p>
                            </div>
                          </div>
 
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=patient-${appointment.patientId}`} />
                              <AvatarFallback className="text-xs">
                                PT
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{appointment.patientName || `Patient ID: ${appointment.patientId}`}</h4>
                              <p className="text-sm text-gray-600">{appointment.appointmentType || 'consultation'}</p>
                            </div>
                          </div>
 
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {appointment.symptoms || 'No symptoms specified'}
                            </p>
                          </div>
 
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(appointment.status || 'pending')}>
                              {appointment.status || 'Pending'}
                            </Badge>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost">
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <FileText className="w-4 h-4" />
                              </Button>
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
    </div>
  );
}
 