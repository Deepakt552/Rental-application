import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex  flex-col items-center  sm:justify-center sm:pt-0 m-4 dark:bg-slate-900">
            

            <div className=" w-full overflow-hidden bg-white dark:bg-slate-800 px-6 shadow-md sm:max-w-md sm:rounded-lg h-[776px] mt-[150px]">
                {children}
            </div>
        </div>
    );
}
