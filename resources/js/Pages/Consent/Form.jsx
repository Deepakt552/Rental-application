// resources/js/Pages/Consent/Form.jsx
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Stepper from '@/Components/Consent/Stepper';
import Step1 from '@/Components/Consent/Steps/Step1';
import Step2 from '@/Components/Consent/Steps/Step2';
import Step3 from '@/Components/Consent/Steps/Step3';

export default function ConsentForm({ sessionId, step1Data, step2Data, step3Data, applicantType }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [stepErrors, setStepErrors] = useState({});
    const [formData, setFormData] = useState({
        step1: step1Data || {
            applicant_tenant: null,
            co_applicants: []
        },
        step2: step2Data || {
            applicants: []
        },
        step3: step3Data || {
            head_of_household: null,
            co_head: null,
            adult_members: []
        }
    });

    const isExcel = applicantType === 'superadmin';

    // Auto-save setup
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            autoSave();
        }, 30000);

        return () => clearInterval(autoSaveInterval);
    }, [currentStep, formData]);

    const autoSave = async () => {
        if (currentStep === 0 && formData.step1.applicant_tenant) {
            await saveStep1(formData.step1, true);
        } else if (currentStep === 1 && formData.step2.applicants.length > 0) {
            await saveStep2(formData.step2, true);
        } else if (currentStep === 2 && formData.step3.head_of_household) {
            await saveStep3(formData.step3, true);
        }
    };

    const saveStep1 = async (data, isAutoSave = false, isCompleting = false) => {
        if (!isAutoSave) setSaving(true);
        setError(null);

        try {
            const orgName = data?.applicant_tenant?.orgName;

            // Dynamic route
            const url =
                orgName === 'Excel Residential Services'
                    ? '/consent/excel/step1'
                    : '/consent/step1';

            await axios.post(url, {
                ...data,
                session_id: sessionId
            });
            if (!isAutoSave) {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                toast.textContent = 'Step 1 saved successfully!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            if (!isAutoSave) {
                setError(error.response?.data?.message || 'Failed to save. Please try again.');
            }
            return false;
        } finally {
            if (!isAutoSave && !isCompleting) setSaving(false);
        }
    };

    const saveStep2 = async (data, isAutoSave = false) => {
        if (!isAutoSave) setSaving(true);
        setError(null);

        try {
            await axios.post('/consent/step2', {
                ...data,
                session_id: sessionId
            });
            if (!isAutoSave) {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                toast.textContent = 'Step 2 saved successfully!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            if (!isAutoSave) {
                setError(error.response?.data?.message || 'Failed to save. Please try again.');
            }
            return false;
        } finally {
            if (!isAutoSave) setSaving(false);
        }
    };

    const saveStep3 = async (data, isAutoSave = false, isCompleting = false) => {
        if (!isAutoSave) setSaving(true);
        setError(null);

        try {
            await axios.post('/consent/step3', {
                ...data,
                session_id: sessionId
            });
            if (!isAutoSave) {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                toast.textContent = 'Step 3 saved successfully!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            if (!isAutoSave) {
                setError(error.response?.data?.message || 'Failed to save. Please try again.');
            }
            return false;
        } finally {
            if (!isAutoSave && !isCompleting) setSaving(false);
        }
    };

    const validateStep1 = () => {
        const errors = {};
        if (!formData.step1.applicant_tenant?.applicant_name) {
            errors.applicant_name = 'Applicant name is required';
        }
        if (!formData.step1.applicant_tenant?.signature) {
            errors.signature = 'Signature is required';
        }
        if (formData.step1.co_applicants && formData.step1.co_applicants.length > 0) {
            formData.step1.co_applicants.forEach((coApp, index) => {
                if (coApp.name && !coApp.signature) {
                    errors[`co_applicant_${index}_signature`] = `Signature required for ${coApp.name}`;
                }
                if (coApp.name && !coApp.consent_date) {
                    errors[`co_applicant_${index}_date`] = `Date required for ${coApp.name}`;
                }
            });
        }
        setStepErrors(prev => ({ ...prev, step1: errors }));
        return Object.keys(errors).length === 0;
    };

    // const validateStep2 = () => {
    //     const errors = {};
    //     if (!formData.step2.applicants || formData.step2.applicants.length === 0) {
    //         errors.applicants = 'At least one applicant is required';
    //     } else {
    //         formData.step2.applicants.forEach((applicant, index) => {
    //             if (!applicant.applicant_name) errors[`applicant_${index}_name`] = 'Name is required';
    //             if (!applicant.date_of_birth) errors[`applicant_${index}_dob`] = 'DOB is required';
    //             if (!applicant.today_date) errors[`applicant_${index}_today_date`] = 'Date is required';
    //             if (!applicant.signature) errors[`applicant_${index}_signature`] = 'Signature is required';
    //         });
    //     }
    //     setStepErrors(prev => ({ ...prev, step2: errors }));
    //     return Object.keys(errors).length === 0;
    // };

    const validateStep2 = () => {
        const errors = {};

        // Applicants check
        if (!formData.step2.applicants || formData.step2.applicants.length === 0) {
            errors.applicants = 'At least one applicant is required';
        } else {

            formData.step2.applicants.forEach((applicant, index) => {

                // SSN Required
                if (!applicant.social_security_no?.trim()) {

                    errors[`applicant_${index}_ssn`] =
                        'Social Security Number is required';

                } else {

                    // SSN Format Validation
                    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;

                    if (!ssnRegex.test(applicant.social_security_no)) {

                        errors[`applicant_${index}_ssn`] =
                            'SSN format must be XXX-XX-XXXX';
                    }
                }

                // DOB
                if (!applicant.date_of_birth) {

                    errors[`applicant_${index}_dob`] =
                        'Date of Birth is required';
                }

                // Today's Date
                if (!applicant.today_date) {

                    errors[`applicant_${index}_today_date`] =
                        'Today Date is required';
                }

                // Signature
                if (!applicant.signature) {

                    errors[`applicant_${index}_signature`] =
                        'Signature is required';
                }
            });
        }

        setStepErrors(prev => ({
            ...prev,
            step2: errors
        }));

        return Object.keys(errors).length === 0;
    };
    const validateStep3 = () => {
        const errors = {};
        if (!formData.step3.head_of_household?.name) {
            errors.head_name = 'Head of household name is required';
        }
        if (!formData.step3.head_of_household?.signature) {
            errors.head_signature = 'Signature is required';
        }
        if (formData.step3.co_head?.name && !formData.step3.co_head?.signature) {
            errors.co_head_signature = 'Co-head signature is required';
        }
        if (formData.step3.adult_members && formData.step3.adult_members.length > 0) {
            formData.step3.adult_members.forEach((member, index) => {
                if (member.name && !member.signature) {
                    errors[`adult_member_${index}_signature`] = `Signature required for ${member.name}`;
                }
                if (member.name && !member.consent_date) {
                    errors[`adult_member_${index}_date`] = `Date required for ${member.name}`;
                }
            });
        }
        setStepErrors(prev => ({ ...prev, step3: errors }));
        return Object.keys(errors).length === 0;
    };

    const updateStep1Data = (data) => {
        setFormData(prev => ({ ...prev, step1: data }));
        if (stepErrors.step1) setStepErrors(prev => ({ ...prev, step1: {} }));
    };

    const updateStep2Data = (data) => {
        setFormData(prev => ({ ...prev, step2: data }));
        if (stepErrors.step2) setStepErrors(prev => ({ ...prev, step2: {} }));
    };

    const updateStep3Data = (data) => {
        setFormData(prev => ({ ...prev, step3: data }));
        if (stepErrors.step3) setStepErrors(prev => ({ ...prev, step3: {} }));
    };

    const allSteps = [
        {
            title: 'Applicant/Tenant Consent',
            component: (
                <Step1
                    data={formData.step1}
                    onChange={updateStep1Data}
                    onSave={() => saveStep1(formData.step1)}
                    errors={stepErrors.step1 || {}}
                    isExcel={isExcel}
                />
            )
        },
        {
            title: 'Criminal Background Check',
            component: (
                <Step2
                    data={formData.step2}
                    onChange={updateStep2Data}
                    onSave={() => saveStep2(formData.step2)}
                    errors={stepErrors.step2 || {}}
                    isExcel={isExcel}
                    step1Data={formData.step1}
                />
            )
        },
        {
            title: 'Affordable Housing Consent',
            component: (
                <Step3
                    data={formData.step3}
                    onChange={updateStep3Data}
                    onSave={() => saveStep3(formData.step3)}
                    sessionId={sessionId}
                    errors={stepErrors.step3 || {}}
                />
            )
        }
    ];

    const steps = isExcel ? [allSteps[0]] : allSteps;

    const handleNext = async () => {
        setError(null);
        let isValid = false;

        if (currentStep === 0) {
            isValid = validateStep1();
            if (!isValid) return setError('Please fix errors');
            
            if (isExcel) {
                return handleComplete();
            } else {
                const saved = await saveStep1(formData.step1);
                if (!saved) return;
            }
        } else if (currentStep === 1) {
            isValid = validateStep2();
            if (!isValid) return setError('Please fix errors');
            const saved = await saveStep2(formData.step2);
            if (!saved) return;
        } else if (currentStep === 2) {
            isValid = validateStep3();
            if (!isValid) return setError('Please fix errors');
            // Do not call saveStep3 here, it will be called in handleComplete
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleComplete = async () => {
        const isValid = isExcel ? validateStep1() : validateStep3();
        if (!isValid) return setError('Please fix errors');

        setSaving(true);
        try {
            let saved = false;
            if (isExcel) {
                saved = await saveStep1(formData.step1, false, true);
            } else {
                saved = await saveStep3(formData.step3, false, true);
            }
            
            if (!saved) {
                setSaving(false);
                return;
            }

            const response = await axios.post('/consent/complete', { session_id: sessionId });
            toast.success('Consent completed successfully!');
            setTimeout(() => {
                if (response.data.applicant_id) {
                    router.post(`/payment/checkout/${response.data.applicant_id}`);
                } else {
                    router.visit('/dashboard');
                }
            }, 1500);
        } catch (error) {
            console.error('Completion failed:', error);
            setError('Failed to complete consent.');
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="px-6 py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Consent Forms</h1>
                            <p className="text-gray-600 mt-2">
                                Please complete the consent form to proceed with your application
                            </p>
                        </div>

                        <Stepper steps={steps.map(s => s.title)} currentStep={currentStep} />

                        {error && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        <div className="mt-8">
                            {steps[currentStep].component}
                        </div>

                        <div className="mt-8 flex justify-between items-center border-t pt-6">
                            <div>
                                {currentStep > 0 && (
                                    <button
                                        onClick={handleBack}
                                        disabled={saving}
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleNext}
                                    disabled={saving}
                                    className={`px-8 py-2 rounded-md text-white font-medium transition-colors ${currentStep === steps.length - 1
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-brand hover:bg-brand-dark'
                                        } disabled:opacity-50`}
                                >
                                    {saving ? 'Processing...' : (currentStep === steps.length - 1 ? 'Complete & Proceed' : 'Save & Next')}
                                </button>
                            </div>
                        </div>

                        {saving && (
                            <div className="mt-4 text-center text-sm text-gray-500 animate-pulse">
                                Saving your progress...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}