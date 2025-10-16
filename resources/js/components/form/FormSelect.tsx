import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { FieldErrors } from 'react-hook-form';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

type Option = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  options: Option[];
  errors?: FieldErrors;
  wrapperClass?: string;
  labelClass?: string;
  errorClass?: string;
  description?: string;
  icon?: React.ReactNode;
  placeholder?: string;
};

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      name,
      options,
      errors,
      wrapperClass = '',
      labelClass = '',
      errorClass = '',
      description,
      icon,
      className = '',
      placeholder = 'Select an option',
      ...props
    },
    ref
  ) => {
    const hasError = errors && errors[name];
    const selectClasses = `mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
      hasError
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
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
        
        <div className="mt-1 relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          
          <div className="relative">
            <select
              id={name}
              name={name}
              ref={ref}
              className={`${selectClasses} ${icon ? 'pl-10' : ''} appearance-none`}
              defaultValue=""
              aria-invalid={hasError ? 'true' : 'false'}
              {...props}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((option) => (
                <option 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
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

FormSelect.displayName = 'FormSelect';
