export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-brand">Rental Application</h1>
                        </div>
                    </div>
                </div>
            </nav>
            <main>
                {children}
            </main>
            <footer className="bg-white border-t mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-gray-500 text-sm">© 2024 Rental Application. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}