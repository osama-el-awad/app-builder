import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth, templates }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        template_id: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('apps.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Launch Your App 🚀
                </h2>
            }
        >
            <Head title="Create App" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-black mb-4 dark:text-white">Pick a Template & Launch.</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-lg">You are 60 seconds away from your own mobile app.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {templates.map((template) => {
                                    const getEmoji = (name) => {
                                        if (name.includes('Shop')) return '🛒';
                                        if (name.includes('Canvas') || name.includes('Portfolio')) return '📸';
                                        if (name.includes('Reader') || name.includes('Blog')) return '✍️';
                                        if (name.includes('Starter')) return '🚀';
                                        return '🏢';
                                    };

                                    return (
                                        <div 
                                            key={template.id}
                                            onClick={() => setData('template_id', template.id)}
                                            className={`cursor-pointer p-6 border-2 rounded-[2rem] transition transform hover:scale-[1.02] ${data.template_id === template.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-xl shadow-indigo-100 dark:shadow-none' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-200 dark:hover:border-slate-700'}`}
                                        >
                                            <div className="h-40 bg-white dark:bg-slate-800 rounded-2xl mb-4 flex items-center justify-center text-5xl shadow-inner border border-gray-50 dark:border-slate-700">
                                                {getEmoji(template.name)}
                                            </div>
                                            <h4 className="font-black text-xl mb-1 dark:text-white">{template.name}</h4>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-relaxed">{template.description}</p>
                                        </div>
                                    );
                                })}
                                
                                <div 
                                    onClick={() => setData('template_id', null)}
                                    className={`cursor-pointer p-6 border-2 rounded-[2rem] transition transform hover:scale-[1.02] ${data.template_id === null ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-xl shadow-indigo-100 dark:shadow-none' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-200 dark:hover:border-slate-700'}`}
                                >
                                    <div className="h-40 bg-gray-50 dark:bg-slate-800 rounded-2xl mb-4 flex items-center justify-center text-4xl border border-dashed border-gray-200 dark:border-slate-700">
                                        <span className="text-gray-300 dark:text-gray-600">📄</span>
                                    </div>
                                    <h4 className="font-black text-xl mb-1 text-gray-400 dark:text-gray-500">Blank Canvas</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-relaxed">Start from scratch for full control.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="bg-slate-900 dark:bg-indigo-950 p-8 rounded-[2.5rem] shadow-2xl sticky top-8 text-white border border-slate-800 dark:border-indigo-900">
                                <h3 className="text-xl font-bold mb-6 flex items-center">
                                    <span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-xs mr-3">1</span>
                                    Final Step
                                </h3>
                                <form onSubmit={submit}>
                                    <div className="mb-8">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">App Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full bg-slate-800 dark:bg-indigo-900/50 border-none rounded-xl py-4 px-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 transition"
                                            placeholder="e.g. My Awesome App"
                                        />
                                        <p className="text-[9px] text-slate-500 mt-2 italic">Leave blank to use template name.</p>
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <button 
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 transition transform active:scale-95 flex items-center justify-center"
                                        disabled={processing}
                                    >
                                        {processing ? 'Launching...' : 'Create My App Instantly 🚀'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
