import { Head, Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <Head title="Terms of Service" />
            <main className="mx-auto max-w-4xl px-6 py-16">
                <Link href="/" className="text-sm font-bold text-indigo-600">Back to AppBuilder</Link>
                <h1 className="text-4xl font-black mt-8 mb-6">Terms of Service</h1>
                <p className="text-slate-500 mb-10">Last updated: May 3, 2026</p>

                <section className="space-y-6 leading-7 text-slate-700">
                    <p>AppBuilder provides tools for creating, previewing, exporting, and operating mobile app experiences. By using the service, you agree to use it lawfully and to keep your account credentials secure.</p>
                    <h2 className="text-xl font-black text-slate-900">Accounts and Subscriptions</h2>
                    <p>You are responsible for all activity under your account. Paid plans, usage limits, billing cycles, upgrades, and cancellations are managed through the billing provider shown at checkout.</p>
                    <h2 className="text-xl font-black text-slate-900">User Content</h2>
                    <p>You retain ownership of app content, layouts, images, data sources, and submissions you upload or collect. You grant AppBuilder permission to process that content only to provide and improve the platform.</p>
                    <h2 className="text-xl font-black text-slate-900">Acceptable Use</h2>
                    <p>You may not use the service for unlawful content, malware, spam, deceptive apps, privacy violations, or content that infringes third-party rights.</p>
                    <h2 className="text-xl font-black text-slate-900">Exports and Backups</h2>
                    <p>Backups and exports are provided to help you preserve your app data. You remain responsible for reviewing exported content and maintaining independent records when required by law.</p>
                    <h2 className="text-xl font-black text-slate-900">Disclaimers</h2>
                    <p>The service is provided as-is. App store approval, third-party API availability, and payment provider availability are outside our direct control.</p>
                    <h2 className="text-xl font-black text-slate-900">Contact</h2>
                    <p>For legal or account questions, contact the platform owner through the support channel listed in your account dashboard.</p>
                </section>
            </main>
        </div>
    );
}
