import React, { useState, useRef, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import {User, Clock, Phone, Edit, Camera, Mail, Calendar, Shield, Heart, MapPin, CheckCircle2, Upload, Save, X, CreditCard, Stethoscope, DollarSign, Award, Settings, Star, CalendarDays} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

import { userMgmtApi } from '../services/api';
 
let healthcare_user = JSON.parse(localStorage.getItem("healthcare_user"));
 
const ProfileHeader = ({ title, subtitle, gradient }) => (
  <div className="text-center space-y-2">
    <h1 className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
      {title}
    </h1>
    <p className="text-gray-600 text-lg">{subtitle}</p>
  </div>
);
 
const CompletionCard = ({ completion, gradient, icon: Icon, title, subtitle }) => (
  <Card className={`border-0 shadow-xl bg-gradient-to-r ${gradient} text-white`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="opacity-90">{subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{completion}%</div>
          <div className="text-sm opacity-90">Complete</div>
        </div>
      </div>
      <Progress value={completion} className="h-3 bg-white/20" />
    </CardContent>
  </Card>
);
 
const AvatarSection = ({ gradient, roleId, badgeIcon: BadgeIcon, badgeText, secondaryBadge, isEditing, avatarPreview, formData, fileInputRef, handleAvatarUpload }) => (
  <div className="flex flex-col items-center space-y-4">
    <div className="relative group">
      <Avatar className={`h-32 w-32 border-4 ${gradient} shadow-2xl`}>
        <AvatarImage src={avatarPreview || formData.avatar} className="object-cover" />
        <AvatarFallback className={`text-3xl bg-gradient-to-br ${gradient.replace('border-', '')} text-white`}>
          {formData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      {isEditing && (
        <div
          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-8 h-8 text-white" />
        </div>
      )}
    </div>
    {isEditing && (
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        <Upload className="w-4 h-4 mr-2" />Upload Photo
      </Button>
    )}
    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
 
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
      <BadgeIcon className="w-4 h-4" />
      <span className="font-semibold text-sm">ID: {roleId}</span>
    </div>
    {secondaryBadge && secondaryBadge}
  </div>
);
 
const FormField = ({ label, icon: Icon, value, displayValue, onChange, type = "text", options, isTextarea, readOnly, placeholder, fieldKey, isEditing }) => {
  const inputId = `field_${fieldKey}`;
  const valueToString = (val) => (Array.isArray(val) ? val.join(', ') : val || '');
 
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </Label>
      {isEditing && !readOnly ? (
        type === "select" ? (
          <select
            id={inputId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-12 px-3 border-2 focus:border-blue-500 rounded-lg bg-white"
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : isTextarea ? (
          <Textarea
            id={inputId}
            value={valueToString(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-24 px-3 py-2 border-2 focus:border-blue-500 rounded-lg resize-none"
            placeholder={placeholder}
          />
        ) : (
          <Input
            id={inputId}
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 border-2 focus:border-blue-500 rounded-lg"
            placeholder={placeholder}
          />
        )
      ) : (
        <div className="h-12 px-3 py-2 bg-gray-50 border-2 border-gray-100 rounded-lg flex items-center">
          <span className="font-medium text-gray-800">{displayValue || valueToString(value) || 'Not provided'}</span>
        </div>
      )}
    </div>
  );
};
 
export default function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
 
  const userRole = user?.role;
  const isPatient = userRole === 'patient';
  const isDoctor = userRole === 'doctor';

  const generateId = (prefix) => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${random}`;
  };
 
  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.length > 0) return value.split(',').map(s => s.trim());
    return [];
  };
 
  const toString = (value) => {
    if (Array.isArray(value)) return value.join(', ');
    return value || '';
  }
 
  const getInitialFormData = (srcUser = user) => {
    const baseData = {
      name: srcUser?.name || '',
      email: srcUser?.email || '',
      phone: srcUser?.phone || '',
      avatar: srcUser?.avatar || ''
    };
 
    if (isPatient) {
      return {
        ...baseData,
        patient_id: srcUser?.patient_id || generateId('PAT'),
        gender: srcUser?.gender || '',
        blood_type: srcUser?.blood_type || '',
        emergency_contact: srcUser?.emergency_contact || '',
        address: srcUser?.address || '',
        date_of_birth: srcUser?.date_of_birth || srcUser?.dateOfBirth || '',
        medical_history: toArray(srcUser?.medical_history || srcUser?.medicalHistory),
        allergies: toArray(srcUser?.allergies)
      };
    }
 
    if (isDoctor) {
      return {
        ...baseData,
        doctor_id: srcUser?.doctor_id || generateId('DOC'),
        specialization: srcUser?.specialization || srcUser?.specialty || '',
        experience: srcUser?.experience || '',
        hospital: srcUser?.hospital || '',
        fee: srcUser?.fee || srcUser?.consultationFee || '',
        about: srcUser?.about || srcUser?.bio || '',
        licenseNo: srcUser?.licenseNo || srcUser?.licenseNumber || '',
        availableDays: srcUser?.availableDays || '',
        startTime: srcUser?.startTime || '',
        endTime: srcUser?.endTime || '',
        rating: srcUser?.rating || 0,
        reviews: srcUser?.reviews || 0
      };
    }

    return baseData;
  };
 
  const [formData, setFormData] = useState(() => getInitialFormData(user));
  const [originalData, setOriginalData] = useState(() => getInitialFormData(user));
 
  useEffect(() => {
    const refresh = async () => {
      try {
        if (!user || !user.email) {
          throw new Error("User email not found in context.");
        }
        const emailId = user.email;
 
        let detailedProfile = null;
        const token = localStorage.getItem('healthcare_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
 
        try {
          if (isPatient) {
            const res = await userMgmtApi.get(`/app2/api/v1/patients/email/${encodeURIComponent(emailId)}`, { headers });
            detailedProfile = res.data;
          } else if (isDoctor) {
            const res = await userMgmtApi.get(`/app2/api/v1/doctors/email/${encodeURIComponent(emailId)}`, { headers });
            detailedProfile = res.data;
          }
        } catch (profileError) {
          console.warn("Could not fetch detailed profile, assuming new user.", profileError.response?.data || profileError.message);
        }
 
        let averageRating = 0;
        let reviewCount = 0;
 
        if (isDoctor && detailedProfile && detailedProfile.id) {
          try {
            const feedbackRes = await userMgmtApi.get(
              `/app2/api/v1/feedbacks/doctor/${detailedProfile.id}`,
              { headers }
            );
 
            const feedbacks = feedbackRes.data || [];
            reviewCount = feedbacks.length;
 
            if (reviewCount > 0) {
              const totalRating = feedbacks.reduce((acc, fb) => acc + fb.rating, 0);
              averageRating = (totalRating / reviewCount).toFixed(1);
            }
          } catch (feedbackError) {
            console.warn("Could not fetch doctor ratings", feedbackError);
          }
        }
 
        const merged = {
          ...user,

          rating: averageRating,
          reviews: reviewCount,
         
          phone: user.phone || detailedProfile?.phone || '',
          date_of_birth: user.date_of_birth || user.dateOfBirth || detailedProfile?.dateOfBirth || detailedProfile?.date_of_birth || '', 
         
          // Patient specific
          address: detailedProfile?.homeAddress || user.address || '',
          blood_type: detailedProfile?.bloodType || user.blood_type || '',
          emergency_contact: detailedProfile?.emergencyContact || user.emergency_contact || '',
          medical_history: toArray(detailedProfile?.medicalHistory || user.medical_history),
          allergies: toArray(detailedProfile?.allergies || user.allergies),
 
          // Doctor specific
          specialization: detailedProfile?.specialization || user.specialization || '',
          experience: detailedProfile?.experience || user.experience || '',
          fee: detailedProfile?.fee || user.fee || '',
          licenseNo: detailedProfile?.licenseNo || user.licenseNo || '',
          availableDays: detailedProfile?.availableDays || user.availableDays || '',
          startTime: detailedProfile?.startTime || user.startTime || '',
          endTime: detailedProfile?.endTime || user.endTime || '',
        };

        updateUser(merged);
        const initialData = getInitialFormData(merged);
        setFormData(initialData);
        setOriginalData(initialData);
        setAvatarPreview(merged?.avatar || null);
 
      } catch (error) {
        console.error("Error refreshing profile data:", error);
        toast.error("Could not load your profile.");
        const initialData = getInitialFormData(user);
        setFormData(initialData);
        setOriginalData(initialData);
        setAvatarPreview(user?.avatar || null);
      } finally {
        setLoading(false);
      }
    };
 
    if (user && loading) {
      refresh();
    }
  }, [user, loading, isPatient, isDoctor, updateUser]);
 
  const calculateProfileCompletion = () => {
    const requiredFields = {
      patient: ['name', 'phone', 'gender', 'blood_type', 'emergency_contact', 'address', 'date_of_birth', 'medical_history', 'allergies'],
      doctor: ['name', 'phone', 'specialization', 'experience', 'fee', 'licenseNo', 'availableDays', 'startTime', 'endTime']
    };
 
    const fields = requiredFields[userRole] || [];
    const filledFields = fields.filter(field => {
      const value = formData[field];
      return Array.isArray(value) ? value.length > 0 : value && value.toString().trim();
    });
 
    return fields.length ? Math.round((filledFields.length / fields.length) * 100) : 0;
  };
 
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
 
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
 
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }
 
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
      setFormData(prev => ({ ...prev, avatar: e.target.result }));
    };
    reader.readAsDataURL(file);
  };
 
  const handleSave = async () => {
    setIsUploading(true);
    try {
      const token = localStorage.getItem('healthcare_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
 
      const baseUserPayload = {
        name: formData.name,
        phoneNumber: formData.phone || formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.date_of_birth || formData.dateOfBirth,
        gender: formData.gender,
        avatar: formData.avatar,
        userRole: healthcare_user.role.toUpperCase()
      };

      await userMgmtApi.patch(`/app1/api/v1/user/${healthcare_user.email}`, baseUserPayload, { headers });
 
      if (healthcare_user.role === 'patient') {
        const userRes = await userMgmtApi.get(`/app2/api/v1/patients/email/${encodeURIComponent(healthcare_user.id)}`);
        const userDto = userRes.data || {};
 
        if (userDto.id) {
          const patientPayload = {
            emailId: userDto.emailId,
            homeAddress: formData.address || '',
            bloodType: (formData.blood_type) || '',
            emergencyContact: formData.emergency_contact || '',
            medicalHistory: toString(formData.medical_history),
            allergies: toString(formData.allergies),
          };
 
          const response = await userMgmtApi.put(
            `/app2/api/v1/patients/${userDto.id}`,
            patientPayload,
            { headers }
          );
 
          const updatedPatientProfile = response.data;
         
          const mergedUpdatedUser = {
            ...user, 
            ...baseUserPayload,
            ...updatedPatientProfile,
            address: updatedPatientProfile.homeAddress,
            blood_type: updatedPatientProfile.bloodType,
            emergency_contact: updatedPatientProfile.emergencyContact,
            medical_history: toArray(updatedPatientProfile.medicalHistory),
            allergies: toArray(updatedPatientProfile.allergies),
            date_of_birth: baseUserPayload.dateOfBirth,
            phone: baseUserPayload.phoneNumber,
            name: baseUserPayload.name,
          };
 
          updateUser(mergedUpdatedUser);
          const newData = getInitialFormData(mergedUpdatedUser);
          setFormData(newData);
          setOriginalData(newData);
          toast.success('Patient profile updated successfully! 🎉');
        } else {
          throw new Error('Patient profile not found, cannot update.');
        }
 
      } else if (healthcare_user.role === 'doctor') {
        const userRes = await userMgmtApi.get(`/app2/api/v1/doctors/email/${encodeURIComponent(healthcare_user.id)}`);
        const userDto = userRes.data || {};
 
        if (userDto.id) {
          const doctorPayload = {
            emailId: userDto.emailId,
            fee: Number(formData.fee || 0),
            specialization: formData.specialization || '',
            experience: (formData.experience || '').toString(),
            licenseNo: formData.licenseNo || '',
            availableDays: formData.availableDays || '',
            startTime: formData.startTime || '',
            endTime: formData.endTime || '',
          };
 
          const response = await userMgmtApi.put(
            `/app2/api/v1/doctors/${userDto.id}`,
            doctorPayload,
            { headers }
          );
         
          const updatedDoctorProfile = response.data;
          const mergedUpdatedUser = {
            ...user,
            ...formData, 
            ...baseUserPayload,
            ...updatedDoctorProfile,
            date_of_birth: baseUserPayload.dateOfBirth,
            phone: baseUserPayload.phoneNumber,
          };
         
          updateUser(mergedUpdatedUser);
          const newData = getInitialFormData(mergedUpdatedUser);
          setFormData(newData);
          setOriginalData(newData);
          toast.success('Doctor profile updated successfully! 🎉');
        } else {
          throw new Error('Doctor profile not found, cannot update.');
        }
      }
     
      setIsEditing(false);
 
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
 
 
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
 
  const handleCancel = () => {
    setFormData(originalData);
    setAvatarPreview(originalData?.avatar || null);
    setIsEditing(false);
  };
 
 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }
 
  const profileCompletion = calculateProfileCompletion();
 
  const roleConfigs = {
    patient: {
      title: "Patient Profile",
      subtitle: "Manage your personal and medical information",
      gradient: "from-blue-600 to-purple-600",
      cardGradient: "from-blue-500 to-purple-600",
      avatarGradient: "border-gradient-to-br from-blue-400 to-purple-500",
      icon: User,
      badgeIcon: CreditCard,
      roleId: formData.patient_id
    },
    doctor: {
      title: "Doctor Profile",
      subtitle: "Manage your professional information and practice details",
      gradient: "from-green-600 to-emerald-600",
      cardGradient: "from-green-500 to-emerald-600",
      avatarGradient: "border-gradient-to-br from-green-400 to-emerald-500",
      icon: Stethoscope,
      badgeIcon: Award,
      roleId: formData.doctor_id,
      secondaryBadge: (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <Star className="w-4 h-4" />
          <span className="font-semibold text-sm">{formData.rating} ⭐ ({formData.reviews} reviews)</span>
        </div>
      )
    }
  };
 
  const config = roleConfigs[userRole] || roleConfigs.patient;
 
  const getFormFields = () => {
    const commonFields = [
      { key: 'name', label: 'Full Name', icon: User, placeholder: 'Enter your full name' },
      { key: 'email', label: 'Email Address', icon: Mail, readOnly: true },
      { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: 'Enter your phone number' }
    ];
 
    const roleFields = {
      patient: [
        ...commonFields,
        { key: 'gender', label: 'Gender', icon: User, type: 'select', options: ['Male', 'Female', 'Other'] },
        { key: 'date_of_birth', label: 'Date of Birth', icon: Calendar, type: 'date' },
        { key: 'blood_type', label: 'Blood Type', icon: Heart, type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
        { key: 'emergency_contact', label: 'Emergency Contact', icon: Phone, placeholder: 'Emergency contact number' },
        { key: 'address', label: 'Home Address', icon: MapPin, isTextarea: true, placeholder: 'Enter your complete address' },
        { key: 'medical_history', label: 'Medical History', icon: Heart, isTextarea: true, placeholder: 'e.g., Diabetes, Hypertension' },
        { key: 'allergies', label: 'Allergies', icon: Heart, isTextarea: true, placeholder: 'e.g., Peanuts, Penicillin' }
      ],
      doctor: [
        ...commonFields,
        { key: 'specialization', label: 'Specialization', icon: Stethoscope, placeholder: 'Enter your specialization' },
        { key: 'experience', label: 'Years of Experience', icon: Calendar, type: 'number', placeholder: 'Years of experience', format: (val) => val ? `${val} years` : 'Not provided' },
        { key: 'fee', label: 'Consultation Fee', icon: DollarSign, type: 'number', placeholder: 'Consultation fee', format: (val) => val ? `$${val}` : 'Not provided' },
        { key: 'licenseNo', label: 'License Number', icon: Award, placeholder: 'Enter your License Number' },
        { key: 'availableDays', label: 'Availability', icon: CalendarDays, placeholder: 'e.g., MON,TUE,WED' },
        { key: 'startTime', label: 'Start Time', icon: Clock, placeholder: 'HH:mm e.g., 09:00' },
        { key: 'endTime', label: 'End Time', icon: Clock, placeholder: 'HH:mm e.g., 17:00' }
      ]
    };
    return roleFields[userRole] || roleFields.patient;
  };
 
  return (
    <div className={`min-h-screen bg-gradient-to-br from-${config.gradient.split('-')[1]}-50 via-white to-${config.gradient.split('-')[3]}-50 -m-6 p-6`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <ProfileHeader title={config.title} subtitle={config.subtitle} gradient={config.gradient} />
 
        <CompletionCard
          completion={profileCompletion}
          gradient={config.cardGradient}
          icon={CheckCircle2}
          title={isPatient ? "Profile Completion" : isDoctor ? "Professional Profile" : "Administrative Profile"}
          subtitle={isPatient ? "Complete your profile to get better recommendations" : isDoctor ? "Keep your professional information updated" : "Maintain your system administration credentials"}
        />
 
        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className={`p-2 bg-gradient-to-br ${config.cardGradient} rounded-full text-white`}>
                  <config.icon className="w-6 h-6" />
                </div>
                {isPatient ? "Personal Information" : isDoctor ? "Professional Information" : "Administrator Information"}
              </CardTitle>
              <Button
                variant={isEditing ? "destructive" : "default"}
                size="lg"
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                className={isEditing ? "" : `bg-gradient-to-r ${config.cardGradient} hover:from-${config.cardGradient.split('-')[1]}-600 hover:to-${config.cardGradient.split('-')[3]}-700`}
              >
                {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
 
          <CardContent className="space-y-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <AvatarSection
                gradient={config.avatarGradient}
                roleId={config.roleId}
                badgeIcon={config.badgeIcon}
                secondaryBadge={config.secondaryBadge}
                isEditing={isEditing}
                avatarPreview={avatarPreview}
                formData={formData}
                fileInputRef={fileInputRef}
                handleAvatarUpload={handleAvatarUpload}
              />
 
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getFormFields().map(field => (
                    <FormField
                      key={field.key}
                      fieldKey={field.key}
                      label={field.label}
                      icon={field.icon}
                      value={formData[field.key]}
                      displayValue={field.format ? field.format(formData[field.key]) : null}
                      onChange={(value) => handleInputChange(field.key, value)}
                      type={field.type}
                      options={field.options}
                      isTextarea={field.isTextarea}
                      readOnly={field.readOnly}
                      placeholder={field.placeholder}
                      isEditing={isEditing}
                    />
                  ))}
                </div>
 
                {isEditing && (
                  <div className="flex gap-4 pt-6 border-t">
                    <Button
                      onClick={handleSave}
                      disabled={isUploading}
                      className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-3 text-lg font-semibold shadow-lg`}
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-5 h-5" />Save Changes
                        </div>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="px-8 py-3 text-lg font-semibold border-2">
                      <X className="w-5 h-5 mr-2" />Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
 
 