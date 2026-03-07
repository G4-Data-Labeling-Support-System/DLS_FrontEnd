import { themeClasses } from '@/styles';
import { TeamOutlined, DesktopOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useUsers } from '@/features/admin/hooks/useUsers';
import { useLabels } from '@/features/admin/hooks/useLabels';

export default function AdminDashboard() {
    const { data: rawUsers, isLoading } = useUsers();
    const { data: labelsResponse, isLoading: isLoadingLabels } = useLabels();
    const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers as any)?.data || [];

    // Extract label count robustly
    const getLabelCount = () => {
        if (!labelsResponse) return 0;
        const data = labelsResponse.data ?? labelsResponse;
        if (Array.isArray(data)) return data.length;
        if (typeof data === 'number') return data;
        return data.total ?? data.count ?? data.totalLabels ?? 0;
    };
    const labelCount = getLabelCount();

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex flex-col gap-1">
                    <h2 className={`text-2xl font-bold tracking-tight ${themeClasses.text.violet} md:text-3xl`}>
                        Admin Dashboard
                    </h2>
                    <p className={`font-body text-sm ${themeClasses.text.secondary}`}>
                        Manage users, permissions, and monitor backend performance.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-5 md:grid-cols-4">

                {/* Total Images */}
                <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                                Total Images
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

                {/* Labeled */}
                <div className={`${themeClasses.cards.glass} relative flex flex-col justify-between h-full`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`font-body text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                                Labeled
                            </p>
                            <p className="text-3xl font-bold tracking-tight text-white">
                                {isLoadingLabels ? '-' : labelCount}
                            </p>
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

            </div>
        </div>
    );
}

