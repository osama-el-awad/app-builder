import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PublicPreview({ app, author }) {
    const [currentPage, setCurrentPage] = useState(app.pages[0]);
    const theme = app.settings || { primary: '#4F46E5', font: 'Inter', radius: 8 };

    const renderComponent = (comp) => {
        const config = comp.config || {};
        const style = { borderRadius: `${theme.radius}px`, fontFamily: theme.font };

        switch (comp.type) {
            case 'text':
                return <div key={comp.id} style={{ ...style, fontSize: `${config.fontSize}px`, color: config.color }} className="mb-4">{config.content}</div>;
            case 'button':
                return <button key={comp.id} style={{ ...style, backgroundColor: theme.primary }} className="w-full py-3 px-6 text-white font-black mb-4 shadow-lg">{config.label}</button>;
            case 'image':
                return config.url ? <img key={comp.id} src={config.url} style={style} className="w-full h-48 object-cover mb-4 shadow-sm" /> : <div key={comp.id} className="w-full h-48 bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-300">🖼️</div>;
            case 'list':
                return (
                    <div key={comp.id} className="space-y-3 mb-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} style={style} className="p-4 bg-white border border-slate-100 shadow-sm flex items-center space-x-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
                                    <div className="h-2 w-full bg-slate-50 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'form':
                return (
                    <div key={comp.id} style={style} className="p-6 bg-slate-50 border border-slate-100 mb-6">
                        <div className="space-y-4">
                            <div className="h-10 bg-white border border-slate-200 rounded-lg"></div>
                            <div className="h-24 bg-white border border-slate-200 rounded-lg"></div>
                            <button style={{ ...style, backgroundColor: theme.primary }} className="w-full py-2 text-white font-bold opacity-50 cursor-not-allowed">Submit</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const shareUrl = window.location.href;
    const shareText = `Check out this amazing app "${app.name}" built with AppBuilder! 🚀`;

    return (
        <div className="min-h-screen bg-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
            <Head>
                <title>{app.name} - Created with AppBuilder</title>
                <meta name="description" content={`Check out ${app.name} by ${author}. Built without code using AppBuilder.`} />
                <meta property="og:title" content={`${app.name} Preview`} />
                <meta property="og:description" content={`A professional mobile app built by ${author} using AppBuilder.`} />
                <meta property="og:image" content={app.thumbnail || 'https://via.placeholder.com/1200x630?text=AppBuilder+Preview'} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            {/* Header */}
            <div className="fixed top-0 w-full z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 px-6 h-20 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-500/20">A</div>
                    <span className="font-black text-white tracking-tight">AppBuilder</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <Link href={route('register')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-black shadow-xl shadow-indigo-500/20 hover:scale-105 transition">
                        Build Your Own App 🚀
                    </Link>
                </div>
            </div>

            <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                {/* Left: Info & Actions */}
                <div className="text-white order-2 lg:order-1">
                    <span className="inline-block py-1 px-3 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 border border-indigo-500/20">Public Preview</span>
                    <h1 className="text-5xl font-black mb-4 tracking-tight">{app.name}</h1>
                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                        Created by <span className="text-white font-bold">{author}</span>. 
                        This app features {app.pages.length} screens and professional components.
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10">
                        <h3 className="font-bold mb-6 flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
                            Want a copy of this app?
                        </h3>
                        <form action={route('showcase.clone', app.id)} method="POST">
                            <input type="hidden" name="_token" value={usePage().props.auth.csrf_token} />
                            <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-lg shadow-2xl hover:bg-indigo-50 transition transform active:scale-95 flex items-center justify-center">
                                Clone This App Now 🚀
                            </button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Share this app</p>
                        <div className="flex space-x-3">
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition border border-white/5">🐦</a>
                            <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition border border-white/5">📱</a>
                            <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copied!'); }} className="px-6 h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition border border-white/5 text-xs font-black uppercase tracking-widest">🔗 Copy Link</button>
                        </div>
                    </div>
                </div>

                {/* Right: Phone Preview */}
                <div className="order-1 lg:order-2 flex justify-center">
                    <div className="w-[320px] h-[650px] bg-white border-[10px] border-slate-800 rounded-[2.5rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] overflow-hidden flex flex-col">
                        {/* Notch */}
                        <div className="h-6 bg-slate-800 w-32 mx-auto rounded-b-xl mb-2"></div>
                        
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <h2 className="text-xl font-black mb-6" style={{ fontFamily: theme.font }}>{currentPage.name}</h2>
                            {currentPage.components.map(comp => renderComponent(comp))}
                        </div>

                        {/* Bottom Nav Simulation */}
                        <div className="h-16 bg-slate-50 border-t border-slate-100 flex items-center justify-around px-4">
                            {app.pages.map(page => (
                                <button key={page.id} onClick={() => setCurrentPage(page)} className={`text-[10px] font-black uppercase transition ${currentPage.id === page.id ? 'text-indigo-600' : 'text-slate-300'}`}>
                                    {page.name.substring(0, 4)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Banner */}
            <div className="bg-indigo-600 py-4 text-center">
                <p className="text-white text-xs font-black tracking-widest uppercase flex items-center justify-center">
                    Powering {app.platform === 'android' ? 'Android' : 'iOS'} applications since 2026. Join the revolution.
                </p>
            </div>
        </div>
    );
}
