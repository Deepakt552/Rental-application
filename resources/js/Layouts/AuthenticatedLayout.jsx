import Dropdown from '@/Components/Dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Menu,
    X,
    ChevronDown,
    LayoutDashboard,
    User,
    LogOut,
    Settings,
    Bell,
    Grid3x3,
    Mail,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Users,
    FileText,
    Users2,
    CreditCard,
    ChevronUp,
    Building,
    Search,
    Sun,
    Moon
} from 'lucide-react';

// Custom hook for theme management
const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                return savedTheme;
            }
            return 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return { theme, toggleTheme };
};

export default function AuthenticatedLayout({ header, children }) {
    const { theme, toggleTheme } = useTheme();
    const user = usePage().props.auth.user;
    const isTenant = user?.role === 'user';
    const applicant = usePage().props.applicant;
    const portalName = isTenant ? 'Tenant Portal' : 'Admin Portal';

    const totalAdminCount = usePage().props.total_admin || 0;
    const totalSuperAdminCount = usePage().props.total_superadmin || 0;

    const checkIsExcel = () => {
        if (applicant?.company_name) {
            const comp = applicant.company_name.toLowerCase();
            if (comp.includes('excel')) return true;
            if (comp.includes('triumph')) return false;
        }
        if (applicant?.property_name) {
            const prop = applicant.property_name.toLowerCase();
            if (prop.includes('excel')) return true;
            if (prop.includes('triumph')) return false;
        }
        if (applicant?.property_type) {
            const propTypeStr = Array.isArray(applicant.property_type)
                ? applicant.property_type.join(' ').toLowerCase()
                : String(applicant.property_type).toLowerCase();
            if (propTypeStr.includes('excel')) return true;
            if (propTypeStr.includes('triumph')) return false;
        }
        return applicant?.email_logs?.[0]?.recipient_type === 'superadmin';
    };

    const isExcelTheme = checkIsExcel();

    useEffect(() => {
        const favicon = document.getElementById('favicon');
        if (favicon) {
            favicon.href = isExcelTheme ? '/Excel Residential - Icon.png' : '/Triumph Logo.png';
        }
    }, [isExcelTheme]);

    const BrandIcon = ({ className = "h-8 w-auto" }) => {
        if (isExcelTheme) {
            return <img src="/Excel Residential - Icon.png" alt="Excel" className={`${className} object-contain`} />;
        }
        return <img src="/Triumph Logo.png" alt="Triumph" className={`${className} object-contain`} />;
    };

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const [emailCount, setEmailCount] = useState(0);

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'superadmin') {
            fetch('/admin/email-logs/unread-count')
                .then(res => res.json())
                .then(data => setEmailCount(data.count || 0))
                .catch(() => {});
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isMobileSidebarOpen) {
                setIsMobileSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileSidebarOpen]);

    const navigationGroups = [
        {
            title: 'Main',
            items: [
                {
                    name: 'Dashboard',
                    href: (user?.role === 'admin' || user?.role === 'superadmin') ? route('admin.dashboard') : route('dashboard'),
                    icon: LayoutDashboard,
                    active: route().current('admin.dashboard') || route().current('dashboard'),
                    roles: ['admin', 'superadmin', 'user']
                }
            ]
        },
        {
            title: 'Core Management',
            items: [
                {
                    name: 'Applications',
                    icon: FileText,
                    hasSubmenu: true,
                    submenuItems: [
                        {
                            name: 'Triumph',
                            type: 'admin',
                            href: route('admin.applications.index', { type: 'admin' }),
                            active: route().current('admin.applications.index') &&
                                new URLSearchParams(window.location.search).get('type') === 'admin',
                            count: totalAdminCount,
                            icon: BarChart3,
                            description: 'Admin Applications',
                            filterType: 'admin'
                        },
                        {
                            name: 'Excel',
                            type: 'superadmin',
                            href: route('admin.applications.index', { type: 'superadmin' }),
                            active: route().current('admin.applications.index') &&
                                new URLSearchParams(window.location.search).get('type') === 'superadmin',
                            count: totalSuperAdminCount,
                            icon: Users,
                            description: 'Super Admin Applications',
                            filterType: 'superadmin'
                        }
                    ],
                    roles: ['admin', 'superadmin']
                },
                {
                    name: 'Payments',
                    href: route('admin.payments.index'),
                    icon: CreditCard,
                    active: route().current('admin.payments.index'),
                    roles: ['admin', 'superadmin']
                }
            ]
        },
        {
            title: 'System & Logs',
            items: [
                {
                    name: 'User',
                    href: route('admin.users.index'),
                    icon: Users2,
                    active: route().current('admin.users*') || window.location.pathname.startsWith('/admin/users'),
                    roles: ['admin', 'superadmin']
                },
                {
                    name: 'Property',
                    href: '/admin/properties',
                    icon: Building,
                    active: route().current('admin.properties.*') || window.location.pathname.startsWith('/admin/properties'),
                    roles: ['admin', 'superadmin']
                },
                {
                    name: 'Email Logs',
                    href: route('admin.email-logs'),
                    icon: Mail,
                    active: route().current('admin.email-logs') || window.location.pathname.includes('/admin/email-logs'),
                    roles: ['admin', 'superadmin'],
                    badge: emailCount
                },
                {
                    name: 'Settings',
                    href: route('admin.settings.edit'),
                    icon: Settings,
                    active: route().current('admin.settings.edit'),
                    roles: ['admin', 'superadmin']
                }
            ]
        }
    ];

    useEffect(() => {
        const flatItems = navigationGroups.flatMap(group => group.items);
        const activeParent = flatItems.find(item =>
            item.hasSubmenu &&
            item.submenuItems?.some(sub => sub.active)
        );
        if (activeParent) {
            setOpenSubMenu(activeParent.name);
        }
    }, [window.location.href]);

    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
    const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
    const toggleSubMenu = (menuName) => setOpenSubMenu(prev => prev === menuName ? null : menuName);

    const getBreadcrumbs = () => {
        const flatItems = navigationGroups.flatMap(g => g.items);
        for (const item of flatItems) {
            if (!item || !item.roles) continue;
            if (item.active && item.roles.includes(user?.role)) {
                return [
                    { name: 'Portal', href: '#' },
                    { name: item.name, href: item.href || '#', active: true }
                ];
            }
            if (item.hasSubmenu) {
                const activeSub = item.submenuItems?.find(sub => sub.active);
                if (activeSub) {
                    return [
                        { name: 'Portal', href: '#' },
                        { name: item.name, href: '#' },
                        { name: activeSub.name, href: activeSub.href, active: true }
                    ];
                }
            }
        }
        if (route().current('profile.edit')) {
            return [
                { name: 'Portal', href: '#' },
                { name: 'Profile Settings', href: route('profile.edit'), active: true }
            ];
        }
        return [
            { name: 'Portal', href: '#' },
            { name: 'Dashboard', href: '#', active: true }
        ];
    };

    const breadcrumbs = getBreadcrumbs();

    const renderDesktopNavItem = (item) => {
        if (!item || !item.roles || !item.roles.includes(user?.role)) return null;

        if (item.hasSubmenu) {
            const isSubmenuOpen = openSubMenu === item.name;
            const hasAnyActiveSubItem = item.submenuItems?.some(sub => sub.active);

            return (
                <div key={item.name} className="mb-1">
                    <button
                        onClick={() => !isSidebarCollapsed && toggleSubMenu(item.name)}
                        title={isSidebarCollapsed ? item.name : ''}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
                            ${hasAnyActiveSubItem
                                ? 'bg-blue-50 text-[#0e4a81] dark:bg-[#0e4a81]/15 dark:text-[#5a9bd5] font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                            <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 flex-shrink-0
                                ${hasAnyActiveSubItem
                                    ? 'text-[#0e4a81] dark:text-[#5a9bd5]'
                                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                }`} />
                            {!isSidebarCollapsed && <span className="text-[13.5px] tracking-[0.1px]">{item.name}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                            <ChevronUp className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-0' : 'rotate-180'}`} />
                        )}
                    </button>

                    {!isSidebarCollapsed && isSubmenuOpen && (
                        <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3.5">
                            {item.submenuItems?.map((subItem) => (
                                <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group
                                        ${subItem.active
                                            ? 'bg-blue-50 text-[#0e4a81] dark:bg-[#0e4a81]/15 dark:text-[#5a9bd5] font-semibold'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <subItem.icon className={`h-4 w-4 transition-transform group-hover:scale-105
                                            ${subItem.active ? 'text-[#0e4a81] dark:text-[#5a9bd5]' : 'text-slate-400 dark:text-slate-500'}`} />
                                        <span className="text-[12.5px]">{subItem.name}</span>
                                    </div>
                                    {subItem.count > 0 && (
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                                            ${subItem.active
                                                ? 'bg-blue-100 text-[#0e4a81] dark:bg-[#0e4a81]/25 dark:text-[#5a9bd5]'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {subItem.count}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.name}
                href={item.href}
                title={isSidebarCollapsed ? item.name : ''}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1
                    ${item.active
                        ? 'bg-blue-50 text-[#0e4a81] dark:bg-[#0e4a81]/15 dark:text-[#5a9bd5] font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                    } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
                <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                    <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 flex-shrink-0
                        ${item.active
                            ? 'text-[#0e4a81] dark:text-[#5a9bd5]'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`} />
                    {!isSidebarCollapsed && <span className="text-[13.5px] tracking-[0.1px]">{item.name}</span>}
                </div>
                {!isSidebarCollapsed && item.badge > 0 && (
                    <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm">
                        {item.badge > 99 ? '99+' : item.badge}
                    </div>
                )}
                {!isSidebarCollapsed && item.active && !item.badge && (
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0e4a81] dark:bg-[#5a9bd5] flex-shrink-0"></div>
                )}
            </Link>
        );
    };

    const renderMobileNavItem = (item, onClickClose) => {
        if (!item || !item.roles || !item.roles.includes(user?.role)) return null;

        if (item.hasSubmenu) {
            const isSubmenuOpen = openSubMenu === item.name;
            const hasAnyActiveSubItem = item.submenuItems?.some(sub => sub.active);

            return (
                <div key={item.name} className="mb-1">
                    <button
                        onClick={() => toggleSubMenu(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
                            ${hasAnyActiveSubItem
                                ? 'bg-blue-50 text-[#0e4a81] dark:bg-[#0e4a81]/15 dark:text-[#5a9bd5] font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <item.icon className={`h-5 w-5 flex-shrink-0
                                ${hasAnyActiveSubItem ? 'text-[#0e4a81] dark:text-[#5a9bd5]' : 'text-slate-400 dark:text-slate-500'}`} />
                            <span className="text-[14px] tracking-[0.2px]">{item.name}</span>
                        </div>
                        <ChevronUp className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-0' : 'rotate-180'}`} />
                    </button>

                    {isSubmenuOpen && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                            {item.submenuItems?.map((subItem) => (
                                <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={onClickClose}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200
                                        ${subItem.active
                                            ? 'bg-blue-50 text-[#0e4a81] dark:bg-[#0e4a81]/15 dark:text-[#5a9bd5] font-medium'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <subItem.icon className="h-4 w-4" />
                                        <span className="text-sm">{subItem.name}</span>
                                    </div>
                                    {subItem.count > 0 && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full
                                            ${subItem.active
                                                ? 'bg-blue-100 text-[#0e4a81] dark:bg-[#0e4a81]/25 dark:text-[#5a9bd5]'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {subItem.count}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.name}
                href={item.href}
                onClick={onClickClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1
                    ${item.active
                        ? 'bg-blue-50 text-[#0e4a81] dark:bg-[#0e4a81]/15 dark:text-[#5a9bd5] font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                    }`}
            >
                <div className="flex items-center space-x-3">
                    <item.icon className={`h-5 w-5 flex-shrink-0
                        ${item.active ? 'text-[#0e4a81] dark:text-[#5a9bd5]' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="text-[14px] tracking-[0.2px]">{item.name}</span>
                </div>
                {item.badge > 0 && (
                    <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">

            {/* Mobile Sidebar Overlay */}
            {!isTenant && isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm md:hidden"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Mobile Sidebar */}
            {!isTenant && (
                <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex h-full flex-col bg-white dark:bg-slate-900 shadow-2xl">

                        {/* Mobile Sidebar Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center">
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Rental Application</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">{portalName}</span>
                                </div>
                            </div>
                            <button
                                onClick={closeMobileSidebar}
                                className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Mobile User Card */}
                        <div className="px-4 pt-4">
                            <div className="flex items-center space-x-3 px-3 py-3 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-[#0e4a81]/10 dark:to-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0e4a81] to-[#1a5c9e] flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</div>
                                    <div className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</div>
                                </div>
                                <div className="h-2.5 w-2.5 bg-green-500 rounded-full ring-4 ring-white dark:ring-slate-900 flex-shrink-0"></div>
                            </div>
                        </div>

                        {/* Mobile Nav Items */}
                        <div className="flex-1 overflow-y-auto py-4 px-3">
                            <div className="space-y-6">
                                {navigationGroups.map((group) => {
                                    const visibleItems = group.items.filter(item => item && item.roles && item.roles.includes(user?.role));
                                    if (visibleItems.length === 0) return null;
                                    return (
                                        <div key={group.title}>
                                            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                                                {group.title}
                                            </div>
                                            <div className="space-y-0.5">
                                                {visibleItems.map(item => renderMobileNavItem(item, closeMobileSidebar))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Logout */}
                        <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                            <button
                                onClick={() => { closeMobileSidebar(); router.post(route('logout')); }}
                                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-semibold text-sm">Log Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            {!isTenant && (
                <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.04)] dark:shadow-none">

                        {/* Desktop Sidebar Header */}
                        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
                            {!isSidebarCollapsed ? (
                                <div className="flex items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Rental Application</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">{portalName}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative mx-auto font-black text-slate-800 dark:text-slate-100 text-sm tracking-widest bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm">
                                    RA
                                </div>
                            )}
                            <button
                                onClick={toggleSidebar}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex-shrink-0"
                            >
                                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </button>
                        </div>

                        {/* Desktop Nav Items */}
                        <div className="flex-1 overflow-y-auto py-6">
                            <div className="px-3 space-y-6">
                                {navigationGroups.map((group) => {
                                    const visibleItems = group.items.filter(item => item && item.roles && item.roles.includes(user?.role));
                                    if (visibleItems.length === 0) return null;
                                    return (
                                        <div key={group.title}>
                                            {!isSidebarCollapsed && (
                                                <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                                                    {group.title}
                                                </div>
                                            )}
                                            <div className="space-y-0.5">
                                                {visibleItems.map(item => renderDesktopNavItem(item))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Desktop Logout */}
                        <div className="border-t border-slate-100 dark:border-slate-800 p-3">
                            <button
                                onClick={() => router.post(route('logout'))}
                                title={isSidebarCollapsed ? 'Log Out' : ''}
                                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200`}
                            >
                                <LogOut className="h-5 w-5 flex-shrink-0" />
                                {!isSidebarCollapsed && <span className="font-semibold text-sm">Log Out</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className={`transition-all duration-300 ease-in-out ${isTenant ? 'md:pl-0' : (isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64')}`}>

                {/* Top Navigation Bar */}
                <nav className={`fixed top-0 right-0 z-[100] transition-all duration-300
                    ${isTenant ? 'left-0' : (isSidebarCollapsed ? 'md:left-20' : 'md:left-64')} left-0
                    bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm`}>
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center gap-4">

                            {/* Mobile Hamburger */}
                            {!isTenant && (
                                <div className="flex items-center md:hidden flex-shrink-0">
                                    <button
                                        onClick={() => setIsMobileSidebarOpen(true)}
                                        className="inline-flex items-center justify-center rounded-xl p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
                                    >
                                        <Menu className="h-6 w-6" />
                                    </button>
                                </div>
                            )}

                            {/* Mobile Brand / Tenant Brand */}
                            <div className={`flex items-center ${isTenant ? '' : 'md:hidden'} flex-shrink-0`}>
                                <Link href="/">
                                    <div className="flex items-center space-x-3">
                                        <BrandIcon className="h-9 w-auto" />
                                        {isTenant && (
                                            <span className="text-sm font-bold bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] bg-clip-text text-transparent">
                                                {portalName}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </div>

                            {/* Desktop Search */}
                            {!isTenant && (
                                <div className="hidden md:flex items-center flex-1 max-w-xs">
                                    <div className="relative w-full group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#0e4a81] dark:group-focus-within:text-[#5a9bd5] transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Quick Search..."
                                            className="block w-full pl-9 pr-12 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e4a81]/20 dark:focus:ring-[#5a9bd5]/20 focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                                                ⌘K
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Right-side actions */}
                            <div className="flex items-center space-x-1 sm:space-x-2 ml-auto">

                                {/* Theme Toggle — Admin only */}
                                {!isTenant && (
                                    <button
                                        onClick={toggleTheme}
                                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-200"
                                    >
                                        {theme === 'dark' ? (
                                            <Sun className="h-[18px] w-[18px]" />
                                        ) : (
                                            <Moon className="h-[18px] w-[18px]" />
                                        )}
                                    </button>
                                )}

                                {/* Notification Bell — Admin only */}
                                {!isTenant && (
                                    <button className="relative p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-200">
                                        <Bell className="h-[18px] w-[18px]" />
                                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                                    </button>
                                )}

                                {/* User Profile Dropdown */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="group flex items-center space-x-2.5 focus:outline-none p-1.5 sm:pr-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-[#0e4a81]/40 dark:hover:border-blue-500/40 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm">
                                            <div className="relative">
                                                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#0e4a81] via-[#15599b] to-[#2563eb] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#0e4a81]/25 ring-2 ring-white dark:ring-slate-900">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></div>
                                            </div>
                                            <div className="hidden sm:block text-left">
                                                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-[#0e4a81] dark:group-hover:text-blue-400 transition-colors leading-tight">
                                                    {user.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                                                    {isTenant ? 'Applicant Portal' : 'Administrator'}
                                                </p>
                                            </div>
                                            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#0e4a81] dark:group-hover:text-blue-400 transition-colors" />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="64" align="right" contentClasses="w-full rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                                        {/* User Header Info Card */}
                                        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0e4a81] to-[#2563eb] text-white flex items-center justify-center font-black text-sm shadow-md">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black text-slate-800 dark:text-white truncate">{user.name}</p>
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                    Active Session
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                    {isTenant ? 'Tenant' : 'Admin'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Links */}
                                        <div className="p-1.5 space-y-0.5">
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 hover:text-[#0e4a81] dark:hover:text-blue-400 transition-all"
                                            >
                                                <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                <span>Profile Settings</span>
                                            </Dropdown.Link>
                                        </div>

                                        {/* Log Out */}
                                        <div className="p-1.5">
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all w-full text-left"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Log Out</span>
                                            </Dropdown.Link>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Page Header / Breadcrumbs */}
                {!isTenant && header && (
                    <header className="pt-20 pb-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                                {/* Top accent bar */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0e4a81] via-[#1a5c9e] to-[#0e4a81]"></div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-1">
                                                <div className="h-8 w-1 bg-gradient-to-b from-[#0e4a81] to-[#1a5c9e] rounded-full flex-shrink-0"></div>
                                                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                                    {header}
                                                </h1>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-4">
                                                Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name}</span>! Here's your executive summary.
                                            </p>
                                        </div>

                                        <div className="hidden sm:flex flex-col items-end space-y-2 flex-shrink-0">
                                            {/* Breadcrumbs */}
                                            <nav aria-label="Breadcrumb">
                                                <ol className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                    {breadcrumbs.map((crumb, idx) => (
                                                        <li key={idx} className="flex items-center">
                                                            {idx > 0 && <span className="mx-1 text-slate-300 dark:text-slate-700">/</span>}
                                                            {crumb.active ? (
                                                                <span className="text-[#0e4a81] dark:text-[#5a9bd5] font-semibold">{crumb.name}</span>
                                                            ) : (
                                                                <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{crumb.name}</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </nav>
                                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-lg">
                                                <Grid3x3 className="h-3.5 w-3.5 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Premium Access</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className={`${(isTenant || !header) ? 'pt-20' : ''} ${isTenant ? 'pb-2' : 'pb-8'}`}>
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

                ::-webkit-scrollbar { width: 5px; height: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark ::-webkit-scrollbar-thumb { background: #475569; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .dark ::-webkit-scrollbar-thumb:hover { background: #64748b; }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                main > div { animation: fadeIn 0.35s ease-out; }
            `}</style>
        </div>
    );
}