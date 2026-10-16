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
    Moon,
    Sparkles,
    Shield,
    Activity
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
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
        }
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
    const [openSubMenu, setOpenSubMenu] = useState('Applications');
    const [emailCount, setEmailCount] = useState(0);
    const [headerSearch, setHeaderSearch] = useState('');

    const handleHeaderSearch = (e) => {
        e.preventDefault();
        if (headerSearch.trim()) {
            router.get(route('admin.applications.index'), { search: headerSearch.trim() });
        }
    };

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'superadmin') {
            fetch('/admin/email-logs/unread-count')
                .then(res => res.json())
                .then(data => setEmailCount(data.count || 0))
                .catch(() => { });
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
            title: 'Overview',
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
            title: 'Applications & Finance',
            items: [
                {
                    name: 'Applications',
                    icon: FileText,
                    hasSubmenu: true,
                    submenuItems: [
                        {
                            name: 'Triumph Applications',
                            type: 'admin',
                            href: '/admin/applications?type=admin',
                            active: (route().current('admin.applications.index') &&
                                new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('type') === 'admin') ||
                                (route().current('admin.applications.show') && applicant?.type === 'admin'),
                            count: totalAdminCount,
                            icon: BarChart3,
                            description: 'Admin Applications',
                            filterType: 'admin'
                        },
                        {
                            name: 'Excel Applications',
                            type: 'superadmin',
                            href: '/admin/applications?type=superadmin',
                            active: (route().current('admin.applications.index') &&
                                new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('type') === 'superadmin') ||
                                (route().current('admin.applications.show') && applicant?.type === 'superadmin'),
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
            title: 'System & Properties',
            items: [
                {
                    name: 'Properties',
                    href: '/admin/properties',
                    icon: Building,
                    active: route().current('admin.properties.*') || window.location.pathname.startsWith('/admin/properties'),
                    roles: ['admin', 'superadmin']
                },
                {
                    name: 'Users',
                    href: route('admin.users.index'),
                    icon: Users2,
                    active: route().current('admin.users*') || window.location.pathname.startsWith('/admin/users'),
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
                <div key={item.name} className="mb-1.5">
                    <button
                        onClick={() => !isSidebarCollapsed && toggleSubMenu(item.name)}
                        title={isSidebarCollapsed ? item.name : ''}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 group relative
                            ${hasAnyActiveSubItem
                                ? 'bg-[#eef4fb] dark:bg-[#132238] text-[#0e4a81] dark:text-sky-300 font-extrabold shadow-2xs dark:border dark:border-sky-500/30 dark:shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-bold'
                            } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                    >
                        {hasAnyActiveSubItem && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#0e4a81] dark:bg-sky-400 dark:shadow-[0_0_10px_rgba(56,189,248,0.8)] rounded-r-full" />
                        )}
                        <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                            <item.icon className={`h-5 w-5 transition-transform duration-150 group-hover:scale-105 flex-shrink-0
                                ${hasAnyActiveSubItem
                                    ? 'text-[#0e4a81] dark:text-sky-400 dark:drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]'
                                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                                }`} />
                            {!isSidebarCollapsed && (
                                <span className="text-[13.5px] tracking-tight">{item.name}</span>
                            )}
                        </div>
                        {!isSidebarCollapsed && (
                            <ChevronUp className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-0' : 'rotate-180'}`} />
                        )}
                    </button>

                    {!isSidebarCollapsed && isSubmenuOpen && (
                        <div className="ml-5 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800/80 pl-3.5">
                            {item.submenuItems?.map((subItem) => (
                                <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group
                                        ${subItem.active
                                            ? 'bg-blue-50/90 dark:bg-sky-500/20 text-[#0e4a81] dark:text-sky-300 font-extrabold shadow-2xs dark:border dark:border-sky-500/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-semibold'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <subItem.icon className={`h-4 w-4 transition-transform group-hover:scale-105
                                            ${subItem.active ? 'text-[#0e4a81] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                        <span className="text-[12.5px]">{subItem.name}</span>
                                    </div>
                                    {subItem.count > 0 && (
                                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full
                                            ${subItem.active
                                                ? 'bg-[#0e4a81] dark:bg-sky-500 text-white dark:shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 group mb-1.5 relative
                    ${item.active
                        ? 'bg-[#eef4fb] dark:bg-[#132238] text-[#0e4a81] dark:text-sky-300 font-extrabold shadow-2xs dark:border dark:border-sky-500/30 dark:shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-bold'
                    } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
            >
                {item.active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#0e4a81] dark:bg-sky-400 dark:shadow-[0_0_10px_rgba(56,189,248,0.8)] rounded-r-full" />
                )}
                <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                    <item.icon className={`h-5 w-5 transition-transform duration-150 group-hover:scale-105 flex-shrink-0
                        ${item.active
                            ? 'text-[#0e4a81] dark:text-sky-400 dark:drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                        }`} />
                    {!isSidebarCollapsed && (
                        <span className="text-[13.5px] tracking-tight">{item.name}</span>
                    )}
                </div>
                {!isSidebarCollapsed && item.badge > 0 && (
                    <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black text-white bg-rose-500 rounded-full shadow-xs">
                        {item.badge > 99 ? '99+' : item.badge}
                    </div>
                )}
                {!isSidebarCollapsed && item.active && !item.badge && (
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0e4a81] dark:bg-sky-400 dark:shadow-[0_0_8px_rgba(56,189,248,0.8)] flex-shrink-0"></div>
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
                <div key={item.name} className="mb-1.5">
                    <button
                        onClick={() => toggleSubMenu(item.name)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 group
                            ${hasAnyActiveSubItem
                                ? 'bg-blue-50 dark:bg-[#132238] text-[#0e4a81] dark:text-sky-300 font-extrabold dark:border dark:border-sky-500/30'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <item.icon className={`h-5 w-5 flex-shrink-0
                                ${hasAnyActiveSubItem ? 'text-[#0e4a81] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                            <span className="text-[14px]">{item.name}</span>
                        </div>
                        <ChevronUp className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-0' : 'rotate-180'}`} />
                    </button>

                    {isSubmenuOpen && (
                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800/80 pl-3.5">
                            {item.submenuItems?.map((subItem) => (
                                <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={onClickClose}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150
                                        ${subItem.active
                                            ? 'bg-blue-50 text-[#0e4a81] dark:bg-sky-500/20 dark:text-sky-300 font-extrabold dark:border dark:border-sky-500/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <subItem.icon className="h-4 w-4" />
                                        <span className="text-sm">{subItem.name}</span>
                                    </div>
                                    {subItem.count > 0 && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                                            ${subItem.active
                                                ? 'bg-[#0e4a81] dark:bg-sky-500 text-white dark:shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 group mb-1.5
                    ${item.active
                        ? 'bg-blue-50 text-[#0e4a81] dark:bg-[#132238] dark:text-sky-300 font-extrabold dark:border dark:border-sky-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
                    }`}
            >
                <div className="flex items-center space-x-3">
                    <item.icon className={`h-5 w-5 flex-shrink-0
                        ${item.active ? 'text-[#0e4a81] dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="text-[14px]">{item.name}</span>
                </div>
                {item.badge > 0 && (
                    <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black text-white bg-rose-500 rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-[#0b1120] text-slate-800 dark:text-slate-200 transition-colors duration-200 relative">

            {/* Ambient Background Glow Effect (Dark Mode) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden dark:block" aria-hidden="true">
                <div className="absolute -top-32 right-1/4 w-[480px] h-[480px] bg-sky-500/5 rounded-full blur-[140px]"></div>
                <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] bg-indigo-500/5 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-12 right-12 w-[520px] h-[520px] bg-blue-600/5 rounded-full blur-[160px]"></div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {!isTenant && isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Mobile Sidebar */}
            {!isTenant && (
                <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex h-full flex-col bg-white dark:bg-[#0d1527]/98 dark:backdrop-blur-2xl shadow-2xl border-r border-slate-200 dark:border-slate-800/80">

                        {/* Mobile Sidebar Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm dark:shadow-[0_0_15px_rgba(14,74,129,0.5)]" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-black text-slate-900 dark:text-slate-100 leading-tight">Rental App</span>
                                    <span className="text-[10px] text-[#0e4a81] dark:text-sky-400 font-extrabold uppercase tracking-widest">{portalName}</span>
                                </div>
                            </div>
                            <button
                                onClick={closeMobileSidebar}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Mobile User Card */}
                        <div className="px-4 pt-4">
                            <div className="flex items-center space-x-3 px-3.5 py-3 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0e4a81] to-[#2563eb] flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                                </div>
                                <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full ring-4 ring-white dark:ring-slate-900 flex-shrink-0"></div>
                            </div>
                        </div>

                        {/* Mobile Nav Items */}
                        <div className="flex-1 overflow-y-auto py-4 px-3">
                            <div className="space-y-5">
                                {navigationGroups.map((group) => {
                                    const visibleItems = group.items.filter(item => item && item.roles && item.roles.includes(user?.role));
                                    if (visibleItems.length === 0) return null;
                                    return (
                                        <div key={group.title}>
                                            <div className="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
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
                        <div className="border-t border-slate-200 dark:border-slate-800/80 p-4">
                            <button
                                onClick={() => { closeMobileSidebar(); router.post(route('logout')); }}
                                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-sm transition-all"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Modern Sidebar */}
            {!isTenant && (
                <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                    <div className="flex flex-col flex-1 min-h-0 bg-white/95 dark:bg-[#0d1527]/95 dark:backdrop-blur-xl border-r border-slate-200/90 dark:border-slate-800/80 shadow-[2px_0_20px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_35px_rgba(0,0,0,0.5)]">

                        {/* Desktop Sidebar Header */}
                        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80">
                            {!isSidebarCollapsed ? (
                                <Link href={route('admin.dashboard')} className="flex items-center gap-3 min-w-0 group">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-[0_2px_8px_rgba(14,74,129,0.25)] dark:shadow-[0_0_15px_rgba(14,74,129,0.5)] flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[15px] font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight truncate">
                                            Rental Application
                                        </span>
                                        <span className="text-[10px] text-[#0e4a81] dark:text-sky-400 font-extrabold uppercase tracking-widest leading-none mt-0.5">
                                            {portalName}
                                        </span>
                                    </div>
                                </Link>
                            ) : (
                                <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm dark:shadow-[0_0_15px_rgba(14,74,129,0.5)]" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <button
                                onClick={toggleSidebar}
                                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all flex-shrink-0"
                            >
                                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </button>
                        </div>

                        {/* Desktop Nav Items */}
                        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
                            {navigationGroups.map((group) => {
                                const visibleItems = group.items.filter(item => item && item.roles && item.roles.includes(user?.role));
                                if (visibleItems.length === 0) return null;
                                return (
                                    <div key={group.title}>
                                        {!isSidebarCollapsed && (
                                            <div className="px-3 mb-2 text-[10.5px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
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

                        {/* Desktop Bottom User Mini Card */}
                        <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-3">
                            {!isSidebarCollapsed ? (
                                <div className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="relative">
                                            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#0e4a81] to-[#2563eb] text-white flex items-center justify-center font-black text-xs shadow-xs">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate leading-tight">{user.name}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate capitalize leading-tight mt-0.5">
                                                {user.role || 'Admin'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.post(route('logout'))}
                                        title="Log Out"
                                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex-shrink-0"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => router.post(route('logout'))}
                                    title="Log Out"
                                    className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Layout Area */}
            <div className={`transition-all duration-300 ease-in-out ${isTenant ? 'md:pl-0' : (isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64')}`}>

                {/* Modern Top Header Navigation Bar */}
                <nav className={`fixed top-0 right-0 z-30 transition-all duration-300
                    ${isTenant ? 'left-0' : (isSidebarCollapsed ? 'md:left-20' : 'md:left-64')} left-0
                    bg-white/85 dark:bg-[#0d1527]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]`}>
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center gap-3">

                            {/* Mobile Hamburger */}
                            {!isTenant && (
                                <div className="flex items-center md:hidden flex-shrink-0">
                                    <button
                                        onClick={() => setIsMobileSidebarOpen(true)}
                                        className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                    >
                                        <Menu className="h-6 w-6" />
                                    </button>
                                </div>
                            )}

                            {/* Mobile Brand / Tenant Brand */}
                            <div className={`flex items-center ${isTenant ? '' : 'md:hidden'} flex-shrink-0`}>
                                <Link href="/">
                                    <BrandIcon className={isTenant ? "h-10 sm:h-11 w-auto" : "h-8 w-auto"} />
                                </Link>
                            </div>

                            {/* Functional Global Search Input (Desktop) */}
                            {!isTenant && (
                                <form onSubmit={handleHeaderSearch} className="hidden md:flex items-center flex-1 max-w-sm">
                                    <div className="relative w-full">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Search applicants, properties, emails..."
                                            value={headerSearch}
                                            onChange={(e) => setHeaderSearch(e.target.value)}
                                            className="w-full pl-10 pr-12 py-2 text-xs sm:text-sm font-medium bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 dark:focus:border-sky-500/60 dark:focus:ring-sky-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                        />
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs">
                                                ↵
                                            </span>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Right-side actions: Theme toggle, Notifications, User Menu */}
                            <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">

                                {/* Theme Switcher (Dark / Light) - Tactile illuminated pill */}
                                {!isTenant && (
                                    <button
                                        onClick={toggleTheme}
                                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                        className="relative p-2 sm:px-3 sm:py-2 rounded-xl text-slate-500 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:dark:border-amber-400/50 transition-all flex items-center gap-2 text-xs font-bold shadow-xs dark:shadow-[0_0_15px_rgba(245,158,11,0.15)] group active:scale-95"
                                    >
                                        {theme === 'dark' ? (
                                            <>
                                                <div className="w-4 h-4 flex items-center justify-center text-amber-400 group-hover:rotate-45 transition-transform duration-300">
                                                    <Sun className="h-4 w-4 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                                                </div>
                                                <span className="hidden sm:inline text-amber-400 font-extrabold tracking-wide">Light</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 flex items-center justify-center text-slate-700 group-hover:-rotate-12 transition-transform duration-300">
                                                    <Moon className="h-4 w-4" />
                                                </div>
                                                <span className="hidden sm:inline text-slate-700 font-extrabold tracking-wide">Dark</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Email Logs / Notification Icon */}
                                {!isTenant && (
                                    <Link
                                        href={route('admin.email-logs')}
                                        title="Email Logs"
                                        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-[#0e4a81] dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 transition-all shadow-2xs"
                                    >
                                        <Bell className="h-4 w-4" />
                                        {emailCount > 0 && (
                                            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                                                {emailCount > 99 ? '99+' : emailCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* User Profile Dropdown */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="group flex items-center space-x-2.5 focus:outline-none p-1.5 sm:pr-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-[#0e4a81]/40 dark:hover:border-sky-500/40 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs">
                                            <div className="relative">
                                                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#0e4a81] via-[#15599b] to-[#2563eb] text-white flex items-center justify-center font-black text-xs shadow-xs ring-2 ring-white dark:ring-slate-900">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></div>
                                            </div>
                                            <div className="hidden sm:block text-left">
                                                <p className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-[#0e4a81] dark:group-hover:text-sky-400 transition-colors leading-tight">
                                                    {user.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-tight mt-0.5 capitalize">
                                                    {isTenant ? 'Applicant' : (user.role || 'Admin')}
                                                </p>
                                            </div>
                                            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#0e4a81] dark:group-hover:text-sky-400 transition-colors" />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="64" align="right" contentClasses="w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                                        {/* User Header Info Card */}
                                        <div className="p-4 bg-slate-50/90 dark:bg-slate-800/80">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0e4a81] to-[#2563eb] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                                    Active Session
                                                </span>
                                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                                                    {isTenant ? 'Tenant' : (user.role || 'Admin')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Links */}
                                        <div className="p-1.5 space-y-0.5">
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 hover:text-[#0e4a81] dark:hover:text-blue-400 transition-all"
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

                {/* Page Header / Breadcrumbs (if supplied) */}
                {!isTenant && header && (
                    <header className="pt-20 pb-4">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0e4a81] via-[#1a6bb5] to-[#0e4a81]"></div>
                                <div className="p-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-1">
                                                <div className="h-7 w-1 bg-gradient-to-b from-[#0e4a81] to-[#1a6bb5] rounded-full flex-shrink-0"></div>
                                                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                                    {header}
                                                </h1>
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 ml-4 font-medium">
                                                Welcome back, <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                                            </p>
                                        </div>

                                        <div className="hidden sm:flex flex-col items-end space-y-2 flex-shrink-0">
                                            <nav aria-label="Breadcrumb">
                                                <ol className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                                                    {breadcrumbs.map((crumb, idx) => (
                                                        <li key={idx} className="flex items-center">
                                                            {idx > 0 && <span className="mx-1 text-slate-300 dark:text-slate-700">/</span>}
                                                            {crumb.active ? (
                                                                <span className="text-[#0e4a81] dark:text-[#5a9bd5] font-extrabold">{crumb.name}</span>
                                                            ) : (
                                                                <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{crumb.name}</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Body */}
                <main className={`${(isTenant || !header) ? 'pt-16 sm:pt-20' : ''} ${isTenant ? 'pb-2' : 'pb-8'}`}>
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark ::-webkit-scrollbar-thumb { background: #334155; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .dark ::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}</style>
        </div>
    );
}