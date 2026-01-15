'use client';

import { useState, useRef, useEffect } from 'react';

interface FloatingLabelInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}

export default function FloatingLabelInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  autoComplete,
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          autoComplete={autoComplete}
          required={required}
          className={`peer w-full rounded-xl bg-[#E5E5E0] px-4 pt-6 pb-2 text-[#2B2B2B] transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6F54] ${
            error ? 'ring-2 ring-red-500' : ''
          }`}
        />
        <label
          htmlFor={id}
          className={`absolute left-4 text-[#2B2B2B] transition-all duration-300 ease-out pointer-events-none ${
            isFloating
              ? 'top-2 text-xs text-[#1F6F54]'
              : 'top-1/2 -translate-y-1/2 text-base'
          }`}
        >
          {label}
          {required && <span className="text-[#1F6F54] ml-1">*</span>}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 px-4">{error}</p>
      )}
    </div>
  );
}
