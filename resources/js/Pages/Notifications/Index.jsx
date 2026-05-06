import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Index({ apps }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        app_id: apps[0]?.id || '',
        title: '',
        body: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('notifications.send'), {
            onSuccess: () => reset('title', 'body'),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Push Notifications</h2>}
        >
            <Head title="Push Notifications" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-black text-gray-900 mb-4">Send a Notification</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Enter the details below to send a push notification to all users of your app.
                        </p>

                        <form onSubmit={submit} className="max-w-xl space-y-6">
                            <div>
                                <InputLabel htmlFor="app_id" value="Select App" />
                                <select
                                    id="app_id"
                                    value={data.app_id}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    onChange={(e) => setData('app_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select an app</option>
                                    {apps.map((app) => (
                                        <option key={app.id} value={app.id}>
                                            {app.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.app_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="title" value="Notification Title" />
                                <TextInput
                                    id="title"
                                    value={data.title}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. New Update Available!"
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="body" value="Notification Body" />
                                <textarea
                                    id="body"
                                    value={data.body}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    rows="4"
                                    onChange={(e) => setData('body', e.target.value)}
                                    placeholder="Enter your message here..."
                                    required
                                ></textarea>
                                <InputError message={errors.body} className="mt-2" />
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>Send Notification</PrimaryButton>
                                {processing && <span className="text-sm text-gray-500">Sending...</span>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
