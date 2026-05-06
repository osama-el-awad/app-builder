import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';

export default function DocsLayout({ children, title }) {
    const { auth } = usePage().props;
    const Layout = auth.user ? AuthenticatedLayout : ({ children, header }) => (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <nav className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="font-black text-xl dark:text-white">AppBuilder <span className="text-indigo-600">Docs</span></Link>
                    <Link href={route('login')} className="text-sm font-bold text-indigo-600">Sign In</Link>
                </div>
            </nav>
            {header && <header className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800 p-6">{header}</header>}
            <main>{children}</main>
        </div>
    );

    const sidebarItems = [
        { name: 'Introduction', href: route('docs.index') },
        { name: '5-Minute Guide', href: route('docs.guide') },
        { name: 'FAQ', href: route('docs.faq') },
        { name: 'Developer API', href: route('docs.api') },
    ];

    return (
        <Layout
            header={<h2 className="text-xl font-black text-gray-800 dark:text-white">{title}</h2>}
        >
            <Head title={`${title} - Documentation`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <aside className="w-full md:w-64 space-y-2">
                            {sidebarItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block px-4 py-2 rounded-xl text-sm font-bold transition ${route().current(item.href) ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </aside>

                        {/* Content */}
                        <div className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 prose dark:prose-invert max-w-none">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
