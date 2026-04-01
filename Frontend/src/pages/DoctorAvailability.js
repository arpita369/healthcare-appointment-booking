import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { userMgmtApi } from '../services/api';
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar as CalendarIcon, Send, ListX } from 'lucide-react';


const getNextWeekRange = () => {
  const today = new Date();
  const todayDay = today.getDay();
  
  const daysUntilNextMonday = (todayDay === 0) ? 1 : (8 - todayDay); 
  
  const nextMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const nextSunday = new Date(nextMonday.getFullYear(), nextMonday.getMonth(), nextMonday.getDate() + 6);
  nextSunday.setHours(23, 59, 59, 999);

  return { nextMonday, nextSunday };
};

const toYYYYMMDD = (date) => {
  return date.toISOString().split('T')[0];
};

const { nextMonday, nextSunday } = getNextWeekRange();

const UnavailabilitySchema = Yup.object().shape({
  date: Yup.string()
    .required('You must select a date.')
    .test(
      'is-in-range',
      'Date must be within next week (Mon-Sun)',
      (value) => {
        if (!value) return false;
        const selectedDate = new Date(value);
        return selectedDate >= nextMonday && selectedDate <= nextSunday;
      }
    ),
  reason: Yup.string()
    .required('A reason is required.')
    .min(5, 'Reason must be at least 5 characters long.'),
});

export default function DoctorAvailability() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [unavailabilities, setUnavailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  const dateRangeDisplay = useMemo(() => {
    const options = { month: 'short', day: 'numeric' };
    return `${nextMonday.toLocaleDateString(undefined, options)} - ${nextSunday.toLocaleDateString(undefined, options)}`;
  }, []);

  useEffect(() => {
    const fetchDoctorAndAvailability = async () => {
      if (!user || !user.email) {
        toast.error("Could not find user. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('healthcare_token');
        const headers = { Authorization: `Bearer ${token}` };

        const doctorsList = await userMgmtApi.get('/app2/api/v1/doctors', { headers });
        const loggedInDoctor = (doctorsList.data || []).find(d => d.emailId === user.email);

        if (!loggedInDoctor) {
          throw new Error("Doctor profile not found.");
        }
        setDoctor(loggedInDoctor);

        await fetchUnavailabilities(loggedInDoctor.id, headers);

      } catch (err) {
        console.error("Error loading data:", err);
        toast.error(err.message || "Failed to load availability data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAndAvailability();
  }, [user]);

  const fetchUnavailabilities = async (doctorId, headers) => {
    try {
      const res = await userMgmtApi.get(`/app2/api/doctors/availability/${doctorId}`, { headers });
      const sorted = (res.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      setUnavailabilities(sorted);
    } catch (err) {
      console.error("Error fetching unavailabilities:", err);
      toast.error("Could not refresh unavailability list.");
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const token = localStorage.getItem('healthcare_token');
    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      date: values.date, 
      reason: values.reason,
    };

    try {
      console.log('payload ',payload)
      await userMgmtApi.post(
        `/app2/api/doctors/availability/${doctor.id}/unavailable`,
        payload,
        { headers }
      );
      toast.success("Unavailability declared successfully!");
      resetForm();
      await fetchUnavailabilities(doctor.id, headers);
    } 
    catch (err) {
      console.error("Error declaring unavailability:", err);
      const errorMsg = err.response?.data?.message || "An error occurred.";
      toast.error(`Error: ${errorMsg}`);
    } 
    finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading availability..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">   
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Declare Unavailability
          </CardTitle>
          <CardDescription>
            Select a date in the **next week** ({dateRangeDisplay}) to mark as unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ date: '', reason: '' }}
            validationSchema={UnavailabilitySchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Date Input */}
                <div className="md:col-span-1 space-y-2">
                  <Label htmlFor="date">Date (Next Week Only)</Label>
                  <Field
                    as={Input}
                    type="date"
                    id="date"
                    name="date"
                    min={toYYYYMMDD(nextMonday)}
                    max={toYYYYMMDD(nextSunday)}
                    className={errors.date && touched.date ? 'border-red-500' : ''}
                  />
                  <ErrorMessage name="date" component="p" className="text-sm text-red-600" />
                </div>

                {/* Reason Input */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Field
                    as={Input}
                    id="reason"
                    name="reason"
                    placeholder="e.g., Personal Leave, Conference"
                    className={errors.reason && touched.reason ? 'border-red-500' : ''}
                  />
                  <ErrorMessage name="reason" component="p" className="text-sm text-red-600" />
                </div>

                {/* Submit Button */}
                <div className="md:col-span-3">
                  <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit Unavailability
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
      
      {/* Scheduled Unavailability */}
      <Card>
        <CardHeader>
          <CardTitle>Your Scheduled Unavailability</CardTitle>
          <CardDescription>
            This is a list of all dates you have marked as unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unavailabilities.length > 0 ? (
            <div className="space-y-4">
              {unavailabilities.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(item.date).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Reason:</strong> {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <ListX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No Unavailable Dates</h3>
              <p className="text-gray-500">You have not scheduled any time off.</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}