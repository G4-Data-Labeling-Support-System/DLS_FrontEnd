import { useState } from 'react';
import AddUserModal from './components/AddUserModal';

export default function UserManagement() {
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                        System Administration
                    </h2>
                    <p className="font-body text-sm text-gray-400">
                        Manage users, permissions, and monitor backend performance.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 font-body text-sm font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    <span>Add User</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-5 md:grid-cols-3">
                {/* Total Users */}
                <div className="glass-card relative flex flex-col justify-between rounded-xl p-6 h-full">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-body text-sm font-medium text-gray-400 mb-1">
                                Total Users
                            </p>
                            <p className="text-3xl font-bold tracking-tight text-white">-</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                            +0%
                        </span>
                        <span className="text-xs text-gray-500">vs last week</span>
                    </div>
                </div>

                {/* System Status */}
                <div className="glass-card relative flex flex-col justify-between rounded-xl p-6 h-full">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-body text-sm font-medium text-gray-400 mb-1">
                                System Status
                            </p>
                            <p className="text-3xl font-bold tracking-tight text-white">-</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <span className="material-symbols-outlined">monitor_heart</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-medium text-gray-400">
                            All systems fully operational
                        </p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                            <div className="h-full w-0 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                        </div>
                    </div>
                </div>

                {/* Storage */}
                <div className="glass-card relative flex flex-col justify-between rounded-xl p-6 h-full">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-body text-sm font-medium text-gray-400 mb-1">
                                Storage
                            </p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-bold tracking-tight text-white">
                                    -<span className="text-lg text-gray-500 font-medium">TB</span>
                                </p>
                                <span className="text-xs text-gray-500">/ -TB</span>
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
                            <span className="material-symbols-outlined">database</span>
                        </div>
                    </div>
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5 flex">
                        <div className="h-full w-0 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                        <div className="h-full w-0 bg-emerald-500"></div>
                        <div className="h-full w-0 bg-amber-500"></div>
                    </div>
                    <div className="mt-2 flex gap-4 text-[10px] text-gray-400">
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
            <div className="glass-card flex flex-col overflow-hidden rounded-xl">
                <div className="border-b border-white/5 px-6 py-5 flex justify-between items-center bg-[#1e1b29]">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-white">User Management</h3>
                        <p className="text-sm text-gray-400 font-body">
                            List of users in the system
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsAddUserModalOpen(true)}
                            className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 font-body text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                            <span className="material-symbols-outlined text-lg">add</span>
                            <span>Add User</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[11px] uppercase text-gray-500 font-bold tracking-wider border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Tasks</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-body text-sm">
                            {/* Admin User */}
                            <tr className="group transition-colors hover:bg-white/5">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-[#1e1b29] ring-1 ring-white/10 transition-all group-hover:ring-violet-500/50 flex items-center justify-center">
                                            <span className="text-sm font-bold text-violet-400">AD</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-[15px]">
                                                Nguyen Van Admin
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                admin@labelflow.com
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                                        <span className="material-symbols-outlined text-[14px]">
                                            shield
                                        </span>
                                        Admin
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span>
                                        <span className="text-emerald-500 text-sm font-medium">
                                            Active
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-white text-[15px]">0</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-500 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-lg">
                                            more_horiz
                                        </span>
                                    </button>
                                </td>
                            </tr>

                            {/* Manager User */}
                            <tr className="group transition-colors hover:bg-white/5">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-[#1e1b29] ring-1 ring-white/10 transition-all group-hover:ring-violet-500/50 flex items-center justify-center">
                                            <span className="text-sm font-bold text-fuchsia-400">TM</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-[15px]">
                                                Tran Thi Manager
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                manager@labelflow.com
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                                        <span className="material-symbols-outlined text-[14px]">
                                            person
                                        </span>
                                        Manager
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span>
                                        <span className="text-emerald-500 text-sm font-medium">
                                            Active
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-white text-[15px]">45</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-500 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-lg">
                                            more_horiz
                                        </span>
                                    </button>
                                </td>
                            </tr>

                            {/* Reviewer User */}
                            <tr className="group transition-colors hover:bg-white/5">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-[#1e1b29] ring-1 ring-white/10 transition-all group-hover:ring-violet-500/50 flex items-center justify-center">
                                            <span className="text-sm font-bold text-indigo-400">LR</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-[15px]">
                                                Le Van Reviewer
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                reviewer@labelflow.com
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                                        <span className="material-symbols-outlined text-[14px]">
                                            visibility
                                        </span>
                                        Reviewer
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span>
                                        <span className="text-emerald-500 text-sm font-medium">
                                            Active
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-white text-[15px]">320</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-500 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-lg">
                                            more_horiz
                                        </span>
                                    </button>
                                </td>
                            </tr>

                            {/* Annotator User */}
                            <tr className="group transition-colors hover:bg-white/5">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-[#1e1b29] ring-1 ring-white/10 transition-all group-hover:ring-violet-500/50 flex items-center justify-center">
                                            <span className="text-sm font-bold text-violet-400">PA</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-[15px]">
                                                Pham Annotator
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                annotator@labelflow.com
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                        <span className="material-symbols-outlined text-[14px]">
                                            edit
                                        </span>
                                        Annotator
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                                        <span className="text-gray-400 text-sm font-medium">
                                            Inactive
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-white text-[15px]">1,250</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-500 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-lg">
                                            more_horiz
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
            />
        </div>
    );
}
