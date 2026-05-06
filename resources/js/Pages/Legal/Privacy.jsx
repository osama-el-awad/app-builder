import { Head, Link } from '@inertiajs/react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <Head title="Privacy Policy" />
            <main className="mx-auto max-w-4xl px-6 py-16">
                <Link href="/" className="text-sm font-bold text-indigo-600">Back to AppBuilder</Link>
                <h1 className="text-4xl font-black mt-8 mb-6">Privacy Policy</h1>
                <p className="text-slate-500 mb-10">Last updated: May 3, 2026</p>

                <section className="space-y-6 leading-7 text-slate-700">
                    <p>This policy describes a GDPR-ready structure for how AppBuilder handles account data, app configuration, form submissions, referral data, billing metadata, and technical logs.</p>
                    <h2 className="text-xl font-black text-slate-900">Data We Process</h2>
                    <p>We process account identity data, authentication data, app builder JSON, uploaded configuration, public preview settings, referral relationships, backup metadata, and form submissions collected through apps.</p>
                    <h2 className="text-xl font-black text-slate-900">Legal Bases</h2>
                    <p>Processing may be based on contract performance, legitimate interests such as security and fraud prevention, consent where required, and legal obligations for billing or compliance records.</p>
                    <h2 className="text-xl font-black text-slate-900">Data Subject Rights</h2>
                    <p>Users may request access, correction, deletion, portability, or restriction of personal data, subject to legal and operational limits. App owners are responsible for honoring rights requests from their own app users.</p>
                    <h2 className="text-xl font-black text-slate-900">Processors and Transfers</h2>
                    <p>The platform may use processors for hosting, email, payment processing, analytics, backups, and push notifications. Cross-border transfers should use appropriate safeguards such as contractual clauses where required.</p>
                    <h2 className="text-xl font-black text-slate-900">Retention</h2>
                    <p>Account data is retained while the account is active. App backups, form submissions, billing records, and logs should follow the retention settings and legal requirements configured by the platform operator.</p>
                    <h2 className="text-xl font-black text-slate-900">Security</h2>
                    <p>The platform uses access controls, preview tokens for private apps, password hashing, role-ready permissions, and export controls. Production deployments should enforce HTTPS, secure cookies, and encrypted backups.</p>
                    <h2 className="text-xl font-black text-slate-900">Contact</h2>
                    <p>Privacy requests should be sent to the platform owner or data protection contact listed in the production deployment.</p>
                </section>
            </main>
        </div>
    );
}
