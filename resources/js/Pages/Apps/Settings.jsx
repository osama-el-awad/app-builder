import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Settings({ app }) {
    const { data, setData, put, processing, errors } = useForm({
        settings_only: true,
        name: app.name || '',
        description: app.description || '',
        thumbnail: app.thumbnail || '',
        is_public: Boolean(app.is_public),
        platform: app.platform || 'android',
    });

    const previewUrl = app.is_public
        ? `${window.location.origin}/app/${app.id}/preview`
        : `${window.location.origin}/app/${app.id}/preview/${app.preview_token}`;

    const submit = (e) => {
        e.preventDefault();
        put(route('apps.update', app.id));
    };

    const regeneratePreviewLink = () => {
        if (confirm('Regenerate the private preview link? Old private links will stop working.')) {
            router.put(route('apps.update', app.id), { regenerate_preview_token: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        App Settings
                    </h2>
                    <Link href={route('apps.show', app.id)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                        Back to Builder
                    </Link>
                </div>
            }
        >
            <Head title={`Settings - ${app.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white p-8 shadow-sm sm:rounded-lg border border-gray-100 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">App Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                            />
                            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                                rows="4"
                            />
                            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Thumbnail URL</label>
                            <input
                                type="url"
                                value={data.thumbnail}
                                onChange={(e) => setData('thumbnail', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                                placeholder="https://example.com/thumbnail.png"
                            />
                            {errors.thumbnail && <p className="text-sm text-red-600 mt-1">{errors.thumbnail}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Primary Platform</label>
                            <select
                                value={data.platform}
                                onChange={(e) => setData('platform', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="android">Android</option>
                                <option value="ios">iOS</option>
                            </select>
                            {errors.platform && <p className="text-sm text-red-600 mt-1">{errors.platform}</p>}
                        </div>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.is_public}
                                onChange={(e) => setData('is_public', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-gray-700">Make this app public</span>
                        </label>

                        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Preview Link</p>
                            <div className="flex gap-3">
                                <input readOnly value={previewUrl} className="flex-1 rounded-lg border-gray-200 bg-white text-xs" />
                                <button type="button" onClick={regeneratePreviewLink} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold">
                                    Regenerate
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Save Settings
                        </button>
                        <Link
                            href={route('apps.builds.index', app.id)}
                            className="inline-flex ms-3 px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800"
                        >
                            Build Android APK
                        </Link>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
