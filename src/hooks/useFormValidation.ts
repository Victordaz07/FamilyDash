/**
 * 🎯 FORM VALIDATION HOOK — FamilyDash+
 * Hook personalizado para validación robusta de formularios
 */

import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface UseFormValidationReturn {
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  validateField: (field: string, value: any) => string | null;
  validateForm: (data: any) => boolean;
  setFieldTouched: (field: string, touched?: boolean) => void;
  setFieldError: (field: string, error: string | null) => void;
  resetForm: () => void;
}

export const useFormValidation = (
  rules: ValidationRules,
  initialData?: any
): UseFormValidationReturn => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || `${field} es requerido`;
    }

    // Skip other validations if value is empty and not required
    if (!value && !rule.required) return null;

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${field} debe tener al menos ${rule.minLength} caracteres`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${field} no puede tener más de ${rule.maxLength} caracteres`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${field} tiene un formato inválido`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((data: any): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const setFieldTouched = useCallback((field: string, touchedValue: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: touchedValue }));
  }, []);

  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const isValid = Object.keys(errors).length === 0 || Object.values(errors).every(error => !error);

  return {
    errors,
    touched,
    isValid,
    validateField,
    validateForm,
    setFieldTouched,
    setFieldError,
    resetForm,
  };
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  lettersOnly: /^[a-zA-Z\s]+$/,
  numbersOnly: /^\d+$/,
};

// Common validation rules
export const COMMON_RULES = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'Este campo es requerido',
  }),
  email: (message?: string): ValidationRule => ({
    required: true,
    pattern: VALIDATION_PATTERNS.email,
    message: message || 'Ingresa un email válido',
  }),
  phone: (message?: string): ValidationRule => ({
    pattern: VALIDATION_PATTERNS.phone,
    message: message || 'Ingresa un número de teléfono válido',
  }),
  time: (message?: string): ValidationRule => ({
    required: true,
    pattern: VALIDATION_PATTERNS.time,
    message: message || 'Ingresa una hora válida (HH:MM)',
  }),
  date: (message?: string): ValidationRule => ({
    required: true,
    pattern: VALIDATION_PATTERNS.date,
    message: message || 'Ingresa una fecha válida (YYYY-MM-DD)',
  }),
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Debe tener al menos ${min} caracteres`,
  }),
  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `No puede tener más de ${max} caracteres`,
  }),
  name: (message?: string): ValidationRule => ({
    required: true,
    pattern: VALIDATION_PATTERNS.lettersOnly,
    minLength: 2,
    maxLength: 50,
    message: message || 'Ingresa un nombre válido',
  }),
  address: (message?: string): ValidationRule => ({
    required: true,
    minLength: 5,
    maxLength: 200,
    message: message || 'Ingresa una dirección válida',
  }),
};




