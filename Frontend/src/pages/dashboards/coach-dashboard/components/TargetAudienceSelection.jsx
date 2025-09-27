// Frontend/src/pages/dashboards/coach-dashboard/components/TargetAudienceSelection.jsx
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import Input from "@/components/ui/Input";


const predefinedAudiences = [
  'Life coaches',
  'Business coaches',
  'Wellness and fitness trainers',
  'Academic or career coaches',
  'Executive coaches',
];

const TargetAudienceSelection = ({ selectedAudiences, setSelectedAudiences }) => {
  const [otherValue, setOtherValue] = useState('');

  const handleCheckboxChange = (audience) => {
    const isSelected = selectedAudiences.includes(audience);
    if (isSelected) {
      setSelectedAudiences(selectedAudiences.filter((item) => item !== audience));
    } else {
      setSelectedAudiences([...selectedAudiences, audience]);
    }
  };

  const handleOtherInputChange = (e) => {
    setOtherValue(e.target.value);
    // Remove the previous "Other:" value if it exists
    const withoutOther = selectedAudiences.filter(item => !item.startsWith('Other:'));
    if (e.target.value) {
      setSelectedAudiences([...withoutOther, `Other: ${e.target.value}`]);
    } else {
      setSelectedAudiences(withoutOther);
    }
  };

  const isOtherSelected = selectedAudiences.some(item => item.startsWith('Other:'));

  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Target Audience</h3>
      <div className="space-y-3">
        {predefinedAudiences.map((audience) => (
          <div key={audience} className="flex items-center">
            <Checkbox
              id={audience}
              checked={selectedAudiences.includes(audience)}
              onCheckedChange={() => handleCheckboxChange(audience)}
            />
            <label htmlFor={audience} className="ml-2 text-sm font-medium text-gray-700">
              {audience}
            </label>
          </div>
        ))}
        <div className="flex items-center">
          <Checkbox
            id="other"
            checked={isOtherSelected}
            onCheckedChange={() => {
              if (isOtherSelected) {
                // If "Other" is unchecked, remove the custom value
                setSelectedAudiences(selectedAudiences.filter(item => !item.startsWith('Other:')));
                setOtherValue('');
              } else if (otherValue) {
                // If "Other" is checked and there's text, add it
                setSelectedAudiences([...selectedAudiences, `Other: ${otherValue}`]);
              }
            }}
          />
          <label htmlFor="other" className="ml-2 text-sm font-medium text-gray-700">
            Other
          </label>
          {isOtherSelected && (
            <Input
              type="text"
              placeholder="Please specify"
              value={otherValue}
              onChange={handleOtherInputChange}
              className="ml-4 h-9"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetAudienceSelection;