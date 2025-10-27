// Frontend/src/pages/dashboards/shared/DemographicsFormSection.jsx
import React from 'react';
import Input from '@/components/ui/Input';
// NOTE: The Radix Select component is too complex for this simple use case; using native select.

// ✅ MODIFIED: Accept maxDate prop
const DemographicsFormSection = ({ formData, handleChange, maxDate }) => {
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Demographic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date of Birth Input */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth === '0000-00-00' ? '' : formData.dateOfBirth || ''}
            onChange={handleChange}
            className="w-full"
            // ✅ FIX 1: Disable future dates
            max={maxDate}
          />
        </div>

        {/* Gender Selection - Using native select for simplicity */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            // ✅ FIX 2: Added 'border' and set border color explicitly for visibility
            className="w-full rounded-md border border-gray-400 bg-white py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          >
            <option value="">Select gender...</option>
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ethnicity Input */}
        <div>
          <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 mb-1">
            Ethnicity
          </label>
          <Input
            id="ethnicity"
            name="ethnicity"
            type="text"
            placeholder="e.g., Asian, Hispanic, etc."
            value={formData.ethnicity || ''}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        {/* Country Input */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <Input
            id="country"
            name="country"
            type="text"
            placeholder="e.g., United States"
            value={formData.country || ''}
            onChange={handleChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default DemographicsFormSection;