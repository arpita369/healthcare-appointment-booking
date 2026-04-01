import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Calendar, Phone, MessageCircle, Plus, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'sonner';
import { appointmentApi, userMgmtApi } from '../services/api';
 
// Helper function to get the auth token
const tokenHeader = () => {
  const token = localStorage.getItem('healthcare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
 
// Helper function to format time
const formatTime = (time) => {
    if (!time) return 'Time TBD';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};
 
export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from auth context
 
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
 
  const [patientName, setPatientName] = useState('User');
 
  const handleBookAppointment = () => navigate('/app/patient/appointments/book');
  const handleContactSupport = () => navigate('/app/contact');
  const handleEmergency = () => navigate('/app/emergency');
 
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingAppointments(true);
        const headers = tokenHeader();
        let healthcare_user = JSON.parse(localStorage.getItem("healthcare_user"));
        if (!healthcare_user || !healthcare_user.id) {
          throw new Error("User data not found in local storage.");
        }
        const userEmail = healthcare_user.id;
 
        const userRes = await userMgmtApi.get(`/app2/api/v1/patients/email/${encodeURIComponent(userEmail)}`, { headers });
        const patientDto = userRes.data;
        const patientId = patientDto?.id;
 
        if (!patientId) {
          throw new Error("Could not find patient profile.");
        }
 
        if (patientDto?.firstName) {
          setPatientName(patientDto.firstName);
        } else if (user?.name) { 
          setPatientName(user.name); 
        }
 
        // Fetch Appointments
        const appointmentRes = await appointmentApi.get('/app3/api/v1/appointments', { headers });
        const allAppointments = appointmentRes.data || [];
       
        // Filter for this patient
        const ptAppointments = allAppointments.filter(a => String(a.patientId) === String(patientId));
       
        // Filter for today
        const today = new Date().toISOString().split('T')[0];
        const todays = ptAppointments.filter(apt => apt.appointmentDate === today);
       
        // Set preview list
        setTodayAppointments(todays.slice(0, 3));
 
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoadingAppointments(false);
      }
    };
 
    if (user) {
      loadDashboardData();
    }
  }, [user]);
 
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-6 shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          Good Morning, {patientName}! ☺️
        </h1>
        <p className="text-sm md:text-base text-blue-100">
          We wish you a healthy day. Here are some quick actions to get you started.
        </p>
      </div>
 
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={handleBookAppointment}
            >
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-base font-medium text-gray-700">Book Appointment</span>
            </Button>
           
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={handleContactSupport}
            >
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <span className="text-base font-medium text-gray-700">Contact Support</span>
            </Button>
           
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center justify-center gap-2 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={handleEmergency}
            >
              <Phone className="w-6 h-6" />
              <span className="text-base font-medium">Emergency</span>
            </Button>
          </div>
        </CardContent>
      </Card>
 
      {/* Today's Schedule Preview */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                Your upcoming appointments for today
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/app/patient/appointments')}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAppointments ? (
            <div className="flex justify-center items-center h-24">
              <LoadingSpinner text="Loading schedule..." />
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={`https"//api.dicebear.com/7.x/avataaars/svg?seed=doctor-${appointment.doctorId}`} />
                        <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{appointment.doctorName || `Doctor #${appointment.doctorId}`}</h4>
                      <p className="text-sm text-gray-500">{appointment.appointmentType}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-blue-600">
                      {formatTime(appointment.timeSlot)}
                    </div>
                     <Badge
                      variant={(appointment.status || '').toLowerCase() === 'confirmed' ? 'default' : 'secondary'}
                      className={`mt-1 ${(appointment.status || '').toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {appointment.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}