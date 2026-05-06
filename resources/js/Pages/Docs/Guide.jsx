import React from 'react';
import DocsLayout from '@/Layouts/DocsLayout';

export default function Guide() {
    const steps = [
        {
            title: "1. Create Your App",
            desc: "Log in to your dashboard and click 'Create New App'. You can start with a blank canvas or pick one of our high-converting templates like 'Elite Shop' or 'Modern Reader'.",
            icon: "🚀"
        },
        {
            title: "2. Design with the Builder",
            desc: "Use the sidebar to drag components into the phone preview. Customize text, colors, and images. Your changes are saved automatically in the cloud.",
            icon: "🎨"
        },
        {
            title: "3. Configure Settings",
            desc: "Head over to the 'Theme' tab in the builder to set your brand colors and fonts. This applies a consistent look across all screens.",
            icon: "⚙️"
        },
        {
            title: "4. Request a Build",
            desc: "Click 'Build APK' or 'Build iOS' in the dashboard. Our infrastructure will take your design and compile it into a real app file within minutes.",
            icon: "🏗️"
        },
        {
            title: "5. Share & Track",
            desc: "Use the 'Share' button to send a live preview link to your clients. Once published, check the Dashboard for real-time analytics on views and conversions.",
            icon: "📈"
        }
    ];

    return (
        <DocsLayout title="5-Minute Quickstart">
            <h1>Launch your app in 5 minutes</h1>
            <p>Follow these simple steps to go from idea to a working mobile app.</p>

            <div className="space-y-12 my-12 relative">
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-100 dark:bg-slate-800 -z-10 hidden md:block"></div>
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-6 relative">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                            {index + 1}
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 flex-1">
                            <h3 className="m-0 text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                <span>{step.icon}</span> {step.title}
                            </h3>
                            <p className="mb-0 mt-2 text-gray-600 dark:text-gray-400">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800 text-center">
                <h2 className="m-0 text-emerald-700 dark:text-emerald-400 italic">"The best way to predict the future is to create it."</h2>
                <p className="mt-4 text-emerald-900 dark:text-emerald-300">You are now ready to build something amazing.</p>
                <a href={route('apps.create')} className="bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-black no-underline inline-block mt-4 hover:scale-105 transition transform shadow-xl shadow-emerald-100 dark:shadow-none">Start Now 🚀</a>
            </div>
        </DocsLayout>
    );
}
