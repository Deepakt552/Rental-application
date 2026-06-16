import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Mail, 
    User, 
    Shield, 
    Calendar, 
    CheckCircle, 
    XCircle,
    ArrowLeft,
    RefreshCw,
    Trash2,
    Clock,
    AlertCircle,
    Info,
    Send,
    Download,
    Printer,
    FileText,
    AtSign,
    Phone,
    MapPin,
    Briefcase
} from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EmailLogDetail({ emailLog }) {
    const [isResending, setIsResending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleBack = () => {
        router.get('/admin/email-logs');
    };

    const handleResend = async () => {
        if (confirm('Are you sure you want to resend this email?')) {
            setIsResending(true);
            router.post(`/admin/email-logs/${emailLog.id}/resend`, {}, {
                onFinish: () => setIsResending(false)
            });
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this email log? This action cannot be undone.')) {
            setIsDeleting(true);
            router.delete(`/admin/email-logs/${emailLog.id}`, {
                onFinish: () => setIsDeleting(false)
            });
        }
    };

    const getStatusConfig = () => {
        switch(emailLog.status) {
            case 'sent':
                return { icon: CheckCircle, color: '#059669', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', label: 'Sent Successfully' };
            case 'failed':
                return { icon: XCircle, color: '#dc2626', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', label: 'Failed to Send' };
            default:
                return { icon: Clock, color: '#d97706', bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', label: 'Pending' };
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="py-6 px-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Poppins', 'Inter', system-ui, sans-serif" }}>
                    <div className="mx-auto">
                        
                        {/* Premium Header */}
                        <div className="mb-8">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                                <div className="relative">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0e4a81] via-[#1a5c9e] to-[#2d6eb3]"></div>
                                    <div className="px-6 py-6">
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={handleBack}
                                                    className="group p-2 rounded-xl bg-gray-50 dark:bg-slate-700 hover:bg-[#0e4a81] dark:hover:bg-[#0e4a81] transition-all duration-300"
                                                >
                                                    <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-slate-400 group-hover:text-white transition-colors" />
                                                </button>
                                                <div className="flex items-center space-x-4">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] blur-xl opacity-30"></div>
                                                        <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0e4a81] to-[#1a5c9e] flex items-center justify-center shadow-lg">
                                                            <Mail className="h-7 w-7 text-white" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-slate-100">Email Details</h1>
                                                        <p className="text-gray-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
                                                            <span>Log #{emailLog.id}</span>
                                                            <span className="text-gray-300 dark:text-slate-600">•</span>
                                                            <span className="text-sm">{emailLog.subject}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-3">
                                                {emailLog.status === 'failed' && (
                                                    <button
                                                        onClick={handleResend}
                                                        disabled={isResending}
                                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                                    >
                                                        {isResending ? (
                                                            <>
                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                                <span>Sending...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="h-4 w-4" />
                                                                <span>Resend Email</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                                >
                                                    {isDeleting ? (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                            <span>Deleting...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Delete Log</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className={`${statusConfig.bg} border ${statusConfig.border} rounded-2xl p-6 mb-8`}>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-xl ${statusConfig.bg} border ${statusConfig.border}`}>
                                        <StatusIcon className={`h-6 w-6 ${statusConfig.text}`} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${statusConfig.text}`}>Email Status</p>
                                        <p className={`text-xl font-bold ${statusConfig.text} mt-1`}>{statusConfig.label}</p>
                                    </div>
                                </div>
                                {emailLog.sent_at && (
                                    <div className="flex items-center space-x-2 text-gray-500 dark:text-slate-400">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">{new Date(emailLog.sent_at).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Recipient Info */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden sticky top-6">
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-700 dark:to-slate-800">
                                        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center space-x-2">
                                            <User className="h-5 w-5 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                            <span>Recipient Details</span>
                                        </h2>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                                                <User className="h-4 w-4 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">Full Name</p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mt-1">{emailLog.recipient_name}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                                                <AtSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">Email Address</p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mt-1">{emailLog.recipient_email}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-green-50 dark:bg-green-950/50 rounded-lg">
                                                {emailLog.recipient_type === 'admin' ? (
                                                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">Recipient Type</p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mt-1 capitalize">{emailLog.recipient_type}</p>
                                            </div>
                                        </div>

                                        {emailLog.sent_at && (
                                            <div className="flex items-start space-x-3">
                                                <div className="p-2 bg-orange-50 dark:bg-orange-950/50 rounded-lg">
                                                    <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">Sent At</p>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mt-1">
                                                        {new Date(emailLog.sent_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Email Content */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-700 dark:to-slate-800">
                                        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center space-x-2">
                                            <Mail className="h-5 w-5 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                            <span>Email Content</span>
                                        </h2>
                                    </div>
                                    
                                    <div className="p-6 space-y-6">
                                        {/* Subject */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center space-x-2">
                                                <Info className="h-4 w-4 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                <span>Subject</span>
                                            </label>
                                            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                                                <p className="text-gray-800 dark:text-slate-200 font-medium">{emailLog.subject}</p>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center space-x-2">
                                                <FileText className="h-4 w-4 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                <span>Message</span>
                                            </label>
                                            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-5 border border-gray-100 dark:border-slate-700">
                                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                                    <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                        {emailLog.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {emailLog.status === 'failed' && emailLog.error_message && (
                                            <div>
                                                <label className="block text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center space-x-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>Error Details</span>
                                                </label>
                                                <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-5 border border-red-200 dark:border-red-800">
                                                    <div className="flex items-start space-x-3">
                                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                        <p className="text-red-700 dark:text-red-400 text-sm">{emailLog.error_message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Related Application */}
                                        {emailLog.applicant && (
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                                                <div className="flex items-start space-x-3">
                                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                        <FileText className="h-5 w-5 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">Related Application</p>
                                                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                                                            #{emailLog.applicant.id} - {emailLog.applicant.personal_information?.first_name} {emailLog.applicant.personal_information?.last_name}
                                                        </p>
                                                        <button 
                                                            onClick={() => router.get(`/admin/applications/${emailLog.applicant.id}`)}
                                                            className="mt-3 text-xs font-medium text-[#0e4a81] dark:text-[#5a9bd5] hover:underline flex items-center space-x-1"
                                                        >
                                                            <span>View Application</span>
                                                            <ArrowLeft className="h-3 w-3 rotate-180" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                * {
                    font-family: 'Poppins', 'Inter', system-ui, -apple-system, sans-serif;
                }
                
                body {
                    font-family: 'Poppins', 'Inter', system-ui, -apple-system, sans-serif;
                }
                
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .dark ::-webkit-scrollbar-track {
                    background: #1e293b;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: #0e4a81;
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: #1a5c9e;
                }
                
                .dark ::-webkit-scrollbar-thumb {
                    background: #5a9bd5;
                }
                
                .dark ::-webkit-scrollbar-thumb:hover {
                    background: #7ab3d4;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .grid > div {
                    animation: fadeIn 0.4s ease-out;
                }
                
                .prose {
                    line-height: 1.6;
                }
                
                button:active {
                    transform: scale(0.98);
                }
            ` }} />
        </AuthenticatedLayout>
    );
}