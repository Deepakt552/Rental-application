// resources/js/Components/Consent/DynamicRepeater.jsx
import React from 'react';

export default function DynamicRepeater({ 
    items, 
    onAdd, 
    onRemove, 
    renderItem,
    addButtonText = "Add Item",
    emptyMessage = "No items added yet",
    maxItems = null
}) {
    return (
        <div className="space-y-4">
            {items.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            )}
            
            {items.map((item, index) => (
                <div key={item.id || index} className="relative border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="mb-4 pb-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-500">
                             #{index + 1}
                        </span>
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                    {renderItem(item, index)}
                </div>
            ))}
            
            {(!maxItems || items.length < maxItems) && (
                <button
                    type="button"
                    onClick={onAdd}
                    className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {addButtonText}
                </button>
            )}
        </div>
    );
}