// resources/js/Components/Consent/Steps/Step2.jsx
import React, { useState, useEffect } from 'react';
import SignaturePad from '../SignaturePad';

export default function Step2({ data, onChange, onSave, errors = {}, isExcel = false, step1Data }) {
    const getFormattedDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const todayVal = new Date();
    const todayStr = getFormattedDate(todayVal);
    
    const twoDaysAgoVal = new Date();
    twoDaysAgoVal.setDate(todayVal.getDate() - 2);
    const minDateStr = getFormattedDate(twoDaysAgoVal);

    const orgName = isExcel ? "Excel Residential Services" : "Triumph Residential Services";
    const [formData, setFormData] = useState({
        applicants: data.applicants || []
    });

    useEffect(() => {
        if (step1Data) {
            const step1People = [];
            if (step1Data.applicant_tenant?.applicant_name) {
                step1People.push(step1Data.applicant_tenant.applicant_name);
            }
            if (step1Data.co_applicants) {
                step1Data.co_applicants.forEach(coApp => {
                    if (coApp.name) step1People.push(coApp.name);
                });
            }

            setFormData(prev => {
                const newApplicants = step1People.map(name => {
                    const existing = prev.applicants.find(a => a.applicant_name === name) || {};
                    return {
                        applicant_name: name,
                        social_security_no: existing.social_security_no || '',
                        date_of_birth: existing.date_of_birth || '',
                        today_date: existing.today_date || todayStr,
                        signature: existing.signature || '',
                        id: existing.id || Date.now() + Math.random()
                    };
                });
                return { ...prev, applicants: newApplicants };
            });
        }
    }, [step1Data]);

    useEffect(() => {
        onChange(formData);
    }, [formData]);

    const updateApplicant = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            applicants: prev.applicants.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const formatSSN = (value) => {
        let numbers = value.replace(/\D/g, '');

        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 5) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
        }
    };
    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.applicants || formData.applicants.length === 0) {
            newErrors.applicants = 'At least one applicant is required';
        }

        formData.applicants.forEach((applicant, index) => {

            // SSN
            if (!applicant.social_security_no?.trim()) {
                newErrors[`applicant_${index}_ssn`] = 'Social Security Number is required';
            } else {
                const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;

                if (!ssnRegex.test(applicant.social_security_no)) {
                    newErrors[`applicant_${index}_ssn`] = 'SSN format must be XXX-XX-XXXX';
                }
            }

            // DOB
            if (!applicant.date_of_birth) {
                newErrors[`applicant_${index}_dob`] = 'Date of Birth is required';
            }

            // Today Date
            if (!applicant.today_date) {
                newErrors[`applicant_${index}_today_date`] = 'Today date is required';
            }

            // Signature
            if (!applicant.signature) {
                newErrors[`applicant_${index}_signature`] = 'Signature is required';
            }
        });

        return newErrors;
    };

    const renderApplicant = (item, index) => (
        <div key={item.id} className="space-y-4 p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50/50">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applicant Name
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-800 font-medium">
                    {item.applicant_name}
                </div>
            </div>

            <div className={errors[`applicant_${index}_ssn`] ? 'border-red-500 rounded-md p-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Social Security Number <span className="text-red-500">*</span>
                </label>

                <input
                    type="text"
                    value={item.social_security_no}
                    onChange={(e) => {
                        const formatted = formatSSN(e.target.value);
                        updateApplicant(index, 'social_security_no', formatted);
                    }}
                    maxLength="11"
                    placeholder="XXX-XX-XXXX"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`applicant_${index}_ssn`]
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                        }`}
                />

                <p className="mt-1 text-xs text-gray-500">
                    Format: XXX-XX-XXXX
                </p>

                {errors[`applicant_${index}_ssn`] && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors[`applicant_${index}_ssn`]}
                    </p>
                )}
            </div>
            <div className={errors[`applicant_${index}_dob`] ? 'border-red-500 rounded-md p-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    value={item.date_of_birth}
                    onChange={(e) => updateApplicant(index, 'date_of_birth', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`applicant_${index}_dob`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    max={todayStr}
                />
                {errors[`applicant_${index}_dob`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`applicant_${index}_dob`]}</p>
                )}
            </div>

            <div className={errors[`applicant_${index}_today_date`] ? 'border-red-500 rounded-md p-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Today's Date <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    value={item.today_date}
                    onChange={(e) => updateApplicant(index, 'today_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`applicant_${index}_today_date`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    min={minDateStr}
                    max={todayStr}
                />
                {errors[`applicant_${index}_today_date`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`applicant_${index}_today_date`]}</p>
                )}
            </div>

            <div className={errors[`applicant_${index}_signature`] ? 'border-red-500 rounded-md p-2' : ''}>
                <SignaturePad
                    value={item.signature}
                    onChange={(signature) => updateApplicant(index, 'signature', signature)}
                    label="Applicant Signature"
                    required={true}
                />
                {errors[`applicant_${index}_signature`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`applicant_${index}_signature`]}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">APPLICANT'S CONSENT AND RELEASE FOR CRIMINAL BACKGROUND CHECK</h3>
                <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                    <p>
                        I / We, the undersigned, hereby authorize <strong>{orgName}</strong> and their
                        agents, to conduct a criminal record check on me in connection with a pending application for an
                        apartment rental.
                    </p>
                    <p>
                        I / We hereby waive and release any and all claims, causes of actions and demands of every kind,
                        nature, and description, arising from any request for and release of criminal records and information.
                    </p>
                    <p>
                        I / We also agree that a photocopy or fax copy of this document shall be valid as the original and
                        will suffice as an authorized signature to release information and records, as requested by
                        {orgName}.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-brand text-gray-700">
                        <p className="mb-2">
                            Applicant acknowledges that it is the policy of the proposed lessor to screen applications for
                            convictions of certain felonies within <strong>five (5) years</strong> from the date of conviction,
                            and certain misdemeanors involving bodily harm within <strong>three (3) years</strong> from the date
                            of conviction.
                        </p>
                        <p className="mb-2">
                            The number of convictions within a particular time period, not to exceed five years,
                            will also be considered. Outstanding bench warrants must be reported and will be considered. Due to
                            the nature of the housing program, applicants who have been convicted of offenses involving
                            <strong>forgery and/or welfare fraud will be denied</strong>.
                        </p>
                        <p>
                            Per federal statute, applicants subject to a <strong>lifetime registration requirement under a State
                                Sex Offender Registration Program will be automatically denied</strong>. Felony convictions for the
                            sale, manufacture, or distribution of controlled substances will result in denial of the application.
                        </p>
                    </div>
                </div>
            </div>

            {errors.applicants && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errors.applicants}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Signatures Required</h2>
                {formData.applicants.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No applicants added in Step 1. Please go back and add an applicant.</p>
                    </div>
                ) : (
                    formData.applicants.map((item, index) => renderApplicant(item, index))
                )}
            </div>
        </div>
    );
}