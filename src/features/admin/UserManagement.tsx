import { useState } from 'react';
import AddUserModal from './components/AddUserModal';
import AddUserSuccessModal from './components/AddUserSuccessModal';
import { themeClasses } from '@/styles';
import { Button } from '@/shared/components/ui/Button';
import { UserAddOutlined, PlusOutlined, MoreOutlined, TeamOutlined, DesktopOutlined, DatabaseOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useUsers } from '@/features/admin/hooks/useUsers';

export default function UserManagement() {
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [successModal, setSuccessModal] = useState<{ isOpen: boolean; data?: any }>({ isOpen: false });
    const { data: rawUsers, isLoading } = useUsers();

    // Safety check for API response structure
    const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers as any)?.data || [];
    console.log("Users API Response:", rawUsers, "Parsed Users:", users);

    const handleUserCreateSuccess = (data: any) => {
        setIsAddUserModalOpen(false);
        setSuccessModal({ isOpen: true, data });
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                        System Administration
                    </h2>
                    <p className={`font-body text-sm ${themeClasses.text.secondary}`}>
                        Manage users, permissions, and monitor backend performance.
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddUserModalOpen(true)}
                    variant="primary"
                    className="group relative flex items-center gap-2 overflow-hidden px-5 py-2.5 font-body"
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <UserAddOutlined className="text-lg" />
                    <span>Add User</span>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-5 md:grid-cols-3">
                {/* Total Users */}
                <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                                Total Users
                            </p>
                            <p className="text-3xl font-bold tracking-tight text-white">
                                {isLoading ? '-' : users?.length || 0}
                            </p>
                        </div>
                        <div className={`h-10 w-10 rounded-lg ${themeClasses.backgrounds.violetAlpha10} flex items-center justify-center ${themeClasses.text.violet}`}>
                            <TeamOutlined className="text-xl" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                            +0%
                        </span>
                        <span className={`text-xs ${themeClasses.text.tertiary}`}>vs last week</span>
                    </div>
                </div>

                {/* System Status */}
                <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                                System Status
                            </p>
                            <p className="text-3xl font-bold tracking-tight text-white">-</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <DesktopOutlined className="text-xl" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className={`text-xs font-medium ${themeClasses.text.secondary}`}>
                            All systems fully operational
                        </p>
                        <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${themeClasses.backgrounds.whiteAlpha5}`}>
                            <div className="h-full w-0 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                        </div>
                    </div>
                </div>

                {/* Storage */}
                <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                                Storage
                            </p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-bold tracking-tight text-white">
                                    -<span className={`text-lg ${themeClasses.text.tertiary} font-medium`}>TB</span>
                                </p>
                                <span className={`text-xs ${themeClasses.text.tertiary}`}>/ -TB</span>
                            </div>
                        </div>
                        <div className={`h-10 w-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center ${themeClasses.text.fuchsia}`}>
                            <DatabaseOutlined className="text-xl" />
                        </div>
                    </div>
                    <div className={`mt-4 h-2 w-full overflow-hidden rounded-full ${themeClasses.backgrounds.whiteAlpha5} flex`}>
                        <div className="h-full w-0 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                        <div className="h-full w-0 bg-emerald-500"></div>
                        <div className="h-full w-0 bg-amber-500"></div>
                    </div>
                    <div className={`mt-2 flex gap-4 text-[10px] ${themeClasses.text.secondary}`}>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                            Images
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            Labels
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            Others
                        </div>
                    </div>
                </div>
            </div>

            {/* User Management Table */}
            <div className={`glass-card flex flex-col overflow-hidden rounded-xl`}>
                <div className={`border-b ${themeClasses.borders.white5} px-6 py-5 flex justify-between items-center ${themeClasses.backgrounds.card}`}>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-white">User Management</h3>
                        <p className={`text-sm ${themeClasses.text.secondary} font-body`}>
                            List of users in the system ({users?.length || 0})
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsAddUserModalOpen(true)}
                            variant="primary"
                            className="group relative flex items-center gap-2 overflow-hidden px-4 py-2 font-body text-sm font-semibold"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                            <PlusOutlined className="text-lg" />
                            <span>Add User</span>
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={`text-[11px] uppercase ${themeClasses.text.tertiary} font-bold tracking-wider border-b ${themeClasses.borders.white5}`}>
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Tasks</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${themeClasses.borders.white5} font-body text-sm`}>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (

                                users?.map((user: any) => {
                                    // Handle backend field difference and normalize
                                    const rawRole = user.userRole || user.role || 'Unknown';
                                    const roleLower = rawRole.toLowerCase();
                                    const displayRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

                                    return (
                                        <tr key={user.id} className={`group transition-colors hover:${themeClasses.backgrounds.whiteAlpha5}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 overflow-hidden rounded-full ${themeClasses.backgrounds.card} ring-1 ring-white/10 transition-all group-hover:ring-violet-500/50 flex items-center justify-center`}>
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className={`text-sm font-bold ${themeClasses.text.violet}`}>
                                                                {user.username?.substring(0, 2).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white text-[15px]">
                                                            {user.fullName || user.username}
                                                        </span>
                                                        <span className={`text-sm ${themeClasses.text.tertiary}`}>
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold
                                                ${roleLower === 'annotator' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
                                                        roleLower === 'reviewer' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' :
                                                            roleLower === 'manager' ? 'border-purple-500/20 bg-purple-500/10 text-purple-400' :
                                                                'border-red-500/20 bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {displayRole}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2 w-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-gray-500'}`}></span>
                                                    <span className={`${user.status === 'ACTIVE' ? 'text-emerald-500' : 'text-gray-400'} text-sm font-medium`}>
                                                        {user.status || 'Active'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-white text-[15px]">0</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`${themeClasses.text.tertiary} hover:text-white transition-colors`}
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        more_horiz
                                                    </span>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })

                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSuccess={handleUserCreateSuccess}
            />

            {/* Success Modal */}
            <AddUserSuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                onAddAnother={() => {
                    setSuccessModal({ ...successModal, isOpen: false });
                    setIsAddUserModalOpen(true);
                }}
                userData={successModal.data ? {
                    name: successModal.data.fullName,
                    email: successModal.data.email,
                    role: successModal.data.role
                } : undefined}
            />
        </div>
    );
}

