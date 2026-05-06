import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, apps }) {
    const handleClone = (appId) => {
        if (!auth.user) {
            router.get(route('register'));
            return;
        }
        router.post(route('showcase.clone', appId));
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Head title="App Showcase - Built with AppBuilder" />
            
            {/* Simple Nav for Guest/User */}
            <nav className="bg-white border-b border-slate-100 h-20 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-black">A</div>
                        <span className="font-black tracking-tight">AppBuilder</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="text-sm font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition">Dashboard</Link>
                        ) : (
                            <Link href={route('login')} className="text-sm font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition">Login</Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-black mb-4 tracking-tight">App <span className="text-indigo-600">Showcase.</span></h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Explore amazing apps built by our community. See a design you like? Clone it and start building your own version in seconds.</p>
                    </div>

                    {apps.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-slate-200">
                            <span className="text-5xl mb-4 block">🏗️</span>
                            <h3 className="text-xl font-bold text-slate-400">The showcase is getting ready...</h3>
                            <p className="text-slate-400 mt-2">Check back soon to see featured community apps!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {apps.map((app) => (
                                <div key={app.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl transition group flex flex-col">
                                    <div className="h-64 bg-slate-100 relative overflow-hidden">
                                        {app.thumbnail ? (
                                            <img src={app.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">📱</div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Featured</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-xl font-black mb-2">{app.name}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                                            {app.description || 'A beautiful mobile application built with AppBuilder components and dynamic data.'}
                                        </p>
                                        <div className="flex items-center space-x-3 pt-6 border-t border-slate-50">
                                            <button 
                                                onClick={() => handleClone(app.id)}
                                                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-95"
                                            >
                                                Clone This App 🚀
                                            </button>
                                            <a 
                                                href={`/api/app/${app.id}`} 
                                                target="_blank"
                                                className="px-4 py-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition"
                                                title="View Raw Data"
                                            >
                                                👁️
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] p-16 text-center text-white relative overflow-hidden">
                    <h2 className="text-3xl font-black mb-6">Ready to see your app here?</h2>
                    <p className="text-slate-400 mb-10">Start building today and join the elite group of AppBuilder creators.</p>
                    <Link href={route('register')} className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition">Start Building Now</Link>
                </div>
            </section>
        </div>
    );
}
