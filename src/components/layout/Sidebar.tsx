import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    DashboardOutlined,
    TeamOutlined,
    FolderOpenOutlined,
    SettingOutlined
} from '@ant-design/icons'

interface SidebarProps {
    className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
    const location = useLocation()

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
        { path: '/admin/system-administation', label: 'System Administration', icon: <FolderOpenOutlined /> },
        { path: '/admin/users', label: 'User Management', icon: <TeamOutlined />},
        { path: '/admin/projects', label: 'Projects', icon: <FolderOpenOutlined /> },
        { path: '/admin/settings', label: 'System Config', icon: <SettingOutlined /> }
    ]

    const isActive = (path: string) => location.pathname === path

    return (
        <aside
            className={`w-72 min-h-screen border-r border-white/5 px-6 py-8 flex flex-col ${className}`}
        >
            {/* Section Title */}
            <p className="text-xs tracking-widest text-gray-500 mb-6 font-semibold">
                MAIN MENU
            </p>

            {/* Navigation */}
            <nav className="flex flex-col gap-3">
                {menuItems.map((item) => {
                    const active = isActive(item.path)

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 group`}>
                            
                            {/* Left glow indicator */}
                            {active && (
                                <span className="absolute left-0 top-2 bottom-2 w-1 bg-violet-500 rounded-r-full" />
                            )}

                            <div className="flex items-center gap-4 text-lg">
                                <span
                                    className={`text-xl ${active ? 'text-violet-400' : 'text-gray-500 group-hover:text-white'
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span className={`font-medium text-base ${active ? 'text-violet-400' : 'text-white'} `}>
                                    {item.label}
                                </span>
                            </div>

                            {/* Badge */}
                            {/* {item.badge && (
                                <span className="px-3 py-1 text-sm rounded-xl bg-violet-500/20 text-violet-400">
                                    {item.badge}
                                </span>
                            )} */}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}