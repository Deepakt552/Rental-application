<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">  <!-- Add this line -->
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <link id="favicon" rel="icon" type="image/png" href="/Triumph Logo.png">
        <script>
            function updateFavicon(event) {
                const link = document.getElementById('favicon');
                let isExcel = window.location.href.toLowerCase().includes('excel');
                
                let applicant = null;
                if (event && event.detail && event.detail.page && event.detail.page.props) {
                    applicant = event.detail.page.props.applicant;
                } else {
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
                
                if (isExcel) {
                    link.href = '/Excel Residential - Icon.png';
                } else {
                    link.href = '/Triumph Logo.png';
                }
            }
            // Initial check once DOM is fully parsed
            document.addEventListener('DOMContentLoaded', function() {
                updateFavicon();
            });
            // Check on every navigation (Inertia support)
            document.addEventListener('inertia:navigate', updateFavicon);
            document.addEventListener('inertia:success', updateFavicon);
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
