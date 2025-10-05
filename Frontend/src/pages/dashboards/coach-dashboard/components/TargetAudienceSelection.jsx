import React, { useState, useEffect } from 'react';
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

  // ✅ ADD THIS HOOK to synchronize the 'otherValue' state with incoming props.
  useEffect(() => {
    const otherAudience = selectedAudiences.find(a => a.startsWith('Other: '));
    if (otherAudience) {
      // If an "Other" value exists, strip the prefix and set it to the input field's state.
      setOtherValue(otherAudience.substring(7)); // "Other: ".length is 7
    } else {
      setOtherValue('');
    }
  }, [selectedAudiences]);

  const handleCheckboxChange = (audience) => {
    const isSelected = selectedAudiences.includes(audience);
    if (isSelected) {
      setSelectedAudiences(selectedAudiences.filter((item) => item !== audience));
    } else {
      setSelectedAudiences([...selectedAudiences, audience]);
    }
  };

  const handleOtherInputChange = (e) => {
    const newOtherValue = e.target.value;
    setOtherValue(newOtherValue);
    
    // Remove any previous "Other:" value
    const withoutOther = selectedAudiences.filter(item => !item.startsWith('Other:'));
    
    if (newOtherValue) {
      // Add the new value if the input is not empty
      setSelectedAudiences([...withoutOther, `Other: ${newOtherValue}`]);
    } else {
      // If the input is empty, just keep the other selections
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
                handleOtherInputChange({ target: { value: '' } }); // Clear on uncheck
              } else {
                setSelectedAudiences([...selectedAudiences, 'Other: ']); // Add placeholder on check
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