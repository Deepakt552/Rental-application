import { useState, useEffect, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import {
    User, MapPin, Briefcase, CarFront, Dog,
    IdCardLanyard, AlertCircle, ChevronDown, ChevronUp,
    Plus, Trash2, Phone, Upload, FileText, X,
    CheckCircle, Circle, Save, Table, ShieldCheck, Eye, EyeOff,
    Building2, Search, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function ApplicationForm({ sessionId: propSessionId }) {
    const { type, auth } = usePage().props;
    const [currentStep, setCurrentStep] = useState(1);
    const [applicantId, setApplicantId] = useState(null);
    const [sessionId, setSessionId] = useState(propSessionId || crypto.randomUUID());
    const [showEmailPopup, setShowEmailPopup] = useState(false);
    const [resumeEmail, setResumeEmail] = useState('');
    const [resumeLoading, setResumeLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEmailChecking, setIsEmailChecking] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Property Modal states
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [desiredMoveDate, setDesiredMoveDate] = useState('');
    const [companyName, setCompanyName] = useState(type === 'superadmin' ? 'Excel' : 'Triumph');
    const [applyingProperty, setApplyingProperty] = useState('');
    const [propertySearch, setPropertySearch] = useState('');
    const [propertyResults, setPropertyResults] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [selectedPropertyType, setSelectedPropertyType] = useState('');
    const [propertyLoading, setPropertyLoading] = useState(false);

    // Check if property details are set on load
    useEffect(() => {
        const savedApplicantId = localStorage.getItem('applicant_id');
        const savedApplication = localStorage.getItem('rental_application');

        if (savedApplicantId) {
            setShowPropertyModal(false);
            return;
        }

        if (savedApplication) {
            try {
                const parsed = JSON.parse(savedApplication);
                const pageCompany = type === 'superadmin' ? 'Excel' : 'Triumph';
                if (parsed.company_name === pageCompany && parsed.property_id && parsed.desired_move_date) {
                    setShowPropertyModal(false);
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }

        setShowPropertyModal(true);
        setCompanyName(type === 'superadmin' ? 'Excel' : 'Triumph');
    }, [type]);

    // Property search logic
    useEffect(() => {
        if (propertySearch.length < 2 || !companyName) {
            setPropertyResults([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            setPropertyLoading(true);
            fetch(`/properties/search?search=${encodeURIComponent(propertySearch)}&company_name=${encodeURIComponent(companyName)}`)
                .then(res => res.json())
                .then(data => {
                    setPropertyResults(data.data || []);
                })
                .catch(err => console.error(err))
                .finally(() => setPropertyLoading(false));
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [propertySearch, companyName]);

    const handleSelectProperty = (property) => {
        setSelectedProperty(property);
        setPropertySearch(property.property_name);
        setPropertyResults([]);
        setPropertyTypes(property.property_type || []);
    };

    const handlePropertySubmit = () => {
        if (!companyName || !selectedProperty || !selectedPropertyType || !desiredMoveDate) {
            toast.error('Please fill all fields');
            return;
        }

        const applicationData = {
            company_name: companyName,
            applying_property: applyingProperty,
            property_id: selectedProperty.id,
            property_name: selectedProperty.property_name,
            property_type: selectedPropertyType,
            desired_move_date: desiredMoveDate
        };

        localStorage.setItem('rental_application', JSON.stringify(applicationData));

        setShowPropertyModal(false);
        toast.success('Property details saved successfully!');
    };

    // Formatter helpers
    const formatPhone = (value) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, "");
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 4) return phoneNumber;
        if (phoneNumberLength < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };

    const formatSSN = (value) => {
        if (!value) return value;
        const ssn = value.replace(/[^\d]/g, "");
        const ssnLength = ssn.length;
        if (ssnLength < 4) return ssn;
        if (ssnLength < 6) {
            return `${ssn.slice(0, 3)}-${ssn.slice(3)}`;
        }
        return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5, 9)}`;
    };

    // Dynamic sections
    const [additionalPersons, setAdditionalPersons] = useState([]);
    const [pets, setPets] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showPreviousAddress, setShowPreviousAddress] = useState(false);
    const [showPreviousEmployment, setShowPreviousEmployment] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const emailCheckTimer = useRef(null);

    // Form data
    const [formData, setFormData] = useState({
        personal_info: {
            title: '', first_name: '', middle_name: '', last_name: '',
            preferred_name: '', marital_status: '', date_of_birth: '', phone: '', email: '',
            password: '', password_confirmation: ''
        },
        current_address: {
            country: 'United States', address_line_1: '', address_line_2: '',
            city: '', state: '', zip_code: '', apartment_community: '',
            residency_from_date: '',
            monthly_rent: '', reason_for_moving: '', notice_given: false
        },
        previous_address: {
            previous_country: '', previous_address_line_1: '', previous_address_line_2: '',
            previous_city: '', previous_state: '', previous_zip_code: '',
            previous_apartment: '',
            previous_from_date: '', previous_to_date: '', previous_rent: '', previous_reason: ''
        },
        employment: {
            employment_country: 'United States', employment_status: '', job_title: '',
            employer_name: '', supervisor_name: '', employed_since: '',
            monthly_income: '', additional_income: '', additional_income_source: '',
            employer_address_1: '', employer_address_2: '', employer_city: '',
            employer_state: '', employer_zip: '', employer_phone: ''
        },
        previous_employment: {
            previous_employer_name: '', previous_supervisor_name: '', previous_job_title: '',
            previous_monthly_income: '', previous_additional_income: '', previous_income_source: '',
            previous_start_date: '', previous_end_date: '', previous_employer_address_1: '',
            previous_employer_address_2: '', previous_employer_city: '', previous_employer_state: '',
            previous_employer_zip: '', previous_employer_phone: ''
        },
        screening: {
            date_of_birth: '', screening_country: '', has_ssn: false,
            ssn: '', government_id: '', issuing_entity: '',
            evicted: false, eviction_reason: '', felony: false,
            felony_reason: '', legal_case: false, legal_case_details: ''
        },
        emergency_contact: {
            full_name: '', relationship: '', phone: '', email: '',
            country: '', address_line_1: '', address_line_2: '',
            city: '', state: '', zip_code: ''
        },
        documents: {
            driving_license: null,
            pay_check: [],

            bank_statement: [],
            social_security_card: null,

            other_source_of_income: {
                file: null,
                description: ''
            },

            other: {
                file: null,
                description: ''
            }
        }
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const steps = [
        { number: 1, title: 'Personal Info', icon: User, required: true },
        { number: 2, title: 'Current Address', icon: MapPin, required: true },
        { number: 3, title: 'Previous Address', icon: MapPin, required: false },
        { number: 4, title: 'Employment', icon: Briefcase, required: true },
        { number: 5, title: 'Previous Employment', icon: Briefcase, required: false },
        { number: 6, title: 'Screening', icon: IdCardLanyard, required: true },
        { number: 7, title: 'Pets', icon: Dog, required: false },
        { number: 8, title: 'Vehicles', icon: CarFront, required: false },
        { number: 9, title: 'Emergency Contact', icon: Phone, required: true },
        { number: 10, title: 'Documents', icon: Upload, required: false }
    ];

    // Heartbeat to keep session alive
    useEffect(() => {
        const heartbeat = setInterval(() => {
            fetch('/api/application/ping').catch(() => { });
        }, 120000); // Ping every 2 minutes
        return () => clearInterval(heartbeat);
    }, []);

    // Helper for fetch with CSRF error handling
    const safeFetch = async (url, options = {}) => {
        try {
            const response = await fetch(url, options);
            if (response.status === 419) {
                // CSRF token mismatch
                window.location.reload();
                return null;
            }
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };

    // Save current step data to database
    const saveCurrentStep = async (forcedId = null) => {
        const idToUse = forcedId || applicantId;
        if (!idToUse) return false;

        setIsSaving(true);

        let endpoint = '';
        let dataToSend = { applicant_id: idToUse };

        switch (currentStep) {
            case 1:
                endpoint = '/api/application/step1/save';
                dataToSend = { ...dataToSend, ...formData.personal_info, additional_persons: additionalPersons };
                break;
            case 2:
                endpoint = '/api/application/step2/save';
                dataToSend = { ...dataToSend, ...formData.current_address };
                break;
            case 3:
                endpoint = '/api/application/step3/save';
                dataToSend = { ...dataToSend, ...formData.previous_address };
                break;
            case 4:
                endpoint = '/api/application/step4/save';
                dataToSend = { ...dataToSend, ...formData.employment };
                break;
            case 5:
                endpoint = '/api/application/step5/save';
                dataToSend = { ...dataToSend, ...formData.previous_employment };
                break;
            case 6:
                endpoint = '/api/application/step6/save';
                dataToSend = { ...dataToSend, ...formData.screening };
                break;
            case 7:
                endpoint = '/api/application/step7/save';
                dataToSend = { applicant_id: applicantId, pets: pets };
                break;
            case 8:
                endpoint = '/api/application/step8/save';
                dataToSend = { applicant_id: applicantId, vehicles: vehicles };
                break;
            case 9:
                endpoint = '/api/application/step9/save';
                dataToSend = { ...dataToSend, ...formData.emergency_contact };
                break;
            case 10:
                endpoint = '/api/application/step10/save';
                // For files, use FormData
                const formDataToSend = new FormData();
                formDataToSend.append('applicant_id', idToUse);

                // Append files
                // if (formData.documents.driving_license) formDataToSend.append('documents[driving_license]', formData.documents.driving_license);
                // if (formData.documents.pay_check) formDataToSend.append('documents[pay_check]', formData.documents.pay_check);
                // if (formData.documents.bank_statement) formDataToSend.append('documents[bank_statement]', formData.documents.bank_statement);
                // if (formData.documents.social_security_card) formDataToSend.append('documents[social_security_card]', formData.documents.social_security_card);
                // if (formData.documents.other_source_of_income.file) {
                //     formDataToSend.append('documents[other_source_of_income][file]', formData.documents.other_source_of_income.file);
                //     formDataToSend.append('documents[other_source_of_income][description]', formData.documents.other_source_of_income.description || '');
                // }
                // if (formData.documents.other.file) {
                //     formDataToSend.append('documents[other][file]', formData.documents.other.file);
                //     formDataToSend.append('documents[other][description]', formData.documents.other.description || '');
                // }

                if (formData.documents.driving_license) {
                    formDataToSend.append(
                        'documents[driving_license]',
                        formData.documents.driving_license
                    );
                }

                // Pay Check (multiple)
                if (
                    formData.documents.pay_check &&
                    formData.documents.pay_check.length > 0
                ) {
                    formData.documents.pay_check.forEach((file) => {
                        formDataToSend.append('documents[pay_check][]', file);
                    });
                }

                // Bank Statement (multiple)
                if (
                    formData.documents.bank_statement &&
                    formData.documents.bank_statement.length > 0
                ) {
                    formData.documents.bank_statement.forEach((file) => {
                        formDataToSend.append('documents[bank_statement][]', file);
                    });
                }

                // SSN Card (single)
                if (formData.documents.social_security_card) {
                    formDataToSend.append(
                        'documents[social_security_card]',
                        formData.documents.social_security_card
                    );
                }

                // Other Source of Income
                if (formData.documents.other_source_of_income.file) {

                    formDataToSend.append(
                        'documents[other_source_of_income][file]',
                        formData.documents.other_source_of_income.file
                    );

                    formDataToSend.append(
                        'documents[other_source_of_income][description]',
                        formData.documents.other_source_of_income.description || ''
                    );
                }

                // Other Documents
                if (formData.documents.other.file) {

                    formDataToSend.append(
                        'documents[other][file]',
                        formData.documents.other.file
                    );

                    formDataToSend.append(
                        'documents[other][description]',
                        formData.documents.other.description || ''
                    );
                }

                try {
                    const response = await safeFetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                        },
                        body: formDataToSend
                    });
                    if (!response) return false;
                    const result = await response.json();
                    if (!response.ok) {
                        if (response.status === 422 && result.errors) {
                            setErrors(result.errors);
                        }
                        setIsSaving(false);
                        return false;
                    }
                    setIsSaving(false);
                    return result.success;
                } catch (error) {
                    console.error('Save error:', error);
                    setIsSaving(false);
                    return false;
                }
            default:
                setIsSaving(false);
                return true;
        }

        // For non-file steps, use JSON
        if (endpoint && currentStep !== 10) {
            try {
                const response = await safeFetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify(dataToSend)
                });
                if (!response) return false;
                const result = await response.json();
                if (!response.ok) {
                    if (response.status === 422 && result.errors) {
                        // Map flat keys to nested keys if necessary
                        const mappedErrors = {};
                        Object.keys(result.errors).forEach(key => {
                            let mappedKey = key;
                            if (currentStep === 1) mappedKey = `personal_info.${key}`;
                            if (currentStep === 2) mappedKey = `current_address.${key}`;
                            if (currentStep === 3) mappedKey = `previous_address.${key}`;
                            if (currentStep === 4) mappedKey = `employment.${key}`;
                            if (currentStep === 5) mappedKey = `previous_employment.${key}`;
                            if (currentStep === 6) mappedKey = `screening.${key}`;
                            if (currentStep === 9) mappedKey = `emergency_contact.${key}`;

                            mappedErrors[mappedKey] = result.errors[key];
                        });
                        setErrors(mappedErrors);
                    }
                    setIsSaving(false);
                    return false;
                }
                setIsSaving(false);
                return result.success;
            } catch (error) {
                console.error('Save error:', error);
                setIsSaving(false);
                return false;
            }
        }

        setIsSaving(false);
        return true;
    };
    // Update only current step in applicant table
    const updateStepOnly = async (step, forcedId = null) => {
        const idToUse = forcedId || applicantId;
        if (!idToUse) return;

        try {
            await safeFetch('/api/application/step/current', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ applicant_id: idToUse, current_step: step })
            });
        } catch (error) {
            console.error('Error updating step:', error);
        }
    };




    const initApplication = async (email) => {

        try {

            const rentalApplication = JSON.parse(
                localStorage.getItem('rental_application')
            );

            const response = await safeFetch('/api/application/init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        .content
                },
                body: JSON.stringify({
                    email: email,
                    type: type,

                    company_name: rentalApplication?.company_name || null,
                    property_id: rentalApplication?.property_id || null,
                    property_name: rentalApplication?.property_name || null,
                    property_type: rentalApplication?.property_type || null,
                    desired_move_date:
                        rentalApplication?.desired_move_date || null,
                })
            });

            if (!response) {
                return {
                    success: false,
                    message: 'Session expired. Refreshing...'
                };
            }

            const result = await response.json();

            if (!response.ok) {

                return {
                    success: false,
                    message:
                        result.message ||
                        'Something went wrong'
                };
            }

            if (result.success) {

                setApplicantId(result.applicant_id);

                setSessionId(result.session_id);

                localStorage.setItem(
                    'applicant_id',
                    result.applicant_id
                );

                return {
                    success: true,
                    data: result
                };
            }

            return {
                success: false,
                message:
                    result.message ||
                    'Failed to initialize application'
            };

        } catch (error) {

            return {
                success: false,
                message:
                    'Network error. Please try again.'
            };
        }
    };

    // Next step - Save current step and move forward
    const nextStep = async () => {
        setErrorMessage('');
        // Only block if there are errors for the CURRENT step
        const currentStepPrefixes = {
            1: 'personal_info',
            2: 'current_address',
            3: 'previous_address',
            4: 'employment',
            5: 'previous_employment',
            6: 'screening',
            7: 'pets',
            8: 'vehicles',
            9: 'emergency_contact',
            10: 'documents'
        };

        const prefix = currentStepPrefixes[currentStep];

        // Custom frontend validation for Step 1
        if (currentStep === 1) {
            const newErrors = { ...errors };
            let hasError = false;

            // Password confirmation check
            const passwordFieldVisible = !auth?.user && (!applicantId || errors['personal_info.password'] || (formData.personal_info.password && formData.personal_info.password.length > 0));

            if (passwordFieldVisible) {
                if (!formData.personal_info.password) {
                    newErrors['personal_info.password'] = 'Password is required';
                    hasError = true;
                } else if (formData.personal_info.password.length < 8) {
                    newErrors['personal_info.password'] = 'Password must be at least 8 characters';
                    hasError = true;
                }

                if (formData.personal_info.password !== formData.personal_info.password_confirmation) {
                    newErrors['personal_info.password_confirmation'] = 'Passwords do not match';
                    hasError = true;
                }
            }

            if (hasError) {
                setErrors(newErrors);
                setErrorMessage('Please fix the following errors: ' + Object.values(newErrors).join(', '));
                return;
            }
        }

        const hasCurrentStepErrors = Object.keys(errors).some(key => key.startsWith(prefix) || key === 'email' || key === 'phone');

        if (hasCurrentStepErrors) {
            const relevantErrors = Object.entries(errors)
                .filter(([key]) => key.startsWith(prefix) || key === 'email' || key === 'phone')
                .map(([_, msg]) => msg);

            setErrorMessage(`Please fix the following errors: ${relevantErrors.join(', ')}`);
            // Scroll to first error
            const firstErrorField = document.querySelector('.border-red-500');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        let currentId = applicantId;

        // Check if we already have this applicant initialized
        if (currentStep === 1 && applicantId) {
            // Check if email changed
            const response = await safeFetch(`/api/application/applicant/${applicantId}`);
            if (!response) return;
            const currentApplicant = await response.json();

            if (currentApplicant.success && currentApplicant.form_data.email !== formData.personal_info.email) {
                // Email changed, need to re-init or update
                const initResult = await initApplication(formData.personal_info.email);
                if (!initResult.success) {
                    setErrorMessage(initResult.message || 'Failed to initialize application');
                    return;
                }
                currentId = initResult.data.applicant_id;
            }
        } else if (currentStep === 1) {
            const initResult = await initApplication(
                formData.personal_info.email
            );
            // ERROR CASE
            if (!initResult.success) {
                setErrorMessage(
                    initResult.message ||
                    'Failed to initialize application'
                );
                return;
            }
            currentId = initResult.data.applicant_id;
        }

        // Clear any previous error messages
        setErrorMessage('');

        // Save current step data
        const saved = await saveCurrentStep(currentId);
        if (!saved && currentStep !== 3 && currentStep !== 5 && currentStep !== 7 && currentStep !== 8 && currentStep !== 10) {
            setErrorMessage('Error saving data. Please try again.');
            return;
        }

        if (currentStep < 10) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            await updateStepOnly(newStep, currentId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Previous step
    const prevStep = async () => {
        if (currentStep > 1) {
            // Save current step before leaving (except step 1 which already saved)
            if (currentStep !== 1) {
                await saveCurrentStep();
            }

            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            await updateStepOnly(newStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Go to specific step (navigation click)
    const goToStep = async (step) => {
        // If clicking a different step while on Step 1, ensure validation/init
        if (currentStep === 1 && step !== 1) {
            const newErrors = { ...errors };
            let hasError = false;

            // Password confirmation check
            const passwordFieldVisible = !auth?.user && (!applicantId || errors['personal_info.password'] || (formData.personal_info.password && formData.personal_info.password.length > 0));

            if (passwordFieldVisible) {
                if (!formData.personal_info.password) {
                    newErrors['personal_info.password'] = 'Password is required';
                    hasError = true;
                } else if (formData.personal_info.password.length < 8) {
                    newErrors['personal_info.password'] = 'Password must be at least 8 characters';
                    hasError = true;
                }

                if (formData.personal_info.password !== formData.personal_info.password_confirmation) {
                    newErrors['personal_info.password_confirmation'] = 'Passwords do not match';
                    hasError = true;
                }
            }

            if (!formData.personal_info.first_name) { newErrors['personal_info.first_name'] = 'First name is required'; hasError = true; }
            if (!formData.personal_info.last_name) { newErrors['personal_info.last_name'] = 'Last name is required'; hasError = true; }
            if (!formData.personal_info.phone) { newErrors['personal_info.phone'] = 'Phone is required'; hasError = true; }
            if (!formData.personal_info.email) { newErrors['personal_info.email'] = 'Email is required'; hasError = true; }

            if (hasError) {
                setErrors(newErrors);
                setErrorMessage('Please fix the errors on Step 1 before navigating.');
                return;
            }

            if (applicantId) {
                await saveCurrentStep();
            }
        } else if (applicantId) {
            await saveCurrentStep();
        }

        setCurrentStep(step);
        if (applicantId) {
            await updateStepOnly(step);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Resume from email
    const resumeFromEmail = async () => {
        if (!resumeEmail) return;

        setResumeLoading(true);
        try {
            const response = await safeFetch(`/api/application/resume/${resumeEmail}`);
            if (!response) return;
            const result = await response.json();

            if (result.success) {
                setApplicantId(result.applicant_id);
                setSessionId(result.session_id);
                localStorage.setItem('applicant_id', result.applicant_id);
                setCurrentStep(result.current_step);

                const fd = result.form_data;

                // Restore all data
                if (fd.personal_info) setFormData(prev => ({ ...prev, personal_info: fd.personal_info }));
                if (fd.current_address) setFormData(prev => ({ ...prev, current_address: fd.current_address }));
                if (fd.previous_address && fd.previous_address.previous_address_line_1) {
                    setFormData(prev => ({ ...prev, previous_address: fd.previous_address }));
                    setShowPreviousAddress(true);
                }
                if (fd.employment) setFormData(prev => ({ ...prev, employment: fd.employment }));
                if (fd.previous_employment && fd.previous_employment.previous_employer_name) {
                    setFormData(prev => ({ ...prev, previous_employment: fd.previous_employment }));
                    setShowPreviousEmployment(true);
                }
                if (fd.screening) setFormData(prev => ({ ...prev, screening: fd.screening }));
                if (fd.pets && fd.pets.length > 0) setPets(fd.pets);
                if (fd.vehicles && fd.vehicles.length > 0) setVehicles(fd.vehicles);
                if (fd.emergency_contact) setFormData(prev => ({ ...prev, emergency_contact: fd.emergency_contact }));
                if (fd.additional_persons && fd.additional_persons.length > 0) setAdditionalPersons(fd.additional_persons);

                setShowEmailPopup(false);
                setErrorMessage(`Welcome back! You were on Step ${result.current_step}`);
            } else {
                setErrorMessage('No saved application found with this email.');
                setShowEmailPopup(false);
            }
        } catch (error) {
            console.error('Resume error:', error);
            setErrorMessage('Error loading your application.');
        } finally {
            setResumeLoading(false);
        }
    };
    console.log(formData.documents.pay_check);
    console.log(formData.documents.bank_statement);
    // Final submit
    const finalSubmit = async () => {

        if (!applicantId) return;

        // Clear old errors
        setErrors({});
        setErrorMessage('');

        // ✅ Required document validation
        const requiredDocs = [
            'driving_license',
            'pay_check',
            'bank_statement',
            'social_security_card'
        ];

        const missingDocs = requiredDocs.filter((id) => {

            // Multiple file validation
            if (id === 'pay_check' || id === 'bank_statement') {
                return (
                    !formData.documents[id] ||
                    formData.documents[id].length === 0
                );
            }

            // Single file validation
            return !formData.documents[id];
        });

        if (missingDocs.length > 0) {

            const newErrors = {};

            missingDocs.forEach((id) => {
                newErrors[`documents.${id}`] = 'Document required';
            });

            setErrors(newErrors);

            setErrorMessage(
                'Step 10 is incomplete: Please upload all required documents.'
            );

            return;
        }

        setProcessing(true);

        try {

            // ✅ Save Step 10 first
            const stepSaved = await saveCurrentStep();

            // Stop if save failed
            if (!stepSaved) {

                setProcessing(false);

                console.log('Step 10 save failed');

                return;
            }

            // ✅ Final submit
            const response = await safeFetch('/api/application/final-submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    applicant_id: applicantId,
                    form_type: type
                })
            });

            if (!response) {
                setProcessing(false);
                return;
            }

            const result = await response.json();

            // ✅ Success
            if (result.success) {

                console.log('Application Submitted');
                console.log('Email Status:', result.email_status);

                toast.success('Application submitted successfully!');

                localStorage.removeItem('applicant_id');
                localStorage.removeItem('rental_application');

                setTimeout(() => {

                    window.location.href =
                        `/consent?session_id=${sessionId}`;

                }, 1500);

            } else {

                // ✅ Validation errors
                if (result.errors) {

                    setErrors(result.errors);

                    const errorMessages = Object.values(result.errors).flat();

                    let msg = 'Please fix the following errors:';

                    if (result.step_with_error) {

                        msg =
                            `Error in Step ${result.step_with_error}: ` + msg;

                    } else if (result.first_incomplete_step) {

                        msg =
                            `Step ${result.first_incomplete_step} is incomplete: ` +
                            msg;
                    }

                    setErrorMessage(
                        msg + '\n\n' + errorMessages.join('\n')
                    );

                    // Redirect to error step
                    if (result.step_with_error) {

                        setCurrentStep(result.step_with_error);

                        await updateStepOnly(result.step_with_error);

                    } else if (result.first_incomplete_step) {

                        setCurrentStep(result.first_incomplete_step);

                        await updateStepOnly(result.first_incomplete_step);
                    }

                } else {

                    alert(
                        'Error submitting application: ' +
                        (result.message || 'Unknown error')
                    );
                }
            }

        } catch (error) {

            console.error('Submit error:', error);

            alert(
                'Error submitting application. Please try again.'
            );

        } finally {

            setProcessing(false);
        }
    };
    // Load saved draft on page load
    useEffect(() => {
        const savedApplicantId = localStorage.getItem('applicant_id');
        if (savedApplicantId) {
            safeFetch(`/api/application/applicant/${savedApplicantId}`)
                .then(res => res ? res.json() : null)
                .then(result => {
                    if (result && result.success) {
                        setApplicantId(result.applicant_id);
                        setSessionId(result.session_id);
                        setCurrentStep(result.current_step);

                        const fd = result.form_data;
                        if (fd.personal_info) setFormData(prev => ({ ...prev, personal_info: fd.personal_info }));
                        if (fd.current_address) setFormData(prev => ({ ...prev, current_address: fd.current_address }));
                        if (fd.previous_address && fd.previous_address.previous_address_line_1) {
                            setFormData(prev => ({ ...prev, previous_address: fd.previous_address }));
                            setShowPreviousAddress(true);
                        }
                        if (fd.employment) setFormData(prev => ({ ...prev, employment: fd.employment }));
                        if (fd.previous_employment && fd.previous_employment.previous_employer_name) {
                            setFormData(prev => ({ ...prev, previous_employment: fd.previous_employment }));
                            setShowPreviousEmployment(true);
                        }
                        if (fd.screening) setFormData(prev => ({ ...prev, screening: fd.screening }));
                        if (fd.pets) setPets(fd.pets);
                        if (fd.vehicles) setVehicles(fd.vehicles);
                        if (fd.emergency_contact) setFormData(prev => ({ ...prev, emergency_contact: fd.emergency_contact }));
                        if (fd.additional_persons) setAdditionalPersons(fd.additional_persons);
                    }
                })
                .catch(err => console.error('Error loading draft:', err));
        }
    }, []);



    // Email availability check
    const checkEmailAvailability = async (email) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

        setIsEmailChecking(true);
        try {
            const response = await safeFetch('/api/application/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ email })
            });
            if (!response) return;
            const result = await response.json();
            if (result.exists) {
                setErrors(prev => ({ ...prev, [`personal_info.email`]: result.message }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`personal_info.email`];
                    return newErrors;
                });
                // Show temporary success message
                setEmailAvailable(true);
                setTimeout(() => setEmailAvailable(false), 3000);
            }
        } catch (error) {
            console.error('Email check error:', error);
        } finally {
            setIsEmailChecking(false);
        }
    };

    const clearError = (fieldName) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    const updatePersonalInfo = (field, value) => {
        let newValue = value;
        let newErrors = { ...errors };

        if (field === 'phone') {
            newValue = formatPhone(value);
            const digits = value.replace(/\D/g, '');
            if (digits.length > 0 && digits.length < 10) {
                newErrors[`personal_info.phone`] = 'Phone must be 10 digits';
            } else {
                delete newErrors[`personal_info.phone`];
            }
        }
        if (field === 'date_of_birth') {
            // Only validate once the year part is fully entered (4 digits)
            // This prevents the field from resetting while the user is still typing the year
            const yearPart = value ? value.split('-')[0] : '';
            const isComplete = value && yearPart.length === 4 && value.length === 10;

            if (isComplete) {
                const today = new Date();
                const birthDate = new Date(value);

                // Guard against invalid date
                if (isNaN(birthDate.getTime())) {
                    setFormData(prev => ({ ...prev, personal_info: { ...prev.personal_info, [field]: value } }));
                    return;
                }

                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 18) {
                    setErrors(prev => ({
                        ...prev,
                        'personal_info.date_of_birth': 'You are not eligible. Applicant must be 18+'
                    }));
                    // Still update the value so the field doesn't reset
                    setFormData(prev => ({ ...prev, personal_info: { ...prev.personal_info, [field]: value } }));
                    return;
                }

                if (age > 110) {
                    setErrors(prev => ({
                        ...prev,
                        'personal_info.date_of_birth': 'Maximum allowed age is 110 years'
                    }));
                    setFormData(prev => ({ ...prev, personal_info: { ...prev.personal_info, [field]: value } }));
                    return;
                }
            }

            clearError('personal_info.date_of_birth');
        }


        if (field === 'email') {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors[`personal_info.email`] = 'Invalid email format';
            } else {
                delete newErrors[`personal_info.email`];
                if (value) {
                    if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);
                    emailCheckTimer.current = setTimeout(() => checkEmailAvailability(value), 400);
                }
            }
        } else if (field === 'first_name' || field === 'last_name') {
            const fieldLabel = field === 'first_name' ? 'First' : 'Last';
            if (!value) {
                newErrors[`personal_info.${field}`] = `${fieldLabel} name is required`;
            } else {
                delete newErrors[`personal_info.${field}`];
            }
        } else {
            delete newErrors[`personal_info.${field}`];
        }

        setErrors(newErrors);
        setFormData(prev => ({ ...prev, personal_info: { ...prev.personal_info, [field]: newValue } }));
    };

    const updateCurrentAddress = (field, value) => {
        clearError(`current_address.${field}`);
        setFormData(prev => ({ ...prev, current_address: { ...prev.current_address, [field]: value } }));
    };

    const updatePreviousAddress = (field, value) => {
        clearError(`previous_address.${field}`);
        setFormData(prev => ({ ...prev, previous_address: { ...prev.previous_address, [field]: value } }));
    };

    const updateEmployment = (field, value) => {
        clearError(`employment.${field}`);

        let updatedValue = value;

        // Apply formatting only for employer_phone
        if (field === 'employer_phone') {
            updatedValue = formatUSPhone(value);
        }

        setFormData(prev => ({
            ...prev,
            employment: {
                ...prev.employment,
                [field]: updatedValue
            }
        }));
    };

    const updatePreviousEmployment = (field, value) => {
        clearError(`previous_employment.${field}`);
        setFormData(prev => ({ ...prev, previous_employment: { ...prev.previous_employment, [field]: value } }));
    };

    // const updateScreening = (field, value) => {
    //     let newValue = value;
    //     if (field === 'ssn') {
    //         newValue = formatSSN(value);
    //     }
    //     clearError(`screening.${field}`);
    //     setFormData(prev => ({ ...prev, screening: { ...prev.screening, [field]: newValue } }));
    // };

    const updateScreening = (field, value) => {

        let newValue = value;

        // Format SSN
        if (field === 'ssn') {
            newValue = formatSSN(value);
        }

        clearError(`screening.${field}`);

        setFormData(prev => {

            let updatedScreening = {
                ...prev.screening,
                [field]: newValue
            };

            /*
            |--------------------------------------------------------------------------
            | Clear fields automatically when checkbox unchecked
            |--------------------------------------------------------------------------
            */

            // SSN
            if (field === 'has_ssn' && !value) {
                updatedScreening.ssn = '';
                clearError('screening.ssn');
            }

            // Evicted
            if (field === 'evicted' && !value) {
                updatedScreening.eviction_reason = '';
                clearError('screening.eviction_reason');
            }

            // Felony
            if (field === 'felony' && !value) {
                updatedScreening.felony_reason = '';
                clearError('screening.felony_reason');
            }

            // Legal Case
            if (field === 'legal_case' && !value) {
                updatedScreening.legal_case_details = '';
                clearError('screening.legal_case_details');
            }

            return {
                ...prev,
                screening: updatedScreening
            };
        });
    };
    const updateEmergencyContact = (field, value) => {
        clearError(`emergency_contact.${field}`);
        setFormData(prev => ({ ...prev, emergency_contact: { ...prev.emergency_contact, [field]: value } }));
    };

    // Dynamic section functions
    const addPerson = () => {
        setAdditionalPersons([...additionalPersons, {
            full_name: '', date_of_birth: '', relationship: '', phone: '',
            email: '', occupation: '', is_emergency_contact: false, notes: ''
        }]);
    };

    const updatePerson = (index, field, value) => {
        const updated = [...additionalPersons];
        updated[index][field] = value;
        setAdditionalPersons(updated);
    };

    const removePerson = (index) => {
        setAdditionalPersons(additionalPersons.filter((_, i) => i !== index));
    };

    const addPet = () => {
        if (pets.length < 2) {
            setPets([...pets, { pet_type: '', pet_name: '', breed: '', age: '', weight: '', color: '', vaccinated: false, special_notes: '' }]);
        }
    };

    const updatePet = (index, field, value) => {
        const updated = [...pets];
        updated[index][field] = value;
        setPets(updated);
    };

    const removePet = (index) => {
        setPets(pets.filter((_, i) => i !== index));
    };

    const addVehicle = () => {
        if (vehicles.length < 4) {
            setVehicles([...vehicles, { vehicle_type: '', model: '', plate_number: '' }]);
        }
    };

    const updateVehicle = (index, field, value) => {
        const updated = [...vehicles];
        updated[index][field] = value;
        setVehicles(updated);
    };

    const removeVehicle = (index) => {
        setVehicles(vehicles.filter((_, i) => i !== index));
    };

    const getFieldClass = (fieldName) => {
        return `w-full rounded-md ${errors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`;
    };

    const formatUSPhone = (value) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '').slice(0, 10);

        // Format phone number
        if (digits.length < 4) {
            return digits;
        } else if (digits.length < 7) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
    };



    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return renderPersonalInfoStep();
            case 2: return renderCurrentAddressStep();
            case 3: return renderPreviousAddressStep();
            case 4: return renderEmploymentStep();
            case 5: return renderPreviousEmploymentStep();
            case 6: return renderScreeningStep();
            case 7: return renderPetsStep();
            case 8: return renderVehiclesStep();
            case 9: return renderEmergencyContactStep();
            case 10: return renderDocumentsStep();
            default: return null;
        }
    };

    const renderPersonalInfoStep = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <select value={formData.personal_info.title} onChange={(e) => updatePersonalInfo('title', e.target.value)} className="w-full rounded-md border-gray-300">
                        <option value="">Select</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Dr.">Dr.</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-red-500">First Name *</label>
                    <input type="text" value={formData.personal_info.first_name} onChange={(e) => updatePersonalInfo('first_name', e.target.value)} className={getFieldClass('personal_info.first_name')} />
                    {errors['personal_info.first_name'] && <p className="text-red-500 text-xs mt-1">{errors['personal_info.first_name']}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Middle Name</label>
                    <input type="text" value={formData.personal_info.middle_name} onChange={(e) => updatePersonalInfo('middle_name', e.target.value)} className={getFieldClass('personal_info.middle_name')} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-red-500">Last Name *</label>
                    <input type="text" value={formData.personal_info.last_name} onChange={(e) => updatePersonalInfo('last_name', e.target.value)} className={getFieldClass('personal_info.last_name')} />
                    {errors['personal_info.last_name'] && <p className="text-red-500 text-xs mt-1">{errors['personal_info.last_name']}</p>}
                </div>
                {/* <div>
                    <label className="block text-sm font-medium mb-1">Preferred Name</label>
                    <input type="text" value={formData.personal_info.preferred_name} onChange={(e) => updatePersonalInfo('preferred_name', e.target.value)} className="w-full rounded-md border-gray-300" />
                </div> */}
                <div>
                    <label className="block text-sm font-medium mb-1">Marital Status</label>
                    <select value={formData.personal_info.marital_status} onChange={(e) => updatePersonalInfo('marital_status', e.target.value)} className="w-full rounded-md border-gray-300">
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-red-500">Date of Birth *</label>
                    <input
                        type="date"
                        value={formData.personal_info.date_of_birth || ''}
                        onChange={(e) =>
                            updatePersonalInfo('date_of_birth', e.target.value)
                        }
                        min={
                            new Date(
                                new Date().getFullYear() - 110,
                                0,
                                1
                            ).toISOString().split('T')[0]
                        }
                        max={
                            new Date(
                                new Date().getFullYear() - 18,
                                11,
                                31
                            ).toISOString().split('T')[0]
                        }
                        className={getFieldClass('personal_info.date_of_birth')}
                    />

                    {errors['personal_info.date_of_birth'] && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors['personal_info.date_of_birth']}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-red-500">Phone *</label>
                    <input type="tel" value={formData.personal_info.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} placeholder="(XXX) XXX-XXXX" className={getFieldClass('personal_info.phone')} />
                    {errors['personal_info.phone'] && <p className="text-red-500 text-xs mt-1">{errors['personal_info.phone']}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-red-500">Email *</label>
                    <div className="relative">
                        <input type="email" value={formData.personal_info.email} autoComplete="off" onChange={(e) => updatePersonalInfo('email', e.target.value)} className={getFieldClass('personal_info.email')} />
                        {isEmailChecking && <span className="absolute right-2 top-2 text-xs text-gray-400">Checking...</span>}
                        {emailAvailable && !isEmailChecking && !errors['personal_info.email'] && <span className="absolute right-2 top-2 text-xs text-green-500 font-medium">✓ Available</span>}
                    </div>
                    {errors['personal_info.email'] && <p className="text-red-500 text-xs mt-1">{errors['personal_info.email']}</p>}
                </div>
                {!auth?.user && (!applicantId || errors['personal_info.password'] || errors['password'] || (formData.personal_info.password && formData.personal_info.password.length > 0 && formData.personal_info.password.length < 8)) && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-red-500">Create Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.personal_info.password}
                                    autoComplete="new-password"
                                    onChange={(e) => updatePersonalInfo('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={getFieldClass('personal_info.password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors['personal_info.password'] && <p className="text-red-500 text-xs mt-1">{errors['personal_info.password']}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-red-500">Confirm Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.personal_info.password_confirmation}
                                    autoComplete="new-password"
                                    onChange={(e) => updatePersonalInfo('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    className={getFieldClass('personal_info.password_confirmation')}
                                />
                            </div>
                            {errors['personal_info.password_confirmation'] && <p className="text-red-500 text-xs mt-1">{errors['personal_info.password_confirmation']}</p>}
                        </div>
                    </>
                )}
            </div>

            {/* Additional Household Members */}
            <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Additional Household Members</h3>
                    <button type="button" onClick={addPerson} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Person
                    </button>
                </div>
                {additionalPersons.length > 0 ? additionalPersons.map((person, idx) => (
                    <div key={idx} className="border rounded-lg p-4 mb-4 bg-gray-50">
                        <div className="flex justify-between mb-3">
                            <h4 className="font-semibold">Person #{idx + 1}</h4>
                            <button type="button" onClick={() => removePerson(idx)} className="text-red-500 text-sm">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" placeholder="Full Name" value={person.full_name} onChange={(e) => updatePerson(idx, 'full_name', e.target.value)} className="w-full rounded-md border-gray-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input type="date" value={person.date_of_birth} onChange={(e) => updatePerson(idx, 'date_of_birth', e.target.value)} className="w-full rounded-md border-gray-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                                <select
                                    value={person.relationship}
                                    onChange={(e) => updatePerson(idx, 'relationship', e.target.value)}
                                    className="w-full rounded-md border-gray-300"
                                >
                                    <option value="">Select Relationship</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Child">Child</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Roommate">Roommate</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="tel" placeholder="(XXX) XXX-XXXX" value={person.phone} onChange={(e) => updatePerson(idx, 'phone', formatPhone(e.target.value))} className="w-full rounded-md border-gray-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" placeholder="Email" value={person.email} onChange={(e) => updatePerson(idx, 'email', e.target.value)} className="w-full rounded-md border-gray-300" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Occupation</label>
                                <input type="text" placeholder="Occupation" value={person.occupation} onChange={(e) => updatePerson(idx, 'occupation', e.target.value)} className="w-full rounded-md border-gray-300" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center mt-2 cursor-pointer">
                                    <input type="checkbox" checked={person.is_emergency_contact} onChange={(e) => updatePerson(idx, 'is_emergency_contact', e.target.checked)} className="rounded border-gray-300 text-brand focus:ring-brand" />
                                    <span className="ml-2 text-sm text-gray-700">Set as Emergency Contact</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-gray-500 text-sm">No additional persons added. Click "Add Person" to add household members.</p>}
            </div>
        </div>
    );

    const renderCurrentAddressStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-red-500">Country *</label>
                <input type="text" value={formData.current_address.country} onChange={(e) => updateCurrentAddress('country', e.target.value)} className={getFieldClass('current_address.country')} />
                {errors['current_address.country'] && <p className="text-red-500 text-xs mt-1">{errors['current_address.country']}</p>}
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-red-500">Address Line 1 *</label>
                <input type="text" value={formData.current_address.address_line_1} onChange={(e) => updateCurrentAddress('address_line_1', e.target.value)} className={getFieldClass('current_address.address_line_1')} />
                {errors['current_address.address_line_1'] && <p className="text-red-500 text-xs mt-1">{errors['current_address.address_line_1']}</p>}
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                <input type="text" value={formData.current_address.address_line_2} onChange={(e) => updateCurrentAddress('address_line_2', e.target.value)} className={getFieldClass('current_address.address_line_2')} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-red-500">City *</label>
                <input type="text" value={formData.current_address.city} onChange={(e) => updateCurrentAddress('city', e.target.value)} className={getFieldClass('current_address.city')} />
                {errors['current_address.city'] && <p className="text-red-500 text-xs mt-1">{errors['current_address.city']}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-red-500">State *</label>
                <input type="text" value={formData.current_address.state} onChange={(e) => updateCurrentAddress('state', e.target.value)} className={getFieldClass('current_address.state')} />
                {errors['current_address.state'] && <p className="text-red-500 text-xs mt-1">{errors['current_address.state']}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-red-500">ZIP Code *</label>
                <input type="text" value={formData.current_address.zip_code} onChange={(e) => updateCurrentAddress('zip_code', e.target.value)} className={getFieldClass('current_address.zip_code')} />
                {errors['current_address.zip_code'] && <p className="text-red-500 text-xs mt-1">{errors['current_address.zip_code']}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Apartment Community</label>
                <input type="text" value={formData.current_address.apartment_community} onChange={(e) => updateCurrentAddress('apartment_community', e.target.value)} className={getFieldClass('current_address.apartment_community')} />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Residency From Date</label>
                <input type="date" value={formData.current_address.residency_from_date} onChange={(e) => updateCurrentAddress('residency_from_date', e.target.value)} className={getFieldClass('current_address.residency_from_date')} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Monthly Rent</label>
                <input type="number" step="0.01" value={formData.current_address.monthly_rent} onChange={(e) => updateCurrentAddress('monthly_rent', e.target.value)} className={getFieldClass('current_address.monthly_rent')} />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Reason for Moving</label>
                <textarea rows="2" value={formData.current_address.reason_for_moving} onChange={(e) => updateCurrentAddress('reason_for_moving', e.target.value)} className={getFieldClass('current_address.reason_for_moving')}></textarea>
            </div>
            <div>
                <label className="flex items-center">
                    <input type="checkbox" checked={formData.current_address.notice_given} onChange={(e) => updateCurrentAddress('notice_given', e.target.checked)} className="rounded" />
                    <span className="ml-2 text-sm">30 days notice given to current landlord</span>
                </label>
            </div>
        </div>
    );

    const renderPreviousAddressStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-4 italic">Providing a previous address helps verify your rental history and may speed up your application.</p>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Previous Country</label>
                <input type="text" value={formData.previous_address.previous_country} onChange={(e) => updatePreviousAddress('previous_country', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Previous Address Line 1</label>
                <input type="text" value={formData.previous_address.previous_address_line_1} onChange={(e) => updatePreviousAddress('previous_address_line_1', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Previous City</label>
                <input type="text" value={formData.previous_address.previous_city} onChange={(e) => updatePreviousAddress('previous_city', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Previous State</label>
                <input type="text" value={formData.previous_address.previous_state} onChange={(e) => updatePreviousAddress('previous_state', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Previous ZIP Code</label>
                <input type="text" value={formData.previous_address.previous_zip_code} onChange={(e) => updatePreviousAddress('previous_zip_code', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">From Date</label>
                <input type="date" value={formData.previous_address.previous_from_date} onChange={(e) => updatePreviousAddress('previous_from_date', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">To Date</label>
                <input type="date" value={formData.previous_address.previous_to_date} onChange={(e) => updatePreviousAddress('previous_to_date', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
        </div>
    );

    // const renderEmploymentStep = () => (
    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //         <div>
    //             <label className="block text-sm font-medium mb-1 text-red-500">Employment Country *</label>
    //             <input type="text" value={formData.employment.employment_country} onChange={(e) => updateEmployment('employment_country', e.target.value)} className={getFieldClass('employment.employment_country')} />
    //             {errors['employment.employment_country'] && <p className="text-red-500 text-xs mt-1">{errors['employment.employment_country']}</p>}
    //         </div>
    //         <div>
    //             <label className="block text-sm font-medium mb-1">Employment Status</label>
    //             <select value={formData.employment.employment_status} onChange={(e) => updateEmployment('employment_status', e.target.value)} className="w-full rounded-md border-gray-300">
    //                 <option value="">Select</option>
    //                 <option value="Full-time">Full-time</option>
    //                 <option value="Part-time">Part-time</option>
    //                 <option value="Self-employed">Self-employed</option>
    //                 <option value="Unemployed">Unemployed</option>
    //                 <option value="Retired">Retired</option>
    //             </select>
    //         </div>
    //         <div><label>Job Title</label><input type="text" value={formData.employment.job_title} onChange={(e) => updateEmployment('job_title', e.target.value)} className={getFieldClass('employment.job_title')} /></div>
    //         <div><label>Employer Name</label><input type="text" value={formData.employment.employer_name} onChange={(e) => updateEmployment('employer_name', e.target.value)} className={getFieldClass('employment.employer_name')} /></div>
    //         <div><label>Supervisor Name</label><input type="text" value={formData.employment.supervisor_name} onChange={(e) => updateEmployment('supervisor_name', e.target.value)} className={getFieldClass('employment.supervisor_name')} /></div>
    //         <div><label>Employed Since</label><input type="date" value={formData.employment.employed_since} onChange={(e) => updateEmployment('employed_since', e.target.value)} className={getFieldClass('employment.employed_since')} /></div>
    //         <div><label>Monthly Income</label><input type="number" step="0.01" value={formData.employment.monthly_income} onChange={(e) => updateEmployment('monthly_income', e.target.value)} className={getFieldClass('employment.monthly_income')} /></div>
    //         <div><label>Additional Income</label><input type="number" step="0.01" value={formData.employment.additional_income} onChange={(e) => updateEmployment('additional_income', e.target.value)} className={getFieldClass('employment.additional_income')} /></div>
    //         <div className="md:col-span-2"><label>Employer Address Line 1</label><input type="text" value={formData.employment.employer_address_1} onChange={(e) => updateEmployment('employer_address_1', e.target.value)} className={getFieldClass('employment.employer_address_1')} /></div>
    //         <div><label>Employer City</label><input type="text" value={formData.employment.employer_city} onChange={(e) => updateEmployment('employer_city', e.target.value)} className={getFieldClass('employment.employer_city')} /></div>
    //         <div><label>Employer State</label><input type="text" value={formData.employment.employer_state} onChange={(e) => updateEmployment('employer_state', e.target.value)} className={getFieldClass('employment.employer_state')} /></div>
    //         <div><label>Employer ZIP</label><input type="text" value={formData.employment.employer_zip} onChange={(e) => updateEmployment('employer_zip', e.target.value)} className={getFieldClass('employment.employer_zip')} /></div>
    //         <div><label>Employer Phone</label> <input
    //             type="tel"
    //             value={formData.employment.employer_phone}
    //             onChange={(e) => updateEmployment('employer_phone', e.target.value)}
    //             placeholder="(123) 456-7890"
    //             maxLength={14}
    //             className={getFieldClass('employment.employer_phone')}
    //         /></div>
    //     </div>
    // );
    const renderEmploymentStep = () => {
        // Validation function for employment fields
        const validateEmploymentFields = () => {
            const newErrors = {};
            const emp = formData.employment;

            // Required: Employment Country
            if (!emp.employment_country?.trim()) {
                newErrors['employment.employment_country'] = 'Employment country is required';
            }

            // Required: Employment Status
            if (!emp.employment_status) {
                newErrors['employment.employment_status'] = 'Employment status is required';
            }

            // Conditional Required Fields (Only if employed)
            if (emp.employment_status && emp.employment_status !== 'Unemployed' && emp.employment_status !== 'Retired') {
                // Job Title - Required
                if (!emp.job_title?.trim()) {
                    newErrors['employment.job_title'] = 'Job title is required';
                }

                // Employer Name - Required
                if (!emp.employer_name?.trim()) {
                    newErrors['employment.employer_name'] = 'Employer name is required';
                }

                // Employer Address - Required
                if (!emp.employer_address_1?.trim()) {
                    newErrors['employment.employer_address_1'] = 'Employer address is required';
                }

                // Employer City - Required
                if (!emp.employer_city?.trim()) {
                    newErrors['employment.employer_city'] = 'Employer city is required';
                }

                // Employer State - Required
                if (!emp.employer_state?.trim()) {
                    newErrors['employment.employer_state'] = 'Employer state is required';
                }

                // Employer ZIP - Required
                if (!emp.employer_zip?.trim()) {
                    newErrors['employment.employer_zip'] = 'Employer ZIP code is required';
                } else if (!/^\d{5}(-\d{4})?$/.test(emp.employer_zip)) {
                    newErrors['employment.employer_zip'] = 'Enter valid ZIP code (e.g., 12345 or 12345-6789)';
                }

                // Employed Since - Required
                if (!emp.employed_since) {
                    newErrors['employment.employed_since'] = 'Employment start date is required';
                } else {
                    const startDate = new Date(emp.employed_since);
                    const today = new Date();
                    if (startDate > today) {
                        newErrors['employment.employed_since'] = 'Start date cannot be in the future';
                    }
                }

                // Monthly Income - Required
                if (!emp.monthly_income) {
                    newErrors['employment.monthly_income'] = 'Monthly income is required';
                } else if (parseFloat(emp.monthly_income) < 0) {
                    newErrors['employment.monthly_income'] = 'Income cannot be negative';
                }
            }

            // Employer Phone - Optional but validate format if provided
            if (emp.employer_phone && !/^[\d\s\-\(\)\+]{10,}$/.test(emp.employer_phone)) {
                newErrors['employment.employer_phone'] = 'Enter valid phone number';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employment Country - REQUIRED */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-red-500">
                        Employment Country *
                    </label>
                    <input
                        type="text"
                        value={formData.employment.employment_country}
                        onChange={(e) => updateEmployment('employment_country', e.target.value)}
                        onBlur={validateEmploymentFields}
                        className={getFieldClass('employment.employment_country')}
                    />
                    {errors['employment.employment_country'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.employment_country']}</p>
                    }
                </div>

                {/* Employment Status - REQUIRED */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-red-500">
                        Employment Status *
                    </label>
                    <select
                        value={formData.employment.employment_status}
                        onChange={(e) => {
                            updateEmployment('employment_status', e.target.value);
                            validateEmploymentFields();
                        }}
                        onBlur={validateEmploymentFields}
                        className="w-full rounded-md border-gray-300"
                    >
                        <option value="">Select</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Self-employed">Self-employed</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Retired">Retired</option>
                    </select>
                    {errors['employment.employment_status'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.employment_status']}</p>
                    }
                </div>

                {/* Job Title - REQUIRED (conditional) */}
                <div>
                    <label className={`block text-sm font-medium mb-1 ${formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' ? 'text-red-500' : ''}`}>
                        Job Title {formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' && '*'}
                    </label>
                    <input
                        type="text"
                        value={formData.employment.job_title}
                        onChange={(e) => updateEmployment('job_title', e.target.value)}
                        onBlur={validateEmploymentFields}
                        className={getFieldClass('employment.job_title')}
                    />
                    {errors['employment.job_title'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.job_title']}</p>
                    }
                </div>

                {/* Employer Name - REQUIRED (conditional) */}
                <div>
                    <label className={`block text-sm font-medium mb-1 ${formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' ? 'text-red-500' : ''}`}>
                        Employer Name {formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' && '*'}
                    </label>
                    <input
                        type="text"
                        value={formData.employment.employer_name}
                        onChange={(e) => updateEmployment('employer_name', e.target.value)}
                        onBlur={validateEmploymentFields}
                        className={getFieldClass('employment.employer_name')}
                    />
                    {errors['employment.employer_name'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.employer_name']}</p>
                    }
                </div>

                {/* Supervisor Name - Optional */}
                <div>
                    <label className="block text-sm font-medium mb-1">Supervisor Name</label>
                    <input
                        type="text"
                        value={formData.employment.supervisor_name}
                        onChange={(e) => updateEmployment('supervisor_name', e.target.value)}
                        className={getFieldClass('employment.supervisor_name')}
                    />
                </div>

                {/* Employed Since - REQUIRED (conditional) */}
                <div>
                    <label className={`block text-sm font-medium mb-1 ${formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' ? 'text-red-500' : ''}`}>
                        Employed Since {formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' && '*'}
                    </label>
                    <input
                        type="date"
                        value={formData.employment.employed_since}
                        onChange={(e) => updateEmployment('employed_since', e.target.value)}
                        onBlur={validateEmploymentFields}
                        className={getFieldClass('employment.employed_since')}
                    />
                    {errors['employment.employed_since'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.employed_since']}</p>
                    }
                </div>

                {/* Monthly Income - REQUIRED (conditional) */}
                <div>
                    <label className={`block text-sm font-medium mb-1 ${formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' ? 'text-red-500' : ''}`}>
                        Monthly Income {formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' && '*'}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.employment.monthly_income}
                        onChange={(e) => updateEmployment('monthly_income', e.target.value)}
                        onBlur={validateEmploymentFields}
                        placeholder="0.00"
                        className={getFieldClass('employment.monthly_income')}
                    />
                    {errors['employment.monthly_income'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.monthly_income']}</p>
                    }
                </div>

                {/* Additional Income - Optional */}
                <div>
                    <label className="block text-sm font-medium mb-1">Additional Income</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.employment.additional_income}
                        onChange={(e) => updateEmployment('additional_income', e.target.value)}
                        placeholder="0.00"
                        className={getFieldClass('employment.additional_income')}
                    />
                </div>

                {/* Employer Address Line 1 - REQUIRED (conditional) */}
                <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' ? 'text-red-500' : ''}`}>
                        Employer Address Line 1 {formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' && '*'}
                    </label>
                    <input
                        type="text"
                        value={formData.employment.employer_address_1}
                        onChange={(e) => updateEmployment('employer_address_1', e.target.value)}
                        onBlur={validateEmploymentFields}
                        className={getFieldClass('employment.employer_address_1')}
                    />
                    {errors['employment.employer_address_1'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.employer_address_1']}</p>
                    }
                </div>

                {/* Employer City - REQUIRED (conditional) */}
                <div>
                    <label className={`block text-sm font-medium mb-1 ${formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' ? 'text-red-500' : ''}`}>
                        Employer City {formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' && '*'}
                    </label>
                    <input
                        type="text"
                        value={formData.employment.employer_city}
                        onChange={(e) => updateEmployment('employer_city', e.target.value)}
                        onBlur={validateEmploymentFields}
                        className={getFieldClass('employment.employer_city')}
                    />
                    {errors['employment.employer_city'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.employer_city']}</p>
                    }
                </div>

                {/* Employer State - REQUIRED (conditional) */}
                <div>
                    <label className={`block text-sm font-medium mb-1 ${formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' ? 'text-red-500' : ''}`}>
                        Employer State {formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' && '*'}
                    </label>
                    <input
                        type="text"
                        value={formData.employment.employer_state}
                        onChange={(e) => updateEmployment('employer_state', e.target.value)}
                        onBlur={validateEmploymentFields}
                        className={getFieldClass('employment.employer_state')}
                    />
                    {errors['employment.employer_state'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.employer_state']}</p>
                    }
                </div>

                {/* Employer ZIP - REQUIRED (conditional) */}
                <div>
                    <label className={`block text-sm font-medium mb-1 ${formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' ? 'text-red-500' : ''}`}>
                        Employer ZIP {formData.employment.employment_status && formData.employment.employment_status !== 'Unemployed' && formData.employment.employment_status !== 'Retired' && '*'}
                    </label>
                    <input
                        type="text"
                        value={formData.employment.employer_zip}
                        onChange={(e) => updateEmployment('employer_zip', e.target.value)}
                        onBlur={validateEmploymentFields}
                        className={getFieldClass('employment.employer_zip')}
                    />
                    {errors['employment.employer_zip'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.employer_zip']}</p>
                    }
                </div>

                {/* Employer Phone - Optional with validation */}
                <div>
                    <label className="block text-sm font-medium mb-1">Employer Phone</label>
                    <input
                        type="tel"
                        value={formData.employment.employer_phone}
                        onChange={(e) => updateEmployment('employer_phone', e.target.value)}
                        onBlur={validateEmploymentFields}
                        placeholder="(123) 456-7890"
                        maxLength={14}
                        className={getFieldClass('employment.employer_phone')}
                    />
                    {errors['employment.employer_phone'] &&
                        <p className="text-red-500 text-xs mt-1">{errors['employment.employer_phone']}</p>
                    }
                </div>
            </div>
        );
    };
    const renderPreviousEmploymentStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-4 italic">Including your previous employment history helps us verify your income stability.</p>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Previous Employer Name</label>
                <input type="text" value={formData.previous_employment.previous_employer_name} onChange={(e) => updatePreviousEmployment('previous_employer_name', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Previous Job Title</label>
                <input type="text" value={formData.previous_employment.previous_job_title} onChange={(e) => updatePreviousEmployment('previous_job_title', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input type="date" value={formData.previous_employment.previous_start_date} onChange={(e) => updatePreviousEmployment('previous_start_date', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input type="date" value={formData.previous_employment.previous_end_date} onChange={(e) => updatePreviousEmployment('previous_end_date', e.target.value)} className="w-full rounded-md border-gray-300" />
            </div>
        </div>
    );

    // const renderScreeningStep = () => (
    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //         <div>
    //             <label className="block text-sm font-medium mb-1 text-red-500">Date of Birth *</label>
    //             <input type="date" value={formData.screening.date_of_birth} onChange={(e) => updateScreening('date_of_birth', e.target.value)} className={getFieldClass('screening.date_of_birth')} />
    //             {errors['screening.date_of_birth'] && <p className="text-red-500 text-xs mt-1">{errors['screening.date_of_birth']}</p>}
    //         </div>
    //         <div><label>Screening Country</label><input type="text" value={formData.screening.screening_country} onChange={(e) => updateScreening('screening_country', e.target.value)} className={getFieldClass('screening.screening_country')} /></div>
    //         <div><label className="flex items-center"><input type="checkbox" checked={formData.screening.has_ssn} onChange={(e) => updateScreening('has_ssn', e.target.checked)} className="rounded" /><span className="ml-2">I have a Social Security Number</span></label></div>
    //         {formData.screening.has_ssn && <div><label>Social Security Number</label><input type="text" value={formData.screening.ssn} onChange={(e) => updateScreening('ssn', e.target.value)} className={getFieldClass('screening.ssn')} placeholder="XXX-XX-XXXX" /></div>}
    //         <div><label>Government ID Number</label><input type="text" value={formData.screening.government_id} onChange={(e) => updateScreening('government_id', e.target.value)} className={getFieldClass('screening.government_id')} placeholder="Driver's License, Passport" /></div>
    //         <div><label>Issuing Entity</label><input type="text" value={formData.screening.issuing_entity} onChange={(e) => updateScreening('issuing_entity', e.target.value)} className={getFieldClass('screening.issuing_entity')} /></div>
    //         <div className="md:col-span-2"><label className="flex items-center"><input type="checkbox" checked={formData.screening.evicted} onChange={(e) => updateScreening('evicted', e.target.checked)} className="rounded" /><span className="ml-2">Have you ever been evicted?</span></label>{formData.screening.evicted && <textarea rows="2" value={formData.screening.eviction_reason} onChange={(e) => updateScreening('eviction_reason', e.target.value)} placeholder="Please explain..." className={`mt-2 ${getFieldClass('screening.eviction_reason')}`}></textarea>}</div>
    //         <div className="md:col-span-2"><label className="flex items-center"><input type="checkbox" checked={formData.screening.felony} onChange={(e) => updateScreening('felony', e.target.checked)} className="rounded" /><span className="ml-2">Have you ever been convicted of a felony?</span></label>{formData.screening.felony && <textarea rows="2" value={formData.screening.felony_reason} onChange={(e) => updateScreening('felony_reason', e.target.value)} placeholder="Please explain..." className={`mt-2 ${getFieldClass('screening.felony_reason')}`}></textarea>}</div>
    //         <div className="md:col-span-2"><label className="flex items-center"><input type="checkbox" checked={formData.screening.legal_case} onChange={(e) => updateScreening('legal_case', e.target.checked)} className="rounded" /><span className="ml-2">Are you currently a defendant in any legal case?</span></label>{formData.screening.legal_case && <textarea rows="2" value={formData.screening.legal_case_details} onChange={(e) => updateScreening('legal_case_details', e.target.value)} placeholder="Please explain..." className={`mt-2 ${getFieldClass('screening.legal_case_details')}`}></textarea>}</div>
    //     </div>
    // );
    const renderScreeningStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Date of Birth */}
            <div>
                <label className="block text-sm font-medium mb-1 text-red-500">
                    Date of Birth *
                </label>

                <input
                    type="date"
                    value={formData.screening.date_of_birth}
                    onChange={(e) => updateScreening('date_of_birth', e.target.value)}
                    className={getFieldClass('screening.date_of_birth')}
                />

                {errors['screening.date_of_birth'] && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors['screening.date_of_birth']}
                    </p>
                )}
            </div>

            {/* Screening Country */}
            <div>
                <label>Screening Country</label>

                <input
                    type="text"
                    value={formData.screening.screening_country}
                    onChange={(e) => updateScreening('screening_country', e.target.value)}
                    className={getFieldClass('screening.screening_country')}
                />
            </div>

            {/* SSN Checkbox */}
            <div>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.screening.has_ssn}
                        onChange={(e) => updateScreening('has_ssn', e.target.checked)}
                        className="rounded"
                    />

                    <span className="ml-2">
                        I have a Social Security Number
                    </span>
                </label>
            </div>

            {/* SSN Input */}
            {formData.screening.has_ssn && (
                <div>
                    <label className="text-red-500">
                        Social Security Number *
                    </label>

                    <input
                        type="text"
                        required={formData.screening.has_ssn}
                        value={formData.screening.ssn}
                        onChange={(e) => updateScreening('ssn', e.target.value)}
                        className={getFieldClass('screening.ssn')}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                    />

                    {errors['screening.ssn'] && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors['screening.ssn']}
                        </p>
                    )}
                </div>
            )}

            {/* Government ID */}
            <div>
                <label>Government ID Number</label>

                <input
                    type="text"
                    value={formData.screening.government_id}
                    onChange={(e) => updateScreening('government_id', e.target.value)}
                    className={getFieldClass('screening.government_id')}
                    placeholder="Driver's License, Passport"
                />
            </div>

            {/* Issuing Entity */}
            <div>
                <label>Issuing Entity</label>

                <input
                    type="text"
                    value={formData.screening.issuing_entity}
                    onChange={(e) => updateScreening('issuing_entity', e.target.value)}
                    className={getFieldClass('screening.issuing_entity')}
                />
            </div>

            {/* Evicted */}
            <div className="md:col-span-2">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.screening.evicted}
                        onChange={(e) => updateScreening('evicted', e.target.checked)}
                        className="rounded"
                    />
                    <span className="ml-2">
                        Have you ever been evicted?
                    </span>
                </label>

                {formData.screening.evicted && (
                    <>
                        {/* ✅ Added red asterisk label */}
                        <label className="block text-sm font-medium mt-2 text-red-500">
                            Please explain *
                        </label>

                        <textarea
                            rows="2"
                            required={formData.screening.evicted}
                            value={formData.screening.eviction_reason}
                            onChange={(e) => updateScreening('eviction_reason', e.target.value)}

                            onBlur={(e) => {
                                if (!e.target.value.trim()) {
                                    setErrors(prev => ({
                                        ...prev,
                                        'screening.eviction_reason': 'This field is required'
                                    }));
                                } else {
                                    clearError('screening.eviction_reason');
                                }
                            }}
                            placeholder="Please explain..."
                            className={`mt-1 ${getFieldClass('screening.eviction_reason')}`}
                        />

                        {errors['screening.eviction_reason'] && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors['screening.eviction_reason']}
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Felony */}
            <div className="md:col-span-2">

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.screening.felony}
                        onChange={(e) => updateScreening('felony', e.target.checked)}
                        className="rounded"
                    />

                    <span className="ml-2">
                        Have you ever been convicted of a felony?
                    </span>
                </label>

                {formData.screening.felony && (
                    <>
                        <label className="block text-sm font-medium mt-2 text-red-500">
                            Please explain *
                        </label>
                        <textarea
                            rows="2"
                            value={formData.screening.felony_reason}
                            onChange={(e) => updateScreening('felony_reason', e.target.value)}
                            onBlur={(e) => {
                                if (!e.target.value.trim()) {
                                    setErrors(prev => ({
                                        ...prev,
                                        'screening.felony_reason': 'This field is required'
                                    }));
                                } else {
                                    clearError('screening.felony_reason');
                                }
                            }}
                            placeholder="Please explain..."
                            className={`mt-2 ${getFieldClass('screening.felony_reason')}`}
                        />

                        {errors['screening.felony_reason'] && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors['screening.felony_reason']}
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Legal Case */}
            <div className="md:col-span-2">

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.screening.legal_case}
                        onChange={(e) => updateScreening('legal_case', e.target.checked)}
                        className="rounded"
                    />

                    <span className="ml-2">
                        Are you currently a defendant in any legal case?
                    </span>
                </label>

                {formData.screening.legal_case && (
                    <>
                        <label className="block text-sm font-medium mt-2 text-red-500">
                            Please explain *
                        </label>
                        <textarea
                            rows="2"
                            value={formData.screening.legal_case_details}
                            onChange={(e) => updateScreening('legal_case_details', e.target.value)}
                            onBlur={(e) => {
                                if (!e.target.value.trim()) {
                                    setErrors(prev => ({
                                        ...prev,
                                        'screening.legal_case_details': 'This field is required'
                                    }));
                                } else {
                                    clearError('screening.legal_case_details');
                                }
                            }}
                            placeholder="Please explain..."
                            className={`mt-2 ${getFieldClass('screening.legal_case_details')}`}
                        />

                        {errors['screening.legal_case_details'] && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors['screening.legal_case_details']}
                            </p>
                        )}
                    </>
                )}
            </div>

        </div>
    );
    const renderPetsStep = () => (
        <div>
            <div className="flex justify-end mb-4">
                {pets.length < 2 && <button type="button" onClick={addPet} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add Pet</button>}
            </div>
            {pets.length > 0 ? pets.map((pet, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-3">
                        <h3 className="font-semibold">Pet #{idx + 1}</h3>
                        <button type="button" onClick={() => removePet(idx)} className="text-red-500 text-sm">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select value={pet.pet_type} onChange={(e) => updatePet(idx, 'pet_type', e.target.value)} className="rounded-md border-gray-300">
                            <option value="">Select Type</option>
                            <option value="Cat">Cat</option>
                            <option value="Dog">Dog</option>
                            <option value="Bird">Bird</option>
                            <option value="Fish">Fish</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="text" placeholder="Pet Name" value={pet.pet_name} onChange={(e) => updatePet(idx, 'pet_name', e.target.value)} className="rounded-md border-gray-300" />
                        <input type="text" placeholder="Breed" value={pet.breed} onChange={(e) => updatePet(idx, 'breed', e.target.value)} className="rounded-md border-gray-300" />
                        <input type="number" placeholder="Age (years)" value={pet.age} onChange={(e) => updatePet(idx, 'age', e.target.value)} className="rounded-md border-gray-300" />
                        <input type="number" placeholder="Weight (lbs)" value={pet.weight} onChange={(e) => updatePet(idx, 'weight', e.target.value)} className="rounded-md border-gray-300" />
                        <input type="text" placeholder="Color" value={pet.color} onChange={(e) => updatePet(idx, 'color', e.target.value)} className="rounded-md border-gray-300" />
                        <label className="flex items-center">
                            <input type="checkbox" checked={pet.vaccinated} onChange={(e) => updatePet(idx, 'vaccinated', e.target.checked)} className="rounded" />
                            <span className="ml-2 text-sm">Up-to-date Vaccinations</span>
                        </label>
                    </div>
                </div>
            )) : <p className="text-gray-500 text-sm">No pets added. Click "Add Pet" to add a pet.</p>}
        </div>
    );

    const renderVehiclesStep = () => (
        <div>
            <div className="flex justify-end mb-4">
                {vehicles.length < 4 && <button type="button" onClick={addVehicle} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add Vehicle</button>}
            </div>
            {vehicles.length > 0 ? vehicles.map((vehicle, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-3">
                        <h3 className="font-semibold">Vehicle #{idx + 1}</h3>
                        <button type="button" onClick={() => removeVehicle(idx)} className="text-red-500 text-sm">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select value={vehicle.vehicle_type} onChange={(e) => updateVehicle(idx, 'vehicle_type', e.target.value)} className="rounded-md border-gray-300">
                            <option value="">Select Type</option>
                            <option value="Car">Car</option>
                            <option value="Truck">Truck</option>
                            <option value="SUV">SUV</option>
                            <option value="Motorcycle">Motorcycle</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="text" placeholder="Model" value={vehicle.model} onChange={(e) => updateVehicle(idx, 'model', e.target.value)} className="rounded-md border-gray-300" />
                        <input type="text" placeholder="Plate Number" value={vehicle.plate_number} onChange={(e) => updateVehicle(idx, 'plate_number', e.target.value)} className="rounded-md border-gray-300" />
                    </div>
                </div>
            )) : <p className="text-gray-500 text-sm">No vehicles added. Click "Add Vehicle" to add a vehicle.</p>}
        </div>
    );

    const renderEmergencyContactStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1 text-red-500">Full Name *</label>
                <input type="text" value={formData.emergency_contact.full_name} onChange={(e) => updateEmergencyContact('full_name', e.target.value)} className={getFieldClass('emergency_contact.full_name')} />
                {errors['emergency_contact.full_name'] && <p className="text-red-500 text-xs mt-1">{errors['emergency_contact.full_name']}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-red-500">Relationship *</label>
                <select value={formData.emergency_contact.relationship} onChange={(e) => updateEmergencyContact('relationship', e.target.value)} className={getFieldClass('emergency_contact.relationship')}>
                    <option value="">Select</option>
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                </select>
                {errors['emergency_contact.relationship'] && <p className="text-red-500 text-xs mt-1">{errors['emergency_contact.relationship']}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-red-500">Phone Number *</label>
                <input type="tel" value={formData.emergency_contact.phone} onChange={(e) => updateEmergencyContact('phone', formatPhone(e.target.value))} placeholder="(XXX) XXX-XXXX" className={getFieldClass('emergency_contact.phone')} />
                {errors['emergency_contact.phone'] && <p className="text-red-500 text-xs mt-1">{errors['emergency_contact.phone']}</p>}
            </div>
            <div><label>Email</label><input type="email" value={formData.emergency_contact.email} onChange={(e) => updateEmergencyContact('email', e.target.value)} className={getFieldClass('emergency_contact.email')} /></div>
            <div><label>Country</label><input type="text" value={formData.emergency_contact.country} onChange={(e) => updateEmergencyContact('country', e.target.value)} className={getFieldClass('emergency_contact.country')} /></div>
            <div className="md:col-span-2"><label>Address Line 1</label><input type="text" value={formData.emergency_contact.address_line_1} onChange={(e) => updateEmergencyContact('address_line_1', e.target.value)} className={getFieldClass('emergency_contact.address_line_1')} /></div>
            <div><label>City</label><input type="text" value={formData.emergency_contact.city} onChange={(e) => updateEmergencyContact('city', e.target.value)} className={getFieldClass('emergency_contact.city')} /></div>
            <div><label>State</label><input type="text" value={formData.emergency_contact.state} onChange={(e) => updateEmergencyContact('state', e.target.value)} className={getFieldClass('emergency_contact.state')} /></div>
            <div><label>ZIP Code</label><input type="text" value={formData.emergency_contact.zip_code} onChange={(e) => updateEmergencyContact('zip_code', e.target.value)} className={getFieldClass('emergency_contact.zip_code')} /></div>
        </div>
    );

    const renderDocumentsStep = () => {
        const documentList = [
            {
                id: 'driving_license',
                label: "Driver's License",
                icon: IdCardLanyard,
                desc: "A valid state-issued ID or Driver's license.",
                multiple: false
            },
            {
                id: 'pay_check',
                label: "Recent Pay Stub",
                icon: Briefcase,
                desc: "Your most recent proof of income (last 30 days).",
                multiple: true
            },
            {
                id: 'bank_statement',
                label: "Bank Statement",
                icon: Table,
                desc: "Previous month's full statement (all pages).",
                multiple: true
            },
            {
                id: 'social_security_card',
                label: "Social Security Card",
                icon: ShieldCheck,
                desc: "A clear copy of your SSN card for verification.",
                multiple: false
            }
        ];

        return (
            <div className="space-y-8">
                {/* Info Card */}
                <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Upload className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-1">Final Step: Document Upload</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            To process your application faster, please provide clear photos or PDF scans of the following documents.
                            Supported formats: <span className="font-bold">PDF, JPG, PNG</span> (Max 10MB).
                        </p>
                    </div>
                </div>

                {/* Document Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {documentList.map((doc, idx) => {
                        const Icon = doc.icon;
                        const value = formData.documents[doc.id];

                        const isFileSelected = doc.multiple
                            ? value && value.length > 0
                            : value;
                        const hasError = errors[`documents.${doc.id}`] || (errors.step10 && !isFileSelected);

                        return (
                            <div
                                key={doc.id}
                                className={`relative border rounded-xl p-4 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isFileSelected
                                    ? 'border-green-100 bg-green-50/30'
                                    : hasError
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isFileSelected ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 text-sm">{doc.label} <span className="text-red-500">*</span></h3>
                                        <p className="text-xs text-slate-500 truncate">{doc.desc}</p>
                                        {hasError && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-tight">{errors[`documents.${doc.id}`] || 'Document required'}</p>}
                                    </div>
                                </div>

                                <div className="sm:w-64 flex-shrink-0">
                                    {!isFileSelected ? (
                                        <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-100 hover:text-blue-600 transition-all border border-slate-200 border-dashed">
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>
                                                {doc.multiple ? 'Upload Documents' : 'Upload Document'}
                                            </span>

                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                multiple={doc.multiple}
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);

                                                    if (files.length > 0) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            documents: {
                                                                ...prev.documents,
                                                                [doc.id]: doc.multiple
                                                                    ? [...(prev.documents[doc.id] || []), ...files]
                                                                    : files[0]
                                                            }
                                                        }));
                                                    }
                                                }}
                                            />
                                        </label>
                                    ) : doc.multiple ? (
                                        <div className="space-y-2">
                                            {formData.documents[doc.id].map((file, fileIndex) => (
                                                <div
                                                    key={fileIndex}
                                                    className="flex items-center gap-2 p-2 rounded-lg bg-white border border-green-100 shadow-sm"
                                                >
                                                    <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center border border-slate-100 flex-shrink-0 overflow-hidden">
                                                        {file.type?.startsWith('image/') ? (
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt="preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <FileText className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-900 truncate">
                                                            {file.name}
                                                        </p>

                                                        <p className="text-[10px] font-medium text-slate-400">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                documents: {
                                                                    ...prev.documents,
                                                                    [doc.id]: prev.documents[doc.id].filter(
                                                                        (_, i) => i !== fileIndex
                                                                    )
                                                                }
                                                            }));
                                                        }}
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-100 hover:text-blue-600 transition-all border border-slate-200 border-dashed">

                                                <Upload className="w-3.5 h-3.5" />

                                                <span>Add More Documents</span>

                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    multiple

                                                    onChange={(e) => {

                                                        const files = Array.from(e.target.files);

                                                        if (files.length > 0) {

                                                            setFormData(prev => ({

                                                                ...prev,

                                                                documents: {

                                                                    ...prev.documents,

                                                                    [doc.id]: [
                                                                        ...(prev.documents[doc.id] || []),
                                                                        ...files
                                                                    ]
                                                                }
                                                            }));
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-green-100 shadow-sm">
                                            <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center border border-slate-100 flex-shrink-0 overflow-hidden">
                                                {formData.documents[doc.id].type?.startsWith('image/') ? (
                                                    <img src={URL.createObjectURL(formData.documents[doc.id])} alt="preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FileText className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{formData.documents[doc.id].name}</p>
                                                <p className="text-[10px] font-medium text-slate-400">{(formData.documents[doc.id].size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    documents: { ...prev.documents, [doc.id]: null }
                                                }))}
                                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Optional Documents */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Optional Documents</h3>

                    {/* Other Income */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Other Source of Income</h3>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">e.g., Pension, Investment</p>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Describe the income source..."
                            value={formData.documents.other_source_of_income.description}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                documents: {
                                    ...prev.documents,
                                    other_source_of_income: { ...prev.documents.other_source_of_income, description: e.target.value }
                                }
                            }))}
                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 mb-4 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="relative">
                            {!formData.documents.other_source_of_income.file ? (
                                <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl bg-slate-50/50 border-2 border-dashed border-slate-200 text-slate-600 text-sm font-bold cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group/drop">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover/drop:text-blue-600 transition-colors">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <span className="mt-2 text-xs font-bold text-slate-700">Drop your file here, or <span className="text-blue-600">browse</span></span>
                                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                                        if (e.target.files[0]) {
                                            setFormData(prev => ({
                                                ...prev,
                                                documents: {
                                                    ...prev.documents,
                                                    other_source_of_income: { ...prev.documents.other_source_of_income, file: e.target.files[0] }
                                                }
                                            }));
                                        }
                                    }} />
                                </label>
                            ) : (
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 flex-shrink-0 overflow-hidden">
                                        {formData.documents.other_source_of_income.file.type?.startsWith('image/') ? (
                                            <img src={URL.createObjectURL(formData.documents.other_source_of_income.file)} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <FileText className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{formData.documents.other_source_of_income.file.name}</p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{(formData.documents.other_source_of_income.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            documents: { ...prev.documents, other_source_of_income: { ...prev.documents.other_source_of_income, file: null } }
                                        }))}
                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Documents */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Additional Documents</h3>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Any other helpful files</p>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Document description..."
                            value={formData.documents.other.description}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                documents: { ...prev.documents, other: { ...prev.documents.other, description: e.target.value } }
                            }))}
                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 mb-4 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="relative">
                            {!formData.documents.other.file ? (
                                <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl bg-slate-50/50 border-2 border-dashed border-slate-200 text-slate-600 text-sm font-bold cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group/drop">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover/drop:text-blue-600 transition-colors">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <span className="mt-2 text-xs font-bold text-slate-700">Drop your file here, or <span className="text-blue-600">browse</span></span>
                                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                                        if (e.target.files[0]) {
                                            setFormData(prev => ({
                                                ...prev,
                                                documents: { ...prev.documents, other: { ...prev.documents.other, file: e.target.files[0] } }
                                            }));
                                        }
                                    }} />
                                </label>
                            ) : (
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 flex-shrink-0 overflow-hidden">
                                        {formData.documents.other.file.type?.startsWith('image/') ? (
                                            <img src={URL.createObjectURL(formData.documents.other.file)} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <FileText className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{formData.documents.other.file.name}</p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{(formData.documents.other.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            documents: { ...prev.documents, other: { ...prev.documents.other, file: null } }
                                        }))}
                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto px-4">
                {/* Resume Popup */}
                {showEmailPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-lg font-bold mb-3">Resume Your Application</h2>
                            <p className="text-gray-600 mb-4">Enter your email to continue where you left off</p>
                            <input type="email" placeholder="Enter your email" value={resumeEmail} onChange={(e) => setResumeEmail(e.target.value)} className="w-full rounded-md border-gray-300 p-2 border mb-4" />
                            <div className="flex gap-3">
                                <button onClick={resumeFromEmail} disabled={resumeLoading} className="flex-1 bg-brand text-white py-2 rounded hover:bg-brand-dark">
                                    {resumeLoading ? 'Loading...' : 'Continue'}
                                </button>
                                <button onClick={() => setShowEmailPopup(false)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50">
                                    Start New
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Property Selection Modal */}
                {showPropertyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-slate-200/60 z-10 transform transition-all">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight text-center">
                                    Enter Property Details
                                </h2>
                            </div>

                            <div className="space-y-4">

                                {/* Property Search */}
                                <div className="relative">
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">
                                        Property Name
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={propertySearch}
                                            onChange={(e) => {
                                                setPropertySearch(e.target.value);
                                                setSelectedProperty(null);
                                                setPropertyTypes([]);
                                                setSelectedPropertyType('');
                                            }}
                                            placeholder={propertyLoading ? "Searching..." : "Type min 2 letters..."}
                                            className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand bg-slate-50 focus:bg-white text-slate-700 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Suggestions */}
                                    {propertyResults.length > 0 && (
                                        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            {propertyResults.map((property) => (
                                                <button
                                                    key={property.id}
                                                    type="button"
                                                    onClick={() => handleSelectProperty(property)}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 flex flex-col transition-colors"
                                                >
                                                    <span className="font-semibold text-sm text-slate-800">
                                                        {property.property_name}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                                                        {property.property_type.join(', ')}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Property Type */}
                                {propertyTypes.length > 0 && (
                                    <div>
                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">
                                            Property Type
                                        </label>
                                        <select
                                            value={selectedPropertyType}
                                            onChange={(e) => setSelectedPropertyType(e.target.value)}
                                            className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand bg-slate-50 focus:bg-white text-slate-700 transition-all outline-none"
                                        >
                                            <option value="">Select Property Type</option>
                                            {propertyTypes.map((type, index) => (
                                                <option key={index} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Desired Move Date */}
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">
                                        Desired Move Date
                                    </label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={desiredMoveDate}
                                        onChange={(e) => setDesiredMoveDate(e.target.value)}
                                        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand bg-slate-50 focus:bg-white text-slate-700 transition-all outline-none"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handlePropertySubmit}
                                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-2.5 text-sm font-medium shadow-md shadow-brand/20 hover:bg-brand-dark transition-all"
                                >
                                    Continue Application
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-t-lg shadow-sm p-6 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Rental Application Form</h1>
                            <p className="text-gray-500 text-sm mt-1">Complete all sections to submit your application</p>
                        </div>
                        {/* <button onClick={() => setShowEmailPopup(true)} className="text-sm text-brand hover:underline flex items-center gap-1">
                            <span>↻</span> Resume from email
                        </button> */}
                    </div>
                </div>

                {/* Desktop Progress Bar - Hidden on Mobile */}
                <div className="hidden md:block bg-white p-4 border-x">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Step {currentStep} of 10</span>
                        <span>{Math.round((currentStep / 10) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-brand rounded-full h-2 transition-all" style={{ width: `${(currentStep / 10) * 100}%` }}></div>
                    </div>
                    {isSaving && <p className="text-xs text-gray-400 text-right mt-1">Saving...</p>}
                </div>

                {/* Mobile Sticky Step Indicator */}
                <div className="md:hidden sticky top-0 z-50 bg-white border-b shadow-sm">
                    <div className="flex items-center justify-between p-3 overflow-x-auto no-scrollbar whitespace-nowrap">
                        {steps.map((step, idx) => {
                            const isActive = currentStep === step.number;
                            const isPast = currentStep > step.number;

                            // Only show current, previous, and next on mobile to avoid overcrowding
                            // Or show all but with smaller circles? 
                            // Let's show all but scrollable if many.
                            return (
                                <div key={step.number} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => goToStep(step.number)}
                                        className="flex flex-col items-center gap-1 px-2 outline-none focus:ring-0"
                                    >
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? 'bg-brand text-white shadow-md scale-110' :
                                            isPast ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {isPast ? <CheckCircle className="w-4 h-4" /> : step.number}
                                        </div>
                                        <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-brand' : 'text-gray-500'}`}>
                                            {step.title.split(' ')[0]}
                                        </span>
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <div className={`h-[1px] w-4 ${isPast ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mt-6">
                    {/* Left Side - Steps Navigation - HIDDEN ON MOBILE */}
                    <div className="hidden md:block md:w-80 lg:w-96 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm sticky top-4">
                            <div className="p-3">
                                {steps.map(step => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === step.number;
                                    const isPast = currentStep > step.number;

                                    return (
                                        <button
                                            key={step.number}
                                            onClick={() => goToStep(step.number)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${isActive ? 'bg-brand-light border-l-4 border-brand' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPast ? 'bg-green-500 text-white' :
                                                isActive ? 'bg-brand text-white' :
                                                    'bg-gray-200 text-gray-600'
                                                }`}>
                                                {isPast ? <CheckCircle className="w-5 h-5" /> : step.number}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className={`text-sm font-medium ${isActive ? 'text-brand' : 'text-gray-700'}`}>
                                                    Step {step.number}: {step.title}
                                                </div>
                                                {!step.required && <span className="text-xs text-gray-400">Optional</span>}
                                            </div>
                                            {isPast && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        </button>
                                    );
                                })}
                            </div>

                        </div>
                    </div>

                    {/* Right Side - Form Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="mb-6 pb-3 border-b">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Step {currentStep}: {steps.find(s => s.number === currentStep)?.title}
                                </h2>
                            </div>

                            {errorMessage && (
                                <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div className="whitespace-pre-line text-sm">{errorMessage}</div>
                                </div>
                            )}

                            {renderStepContent()}

                            <div className="flex justify-between mt-8 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className={`px-6 py-2 rounded-md ${currentStep === 1 ? 'invisible' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    ← Previous
                                </button>
                                {currentStep < 10 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={isSaving}
                                        className="bg-brand text-white px-6 py-2 rounded-md hover:bg-brand-dark disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Next Step →'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={finalSubmit}
                                        disabled={processing}
                                        className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}