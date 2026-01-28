export default function AdminDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Users</p>
                            <p className="text-3xl font-bold text-white mt-2">1,234</p>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-violet-500">
                            group
                        </span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Projects</p>
                            <p className="text-3xl font-bold text-white mt-2">56</p>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-fuchsia-500">
                            folder
                        </span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Annotations</p>
                            <p className="text-3xl font-bold text-white mt-2">12.5K</p>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-blue-500">
                            label
                        </span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Completion Rate</p>
                            <p className="text-3xl font-bold text-white mt-2">87%</p>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-green-500">
                            trending_up
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
