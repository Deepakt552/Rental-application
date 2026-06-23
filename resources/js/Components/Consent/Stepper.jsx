// resources/js/Components/Consent/Stepper.jsx
import React from 'react';

export default function Stepper({ steps, currentStep }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center relative flex-1">
                             <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    index <= currentStep
                                        ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900/30'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                                }`}
                            >
                                {index + 1}
                            </div>
                            <div className="absolute top-12 text-sm font-medium text-gray-700 dark:text-slate-300 whitespace-nowrap hidden sm:block">
                                {step}
                            </div>
                            <div className="absolute top-12 text-xs font-medium text-gray-700 dark:text-slate-300 sm:hidden">
                                Step {index + 1}
                            </div>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                                }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}