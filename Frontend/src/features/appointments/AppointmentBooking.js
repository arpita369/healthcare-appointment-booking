import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Calendar as CalendarIcon, Clock, User, Stethoscope, DollarSign, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import AppointmentService from '../../services/appointmentService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
 
// Validation Schema
const appointmentSchema = Yup.object().shape({
  doctorId: Yup.string().required('Please select a doctor'),
  appointmentDate: Yup.date()
    .required('Please select an appointment date')
    .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Cannot book appointments for past dates'),
  appointmentTime: Yup.string().required('Please select an appointment time'),
  appointmentType: Yup.string().required('Please select appointment type'),
  symptoms: Yup.string().required('Please describe your symptoms or reason for visit'),
  notes: Yup.string()
});

const generateTimeSlots = (startTimeStr, endTimeStr, intervalMinutes = 30) => {
  const slots = [];
  const dummyDate = '1970-01-01';
 
  try {
    const [startHour, startMin] = startTimeStr.split(':').map(Number);
    const [endHour, endMin] = endTimeStr.split(':').map(Number);
 
    let currentTime = new Date(`${dummyDate}T00:00:00Z`);
    currentTime.setUTCHours(startHour, startMin, 0, 0);
 
    const endTime = new Date(`${dummyDate}T00:00:00Z`);
    endTime.setUTCHours(endHour, endMin, 0, 0);
 
    while (currentTime < endTime) {
      const hour = currentTime.getUTCHours().toString().padStart(2, '0');
      const minute = currentTime.getUTCMinutes().toString().padStart(2, '0');
      slots.push(`${hour}:${minute}`);
      currentTime.setUTCMinutes(currentTime.getUTCMinutes() + intervalMinutes);
    }
   
    return slots;
 
  } catch (error) {
    console.error("Error parsing time for slot generation:", error);
    return [];
  }
};
 
const AppointmentBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const [patient, setPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
 
  const isFromSearch = searchParams.get('fromSearch') === 'true';
 
  const initialValues = {
    doctorId: searchParams.get('doctorId') || '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    symptoms: '',
    notes: ''
  };
 
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const patientId = await AppointmentService.resolvePatientIdByEmail(user?.email);
        setPatient({ id: patientId, name: user?.name, email: user?.email, phone: user?.phone });
 
        const docs = await AppointmentService.listDoctors();
        setDoctors(docs);
 
        const doctorId = searchParams.get('doctorId');
        if (doctorId) {
          const doctor = docs.find(d => String(d.id) === String(doctorId));
          if (doctor) setSelectedDoctor(doctor);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error loading appointment data');
      } finally {
        setLoading(false);
      }
    };
   
    loadData();
  }, [searchParams, user]);
 
  const loadSlots = async (doctorId, date) => {
    if (doctorId && date) {
      setSlotsLoading(true);
      setAvailableSlots([]);
      try {
        const doctor = doctors.find(d => String(d.id) === String(doctorId));
 
        if (!doctor || !doctor.startTime || !doctor.endTime) {
          console.warn(`Doctor ${doctorId} not found or has no availability set.`);
          return;
        }
       
        await new Promise(resolve => setTimeout(resolve, 300));
       
        const slots = generateTimeSlots(doctor.startTime, doctor.endTime, 30);
        setAvailableSlots(slots);
       
      } catch (error) {
        console.error('Error loading slots:', error);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }
  };
 
  const handleDoctorChange = (doctorId, setFieldValue) => {
    if (isFromSearch) {
      toast.error('Cannot change doctor when booking from search. Please start a new booking.');
      return;
    }
    const doctor = doctors.find(d => String(d.id) === String(doctorId));
    setSelectedDoctor(doctor || null);
    setFieldValue('doctorId', doctorId);
    setFieldValue('appointmentTime', '');
    setAvailableSlots([]);
  };
 
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const appointmentData = {
        appointmentDate: values.appointmentDate,
        timeSlot: values.appointmentTime,
        appointmentType: values.appointmentType,
        symptoms: values.symptoms,
        additionalNotes: values.notes,
        doctorId: Number(values.doctorId || selectedDoctor?.id),
        patientId: Number(patient?.id),
      };
 
      await AppointmentService.bookAppointment(appointmentData);
     
      toast.success('Appointment booked successfully!', {
        description: 'You will receive a confirmation email shortly.'
      });
     
      setTimeout(() => {
        navigate(`/app/${user?.role}/dashboard`);
      }, 2000);
 
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading appointment booking..." />
      </div>
    );
  }
 
  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/app/${user?.role}/dashboard`)}
          className="text-gray-700 hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        {isFromSearch && (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
            Selected from Search
          </Badge>
        )}
      </div>
 
      <Formik
        initialValues={initialValues}
        validationSchema={appointmentSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting, errors, touched }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Booking Form */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-gray-200 rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-800">
                      <CalendarIcon className="w-6 h-6 text-blue-600" />
                      Appointment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Patient Info */}
                    <div className="space-y-2">
                      <Label className="font-medium text-gray-700">Patient Information</Label>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                            <User className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{patient?.name}</p>
                            <p className="text-sm text-gray-600">{patient?.email}</p>
                            <p className="text-sm text-gray-600">{patient?.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
 
                    {/* Doctor Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="doctor" className="font-medium text-gray-700">
                        Select Doctor *
                        {isFromSearch && (
                          <span className="text-xs font-normal text-gray-500 ml-2">
                            (Cannot change - selected from search)
                          </span>
                        )}
                      </Label>
                      {isFromSearch && selectedDoctor ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg ">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.emailId || selectedDoctor.id}`} />
                              <AvatarFallback>
                                {String(selectedDoctor.emailId || selectedDoctor.id).slice(0,2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-blue-900">{selectedDoctor.emailId || `Doctor #${selectedDoctor.id}`}</p>
                              <p className="text-sm text-blue-700">{selectedDoctor.specialization}</p>
                            </div>
                          </div>
                       </div>
                      ) : (
                        <Select
                          onValueChange={(value) => handleDoctorChange(value, setFieldValue)}
                          value={values.doctorId}
                        >
                          <SelectTrigger className={cn("text-base h-auto p-3 [&>span]:line-clamp-none",errors.doctorId && touched.doctorId ? 'border-red-500' : 'border-gray-300')}>
                            <SelectValue placeholder="Choose a doctor..." />
                          </SelectTrigger>
                          <SelectContent className="z-[100] bg-white border shadow-md" position="popper">
                          {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={String(doctor.id)}>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="text-xs">
                                      {String(doctor.emailId || doctor.id).slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{doctor.emailId || `Doctor #${doctor.id}`}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {errors.doctorId && touched.doctorId && (
                        <p className="text-sm text-red-600">{errors.doctorId}</p>
                      )}
                    </div>
 
                    {/* --- STANDARD DATE SELECTION --- */}
                    <div className="space-y-2">
                      <Label htmlFor="appointmentDate" className="font-medium text-gray-700">Appointment Date *</Label>
                      <Input
                        type="date"
                        name="appointmentDate"
                        min={new Date().toISOString().split('T')[0]}
                        value={values.appointmentDate}
                        onChange={(e) => {
                          setFieldValue('appointmentDate', e.target.value);
                          setFieldValue('appointmentTime', '');
                          loadSlots(values.doctorId, e.target.value);
                        }}
                        className={cn(
                          "text-base h-10",
                          errors.appointmentDate && touched.appointmentDate ? 'border-red-500' : 'border-gray-300'
                        )}
                      />
                       {errors.appointmentDate && touched.appointmentDate && (
                        <p className="text-sm text-red-600">{String(errors.appointmentDate)}</p>
                      )}
                    </div>
 
                    {/* Time Slot Selection */}
                    <div className="space-y-2">
                      <Label className="font-medium text-gray-700">Available Time Slots *</Label>
                     
                      {slotsLoading ? (
                        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
                          <LoadingSpinner size="sm" text="Loading available slots..." />
                        </div>
                      ) : !values.appointmentDate ? (
                        <div className="p-3 text-center bg-gray-50 border border-gray-200 rounded-md">
                          <p className="text-sm text-gray-500">Please select a doctor and date first</p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="p-3 text-center bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">No available slots for this date. Please try another day.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              type="button"
                              variant={values.appointmentTime === slot ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFieldValue('appointmentTime', slot)}
                              className={cn(
                                "transition-all duration-150 ease-in-out transform hover:scale-105",
                                values.appointmentTime === slot
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 shadow-md'
                                  : 'hover:bg-blue-50 border-gray-300'
                              )}
                            >
                              <Clock className="w-4 h-4 mr-1.5" />
                              {slot}
                            </Button>
                          ))}
                        </div>
                      )}
                     
                      {errors.appointmentTime && touched.appointmentTime && (
                        <p className="text-sm text-red-600">{errors.appointmentTime}</p>
                      )}
                    </div>
 
                    {/* Appointment Type */}
                    <div className="space-y-2">
                      <Label className="font-medium text-gray-700">Appointment Type</Label>
                      <Select
                        onValueChange={(value) => setFieldValue('appointmentType', value)}
                        value={values.appointmentType}
                      >
                        <SelectTrigger className="text-base border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-md" position="popper">
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="check-up">Check-up</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
 
                    {/* Symptoms */}
                    <div className="space-y-2">
                      <Label htmlFor="symptoms" className="font-medium text-gray-700">Symptoms / Reason for Visit *</Label>
                      <Textarea
                        name="symptoms"
                        placeholder="Please describe your symptoms or reason for the appointment..."
                        value={values.symptoms}
                        onChange={(e) => setFieldValue('symptoms', e.target.value)}
                        className={cn("text-base", errors.symptoms && touched.symptoms ? 'border-red-500' : 'border-gray-300')}
                        rows={3}
                      />
                       {errors.symptoms && touched.symptoms && (
                        <p className="text-sm text-red-600">{errors.symptoms}</p>
                      )}
                    </div>
 
                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="font-medium text-gray-700">Additional Notes (Optional)</Label>
                      <Textarea
                        name="notes"
                        placeholder="Any additional information you'd like the doctor to know..."
                        value={values.notes}
                        onChange={(e) => setFieldValue('notes', e.target.value)}
                        rows={2}
                        className="text-base border-gray-300"
                      />
                    </div>
 
                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full text-lg font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300",
                        "bg-blue-600 hover:bg-blue-700 text-white",
                        isSubmitting && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" text="Booking..." />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Book Appointment
                        </>
                      )}
                    </Button>
                  </CardContent>
                 </Card>
              </div>
 
               {/* Doctor Info Sidebar */}
              <div className="space-y-6">
                {selectedDoctor && (
                  <Card className="shadow-lg rounded-xl border-gray-200 ">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-800">Doctor Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20 ring-4 ring-blue-100">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.emailId || selectedDoctor.id}`} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                            {String(selectedDoctor.emailId || selectedDoctor.id).slice(0,2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                         <h3 className="text-lg font-bold text-gray-900">{selectedDoctor.emailId || `Doctor #${selectedDoctor.id}`}</h3>
                          <p className="text-base text-blue-600 font-medium">{selectedDoctor.specialization}</p>
                        </div>
                      </div>
 
                      <div className="space-y-3 text-base pt-2">
                        <div className="flex items-center gap-3">
                          <Stethoscope className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">{selectedDoctor.experience || 'N/A'} {selectedDoctor.experience ? 'years experience' : ''}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">Consultation Fee: {selectedDoctor.fee != null ? `$${selectedDoctor.fee}` : 'N/A'}</span>
                       </div>
                        {selectedDoctor.licenseNo && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gray-100 text-gray-700 font-medium px-3 py-1">License: {selectedDoctor.licenseNo}</Badge>
                         </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
 
               {/* Booking Info - Themed Card */}
              <Card className="shadow-lg rounded-xl bg-blue-50 border border-blue-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2 text-blue-800">
                    <AlertCircle className="w-6 h-6" />
                    Booking Information
                  </CardTitle>
               </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Appointments are subject to doctor availability</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>You'll receive email confirmation within 24 hours</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Please arrive 15 minutes early for your appointment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <span>Cancellations must be made at least 24 hours in advance</span>
                  </div>
                </CardContent>
               </Card>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
 
export default AppointmentBooking;
 
 