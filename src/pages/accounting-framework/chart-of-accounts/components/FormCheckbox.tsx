import React from 'react';
import { type UseFormRegister } from 'react-hook-form';

interface FormCheckboxProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  defaultChecked?: boolean;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  name,
  register,
  defaultChecked = false
}) => (
  <label className="flex items-center space-x-3">
    <input
      type="checkbox"
      {...register(name)}
      defaultChecked={defaultChecked}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </label>
);