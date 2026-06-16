import Layout from '@/Layouts/Layout';
import { useEffect } from 'react';

export default function Success() {
        useEffect(() => {
        // Remove consent/application session data from browser
        localStorage.removeItem('consent_session_id');
        localStorage.removeItem('consent_completed');
        localStorage.removeItem('consent_pdf_path');
        localStorage.removeItem('consent_form_data');

        sessionStorage.removeItem('consent_session_id');
        sessionStorage.removeItem('consent_completed');
        sessionStorage.removeItem('consent_pdf_path');

        console.log('✅ Consent session cleared from browser');
    }, []);
    return (
        
            <div className="min-h-screen bg-white mt-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h1>
                        <p className="text-gray-600 mb-6">Thank you for completing your rental application. We will review your information and contact you soon.</p>
                       
                    </div>
                </div>
            </div>
        
    );
}