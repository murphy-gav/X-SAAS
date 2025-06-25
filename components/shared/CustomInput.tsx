'use client';

import React from 'react';

import type {
  Control,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import {
  FormField,
  FormControl,
  FormLabel,
  FormMessage,
} from '../ui/form';

import { Input } from '../ui/input';

/**
 * CustomInputProps<T> is generic over T extends FieldValues:
 *   • `control` must be a Control<T>
 *   • `name` must be a valid FieldPath<T>
 *
 * We support a special `type="otp"` to wire up inputMode, pattern, and maxLength automatically.
 */
export interface CustomInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  /**
   * Either a normal HTML input type (text, email, password, etc.)
   * or the special `"otp"` variant to force a 6-digit numeric code input.
   */
  type?: React.HTMLInputTypeAttribute | 'otp';

  /** You can override inputMode if you’re not using otp mode. */
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  pattern?: string;
  maxLength?: number;
  readOnly?: boolean;
}

export default function CustomInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  inputMode,
  pattern,
  maxLength,
  readOnly = false,
}: CustomInputProps<T>) {
  // If they set `type="otp"`, we override:
  //    • htmlType = "text"
  //    • inputMode = "numeric"
  //    • pattern = "[0-9]*"
  //    • maxLength = 6
  const isOtpMode = type === 'otp';

  const htmlType: React.HTMLInputTypeAttribute = isOtpMode ? 'text' : (type as React.HTMLInputTypeAttribute);
  const htmlInputMode: React.HTMLAttributes<HTMLInputElement>['inputMode'] = isOtpMode
    ? 'numeric'
    : inputMode;
  const htmlPattern = isOtpMode ? '[0-9]*' : pattern;
  const htmlMaxLength = isOtpMode ? 6 : maxLength;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col gap-1.5">
          <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-500">{label}</FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
              <Input
                {...field}
                placeholder={placeholder}
                className="input-class"
                type={htmlType}
                inputMode={htmlInputMode}
                pattern={htmlPattern}
                maxLength={htmlMaxLength}
                readOnly={readOnly}
              />
            </FormControl>
            <FormMessage className="text-12 text-red-500 mt-2" />
          </div>
        </div>
      )}
    />
  );
}