import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome({ auth }) {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-300">
            <Head title="AppBuilder - Launch Your Mobile App in 5 Minutes" />
            
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200 dark:shadow-none">A</div>
                        <span className="text-xl font-black tracking-tight">AppBuilder</span>
                    </div>
                    <div className="hidden md:flex space-x-8 text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">
                        <a href="#features" className="hover:text-indigo-600 transition">Features</a>
                        <a href="#templates" className="hover:text-indigo-600 transition">Templates</a>
                        <a href="#pricing" className="hover:text-indigo-600 transition">Pricing</a>
                        <Link href={route('docs.index')} className="hover:text-indigo-600 transition">Docs</Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        {auth.user ? (
                            <Link href={route('dashboard')} className="bg-slate-900 dark:bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-slate-200 dark:shadow-none hover:scale-105 transition">Dashboard</Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition">Login</Link>
                                <Link href={route('register')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 transition">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <span className="inline-block py-1 px-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 border border-indigo-100 dark:border-indigo-800 transition">No-Code Revolution 🚀</span>
                        <h1 className="text-6xl md:text-7xl font-black leading-[1.1] mb-8 tracking-tight dark:text-white">
                            Your Idea, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Mobile Ready.</span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-gray-400 leading-relaxed mb-10 max-w-lg">
                            The most intuitive app builder for visionary entrepreneurs. 
                            Turn your concepts into professional Android and iOS apps in 5 minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link href={route('register')} className="bg-slate-900 dark:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-center shadow-2xl shadow-slate-300 dark:shadow-none hover:bg-indigo-600 dark:hover:bg-indigo-700 transition flex items-center justify-center group">
                                Start Building for Free
                                <span className="ml-2 group-hover:translate-x-1 transition">→</span>
                            </Link>
                            <Link href={route('docs.guide')} className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-gray-300 px-8 py-4 rounded-2xl font-black text-center hover:border-indigo-100 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                How it works? 📖
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50"></div>
                        <div className="relative bg-white dark:bg-slate-900 border-[12px] border-slate-900 dark:border-slate-800 rounded-[3rem] shadow-2xl w-full max-w-[320px] mx-auto overflow-hidden transition-colors">
                            <div className="h-6 bg-slate-900 dark:bg-slate-800 w-32 mx-auto rounded-b-xl mb-4"></div>
                            <div className="p-6 space-y-6">
                                <div className="h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                    <div className="h-4 w-full bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-16 bg-slate-50 dark:bg-slate-800 rounded-xl"></div>
                                    <div className="h-16 bg-slate-50 dark:bg-slate-800 rounded-xl"></div>
                                </div>
                                <div className="h-12 bg-indigo-600 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Showcase Preview */}
            <section id="templates" className="py-24 px-6 bg-white dark:bg-slate-950 transition-colors">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                        <div className="max-w-xl mb-8 md:mb-0">
                            <h2 className="text-4xl font-black mb-4 tracking-tight dark:text-white">Premium <span className="text-indigo-600">Templates.</span></h2>
                            <p className="text-slate-500 dark:text-gray-400">Jumpstart your business with high-converting, professional layouts designed for every industry.</p>
                        </div>
                        <Link href={route('showcase.index')} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline mb-2">Explore the Showcase →</Link>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { name: 'Elite Shop', emoji: '🛒', color: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
                            { name: 'Visual Canvas', emoji: '📸', color: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-600' },
                            { name: 'Modern Reader', emoji: '✍️', color: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600' },
                            { name: 'Business Pro', emoji: '🏢', color: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
                        ].map((template, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className={`h-80 ${template.color} rounded-[2.5rem] border border-slate-100 dark:border-slate-800 mb-6 flex items-center justify-center text-5xl group-hover:shadow-2xl transition duration-500 overflow-hidden relative`}>
                                    <span className="group-hover:scale-125 transition duration-500">{template.emoji}</span>
                                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition duration-500 flex items-center justify-center">
                                        <span className="bg-white dark:bg-slate-900 dark:text-white px-6 py-2 rounded-full font-black text-xs opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-500 shadow-xl">Use Template</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg dark:text-white">{template.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">Ready to publish in 1 click.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black mb-16 tracking-tight dark:text-white">Why Choose <span className="text-indigo-600">AppBuilder?</span></h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white dark:bg-slate-950 p-10 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition group">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition">🖱️</div>
                            <h3 className="text-xl font-bold mb-4 dark:text-white">Visual Drag & Drop</h3>
                            <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-sm">Build your dream app without writing code. Our intuitive builder lets you see changes in real-time.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-10 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition group">
                            <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition">⚡</div>
                            <h3 className="text-xl font-bold mb-4 dark:text-white">Native Performance</h3>
                            <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-sm">Powered by Flutter, your apps run smoothly on both Android and iOS with native feel and speed.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-10 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition group">
                            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition">📈</div>
                            <h3 className="text-xl font-bold mb-4 dark:text-white">Growth Analytics</h3>
                            <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-sm">Track views, shares, and conversions. Understand your users with integrated real-time metrics.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-24 px-6 bg-white dark:bg-slate-950 transition-colors">
                <div className="max-w-4xl mx-auto bg-indigo-600 rounded-[3rem] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none transition-transform hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                    <h2 className="text-4xl font-black mb-6 relative z-10">Ready to build your <span className="text-indigo-200">dream app?</span></h2>
                    <p className="text-indigo-100 mb-10 relative z-10 max-w-lg mx-auto">Join 5,000+ creators who are scaling their business with AppBuilder. No credit card required.</p>
                    <Link href={route('register')} className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-50 transition relative z-10">Start Your Free App Now</Link>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-slate-100 dark:border-slate-800 text-center bg-white dark:bg-slate-950 transition-colors">
                <div className="mb-4 flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                    <Link href={route('docs.index')} className="hover:text-indigo-600 transition">Documentation</Link>
                    <Link href={route('legal.terms')} className="hover:text-indigo-600 transition">Terms</Link>
                    <Link href={route('legal.privacy')} className="hover:text-indigo-600 transition">Privacy</Link>
                </div>
                <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 AppBuilder Inc. Built for visionaries.</p>
            </footer>
        </div>
    );
}
