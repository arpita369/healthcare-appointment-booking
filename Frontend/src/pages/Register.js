import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Heart, User, Lock, Eye, EyeOff, Stethoscope, ArrowLeft, Mail, CheckCircle, AlertCircle, Shield, Apple, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import UserService from '../services/UserService';
import { useNavigate, Link } from 'react-router-dom';

// Validation schema
const registerSchema = yup.object().shape({
  name: yup.string().min(2, 'Name is too short').required('Name is required'),
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Please confirm your password'),
  role: yup.string().required('Please select a role'),
  phoneNumber: yup.string().matches(/^[0-9+() -]{7,20}$/,'Enter a valid phone number').required('Phone number is required'),
  gender: yup.string().oneOf(['Male','Female','Other']).required('Please select gender'),
  dateOfBirth: yup.date().max(new Date(), 'Date cannot be in future').required('Date of birth is required'),
  address: yup.string().min(5, 'Address is too short').required('Address is required'),
  terms: yup.boolean().oneOf([true], 'Please accept the terms and conditions'),
});

export default function Register({ onSwitchToLogin, onBackToLanding }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    control
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      phoneNumber: '',
      gender: '',
      dateOfBirth: '',
      address: '',
      terms: false
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const formData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
      };
      
      const res = await UserService.addUsers(formData);
      
      toast.success('Registration successful! Welcome to HealthCare.', {
        description: 'Please sign in to access your account',
        duration: 3000
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      
    } catch (err) {
      toast.error('Registration failed', {
        description: err.response?.data?.error || 'Please try again with different credentials.',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                  <Heart className="w-7 h-7" />
                </div>
                <span className="text-3xl font-bold">HealthCare</span>
              </div>
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Join Our Healthcare
                <br />
                <span className="text-blue-200">Community</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Create your account to access personalized healthcare services, manage appointments, and connect with medical professionals.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100">Free Account Creation</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100">Instant Access to Services</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100">Secure & Private Platform</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Back Button */}
          {onBackToLanding && (
            <Button
              variant="ghost"
              onClick={onBackToLanding}
              className="text-gray-600 hover:text-blue-600 -mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}

          {/* Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">HealthCare</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600">
              Join our healthcare platform today
            </p>
          </div>

          {/* Registration Form */}
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Type *</Label>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: 'Please select a role' }}
                    render={({ field }) => (
                      <RadioGroup className="flex gap-6" value={field.value} onValueChange={field.onChange}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="patient"
                            id="patient"
                            className={errors.role ? 'border-red-500' : ''}
                          />
                          <Label htmlFor="patient" className="flex items-center gap-2 cursor-pointer">
                            <User className="w-4 h-4" />
                            Patient
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="doctor"
                            id="doctor"
                            className={errors.role ? 'border-red-500' : ''}
                          />
                          <Label htmlFor="doctor" className="flex items-center gap-2 cursor-pointer">
                            <Stethoscope className="w-4 h-4" />
                            Doctor
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.role && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    {...register('name')}
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className={`h-12 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : touchedFields.name && !errors.name ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...register('email')}
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className={`pl-10 h-12 ${
                        errors.email
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : touchedFields.email && !errors.email
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    {touchedFields.email && !errors.email && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      className={`pl-10 pr-10 h-12 ${
                        errors.password
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : touchedFields.password && !errors.password
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...register('confirmPassword')}
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className={`pl-10 pr-10 h-12 ${
                        errors.confirmPassword
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : touchedFields.confirmPassword && !errors.confirmPassword
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    {...register('phoneNumber')}
                    id="phoneNumber"
                    type="text"
                    placeholder="Enter your phone number"
                    className={`h-12 ${errors.phoneNumber ? 'border-red-500 focus-visible:ring-red-500' : touchedFields.phoneNumber && !errors.phoneNumber ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gender *</Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup className="flex gap-6" value={field.value} onValueChange={field.onChange}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Male" id="gender_male" />
                          <Label htmlFor="gender_male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Female" id="gender_female" />
                          <Label htmlFor="gender_female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Other" id="gender_other" />
                          <Label htmlFor="gender_other">Other</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.gender && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                {/* DOB and Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth *</Label>
                    <Input
                      {...register('dateOfBirth')}
                      id="dateOfBirth"
                      type="date"
                      className={`h-12 ${errors.dateOfBirth ? 'border-red-500 focus-visible:ring-red-500' : touchedFields.dateOfBirth && !errors.dateOfBirth ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                    <Input
                      {...register('address')}
                      id="address"
                      type="text"
                      placeholder="Street, City, State, ZIP"
                      className={`h-12 ${errors.address ? 'border-red-500 focus-visible:ring-red-500' : touchedFields.address && !errors.address ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-2">
                  <input
                    {...register('terms')}
                    type="checkbox"
                    id="terms"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                        Privacy Policy
                      </Link>
                    </Label>
                    {errors.terms && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.terms.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading || !isValid}
                  loading={isLoading}
                  loadingText="Creating Account..."
                >
                  {!isLoading && (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
