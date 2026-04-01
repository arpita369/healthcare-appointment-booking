import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Search, DollarSign, Stethoscope, X, Mail, Phone, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { userMgmtApi } from '../../services/api';

// Configuration based on user role
const ROLE_CONFIG = {
  patient: {
    title: 'Find Your Doctor',
    subtitle: 'Search and book appointments with top-rated doctors',
    placeholder: 'Search doctors by name, email, or specialization...',
    tips: [
      'Search by doctor email (e.g., "doctor@example.com")',
      'Search by specialization (e.g., "Cardiology", "Pediatrics")',
      'Click on any doctor to book an appointment'
    ]
  },
  doctor: {
    title: 'Search Your Patients',
    subtitle: 'Find patients by name, email, or medical condition',
    placeholder: 'Search patients by name, email, or medical history...',
    tips: [
      'Search by patient email (e.g., "patient@example.com")',
      'Search by medical condition (e.g., "Diabetes")',
      'Click on any patient to view their records'
    ]
  },
  admin: {
    title: 'Universal Search',
    subtitle: 'Search across all system data',
    placeholder: 'Search doctors, patients, or system data...',
    tips: [
      'Search for doctors by email or specialization',
      'Search for patients by email',
      'Click on any result to view details'
    ]
  }
};

// Utility functions
const getSpecializationColor = (specialization) => {
  if (!specialization) return 'bg-gray-100 text-gray-800';
  const colors = {
    'Cardiology': 'bg-red-100 text-red-800',
    'Dermatology': 'bg-green-100 text-green-800',
    'Family Medicine': 'bg-blue-100 text-blue-800',
    'Orthopedics': 'bg-purple-100 text-purple-800',
    'Pediatrics': 'bg-pink-100 text-pink-800',
    'Neurology': 'bg-indigo-100 text-indigo-800',
  };
  return colors[specialization] || 'bg-gray-100 text-gray-800';
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// UPDATED DOCTOR CARD
const DoctorResultCard = ({ result, onSelect }) => (
  <Card
    className="hover:shadow-md transition-all cursor-pointer border-2 hover:border-blue-200 bg-white"
    onClick={() => onSelect(result)}
  >
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16 ring-2 ring-blue-100">
          <AvatarImage src={result.avatar} alt={result.emailId} />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
            {result.emailId.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{result.emailId}</h3>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getSpecializationColor(result.specialization)}>
                  {result.specialization || 'N/A'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Stethoscope className="w-4 h-4" />
              <span>{result.experience || 'N/A'} years exp.</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${result.fee || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                ID: {result.id}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// UPDATED PATIENT CARD
const PatientResultCard = ({ result, onSelect }) => (
  <Card
    className="hover:shadow-md transition-all cursor-pointer border-2 hover:border-green-200 bg-white"
    onClick={() => onSelect(result)}
  >
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16 ring-2 ring-green-100">
          <AvatarImage src={result.avatar} alt={result.emailId} />
          <AvatarFallback className="bg-green-100 text-green-600 text-lg font-semibold">
            {result.emailId.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {result.emailId || 'Unknown Patient'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span className="truncate">{result.emailId}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{result.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Medical History */}
          {(result.medicalHistory || "").length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Medical History:</p>
              <div className="flex flex-wrap gap-1">
                {result.medicalHistory.split(',').slice(0, 3).map((condition, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`text-xs ${result.matchedCondition === condition.trim() ? 'bg-yellow-100 border-yellow-300' : ''}`}
                  >
                    {condition.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Matched condition highlight */}
          {result.matchedCondition && (
            <div className="flex items-center gap-1 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              <span>Matches condition: <strong>{result.matchedCondition}</strong></span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// UPDATED Main Component
const UniversalSearch = ({ onClose, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const config = ROLE_CONFIG[user?.role] || ROLE_CONFIG.admin;

  // UPDATED searchByRole function
  const searchByRole = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('healthcare_token');
      const headers = { Authorization: `Bearer ${token}` };
      const lowerCaseQuery = searchQuery.toLowerCase();
      
      let searchResults = [];

      if (user?.role === 'patient') {
        const res = await userMgmtApi.get('/app2/api/v1/doctors', { headers });
        const allDoctors = res.data || [];
        
        searchResults = allDoctors.filter(doctor =>
          (doctor.emailId && doctor.emailId.toLowerCase().includes(lowerCaseQuery)) ||
          (doctor.specialization && doctor.specialization.toLowerCase().includes(lowerCaseQuery))
        ).map(doctor => ({ ...doctor, type: 'doctor' }));

      } else if (user?.role === 'doctor') {
        const res = await userMgmtApi.get('/app2/api/v1/patients', { headers });
        const allPatients = res.data || [];
        
        searchResults = allPatients.filter(patient => {
          const matchedCondition = (patient.medicalHistory || "").split(',')
            .find(condition => condition.trim().toLowerCase().includes(lowerCaseQuery));
          
          return (patient.emailId && patient.emailId.toLowerCase().includes(lowerCaseQuery)) ||
                 (patient.name && patient.name.toLowerCase().includes(lowerCaseQuery)) || // Assuming name might exist
                 matchedCondition;
        
        }).map(patient => {
          const matchedCondition = (patient.medicalHistory || "").split(',')
            .find(condition => condition.trim().toLowerCase().includes(lowerCaseQuery));
          return { ...patient, type: 'patient', matchedCondition: matchedCondition ? matchedCondition.trim() : null };
        });

      } else if (user?.role === 'admin') {
        // Admin fetches both
        const [doctorRes, patientRes] = await Promise.all([
          userMgmtApi.get('/app2/api/v1/doctors', { headers }),
          userMgmtApi.get('/app2/api/v1/patients', { headers })
        ]);

        const allDoctors = doctorRes.data || [];
        const allPatients = patientRes.data || [];

        const doctorResults = allDoctors.filter(doctor =>
          (doctor.emailId && doctor.emailId.toLowerCase().includes(lowerCaseQuery)) ||
          (doctor.specialization && doctor.specialization.toLowerCase().includes(lowerCaseQuery))
        ).map(doctor => ({ ...doctor, type: 'doctor' }));
        
        const patientResults = allPatients.filter(patient =>
          (patient.emailId && patient.emailId.toLowerCase().includes(lowerCaseQuery))
        ).map(patient => ({ ...patient, type: 'patient' }));

        searchResults = [...doctorResults, ...patientResults];
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Search failed: " + error.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Debounced search effect 
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchByRole(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchByRole]);

  // Handle selection based on result type
  const handleResultSelect = (result) => {
    const routes = {
      patient: {
        doctor: `/app/patient/appointments/book?doctorId=${result.id}&fromSearch=true`
      },
      doctor: {
        patient: `/app/doctor/patients/${result.id}`
      }
    };

    const route = routes[user?.role]?.[result.type];
    if (route) {
      navigate(route);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden bg-white shadow-2xl border border-gray-200 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-100">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Search className="w-5 h-5 text-blue-600" />
              {config.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{config.subtitle}</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4 bg-white">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={config.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Results */}
            <div className="lg:col-span-3">
              <div className="space-y-4 max-h-[500px] overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200 mx-2">
                    {query ? 'No results found matching your search.' : 'Start typing to search...'}
                  </div>
                ) : (
                  results.map((result) =>
                    result.type === 'doctor' ? (
                      <DoctorResultCard key={result.id} result={result} onSelect={handleResultSelect} />
                    ) : (
                      <PatientResultCard key={result.id} result={result} onSelect={handleResultSelect} />
                    )
                  )
                )}
              </div>
            </div>

            {/* Search Tips Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sticky top-0">
                <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Tips
                </h4>
                <ul className="text-xs text-blue-800 space-y-2">
                  {config.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversalSearch;