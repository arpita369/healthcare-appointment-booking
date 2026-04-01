import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  CONSULTATION_COMPLETE: 'consultation_complete',
  PRESCRIPTION_READY: 'prescription_ready',
  LAB_RESULTS: 'lab_results',
  SYSTEM_ALERT: 'system_alert',
  MESSAGE: 'message'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isEnabled: true,
  preferences: {
    email: true,
    push: true,
    inApp: true,
    sms: false
  }
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date(),
        read: false
      };
      
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      };

    case 'DELETE_NOTIFICATION':
      const notification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notification && !notification.read 
          ? state.unreadCount - 1 
          : state.unreadCount
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };

    case 'TOGGLE_ENABLED':
      return {
        ...state,
        isEnabled: !state.isEnabled
      };

    case 'LOAD_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      };

    default:
      return state;
  }
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  // Access authentication state
  const { user, isAuthenticated } = useAuth();

  // Load notifications from localStorage on mount, but only for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clear notifications if user is not authenticated
      dispatch({ type: 'CLEAR_ALL' });
      return;
    }

    const userKey = `healthcare-notifications-${user.id}`;
    const userPrefsKey = `healthcare-notification-preferences-${user.id}`;
    
    const savedNotifications = localStorage.getItem(userKey);
    const savedPreferences = localStorage.getItem(userPrefsKey);
    
    if (savedNotifications) {
      try {
        const notifications = JSON.parse(savedNotifications);
        dispatch({ type: 'LOAD_NOTIFICATIONS', payload: notifications });
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
    
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }
  }, [isAuthenticated, user]);

  // Save notifications to localStorage whenever they change (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user) {
      const userKey = `healthcare-notifications-${user.id}`;
      localStorage.setItem(userKey, JSON.stringify(state.notifications));
    }
  }, [state.notifications, isAuthenticated, user]);

  // Save preferences to localStorage whenever they change (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user) {
      const userPrefsKey = `healthcare-notification-preferences-${user.id}`;
      localStorage.setItem(userPrefsKey, JSON.stringify(state.preferences));
    }
  }, [state.preferences, isAuthenticated, user]);

  // Helper function to show toast notifications
  const showToast = (notification) => {
    if (!isAuthenticated || !state.isEnabled || !state.preferences.inApp) return;

    const { type, priority, title, message } = notification;

    switch (priority) {
      case NOTIFICATION_PRIORITIES.CRITICAL:
        toast.error(title, { description: message, duration: 10000 });
        break;
      case NOTIFICATION_PRIORITIES.HIGH:
        toast.error(title, { description: message, duration: 7000 });
        break;
      case NOTIFICATION_PRIORITIES.MEDIUM:
        toast.warning(title, { description: message, duration: 5000 });
        break;
      case NOTIFICATION_PRIORITIES.LOW:
      default:
        toast.info(title, { description: message, duration: 4000 });
        break;
    }
  };

  // Actions
  const addNotification = (notification) => {
    // Only add notifications for authenticated users
    if (!isAuthenticated || !user) {
      return;
    }
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Show toast notification
    showToast(notification);
    
    // Trigger browser notification if permission granted
    if (state.preferences.push && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/healthcare-icon.png',
        badge: '/healthcare-badge.png'
      });
    }
  };

  const markAsRead = (id) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const deleteNotification = (id) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const updatePreferences = (preferences) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const toggleEnabled = () => {
    dispatch({ type: 'TOGGLE_ENABLED' });
  };

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // Mock real-time notifications (in a real app, this would be WebSocket/SSE)
  useEffect(() => {
    // Only run for authenticated users
    if (!isAuthenticated || !user) {
      return;
    }

    // Simulate receiving notifications every 2 minutes for authenticated users
    const interval = setInterval(() => {
      // This is just for demo purposes - create user-specific notifications
      const mockNotifications = {
        patient: [
          {
            type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
            priority: NOTIFICATION_PRIORITIES.HIGH,
            title: 'Appointment Reminder',
            message: `Hello ${user.name}, your appointment is coming up soon!`,
            category: 'appointment'
          },
          {
            type: NOTIFICATION_TYPES.LAB_RESULTS,
            priority: NOTIFICATION_PRIORITIES.MEDIUM,
            title: 'Lab Results Ready',
            message: 'Your test results are now available in your dashboard',
            category: 'medical'
          }
        ],
        doctor: [
          {
            type: NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED,
            priority: NOTIFICATION_PRIORITIES.MEDIUM,
            title: 'New Appointment',
            message: 'A patient has booked an appointment with you',
            category: 'appointment'
          },
          {
            type: NOTIFICATION_TYPES.MESSAGE,
            priority: NOTIFICATION_PRIORITIES.LOW,
            title: 'Patient Message',
            message: 'You have a new message from a patient',
            category: 'communication'
          }
        ]
      };

      const userNotifications = mockNotifications[user.role] || [];
      
      // Randomly add a notification (5% chance every 2 minutes for demo)
      if (userNotifications.length > 0 && Math.random() < 0.05) {
        const randomNotification = userNotifications[Math.floor(Math.random() * userNotifications.length)];
        addNotification(randomNotification);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user, state.isEnabled]);

  const value = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
    toggleEnabled,
    requestPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
