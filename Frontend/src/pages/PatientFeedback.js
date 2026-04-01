import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Star, Send, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userMgmtApi } from '../services/api'; // Your configured axios instance
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from '../components/ui/LoadingSpinner';
 

const StarRating = ({ field, form }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const rating = field.value;
 
  return (
    <div className="flex items-center space-x-1">
      {[...Array(10)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={starValue}
            className={`w-6 h-6 cursor-pointer ${
              starValue <= (hoverValue || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => form.setFieldValue(field.name, starValue)}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(0)}
          />
        );
      })}
      <span className="ml-3 text-lg font-semibold text-gray-700">
        {rating || 0} / 10
      </span>
    </div>
  );
};
 
const feedbackSchema = Yup.object().shape({
  doctor: Yup.string().required('Please select a doctor.'),
  notes: Yup.string()
    .min(10, 'Feedback must be at least 10 characters long.')
    .required('Feedback notes are required.'),
  rating: Yup.number()
    .min(1, 'Rating must be at least 1.')
    .max(10, 'Rating cannot be more than 10.')
    .required('Please provide a rating.'),
});
 
export default function PatientFeedback() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.email) {
        setError('You must be logged in to leave feedback.');
        setLoading(false);
        return;
      }
 
      try {
        setLoading(true);
        const token = localStorage.getItem('healthcare_token');
        const headers = { Authorization: `Bearer ${token}` };
 
        // Fetch list of doctors
        const doctorsRes = await userMgmtApi.get('/app2/api/v1/doctors', { headers });
        setDoctors(doctorsRes.data || []);
 
        // Fetch logged-in patient's details to get their ID
        const patientRes = await userMgmtApi.get(`/app2/api/v1/patients/email/${user.email}`, { headers });
        if (patientRes.data && patientRes.data.id) {
          setPatientId(patientRes.data.id);
        } else {
          throw new Error('Could not find patient profile.');
        }
 
        setError(null);
      } catch (err) {
        console.error('Error loading feedback data:', err);
        setError('Failed to load necessary data. Please try again.');
        toast.error('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
 
    loadData();
  }, [user]);
 
  // Form Submission Handler 
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('healthcare_token');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        setSubmitting(false);
        return;
      }
 
      const payload = {
        doctor: parseInt(values.doctor, 10),
        patient: patientId,
        notes: values.notes,
        rating: values.rating,
      };
 
      await userMgmtApi.post('/app2/api/v1/feedbacks', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      toast.success('Thank you! Your feedback has been submitted.');
      resetForm();
    } catch (err) {
      console.error('Feedback submission error:', err);
      if (err.response?.data?.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading feedback form..." />
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
 
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Submit Feedback
          </CardTitle>
          <CardDescription className="text-gray-600">
            We value your opinion. Please share your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <Formik
            initialValues={{
              doctor: '',
              notes: '',
              rating: 0,
            }}
            validationSchema={feedbackSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, setFieldValue }) => (
              <Form className="space-y-8">
                {/* Patient Info */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">
                    Patient
                  </Label>
                  <div className="flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{user.name || user.email}</p>
                      <p className="text-sm text-gray-600">Patient ID: {patientId}</p>
                    </div>
                  </div>
                </div>
 
                {/* Doctor Selection */}
                <div className="space-y-2 m-y-5">
                  <Label htmlFor="doctor" className="text-base font-semibold text-gray-700">
                    Select Doctor
                  </Label>
                  <Field
                    as={Select}
                    name="doctor"
                    onValueChange={(value) => setFieldValue('doctor', value)}
                  >
                    <SelectTrigger
                      id="doctor"
                      className={`h-12 ${errors.doctor && touched.doctor ? 'border-red-500' : ''}`}
                    >
                      <SelectValue placeholder="Choose the doctor you visited..." />
                    </SelectTrigger>
                    <SelectContent className= "bg-white">
                      {doctors.map((doc) => (
                        <SelectItem key={doc.id} value={String(doc.id)}>
                          <div className="flex items-center gap-4">
                            <Stethoscope className="w-4 h-4 text-gray-500" />
                            <div>
                              {/* Use emailId as it seems 'name' is not available */}
                              <p className="font-medium ">{doc.emailId || `Dr. ID ${doc.id}`}</p>
                              {/* <p className="text-sm text-gray-500">{doc.specialization || 'General'}</p> */}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Field>
                  <ErrorMessage name="doctor" component="p" className="text-sm text-red-600" />
                </div>
 
                {/* Rating */}
                <div className="space-y-3">
                  <Label htmlFor="rating" className="text-base font-semibold text-gray-700">
                    Your Rating (1-10)
                  </Label>
                  <Field name="rating" component={StarRating} />
                  <ErrorMessage name="rating" component="p" className="text-sm text-red-600" />
                </div>
 
                {/* Feedback Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-base font-semibold text-gray-700">
                    Feedback Notes
                  </Label>
                  <Field
                    as={Textarea}
                    id="notes"
                    name="notes"
                    placeholder="Please provide at least 10 characters of feedback about your experience..."
                    rows={6}
                    className={`resize-none ${errors.notes && touched.notes ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="notes" component="p" className="text-sm text-red-600" />
                </div>
 
                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
 