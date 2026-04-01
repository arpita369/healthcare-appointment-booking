import React, { createContext, useContext, useState, useEffect } from 'react';
import UserService from '../services/UserService';
 
const AuthContext = createContext(undefined);
 
// Define the key for localStorage
const AUTH_USER_KEY = 'healthcare_user';
 
export function AuthProvider({ children }) {
  // INITIALIZE STATE FROM LOCALSTORAGE
  const [user, setUser] = useState(() => {
    try {
      const item = window.localStorage.getItem(AUTH_USER_KEY);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading user from localStorage", error);
      return null;
    }
  });
 
  const [showOnboarding, setShowOnboarding] = useState(false);
 
  // PERSIST STATE CHANGES BACK TO LOCALSTORAGE
  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch (error) {
      console.error("Error saving user to localStorage", error);
    }
  }, [user]);
 
  const login = async (email, password) => {
    try {
      const res = await UserService.login(email, password);
      const data = res.data || {};
      const avatar = data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email || email}`;
 
      // APPLY YOUR CUSTOM REQUIREMENT
      const userToSave = {
        ...data,               
        avatar: avatar,
        id: data.email || email,
        email: data.email || email
      };
     
      setUser(userToSave);
 
    } catch (err) {
      throw err;
    }
  };
 
  const register = async (userData) => {
    await UserService.register(userData);
    setShowOnboarding(true);
  };
 
  const logout = () => {
    setUser(null);
    setShowOnboarding(false);
  };
 
  const completeOnboarding = () => {
    setShowOnboarding(false);
    if (user) {
      setUser({ ...user, isNewUser: false });
    }
  };
 
  const updateUser = (userData) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };
 
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      showOnboarding,
      login,
      register,
      logout,
      completeOnboarding,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
 
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}