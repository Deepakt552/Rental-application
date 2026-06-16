// resources/js/Components/Consent/Steps/Step1.jsx
import React, { useState, useEffect } from 'react';
import SignaturePad from '../SignaturePad';
import DynamicRepeater from '../DynamicRepeater';

export default function Step1({ data, onChange, onSave, errors = {}, isExcel = false }) {
    const orgName = isExcel ? "Excel Residential Services" : "Triumph Residential Services Inc.";
    const [formData, setFormData] = useState({
        applicant_tenant: data.applicant_tenant || {
            applicant_name: '',
            orgName: orgName,
            signature: '',
            consent_date: new Date().toISOString().split('T')[0]
            

        },
        co_applicants: data.co_applicants || []
    });

    useEffect(() => {
        onChange(formData);
    }, [formData]);

    const updateApplicantTenant = (field, value) => {
        setFormData(prev => ({
            ...prev,
            applicant_tenant: { ...prev.applicant_tenant, [field]: value }
        }));
    };

    const addCoApplicant = () => {
        setFormData(prev => ({
            ...prev,
            co_applicants: [
                ...prev.co_applicants,
                {
                    name: '',
                    signature: '',
                    consent_date: new Date().toISOString().split('T')[0],
                    id: Date.now()
                }
            ]
        }));
    };

    const removeCoApplicant = (index) => {
        setFormData(prev => ({
            ...prev,
            co_applicants: prev.co_applicants.filter((_, i) => i !== index)
        }));
    };

    const updateCoApplicant = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            co_applicants: prev.co_applicants.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const renderCoApplicant = (item, index) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                </label>
                <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateCoApplicant(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter co-applicant name"
                />
            </div>

            <div className={errors[`co_applicant_${index}_signature`] ? 'border-red-500 rounded-md p-2' : ''}>
                <SignaturePad
                    value={item.signature}
                    onChange={(signature) => updateCoApplicant(index, 'signature', signature)}
                    label="Signature"
                />
                {errors[`co_applicant_${index}_signature`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`co_applicant_${index}_signature`]}</p>
                )}
            </div>

            <div className={errors[`co_applicant_${index}_date`] ? 'border-red-500 rounded-md p-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                </label>
                <input
                    type="date"
                    value={item.consent_date}
                    onChange={(e) => updateCoApplicant(index, 'consent_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors[`co_applicant_${index}_date`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`co_applicant_${index}_date`]}</p>
                )}
            </div>
          
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>NOTICE:</strong> All applicants and co-applicants/guarantors must sign below. Electronic signatures are considered legally binding.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">APPLICANT/TENANT CONSENT</h3>
                <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                    <p>
                        I hereby consent to allow <strong>{orgName}</strong>,
                        through its designated agent/employee, to obtain and verify my consumer reports, including but not
                        limited to, my credit report, criminal information, and eviction information for the purpose of
                        determining my eligibility to lease an apartment.
                    </p>
                    <p>
                        I further understand if I lease an apartment, I consent to allow
                        <strong>{orgName}</strong> and its designated
                        agent/employee, for the duration of my lease, to review the following information to assess
                        risk, for analytics, for process improvement, and other uses: my consumer reports, including but not
                        limited to my credit report, criminal information, eviction information, my rental payment history,
                        and occupancy history, and other information.
                    </p>
                    <p className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 text-yellow-800">
                        The facts set forth in my application for residency are true and complete. <strong>False,
                            fraudulent or misleading information on an application may be grounds for denial of residency
                            or subsequent eviction.</strong>
                    </p>
                </div>
            </div>

            {/* Applicant/Tenant Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Applicant/Tenant Consent</h2>

                <div className="space-y-4">
                    <div className={errors.applicant_name ? 'border-red-500 rounded-md p-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Applicant Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.applicant_tenant.applicant_name}
                            onChange={(e) => updateApplicantTenant('applicant_name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.applicant_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                            placeholder="Enter full name"
                        />
                        {errors.applicant_name && (
                            <p className="mt-1 text-sm text-red-500">{errors.applicant_name}</p>
                        )}
                    </div>
                      <input type="hidden" value={formData.applicant_tenant.orgName} name='orgName' />

                    <div className={errors.signature ? 'border-red-500 rounded-md p-2' : ''}>
                        <SignaturePad
                            value={formData.applicant_tenant.signature}
                            onChange={(signature) => updateApplicantTenant('signature', signature)}
                            label="Signature"
                            required={true}
                        />
                        {errors.signature && (
                            <p className="mt-1 text-sm text-red-500">{errors.signature}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.applicant_tenant.consent_date}
                            onChange={(e) => updateApplicantTenant('consent_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Co-Applicant Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Co-Applicant / Guarantor Section
                    <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
                </h2>

                <DynamicRepeater
                    items={formData.co_applicants}
                    onAdd={addCoApplicant}
                    onRemove={removeCoApplicant}
                    onUpdate={updateCoApplicant}
                    renderItem={renderCoApplicant}
                    addButtonText="Add Co-Applicant"
                    emptyMessage="No co-applicants added yet. Click the button above to add."
                />

                <div className="mt-4 text-sm text-gray-500">
                    <p>Note: If you add a name, signature and date are required for that co-applicant.</p>
                </div>
            </div>
        </div>
    );
}