import { Link, Outlet, useLocation } from 'react-router-dom';
import { themeClasses, commonPatterns } from '@/styles';
import { Button } from '@/shared/components/ui/Button';

export default function AdminLayout() {
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/users', label: 'Users', icon: 'group' },
        { path: '/admin/projects', label: 'Projects', icon: 'folder' },
        { path: '/admin/settings', label: 'Settings', icon: 'settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={`min-h-screen ${themeClasses.backgrounds.deepDark} ${themeClasses.text.primary} flex`}>
            {/* Sidebar */}
            <aside className={`w-64 ${themeClasses.backgrounds.blackAlpha} border-r ${themeClasses.borders.violet10} flex flex-col`}>
                {/* Logo */}
                <div className={`p-6 border-b ${themeClasses.borders.violet10}`}>
                    <div className={commonPatterns.logo.container}>
                        <span className="material-symbols-outlined text-3xl text-violet-500">
                            polyline
                        </span>
                        <div>
                            <h1 className="font-space font-bold text-xl">DLSS</h1>
                            <p className="text-xs text-gray-500">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`${commonPatterns.nav.item} ${isActive(item.path)
                                        ? commonPatterns.nav.itemActive
                                        : commonPatterns.nav.itemInactive
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {item.icon}
                                    </span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Info */}
                <div className={`p-4 border-t ${themeClasses.borders.violet10}`}>
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">
                                person
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Admin User</p>
                            <p className={`text-xs ${themeClasses.text.tertiary}`}>admin@dlss.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-black/20 border-b border-violet-500/10 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            {menuItems.find((item) => isActive(item.path))?.label || 'Admin'}
                        </h2>
                        <Button
                            variant="primary"
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 transition-colors"
                        >
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

