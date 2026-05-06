import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Builds({ app, apiBaseUrl, defaultParameters, workflowCommand, workflowCommandIos, builds }) {
    const { data, setData, post, processing, errors } = useForm({
        api_base_url: apiBaseUrl,
        platform: 'android',
    });

    const currentCommand = data.platform === 'ios' ? workflowCommandIos : workflowCommand;

    const submit = (e) => {
        e.preventDefault();
        post(route('apps.builds.store', app.id));
    };

    const copyCommand = () => {
        navigator.clipboard.writeText(currentCommand);
        alert('GitHub Actions command copied.');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        App Build: {app.name}
                    </h2>
                    <Link href={route('apps.show', app.id)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                        Back to Builder
                    </Link>
                </div>
            }
        >
            <Head title={`Build Artifacts - ${app.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white p-8 shadow-sm sm:rounded-lg border border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 mb-2">Build Infrastructure</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            This creates a Laravel build request and dispatches a queue job. If Flutter is available on the worker, it builds an artifact; otherwise it prepares a Flutter project archive ready for CI.
                        </p>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Production API Base URL</label>
                                    <input
                                        type="url"
                                        value={data.api_base_url}
                                        onChange={(e) => setData('api_base_url', e.target.value)}
                                        className="w-full rounded-lg border-gray-300"
                                        placeholder="https://your-domain.com"
                                    />
                                    {errors.api_base_url && <p className="text-sm text-red-600 mt-1">{errors.api_base_url}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Platform</label>
                                    <select
                                        value={data.platform}
                                        onChange={(e) => setData('platform', e.target.value)}
                                        className="w-full rounded-lg border-gray-300"
                                    >
                                        <option value="android">Android (APK)</option>
                                        <option value="ios">iOS (IPA Archive)</option>
                                    </select>
                                    {errors.platform && <p className="text-sm text-red-600 mt-1">{errors.platform}</p>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Queue {data.platform === 'ios' ? 'iOS' : 'Android'} Build
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-8 shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-2">GitHub Actions Command</h3>
                                <p className="text-sm text-gray-500 mb-4">Optional CI fallback: run this from a machine authenticated with GitHub CLI, or trigger the workflow manually from GitHub Actions.</p>
                            </div>
                            <button onClick={copyCommand} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold">
                                Copy
                            </button>
                        </div>
                        <pre className="overflow-x-auto rounded-xl bg-gray-950 text-green-300 p-4 text-xs">{currentCommand}</pre>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-100">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Workflow Inputs</p>
                            <dl className="space-y-3 text-sm">
                                {Object.entries(defaultParameters).map(([key, value]) => (
                                    <div key={key}>
                                        <dt className="font-bold text-gray-700">{key}</dt>
                                        <dd className="text-gray-500 break-all">{value || '(empty for public apps)'}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-100">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Output</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>APK artifact: <strong>app-release.apk</strong></li>
                                <li>Flutter project artifact: generated Android/iOS-ready source</li>
                                <li>Artifact retention: 14 days</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm sm:rounded-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-black text-lg">Build Requests</h3>
                        </div>
                        {builds.length === 0 ? (
                            <div className="p-6 text-gray-500">No build requests yet.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-400">
                                    <tr>
                                        <th className="p-4">Build</th>
                                        <th className="p-4">Platform</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Created</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {builds.map((build) => (
                                        <tr key={build.id} className="border-t border-gray-100">
                                            <td className="p-4 font-bold">{build.build_name}</td>
                                            <td className="p-4">{build.platform}</td>
                                            <td className="p-4">{build.status}</td>
                                            <td className="p-4 text-gray-500">{new Date(build.created_at).toLocaleString()}</td>
                                            <td className="p-4 text-right">
                                                {build.download_url ? (
                                                    <a href={build.download_url} className="text-indigo-600 font-bold hover:text-indigo-800">
                                                        Download
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
