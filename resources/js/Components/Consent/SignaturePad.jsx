// resources/js/Components/Consent/SignaturePad.jsx
import React, { useRef, useState, useEffect } from 'react';

export default function SignaturePad({ value, onChange, onClear, label = "Signature", required = false }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false); // Track if user actually drew anything

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Only load existing signature if it's valid (not empty)
        if (value && value !== '' && !value.includes('data:,') && value.length > 100) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setHasSignature(true);
                setHasDrawn(true);
            };
            img.onerror = () => {
                console.error('Failed to load signature image');
                setHasSignature(false);
                setHasDrawn(false);
            };
            img.src = value;
        } else {
            // Clear canvas if no valid signature
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setHasSignature(false);
            setHasDrawn(false);
        }
    }, [value]);

    const startDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        setHasDrawn(true); // User has started drawing
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        
        setIsDrawing(false);
        const canvas = canvasRef.current;
        
        // Check if canvas has any drawing (not empty)
        const isEmpty = isCanvasEmpty(canvas);
        
        if (!isEmpty && hasDrawn) {
            // Only save if user actually drew something
            const signatureData = canvas.toDataURL();
            onChange(signatureData);
            setHasSignature(true);
        } else if (isEmpty) {
            // If canvas is empty, send empty string
            onChange('');
            setHasSignature(false);
            setHasDrawn(false);
        }
    };

    // Helper function to check if canvas is empty
    const isCanvasEmpty = (canvas) => {
        const context = canvas.getContext('2d');
        const pixelBuffer = new Uint32Array(
            context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        
        // Check if there are any non-white pixels
        for (let i = 0; i < pixelBuffer.length; i++) {
            const pixel = pixelBuffer[i];
            // Check if pixel is not white (0xFFFFFFFF is white with alpha)
            if (pixel !== 0xFFFFFFFF) {
                return false; // Found a drawn pixel
            }
        }
        return true; // Canvas is empty (all white)
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Send empty string to parent
        onChange('');
        setHasSignature(false);
        setHasDrawn(false);
        
        if (onClear) onClear();
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-gray-300 rounded-md p-2 bg-white">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={200}
                    className="border border-gray-200 rounded cursor-crosshair w-full"
                    style={{ touchAction: 'none', width: '100%', height: 'auto' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <div className="flex gap-2 items-center">
                <button
                    type="button"
                    onClick={clearSignature}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                    Clear Signature
                </button>
                {hasSignature && (
                    <span className="text-sm text-green-600 flex items-center">
                        ✓ Signature captured
                    </span>
                )}
                {required && !hasSignature && hasDrawn === false && (
                    <span className="text-sm text-orange-500 flex items-center">
                        <span className="font-bold">NOTICE:</span> Please draw your signature
                    </span>
                )}
            </div>
            <p className="text-xs text-gray-500">Draw your signature using mouse or touch</p>
        </div>
    );
}