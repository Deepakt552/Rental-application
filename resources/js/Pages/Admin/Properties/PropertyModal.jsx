// resources/js/Components/Admin/PropertyModal.jsx

import React, { useState, useEffect } from 'react';

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
        company_name: '',
        address: '',
        property_type: [],
        added_by: 'users.id'
    });

    useEffect(() => {

        if (mode === 'edit' && property) {

            setFormData({
                property_name: property.property_name || '',
                company_name: property.company_name || '',
                address: property.address || '',
                property_type: property.property_type || [],
                added_by: users.id
            });

        } else {

            setFormData({
                property_name: '',
                company_name: '',
                address: '',
                property_type: [],
                added_by: ''
            });

        }

    }, [mode, property]);

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
            property_type: prev.property_type.filter(
                (item) => item !== type
            )
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

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden transform transition-all">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-[#f8fafc] to-[#f0f5fb] dark:from-slate-700 dark:to-slate-700/80">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                            {mode === 'create'
                                ? 'Add Property'
                                : 'Edit Property'}
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            Manage property details
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center text-lg"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <form
                    onSubmit={handleSubmit}
                    className="p-5 space-y-4"
                >

                    {/* Company */}
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                            Company Name
                        </label>

                        <select
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            className="w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                            <option value="">
                                Select Company
                            </option>

                            <option value="Triumph">
                                Triumph
                            </option>

                            <option value="Excel">
                                Excel
                            </option>

                        </select>

                    </div>

                    {/* Property Name */}
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                            Property Name
                        </label>

                        <input
                            type="text"
                            name="property_name"
                            value={formData.property_name}
                            onChange={handleChange}
                            required
                            placeholder="Enter property name"
                            className="w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    {/* Property Type */}
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                            Property Type
                        </label>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={propertyTypeInput}
                                onChange={(e) =>
                                    setPropertyTypeInput(e.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Type like 1 BHK"
                                className="flex-1 h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />

                            <button
                                type="button"
                                onClick={addPropertyType}
                                className="px-4 rounded-xl bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] hover:opacity-90 text-white text-sm font-medium transition-all shadow-sm"
                            >
                                Add
                            </button>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {formData.property_type.map((type, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-[#0e4a81]/20 border border-blue-100 dark:border-[#0e4a81]/30 text-[#0e4a81] dark:text-[#5a9bd5] rounded-lg text-xs font-medium transition-colors"
                                >
                                    {type}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removePropertyType(type)
                                        }
                                        className="text-[#0e4a81]/60 dark:text-[#5a9bd5]/60 hover:text-red-500 dark:hover:text-red-400 focus:outline-none transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                            Address
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                            }
                            placeholder="Enter property address"
                            className="h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] hover:opacity-90 text-sm font-medium text-white shadow-md shadow-[#0e4a81]/20 dark:shadow-slate-900/30 transition-all"
                        >
                            {mode === 'create'
                                ? 'Create Property'
                                : 'Update Property'}
                        </button>
                    </div>

                </form>

            </div>

        </div>

    );
}