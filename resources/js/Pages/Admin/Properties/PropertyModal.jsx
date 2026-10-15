// resources/js/Pages/Admin/Properties/PropertyModal.jsx

import React, { useState, useEffect } from 'react';
import { Building2, X, Plus, Hash, MapPin, Tag } from 'lucide-react';

export default function PropertyModal({
    isOpen,
    onClose,
    onSubmit,
    mode,
    property,
    users
}) {
    const [propertyTypeInput, setPropertyTypeInput] = useState('');

    const [formData, setFormData] = useState({
        property_name: '',
        property_code: '',
        company_name: '',
        address: '',
        property_type: [],
        added_by: users?.id || ''
    });

    useEffect(() => {
        if (mode === 'edit' && property) {
            setFormData({
                property_name: property.property_name || '',
                property_code: property.property_code || '',
                company_name: property.company_name || '',
                address: property.address || '',
                property_type: Array.isArray(property.property_type)
                    ? property.property_type
                    : (typeof property.property_type === 'string' ? JSON.parse(property.property_type || '[]') : []),
                added_by: users?.id || ''
            });
        } else {
            setFormData({
                property_name: '',
                property_code: '',
                company_name: '',
                address: '',
                property_type: [],
                added_by: users?.id || ''
            });
        }
    }, [mode, property, isOpen]);

    // Prevent body scroll and close on Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const addPropertyType = () => {
        const value = propertyTypeInput.trim();
        if (!value) return;

        // Duplicate prevent
        if (formData.property_type.includes(value)) {
            setPropertyTypeInput('');
            return;
        }

        setFormData((prev) => ({
            ...prev,
            property_type: [...prev.property_type, value]
        }));
        setPropertyTypeInput('');
    };

    const removePropertyType = (type) => {
        setFormData((prev) => ({
            ...prev,
            property_type: prev.property_type.filter((item) => item !== type)
        }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPropertyType();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 dark:bg-black/85 backdrop-blur-md transition-all duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 overflow-hidden transform transition-all animate-scale-up relative">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-[#0e4a81] to-[#1a6bb5] text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-white leading-snug">
                                {mode === 'create' ? 'Add New Property' : 'Edit Property Details'}
                            </h2>
                            <p className="text-[11px] font-medium text-blue-100 mt-0.5">
                                {mode === 'create' ? 'Fill in property information below' : 'Update the property fields below'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-80px)] overflow-y-auto">

                    {/* Company */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            className="w-full h-10 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                        >
                            <option value="">Select Company</option>
                            <option value="Triumph">Triumph</option>
                            <option value="Excel">Excel</option>
                        </select>
                    </div>

                    {/* Property Name */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Property Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="property_name"
                            value={formData.property_name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Sunset Heights Apartments"
                            className="w-full h-10 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    {/* Property Code */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Property Code
                            </label>
                            <span className="text-[10px] text-slate-400 font-medium">Numbers only</span>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Hash className="w-3.5 h-3.5" />
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                name="property_code"
                                value={formData.property_code || ''}
                                onChange={(e) => {
                                    const numericOnly = e.target.value.replace(/\D/g, '');
                                    setFormData(prev => ({ ...prev, property_code: numericOnly }));
                                }}
                                placeholder="e.g. 101"
                                className="w-full h-10 pl-9 pr-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Property Type */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Property Types / Units
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Tag className="w-3.5 h-3.5" />
                                </div>
                                <input
                                    type="text"
                                    value={propertyTypeInput}
                                    onChange={(e) => setPropertyTypeInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. 1 Bedroom, 2 Bedroom, Studio"
                                    className="w-full h-10 pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addPropertyType}
                                className="px-4 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                        </div>

                        {/* Tag Chips */}
                        {formData.property_type.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2.5">
                                {formData.property_type.map((type, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-[#0e4a81]/20 border border-blue-200 dark:border-[#0e4a81]/40 text-[#0e4a81] dark:text-[#5a9bd5] rounded-lg text-xs font-semibold"
                                    >
                                        {type}
                                        <button
                                            type="button"
                                            onClick={() => removePropertyType(type)}
                                            className="text-slate-400 hover:text-red-500 focus:outline-none transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Property Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <input
                                type="text"
                                name="address"
                                value={formData.address || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter street address, city, state, zip"
                                className="w-full h-10 pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0e4a81] to-[#1a6bb5] hover:opacity-95 text-xs font-bold text-white shadow-md shadow-[#0e4a81]/20 transition-all cursor-pointer active:scale-95"
                        >
                            {mode === 'create' ? 'Create Property' : 'Save Changes'}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}