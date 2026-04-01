import React, { createContext, useContext } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  // Common validation schemas
  const validationSchemas = {
    contact: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      message: Yup.string()
        .min(10, 'Message must be at least 10 characters')
        .required('Message is required')
    }),
    
    login: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),
    
    register: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      role: Yup.string()
        .required('Role is required')
    }),
    
    appointment: Yup.object({
      doctorId: Yup.string().required('Please select a doctor'),
      date: Yup.date()
        .min(new Date(), 'Cannot schedule appointments for past dates')
        .required('Date is required'),
      time: Yup.string().required('Time is required'),
      type: Yup.string().required('Appointment type is required'),
      symptoms: Yup.string()
        .min(5, 'Please provide more details')
        .required('Symptoms or reason is required')
    }),
    
    profile: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      phone: Yup.string()
        .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number'),
      address: Yup.string()
    })
  };

  // Common initial values
  const initialValues = {
    contact: {
      name: '',
      email: '',
      message: ''
    },
    
    login: {
      email: '',
      password: ''
    },
    
    register: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient'
    },
    
    appointment: {
      doctorId: '',
      date: '',
      time: '',
      type: 'consultation',
      symptoms: '',
      notes: ''
    },
    
    profile: {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
  };

  const FormWrapper = ({ 
    type, 
    initialValues: customInitialValues, 
    onSubmit, 
    children,
    className = ''
  }) => {
    const schema = validationSchemas[type];
    const defaultValues = initialValues[type] || {};
    const formInitialValues = customInitialValues || defaultValues;

    return (
      <Formik
        initialValues={formInitialValues}
        validationSchema={schema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <Form className={className}>
            {typeof children === 'function' ? children(formikProps) : children}
          </Form>
        )}
      </Formik>
    );
  };

  const FormField = ({ 
    name, 
    label, 
    type = 'text', 
    placeholder, 
    className = '', 
    component: Component = 'input',
    rows,
    options = [],
    ...props 
  }) => {
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        {Component === 'input' && (
          <input
            type={type}
            name={name}
            id={name}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
            {...props}
          />
        )}
        
        {Component === 'textarea' && (
          <textarea
            name={name}
            id={name}
            rows={rows || 4}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical ${className}`}
            {...props}
          />
        )}
        
        {Component === 'select' && (
          <select
            name={name}
            id={name}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
            {...props}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  const getFieldProps = (name, type = 'text') => {
    return {
      name,
      type,
      id: name
    };
  };

  const renderFormField = (name, type = 'text', props = {}) => {
    const { label, placeholder, rows, options, className = '', ...rest } = props;
    
    return (
      <FormField
        name={name}
        type={type}
        label={label}
        placeholder={placeholder}
        rows={rows}
        options={options}
        className={className}
        component={type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input'}
        {...rest}
      />
    );
  };

  const value = {
    FormWrapper,
    FormField,
    validationSchemas,
    initialValues,
    getFieldProps,
    renderFormField
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
