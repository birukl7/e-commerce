import React, { InputHTMLAttributes, forwardRef } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { FieldErrors } from 'react-hook-form';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  errors?: FieldErrors;
  wrapperClass?: string;
  labelClass?: string;
  errorClass?: string;
  description?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      name,
      errors,
      wrapperClass = '',
      labelClass = '',
      errorClass = '',
      description,
      icon,
      rightIcon,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = errors && errors[name];
    const inputClasses = `block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
      hasError
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
        : 'border-gray-300'
    } ${className}`;

    return (
      <div className={wrapperClass}>
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 ${labelClass}`}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        
        <div className="mt-1 relative rounded-md shadow-sm">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            id={name}
            name={name}
            ref={ref}
            className={`${inputClasses} ${icon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
            aria-invalid={hasError ? 'true' : 'false'}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {errors && (
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className={`mt-1 text-sm text-red-600 ${errorClass}`}>
                {message}
              </p>
            )}
          />
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
