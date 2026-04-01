import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Users, FileText, Clock, Stethoscope, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import UniversalSearch from '../features/search/UniversalSearch';
import { toast } from 'sonner';
import { appointmentApi, userMgmtApi } from '../services/api';


const tokenHeader = () => {
  const token = localStorage.getItem('healthcare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [availableDays, setAvailableDays] = useState(0); // State was unused

  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const headers = tokenHeader();
        let healthcare_user = JSON.parse(localStorage.getItem("healthcare_user"));
        if (!healthcare_user || !healthcare_user.id) {
          throw new Error("User data not found in local storage.");
        }
        const userEmail = healthcare_user.id;

        const userRes = await userMgmtApi.get(`/app2/api/v1/doctors/email/${encodeURIComponent(userEmail)}`, { headers });
        const doctorDto = userRes.data || {};
        const doctorId = doctorDto.id;
        const availableDaysString = doctorDto.availableDays || '';
        
        if (!doctorId) {
          throw new Error("Could not find doctor profile.");
        }

        const [appointmentRes, reviewRes] = await Promise.all([
          appointmentApi.get('/app3/api/v1/appointments', { headers }),
        ]);

        const allAppointments = appointmentRes.data || [];
        const drAppointments = allAppointments.filter(a => String(a.doctorId) === String(doctorId));
        const today = new Date().toISOString().split('T')[0];
        const todays = drAppointments.filter(apt => apt.appointmentDate === today);
        
        setTodayCount(todays.length);
        setTodayAppointments(todays.slice(0, 3));

        const availableDaysList = availableDaysString
          ? availableDaysString.split(',').map(d => d.trim().toUpperCase())
          : [];
        const availableCount =  availableDaysList.length;
        setAvailableDays(availableCount);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleCardClick = (cardType) => {
    const routes = {
      'today-appointments': `/app/doctor/today-appointments`,
      'availability': `/app/doctor/availability`
    };
    
    navigate(routes[cardType]);
  };

  const formatTime = (time) => {
    if (!time) return 'Time TBD';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Good Morning, {user?.name || 'Doctor'}! ☺️</h1>
            <p>Here's a quick look at your day.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Today's Appointments Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 border-2 hover:border-blue-300 group"
          onClick={() => handleCardClick('today-appointments')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                  Today's Appointments
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {todayCount}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 border-2 hover:border-purple-300 group"
          onClick={() => handleCardClick('availability')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-md font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                  Available Days
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {availableDays}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-purple-600 group-hover:text-purple-700 transition-colors" />
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule Preview */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Today's Schedule Preview
              </CardTitle>
              <CardDescription>
                Your next few appointments for today
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => handleCardClick('today-appointments')}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-blue-600 min-w-20">
                      {formatTime(appointment.timeSlot)}
                    </div>
                    <div>
                      <h4 className="font-medium">{appointment.patientName || `Patient #${appointment.patientId}`}</h4>
                      <p className="text-sm text-gray-500">{appointment.appointmentType}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={(appointment.status || '').toLowerCase() === 'confirmed' ? 'default' : 'secondary'}
                    className={(appointment.status || '').toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {appointment.status || 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Universal Search Modal */}
      {showSearch && (
        <UniversalSearch 
          onClose={() => {
            setShowSearch(false);
            setSearchQuery('');
          }}
          initialQuery={searchQuery}
        />
      )}
    </div>
  );
}