import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useFormContext } from '../../contexts/FormContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import {
  MessageCircle, User, Mail, Phone, Clock, CheckCircle, AlertCircle,
  ArrowLeft, Send, Headphones, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
 
// Validation Schema
const contactSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Please enter a valid email address').required('Email is required'),
  phone: Yup.string()
    .matches(/^[\+]?[(]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  category: Yup.string().required('Please select a category'),
  priority: Yup.string().required('Please select priority level'),
  subject: Yup.string().min(5, 'Subject must be at least 5 characters').required('Subject is required'),
  message: Yup.string().min(10, 'Message must be at least 10 characters').required('Message is required')
});
 
// Static data
const supportCategories = [
  { value: 'appointment', label: 'Appointment Issues', icon: '📅' },
  { value: 'billing', label: 'Billing & Insurance', icon: '💳' },
  { value: 'medical', label: 'Medical Records', icon: '📋' },
  { value: 'prescription', label: 'Prescription Issues', icon: '💊' },
  { value: 'technical', label: 'Technical Support', icon: '🔧' },
  { value: 'general', label: 'General Inquiry', icon: '❓' },
  { value: 'complaint', label: 'Complaint', icon: '⚠️' },
  { value: 'feedback', label: 'Feedback', icon: '💭' }
];
 
const priorityLevels = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800', description: 'Response within 48-72 hours' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Response within 24 hours' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800', description: 'Response within 4-6 hours' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-200 text-red-900', description: 'Response within 1-2 hours' }
];
 
const ContactSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { renderFormField } = useFormContext();
 
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
 
  // Load patient data
  useEffect(() => {
    const loadPatientData = async () => {
      setLoading(true);
      try {
        const patientData = await getPatientInfo();
        setPatient(patientData);
      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setLoading(false);
      }
    };
   
    loadPatientData();
  }, []);
 
  const initialValues = {
    name: patient?.name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    category: '',
    priority: 'medium',
    subject: '',
    message: ''
  };
 
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const contactData = {
        ...values,
        patientId: patient?.id,
        submittedAt: new Date().toISOString()
      };
     
      const result = await submitContactForm(contactData);
     
      if (result.success) {
        toast.success('Message sent successfully!', {
          description: result.message
        });
       
        toast.info(`Ticket ID: ${result.ticketId}`, {
          description: 'Save this for your records'
        });
       
        resetForm({ values: { ...initialValues } });
       
        setTimeout(() => {
          navigate(`/app/${user?.role}/dashboard`);
        }, 3000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
 
  const getPriorityInfo = (priority) => priorityLevels.find(p => p.value === priority);
  const getCategoryInfo = (category) => supportCategories.find(c => c.value === category);
 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading contact form..." />
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
        <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
      </div>
 
      <Formik
        initialValues={initialValues}
        validationSchema={contactSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting, errors, touched }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Send us a Message
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Fill out this form and we'll get back to you as soon as possible
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Field
                            as={Input}
                            name="name"
                            placeholder="Enter your full name"
                            className={`pl-10 ${errors.name && touched.name ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.name && touched.name && (
                          <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>
 
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Field
                            as={Input}
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className={`pl-10 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.email && touched.email && (
                          <p className="text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                    </div>
 
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Field
                          as={Input}
                          name="phone"
                          placeholder="Enter your phone number"
                          className={`pl-10 ${errors.phone && touched.phone ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.phone && touched.phone && (
                        <p className="text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
 
                    {/* Category and Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select onValueChange={(value) => setFieldValue('category', value)} value={values.category}>
                          <SelectTrigger className={errors.category && touched.category ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select a category..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {supportCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  <span>{category.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && touched.category && (
                          <p className="text-sm text-red-600">{errors.category}</p>
                        )}
                      </div>
 
                      <div className="space-y-2">
                        <Label>Priority Level</Label>
                        <Select onValueChange={(value) => setFieldValue('priority', value)} value={values.priority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {priorityLevels.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${priority.color} px-2 py-1 text-xs`}>
                                    {priority.label}
                                  </Badge>
                                  <span className="text-sm">{priority.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
 
                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Field
                        as={Input}
                        name="subject"
                        placeholder="Brief description of your issue or inquiry"
                        className={errors.subject && touched.subject ? 'border-red-500' : ''}
                      />
                      {errors.subject && touched.subject && (
                        <p className="text-sm text-red-600">{errors.subject}</p>
                      )}
                    </div>
 
                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Field
                        as={Textarea}
                        name="message"
                        placeholder="Please provide detailed information about your issue or inquiry..."
                        className={errors.message && touched.message ? 'border-red-500' : ''}
                        rows={6}
                      />
                      <p className="text-xs text-gray-500">
                        Minimum 10 characters ({values.message.length}/10)
                      </p>
                      {errors.message && touched.message && (
                        <p className="text-sm text-red-600">{errors.message}</p>
                      )}
                    </div>
 
                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
 
              {/* Support Information Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Headphones className="w-5 h-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Phone Support</h4>
                      <p className="text-sm text-gray-600">+1 (555) 123-HELP</p>
                      <p className="text-xs text-gray-500">Monday - Friday: 8AM - 8PM EST</p>
                    </div>
                   
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
                      <p className="text-sm text-gray-600">support@healthcare.com</p>
                      <p className="text-xs text-gray-500">Response within 24 hours</p>
                    </div>
 
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Emergency</h4>
                      <p className="text-sm text-red-600 font-medium">Call 911</p>
                      <p className="text-xs text-gray-500">For life-threatening emergencies</p>
                    </div>
                  </CardContent>
                </Card>
 
                {/* Response Times */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Response Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {priorityLevels.map((priority) => (
                      <div key={priority.value} className="flex items-center gap-3">
                        <Badge className={`${priority.color} px-2 py-1 text-xs`}>
                          {priority.label}
                        </Badge>
                        <span className="text-sm text-gray-600">{priority.description}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
 
                {/* Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Tips for Faster Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Be specific about your issue</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Include relevant dates and times</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Select the correct category</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Provide your patient ID if available</span>
                    </div>
                  </CardContent>
                </Card>
 
                {/* Current Form Summary */}
                {(values.category || values.priority !== 'medium') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Request Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {values.category && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Category:</span>
                          <div className="flex items-center gap-1">
                            <span>{getCategoryInfo(values.category)?.icon}</span>
                            <span className="text-sm font-medium">
                              {getCategoryInfo(values.category)?.label}
                            </span>
                          </div>
                        </div>
                      )}
                     
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Priority:</span>
                        <Badge className={`${getPriorityInfo(values.priority)?.color} px-2 py-1 text-xs`}>
                          {getPriorityInfo(values.priority)?.label}
                        </Badge>
                      </div>
                     
                      <div className="text-xs text-gray-500 mt-2">
                        Expected response: {getPriorityInfo(values.priority)?.description}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
 
export default ContactSupport;