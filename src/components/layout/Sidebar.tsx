import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { themeClasses, commonPatterns } from '@/styles';
import { DashboardOutlined, TeamOutlined, FolderOpenOutlined, SettingOutlined } from '@ant-design/icons';

interface SidebarProps {
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
        { path: '/admin/users', label: 'Users', icon: <TeamOutlined /> },
        { path: '/admin/projects', label: 'Projects', icon: <FolderOpenOutlined /> },
        { path: '/admin/settings', label: 'Settings', icon: <SettingOutlined /> },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className={`w-64 ${themeClasses.backgrounds.blackAlpha} border-r ${themeClasses.borders.violet10} flex flex-col ${className}`}>
            {/* Logo Section */}


            {/* Navigation Menu */}
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
                                <span className="flex items-center">
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>


        </aside>
    );
};
