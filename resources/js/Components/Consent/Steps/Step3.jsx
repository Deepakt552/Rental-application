// resources/js/Components/Consent/Steps/Step3.jsx
import React, { useState, useEffect } from 'react';
import SignaturePad from '../SignaturePad';
import DynamicRepeater from '../DynamicRepeater';
import axios from 'axios';

export default function Step3({ data, onChange, sessionId, errors = {} }) {
    console.log('Session ID from server:', sessionId);
    const [formData, setFormData] = useState({
        head_of_household: data.head_of_household || {
            name: '',
            signature: '',
            consent_date: new Date().toISOString().split('T')[0]
        },
        co_head: data.co_head || {
            name: '',
            signature: '',
            consent_date: new Date().toISOString().split('T')[0]
        },
        adult_members: data.adult_members || []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localErrors, setLocalErrors] = useState({});

    useEffect(() => {
        onChange(formData);
    }, [formData]);

    // Helper function to check if signature is valid (not empty/automatic)
    const isValidSignature = (signature) => {
        return signature &&
            signature !== '' &&
            !signature.includes('data:,') &&
            signature.length > 100; // Valid signature should have significant length
    };

    const updateHeadOfHousehold = (field, value) => {
        // For signature, ensure we store empty string instead of empty data URL
        if (field === 'signature' && (!value || value === 'data:,' || value.includes('data:,'))) {
            value = '';
        }

        setFormData(prev => ({
            ...prev,
            head_of_household: { ...prev.head_of_household, [field]: value }
        }));

        // Clear error for this field when updating
        if (field === 'name' && errors.head_name) {
            // Error will be cleared from parent
        }
        if (field === 'signature' && errors.head_signature) {
            // Error will be cleared from parent
        }
    };

    const updateCoHead = (field, value) => {
        // For signature, ensure we store empty string instead of empty data URL
        if (field === 'signature' && (!value || value === 'data:,' || value.includes('data:,'))) {
            value = '';
        }

        setFormData(prev => ({
            ...prev,
            co_head: { ...prev.co_head, [field]: value }
        }));
    };

    const addAdultMember = () => {
        setFormData(prev => ({
            ...prev,
            adult_members: [
                ...prev.adult_members,
                {
                    name: '',
                    signature: '',
                    consent_date: new Date().toISOString().split('T')[0],
                    id: Date.now()
                }
            ]
        }));
    };

    const removeAdultMember = (index) => {
        setFormData(prev => ({
            ...prev,
            adult_members: prev.adult_members.filter((_, i) => i !== index)
        }));
    };

    const updateAdultMember = (index, field, value) => {
        // For signature, ensure we store empty string instead of empty data URL
        if (field === 'signature' && (!value || value === 'data:,' || value.includes('data:,'))) {
            value = '';
        }

        setFormData(prev => ({
            ...prev,
            adult_members: prev.adult_members.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const renderAdultMember = (item, index) => (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium text-gray-900">Adult Member #{index + 1}</h3>
                <button
                    type="button"
                    onClick={() => removeAdultMember(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                >
                    Remove
                </button>
            </div>

            <div className={errors[`adult_member_${index}_name`] ? 'border-red-500 rounded-md p-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adult Member Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateAdultMember(index, 'name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`adult_member_${index}_name`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    placeholder="Enter full name"
                />
                {errors[`adult_member_${index}_name`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`adult_member_${index}_name`]}</p>
                )}
            </div>

            <div className={errors[`adult_member_${index}_signature`] ? 'border-red-500 rounded-md p-2' : ''}>
                <SignaturePad
                    value={item.signature}
                    onChange={(signature) => updateAdultMember(index, 'signature', signature)}
                    label="Adult Member Signature"
                    required={true}
                />
                {errors[`adult_member_${index}_signature`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`adult_member_${index}_signature`]}</p>
                )}
                {item.name && !isValidSignature(item.signature) && (
                    <p className="mt-1 text-xs text-orange-500">Please draw your signature above</p>
                )}
            </div>

            <div className={errors[`adult_member_${index}_date`] ? 'border-red-500 rounded-md p-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    value={item.consent_date}
                    onChange={(e) => updateAdultMember(index, 'consent_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`adult_member_${index}_date`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                />
                {errors[`adult_member_${index}_date`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`adult_member_${index}_date`]}</p>
                )}
            </div>
        </div>
    );

    const handleCompleteAndDownload = async () => {
        // Validate before submitting
        const validationErrors = {};

        // Validate head of household
        if (!formData.head_of_household.name) {
            validationErrors.head_name = 'Head of household name is required';
        }
        if (!isValidSignature(formData.head_of_household.signature)) {
            validationErrors.head_signature = 'Please provide head of household signature';
        }

        // Validate co-head if name is provided
        if (formData.co_head.name && !isValidSignature(formData.co_head.signature)) {
            validationErrors.co_head_signature = 'Co-head signature is required';
        }

        // Validate adult members
        formData.adult_members.forEach((member, index) => {
            if (member.name) {
                if (!member.name.trim()) {
                    validationErrors[`adult_member_${index}_name`] = 'Name is required';
                }
                if (!isValidSignature(member.signature)) {
                    validationErrors[`adult_member_${index}_signature`] = `Signature required for ${member.name}`;
                }
                if (!member.consent_date) {
                    validationErrors[`adult_member_${index}_date`] = 'Date is required';
                }
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            // Pass errors to parent component
            if (onChange) {
                onChange(formData, validationErrors);
            }
            alert('Please fix the errors before completing');
            return;
        }

        if (!sessionId) {
            console.error('Session ID is missing');
            alert('Session error. Please refresh the page and start over.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Clean data - remove empty signatures
            const cleanedData = {
                session_id: sessionId,
                head_of_household: {
                    name: formData.head_of_household.name,
                    signature: isValidSignature(formData.head_of_household.signature) ? formData.head_of_household.signature : null,
                    consent_date: formData.head_of_household.consent_date
                },
                co_head: formData.co_head.name ? {
                    name: formData.co_head.name,
                    signature: isValidSignature(formData.co_head.signature) ? formData.co_head.signature : null,
                    consent_date: formData.co_head.consent_date
                } : null,
                adult_members: formData.adult_members
                    .filter(member => member.name) // Only include members with names
                    .map(member => ({
                        name: member.name,
                        signature: isValidSignature(member.signature) ? member.signature : null,
                        consent_date: member.consent_date
                    }))
            };

            console.log('Sending cleaned data:', cleanedData);

            // First save step 3
            const step3Response = await fetch('/consent/step3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(cleanedData)
            });

            if (!step3Response.ok) {
                const errorData = await step3Response.json();
                console.error('Validation errors:', errorData);
                throw new Error(errorData.message || 'Save failed');
            }

            const step3Result = await step3Response.json();

            if (!step3Result.success) {
                throw new Error(step3Result.message || 'Failed to save');
            }

            // Then download PDF
            const pdfResponse = await fetch('/consent/complete-and-download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'Accept': 'application/pdf',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    session_id: sessionId
                })
            });

            if (!pdfResponse.ok) {
                const errorText = await pdfResponse.text();
                console.error('PDF download failed:', errorText);
                throw new Error('PDF download failed');
            }

            // Get PDF blob
            const blob = await pdfResponse.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `consent_form_${sessionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert('Consent form completed and PDF downloaded successfully!');

            // Optional: redirect after success
            // window.location.href = '/rental-application';

        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">INFORMATION TO APPLICANTS FOR AFFORDABLE RENTAL HOUSING </h3>
                <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                    <p>
                        This signature page acknowledges that I / we have been given a copy of the
                        <strong> Information to Applicants for Affordable Rental Housing</strong>
                        (TR 6 – Resident Selection Criteria). Each adult household member confirms receipt
                        of the criteria and understands the application screening process.
                    </p>
                   <p className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500 text-amber-950 font-bold">
    All adult members in the household must sign below. Failure to sign will result in automatic denial.
</p>
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-700">
                    Please complete all sections below. All fields marked with <span className="text-red-500">*</span> are required.
                </p>
            </div>

            {/* Head of Household */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Head of Household <span className="text-red-500">*</span></h2>

                <div className="space-y-4">
                    <div className={errors.head_name ? 'border-red-500 rounded-md p-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.head_of_household.name}
                            onChange={(e) => updateHeadOfHousehold('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.head_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                            placeholder="Enter full name"
                        />
                        {errors.head_name && (
                            <p className="mt-1 text-sm text-red-500">{errors.head_name}</p>
                        )}
                    </div>

                    <div className={errors.head_signature ? 'border-red-500 rounded-md p-2' : ''}>
                        <SignaturePad
                            value={formData.head_of_household.signature}
                            onChange={(signature) => updateHeadOfHousehold('signature', signature)}
                            label="Signature"
                            required={true}
                        />
                        {errors.head_signature && (
                            <p className="mt-1 text-sm text-red-500">{errors.head_signature}</p>
                        )}
                        {!isValidSignature(formData.head_of_household.signature) && !errors.head_signature && (
                            <p className="mt-1 text-xs text-orange-500">Please draw your signature above</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.head_of_household.consent_date}
                            onChange={(e) => updateHeadOfHousehold('consent_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Co-Head (Optional) */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    2. Co-Head
                    <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.co_head.name}
                            onChange={(e) => updateCoHead('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter co-head name (optional)"
                        />
                    </div>

                    {formData.co_head.name && (
                        <>
                            <div className={errors.co_head_signature ? 'border-red-500 rounded-md p-2' : ''}>
                                <SignaturePad
                                    value={formData.co_head.signature}
                                    onChange={(signature) => updateCoHead('signature', signature)}
                                    label="Signature"
                                    required={true}
                                />
                                {errors.co_head_signature && (
                                    <p className="mt-1 text-sm text-red-500">{errors.co_head_signature}</p>
                                )}
                                {formData.co_head.name && !isValidSignature(formData.co_head.signature) && !errors.co_head_signature && (
                                    <p className="mt-1 text-xs text-orange-500">Please draw your signature above</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.co_head.consent_date}
                                    onChange={(e) => updateCoHead('consent_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Adult Members */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Adult Members (18 years or older)</h2>

                {formData.adult_members.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No adult members added yet.</p>
                        <button
                            type="button"
                            onClick={addAdultMember}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Add Adult Member
                        </button>
                    </div>
                ) : (
                    <>
                        <DynamicRepeater
                            items={formData.adult_members}
                            onAdd={addAdultMember}
                            onRemove={removeAdultMember}
                            onUpdate={updateAdultMember}
                            renderItem={renderAdultMember}
                            addButtonText="Add Another Adult Member"
                            emptyMessage="No adult members added yet. Click the button above to add."
                        />
                    </>
                )}

                <div className="mt-4 text-sm text-gray-500 bg-yellow-50 p-3 rounded">
                    <p><strong>Note:</strong> If you add an adult member's name, signature and date are required for that member.</p>
                </div>
            </div>

            {/* Submit Button */}
            {/* <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                    onClick={handleCompleteAndDownload}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Generating PDF...' : 'Complete & Download Consent PDF'}
                </button>
                <p className="mt-2 text-sm text-gray-500 text-center">
                    Click to save your consent forms and download PDF. Make sure all required fields are filled.
                </p>
            </div> */}
        </div>
    );
}