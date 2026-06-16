// resources/js/Pages/RentalApplication.jsx
import { useState, useEffect, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Search, Home, Building, ChevronLeft, Check, Loader2, X } from 'lucide-react';
import axios from 'axios';

export default function RentalApplication({ company, auth }) {
    const [properties, setProperties] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedType, setSelectedType] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Fetch properties based on search
    const fetchProperties = useCallback(async (search = '') => {
        if (search.length < 2 && search !== '') return;
        
        setLoading(true);
        try {
            const response = await axios.get('/api/properties/list', {
                params: {
                    company_name: company,
                    search: search.length >= 2 ? search : ''
                }
            });
            
            if (response.data.success) {
                setProperties(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    }, [company]);

    // Fetch property types for suggestions
    const fetchPropertyTypes = useCallback(async () => {
        try {
            const response = await axios.get('/api/properties/types', {
                params: { company_name: company }
            });
            
            if (response.data.success) {
                setPropertyTypes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching property types:', error);
        }
    }, [company]);

    // Fetch properties by type
    const fetchPropertiesByType = useCallback(async (type) => {
        if (!type) return;
        
        setLoading(true);
        try {
            const response = await axios.get('/api/properties/list', {
                params: {
                    company_name: company,
                    type: type
                }
            });
            
            if (response.data.success) {
                setProperties(response.data.data);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Error fetching properties by type:', error);
        } finally {
            setLoading(false);
        }
    }, [company]);

    useEffect(() => {
        fetchPropertyTypes();
    }, [fetchPropertyTypes]);

    // Debounced search
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedProperty(null);
        
        if (searchTimeout) clearTimeout(searchTimeout);
        
        if (value.length >= 2) {
            const timeout = setTimeout(() => {
                fetchProperties(value);
                setShowSuggestions(true);
            }, 300);
            setSearchTimeout(timeout);
        } else {
            setProperties([]);
            setShowSuggestions(false);
        }
    };

    const handlePropertySelect = (property) => {
        setSelectedProperty(property);
        setSearchTerm(property.property_name);
        setShowSuggestions(false);
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        fetchPropertiesByType(type);
    };

    const clearSelection = () => {
        setSelectedProperty(null);
        setSelectedType('');
        setSearchTerm('');
        setProperties([]);
        setShowSuggestions(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`Rental Application - ${company}`} />
            
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-brand transition-colors mb-4"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Home
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                            <img 
                                src={company === 'Triumph' ? '/Triumph Logo.png' : '/Excel Residential - Icon.png'} 
                                alt={`${company} Logo`}
                                className="w-full h-full object-contain p-2"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">
                                {company} Residential Services
                            </h1>
                            <p className="text-slate-500 mt-1">Complete your rental application</p>
                        </div>
                    </div>
                </div>

                {/* Application Form */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Property Information</h2>
                    
                    <div className="space-y-6">
                        {/* Property Search Field */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Select Property
                            </label>
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                                        placeholder="Type at least 2 letters to search properties..."
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand focus:outline-none transition-colors text-slate-900"
                                    />
                                    {selectedProperty && (
                                        <button
                                            onClick={clearSelection}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                
                                {/* Suggestions Dropdown */}
                                {showSuggestions && (searchTerm.length >= 2 || selectedType) && (
                                    <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-80 overflow-y-auto">
                                        {loading ? (
                                            <div className="flex items-center justify-center p-8">
                                                <Loader2 className="w-6 h-6 animate-spin text-brand" />
                                            </div>
                                        ) : properties.length > 0 ? (
                                            properties.map((property) => (
                                                <button
                                                    key={property.id}
                                                    onClick={() => handlePropertySelect(property)}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Home className="w-5 h-5 text-brand mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-slate-900">
                                                                {property.property_name}
                                                            </div>
                                                            {property.property_type && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {Array.isArray(property.property_type) && 
                                                                        property.property_type.map((type, idx) => (
                                                                            <span key={idx} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                                                                {type}
                                                                            </span>
                                                                        ))
                                                                    }
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                Added by: {property.user?.name || 'Unknown'}
                                                            </div>
                                                        </div>
                                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-500">
                                                No properties found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Property Type Suggestions */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Or Select Property Type
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {propertyTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handleTypeSelect(type)}
                                        className={`px-6 py-3 rounded-full font-medium transition-all ${
                                            selectedType === type
                                                ? 'bg-brand text-white shadow-lg shadow-brand'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected Property Details */}
                        {selectedProperty && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-brand-light to-slate-50 rounded-2xl border border-brand/20">
                                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <Building className="w-5 h-5 text-brand" />
                                    Selected Property Details
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-slate-700">
                                        <span className="font-semibold">Property Name:</span> {selectedProperty.property_name}
                                    </p>
                                    {selectedProperty.property_type && (
                                        <p className="text-slate-700">
                                            <span className="font-semibold">Property Types:</span>{' '}
                                            {Array.isArray(selectedProperty.property_type) && 
                                                selectedProperty.property_type.join(', ')}
                                        </p>
                                    )}
                                    <p className="text-slate-700">
                                        <span className="font-semibold">Added By:</span> {selectedProperty.user?.name || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => {
                                // Handle form submission
                                console.log('Selected Property:', selectedProperty);
                            }}
                            disabled={!selectedProperty}
                            className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                                selectedProperty
                                    ? 'bg-brand text-white hover:bg-brand-dark shadow-lg shadow-brand'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            Continue Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}