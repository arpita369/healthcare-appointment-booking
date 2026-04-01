import api, { authApi, userMgmtApi } from './api';
 
const TOKEN_KEY = 'healthcare_token';
const USER_KEY = 'healthcare_user';
 
const saveSession = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};
 
const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

class UserService {
  async ensureUserMgmtProfile(user, token) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log(headers)
      if (user.role === 'patient') {
        let exists = false;
        try {
          await userMgmtApi.get(`/app2/api/v1/patients/email/${encodeURIComponent(user.id)}`);
          exists = true;
        } catch (_) {}
        if (!exists) {
        const payload = {
          emailId: user.email,
          homeAddress: user.address || '',
          bloodType: user.bloodType || '',
          emergencyContact: user.emergencyContact || '',
          medicalHistory: Array.isArray(user.medical_history) ? user.medical_history.join(', ') : (user.medicalHistory || ''),
          allergies: Array.isArray(user.allergies) ? user.allergies.join(', ') : (user.allergies || ''),
        };
        try {
         const userRes = await userMgmtApi.post('/app2/api/v1/patients', payload, { headers });
         const userDto = userRes.data || {};
         console.log(userDto);
         if (userDto.id) {
           localStorage.setItem("userId",userDto.id);
        } 
        }catch (err) {
          if (err?.response?.status !== 409) throw err;
        }
      }
      } else if (user.role === 'doctor') {
      
        let exists = false;
        try {
          await userMgmtApi.get(`/app2/api/v1/doctors/email/${encodeURIComponent(user.id)}`);
          exists = true;
        } catch (_) {}
        if (!exists) {
          const payload = {
            emailId: user.email,
            fee: Number(user.consultation_fee || 0),
            specialization: user.specialization || user.specialty || '',
            experience: (user.experience || '').toString(),
            licenseNo: user.license_number || user.licenseNumber || '',
            availableDays: '',
            startTime: '',
            endTime: '',
          };
          try { 
            const userRes =await userMgmtApi.post('/app2/api/v1/doctors', payload, { headers });
            const userDto = userRes.data || {};
            console.log(userDto);
            if (userDto.id) {
                 localStorage.setItem("userId",userDto.id);
            } 
            console.log('hi')
          } catch (err) {
            if (err?.response?.status !== 409) throw err;
          }
        }
      }
    } catch (_) {}
  }
 
  // Authentication
  async login(email, password) {
   
    const loginRes = await authApi.post('/app1/api/v1/user/login', {
      emailId: email,
      password,
    });
    const token = loginRes.data?.token;
    if (!token) throw new Error('No token returned');
 
    const validateRes = await authApi.get('/app1/api/v1/user/validate-token', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!validateRes.data?.valid) throw new Error('Invalid token');
 
    const emailId = validateRes.data.emailId || email;
    const role = (validateRes.data.userRole || '').toString().toLowerCase();
 
    const baseUser = { id: emailId, user_id: emailId, email: emailId, role, name: emailId };
    saveSession(token, baseUser);
 
    let userDto = {};
    try {
      const userRes = await authApi.get(`/app1/api/v1/user/${encodeURIComponent(emailId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      userDto = userRes.data || {};
    } catch (_) {}
 
    const user = {
      ...baseUser,
      name: userDto.name || baseUser.name,
      address: userDto.address || '',
      dateOfBirth: userDto.dateOfBirth || userDto.date_of_birth || '',
      date_of_birth: userDto.date_of_birth || userDto.dateOfBirth || '',
      gender: userDto.gender || '',
      phoneNumber: userDto.phoneNumber || userDto.phone || '',
      phone: userDto.phone || userDto.phoneNumber || '',
      avatar: userDto.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${baseUser.email}`,
    }; 
  
    saveSession(token, user);
    await this.ensureUserMgmtProfile(user, token);
 
    return { data: { ...user, token } };
  }
 
  async register(userData) {
    const payload = {
      emailId: userData.email,
      password: userData.password,
      userRole: (userData.role || 'patient').toUpperCase(),
      name: userData.name,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      avatar: userData.avatar,
    };
 
    try {
      const res = await authApi.post('/app1/api/v1/user/register', payload, { headers: {} });
      return { data: res.data };
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Registration failed';
      throw new Error(msg);
    }
  }
 
  async addUsers(formData) {
    return this.register(formData);
  }
 
  async logout() {
    clearSession();
    return { success: true };
  }
 
  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('No authenticated user');
 
    const validateRes = await api.get('/app1/api/v1/user/validate-token', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!validateRes.data?.valid) throw new Error('Invalid session');
 
    const emailId = validateRes.data.emailId;
    const role = (validateRes.data.userRole || '').toString().toLowerCase();
 
    const userRes = await api.get(`/app1/api/v1/user/${encodeURIComponent(emailId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dto = userRes.data || {};
    
    const user = {
      id: emailId,
      user_id: emailId,
      email: emailId,
      role,
      name: dto.name || emailId,
      address: dto.address || '',
      dateOfBirth: dto.dateOfBirth || dto.date_of_birth || '',
      date_of_birth: dto.date_of_birth || dto.dateOfBirth || '',
      gender: dto.gender || '',
      phoneNumber: dto.phoneNumber || dto.phone || '',
      phone: dto.phone || dto.phoneNumber || '',
      avatar: dto.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailId}`,
    };
 
    saveSession(token, user);
    return { data: user };
  }
 
  // Update profile fields
  async updateProfile(emailId, updateData) {
    const payload = {
      name: updateData.name,
      dateOfBirth: updateData.dateOfBirth || updateData.date_of_birth,
      gender: updateData.gender,
      phoneNumber: updateData.phoneNumber || updateData.phone,
      address: updateData.address,
      avatar: updateData.avatar,
      userRole: updateData.userRole || undefined,
    };

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
 
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await authApi.patch(`/app1/api/v1/user/${encodeURIComponent(emailId)}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
 
    // Merge and persist locally
    const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    const merged = {
      ...currentUser,
      ...payload,
      date_of_birth: payload.dateOfBirth || currentUser.date_of_birth,
      phone: payload.phoneNumber || currentUser.phone,
    };
    saveSession(localStorage.getItem(TOKEN_KEY), merged);
 
    return { data: res.data };
  }
 
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  }
 
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
 
  getUserRole() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user).role : null;
  }
}
 
export default new UserService();