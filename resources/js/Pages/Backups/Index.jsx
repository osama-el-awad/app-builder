import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ apps, backups, systemBackups = [], auth }) {
    const [appId, setAppId] = useState(apps[0]?.id || '');
    const [frequency, setFrequency] = useState('manual');
    const [isBackingUp, setIsBackingUp] = useState(false);

    const isAdmin = auth.user.email === 'admin@example.com' || auth.user.email === 'test@example.com';

    const createBackup = (e) => {
        e.preventDefault();
        router.post(route('backups.store'), { app_id: appId, frequency });
    };

    const runSystemBackup = () => {
        setIsBackingUp(true);
        router.post(route('backups.system'), {}, {
            onFinish: () => setIsBackingUp(false)
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Backups</h2>}
        >
            <Head title="Backups" />

            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 space-y-8">
                    {isAdmin && (
                        <div className="bg-indigo-900 text-white p-6 shadow-sm sm:rounded-lg border border-indigo-800">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-black text-lg">System-wide Backups (Admin Only)</h3>
                                    <p className="text-indigo-200 text-sm">Full Database and Storage backup using spatie/laravel-backup</p>
                                </div>
                                <button 
                                    onClick={runSystemBackup} 
                                    disabled={isBackingUp}
                                    className="px-5 py-2 bg-white text-indigo-900 rounded-lg font-bold hover:bg-indigo-50 disabled:opacity-50"
                                >
                                    {isBackingUp ? 'Backing up...' : 'Run Full Backup'}
                                </button>
                            </div>
                            
                            {systemBackups.length > 0 ? (
                                <div className="bg-indigo-800/50 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-indigo-800 text-left uppercase tracking-widest text-indigo-300">
                                                <th className="p-3">Filename</th>
                                                <th className="p-3">Size</th>
                                                <th className="p-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {systemBackups.map((s, i) => (
                                                <tr key={i} className="border-t border-indigo-700/50">
                                                    <td className="p-3 font-mono">{s.name}</td>
                                                    <td className="p-3">{(s.size / 1024 / 1024).toFixed(2)} MB</td>
                                                    <td className="p-3 opacity-70">{s.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-indigo-300 text-sm italic text-center py-4">No system backups found in storage/app/Laravel</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-6">
                        <h3 className="font-black text-lg text-gray-900">App Data Export</h3>
                        <form onSubmit={createBackup} className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-100 grid md:grid-cols-[1fr_180px_auto] gap-4 items-end">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">App</label>
                                <select value={appId} onChange={(e) => setAppId(e.target.value)} className="w-full rounded-lg border-gray-300" required>
                                    {apps.map((app) => (
                                        <option key={app.id} value={app.id}>{app.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Label</label>
                                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full rounded-lg border-gray-300">
                                    <option value="manual">Manual</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                            <button type="submit" disabled={!apps.length} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50">
                                Export JSON
                            </button>
                        </form>

                        <div className="bg-white shadow-sm sm:rounded-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-black text-lg">Backup History</h3>
                            </div>
                            {backups.length === 0 ? (
                                <div className="p-6 text-gray-500">No backups yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-400">
                                            <tr>
                                                <th className="p-4">App</th>
                                                <th className="p-4">Type</th>
                                                <th className="p-4">Size</th>
                                                <th className="p-4">Completed</th>
                                                <th className="p-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {backups.map((backup) => (
                                                <tr key={backup.id} className="border-t border-gray-100">
                                                    <td className="p-4 font-bold">{backup.app?.name || 'Deleted app'}</td>
                                                    <td className="p-4">{backup.type} {backup.frequency ? `(${backup.frequency})` : ''}</td>
                                                    <td className="p-4">{backup.size} bytes</td>
                                                    <td className="p-4 text-gray-500">{backup.completed_at ? new Date(backup.completed_at).toLocaleString() : '-'}</td>
                                                    <td className="p-4 text-right">
                                                        <a href={route('backups.download', backup.id)} className="text-indigo-600 font-bold hover:text-indigo-800">
                                                            Download
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
