import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, CheckCircle, AlertCircle, Github, Apple } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: yup.boolean().default(false)
});

export default function Login({ onSwitchToRegister, onBackToLanding }) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      
      toast.success('Welcome back! Login successful.', {
        description: 'Redirecting to your dashboard...',
        duration: 2000
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
    } catch (err) {
      toast.error('Login failed', {
        description: err.message || 'Invalid email or password. Please try again.',
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
                Simplifying Healthcare
                <br />
                <span className="text-blue-200">Management</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Access your health records, book appointments, and connect with healthcare professionals seamlessly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100">Secure & HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100">24/7 Access to Medical Records</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100">Easy Appointment Scheduling</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Login Form */}
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600">
              Sign in to access your healthcare dashboard
            </p>
          </div>

          {/* Login Form */}
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
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
                      leftIcon={<Mail className="h-4 w-4" />}
                      error={!!errors.email}
                      success={touchedFields.email && !errors.email}
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
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className={`h-12 ${
                        errors.password
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : touchedFields.password && !errors.password
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                      leftIcon={<Lock className="h-4 w-4" />}
                      error={!!errors.password}
                      success={touchedFields.password && !errors.password}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      {...register('rememberMe')}
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading || !isValid}
                  loading={isLoading}
                  loadingText="Signing In..."
                >
                  {!isLoading && (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Sign In Securely
                    </>
                  )}
                </Button>
              </form>

            </CardContent>
          </Card>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800   font-medium hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
