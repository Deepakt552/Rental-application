// resources/js/Pages/Consent/ExcelForm.jsx
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import Step1 from '@/Components/Consent/Steps/Step1';

export default function ExcelForm({ sessionId }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [stepErrors, setStepErrors] = useState({});
    const [formData, setFormData] = useState({
        applicant_tenant: null,
        co_applicants: []
    });

    const isExcel = true; // This is the Excel specific form

    const saveForm = async (data, isCompleting = false) => {
        setSaving(true);
        setError(null);

        try {
            await axios.post('/consent/excel/step1', {
                ...data,
                session_id: sessionId
            });

            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
            toast.textContent = 'Form saved successfully!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

            return true;
        } catch (error) {
            console.error('Save failed:', error);
            setError(error.response?.data?.message || 'Failed to save. Please try again.');
            return false;
        } finally {
            if (!isCompleting) setSaving(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.applicant_tenant?.applicant_name) {
            errors.applicant_name = 'Applicant name is required';
        }
        if (!formData.applicant_tenant?.signature) {
            errors.signature = 'Signature is required';
        }
        if (formData.co_applicants && formData.co_applicants.length > 0) {
            formData.co_applicants.forEach((coApp, index) => {
                if (coApp.name && !coApp.signature) {
                    errors[`co_applicant_${index}_signature`] = `Signature required for ${coApp.name}`;
                }
                if (coApp.name && !coApp.consent_date) {
                    errors[`co_applicant_${index}_date`] = `Date required for ${coApp.name}`;
                }
            });
        }
        setStepErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleComplete = async () => {
        if (!validateForm()) return setError('Please fix errors');

        const saved = await saveForm(formData, true);
        if (!saved) {
            setSaving(false);
            return;
        }

        try {
            await axios.post('/consent/complete', {
                session_id: sessionId,
                is_excel: true
            });

            // Redirect to rental-application-excel after 1 second
            setTimeout(() => {
                router.visit('/rental-application-excel', {
                    data: { consent_session_id: sessionId }
                });
            }, 1000);

        } catch (error) {
            console.error('Completion failed:', error);
            setError('Failed to complete consent.');
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-2 sm:py-12">
            <div className="max-w-4xl mx-auto px-1 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                    <div className="px-3 py-4 sm:px-6 sm:py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Excel Consent Form</h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-2">
                                Please complete the APPLICANT/TENANT CONSENT to proceed
                            </p>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded flex items-center gap-2">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        <div className="mt-8">
                            <Step1
                                data={formData}
                                onChange={setFormData}
                                onSave={() => saveForm(formData)}
                                errors={stepErrors}
                                isExcel={isExcel}
                            />
                        </div>

                        <div className="mt-8 flex justify-end items-center border-t dark:border-slate-700 pt-6">
                            <button
                                onClick={handleComplete}
                                disabled={saving}
                                className={`px-8 py-2 rounded-md text-white font-medium transition-colors bg-green-600 hover:bg-green-700 disabled:opacity-50`}
                            >
                                {saving ? 'Processing...' : 'Complete & Proceed'}
                            </button>
                        </div>

                        {saving && (
                            <div className="mt-4 text-center text-sm text-gray-500 dark:text-slate-400 animate-pulse">
                                Saving your progress...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}