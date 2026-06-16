import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => {
        let isExcel = window.location.href.toLowerCase().includes('excel');
        
        const page = router.page;
        let applicant = page?.props?.applicant;
        if (!applicant) {
            try {
                const appEl = document.getElementById('app');
                if (appEl && appEl.dataset.page) {
                    const pageData = JSON.parse(appEl.dataset.page);
                    applicant = pageData?.props?.applicant;
                }
            } catch (e) {}
        }

        if (applicant) {
            if (applicant.company_name) {
                isExcel = applicant.company_name.toLowerCase().includes('excel');
            } else if (applicant.property_name) {
                isExcel = applicant.property_name.toLowerCase().includes('excel');
            } else if (applicant.property_type) {
                const pType = Array.isArray(applicant.property_type)
                    ? applicant.property_type.join(' ').toLowerCase()
                    : String(applicant.property_type).toLowerCase();
                isExcel = pType.includes('excel');
            }
        }
        
        const brand = isExcel ? 'Excel Residential' : 'Triumph Residential';
        return title ? `${title} - ${brand}` : brand;
    },
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
