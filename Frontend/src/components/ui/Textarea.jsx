// Frontend/src/components/ui/Textarea.jsx
import React from 'react';
import { cn } from '@/utils/cn'; // Using the utility for class names

const Textarea = React.forwardRef(({ className, label, name, ...props }, ref) => {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };