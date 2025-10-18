import React from 'react';

// New component to display the placeholder message
const ComingSoon = ({ sectionName }) => (
    <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-gray-200">
        <div className="text-center p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {sectionName} - Coming Soon!
            </h2>
            <p className="text-lg text-gray-500">
                This feature is currently under development and will be available shortly.
            </p>
        </div>
    </div>
);

const ResourcesLibrary = () => {
    return (
        <ComingSoon sectionName="Resources Library" />
    );
};

export default ResourcesLibrary;