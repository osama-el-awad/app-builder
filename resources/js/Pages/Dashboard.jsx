import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AnalyticsChart from '@/Components/AnalyticsChart';

export default function Dashboard({ apps, analytics = {}, onboarding = {} }) {
    const { auth } = usePage().props;

    const deleteApp = (app) => {
        if (confirm(`Delete "${app.name}" permanently?`)) {
            router.delete(route('apps.destroy', app.id));
        }
    };

    const getPlanName = () => {
        if (auth.user.plan.is_enterprise) return 'Enterprise';
        if (auth.user.plan.is_pro) return 'Pro';
        if (auth.user.plan.is_basic) return 'Basic';
        return 'No Active Subscription';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            My Apps
                        </h2>
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase rounded-full tracking-wider border border-indigo-200 dark:border-indigo-800">
                            Plan: {getPlanName()}
                        </span>
                    </div>
                    <Link
                        href={route('apps.create')}
                        className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-indigo-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Create New App
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 shadow-sm sm:rounded-lg border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-black text-lg text-gray-900 dark:text-white">Conversion Overview</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Activity across all your apps for the last 7 days</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Conversions</span>
                                </div>
                            </div>
                            <AnalyticsChart data={analytics.chartData} />
                        </div>
                        <div className="space-y-4">
                            {[
                                ['Views', analytics.views || 0, 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'],
                                ['Shares', analytics.shares || 0, 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'],
                                ['Clones', analytics.clones || 0, 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'],
                                ['Total Conversions', analytics.conversions || 0, 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'],
                            ].map(([label, value, colorClass]) => (
                                <div key={label} className="bg-white dark:bg-slate-900 p-5 shadow-sm sm:rounded-lg border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${colorClass.split(' ')[0]}`}>
                                        <div className={`w-2 h-2 rounded-full ${colorClass.split(' ')[1].replace('text-', 'bg-')}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 shadow-sm sm:rounded-lg border border-gray-100 dark:border-slate-800">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h3 className="font-black text-lg text-gray-900 dark:text-white">60-second launch funnel</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Register, choose a template, customize, then publish your Android-first app.</p>
                            </div>
                            <Link href={apps.length ? route('apps.show', apps[0].id) : route('apps.create')} className="inline-flex items-center justify-center px-5 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none">
                                {apps.length ? 'Continue Launch' : 'Start Launch'}
                            </Link>
                        </div>
                        <div className="mt-6 grid md:grid-cols-4 gap-3">
                            {[
                                ['Registered', onboarding.registered],
                                ['App Created', onboarding.created_app],
                                ['Customized', onboarding.customized_app],
                                ['Published', onboarding.published_app],
                            ].map(([label, done]) => (
                                <div key={label} className={`rounded-lg border p-3 ${done ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400 dark:text-gray-500'}`}>
                                    <span className="text-xs font-black uppercase tracking-widest">{done ? 'Done' : 'Next'}</span>
                                    <p className="font-bold mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {apps.length === 0 ? (
                        <div className="overflow-hidden bg-white dark:bg-slate-900 shadow-sm sm:rounded-lg border border-gray-100 dark:border-slate-800">
                            <div className="p-6 text-gray-900 dark:text-gray-100 text-center">
                                <p className="mb-4">You haven't created any apps yet.</p>
                                <Link
                                    href={route('apps.create')}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                                >
                                    Create your first app &rarr;
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {apps.map((app) => (
                                <div key={app.id} className="bg-white dark:bg-slate-900 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-slate-800 hover:shadow-md transition">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{app.name}</h3>
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded capitalize">
                                                {app.platform}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            {app.pages_count} Pages
                                        </p>
                                        <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                                            <div className="rounded bg-gray-50 dark:bg-slate-800 p-2">
                                                <p className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500">Views</p>
                                                <p className="font-bold dark:text-white">{app.views_count || 0}</p>
                                            </div>
                                            <div className="rounded bg-gray-50 dark:bg-slate-800 p-2">
                                                <p className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500">Shares</p>
                                                <p className="font-bold dark:text-white">{app.shares_count || 0}</p>
                                            </div>
                                            <div className="rounded bg-gray-50 dark:bg-slate-800 p-2">
                                                <p className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500">Clones</p>
                                                <p className="font-bold dark:text-white">{app.clones_count || 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <Link
                                                href={route('apps.show', app.id)}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium"
                                            >
                                                Open Builder
                                            </Link>
                                            <Link
                                                href={route('apps.edit', app.id)}
                                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium"
                                            >
                                                Settings
                                            </Link>
                                            <Link
                                                href={route('apps.builds.index', app.id)}
                                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 text-sm font-medium"
                                            >
                                                Build APK
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => deleteApp(app)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
