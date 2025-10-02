import React from 'react';
import { type UseFormRegister, type FieldError } from 'react-hook-form';

interface FormInputProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'textarea';
  className?: string; // Add this line
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  register,
  error,
  required = false,
  placeholder = '',
  type = 'text'
}) => {
  const inputClass = `w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm ${
    error ? "border-red-500" : "border-gray-300"
  }`;

  return (
    <div className="col-span-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          rows={3}
          {...register(name)}
          className={inputClass}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          id={name}
          {...register(name, { required: required ? `${label} is required` : false })}
          className={inputClass}
          placeholder={placeholder}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};