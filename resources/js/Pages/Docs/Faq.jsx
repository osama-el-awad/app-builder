import React from 'react';
import DocsLayout from '@/Layouts/DocsLayout';

export default function Faq() {
    const faqs = [
        {
            q: "What is an APK file?",
            a: "APK (Android Package Kit) is the file format used by the Android operating system for the distribution and installation of mobile apps. You can install it directly on any Android device."
        },
        {
            q: "Can I publish to the App Store?",
            a: "Yes! While we provide a preview IPA archive, for full App Store publication, you will need an Apple Developer account. Our build system supports generating the necessary files for the App Store."
        },
        {
            q: "Is there a limit on how many apps I can build?",
            a: "Free users can build 1 app. Basic plan users get 3 apps, and Pro users have unlimited app builds. Check our pricing page for more details."
        },
        {
            q: "Do I need to know how to code?",
            a: "Not at all. AppBuilder is designed for creators, entrepreneurs, and designers. Everything is managed through our visual builder."
        },
        {
            q: "What is the 'Preview Token'?",
            a: "For private apps, the preview token is a secure key added to your share link so only people with the link can view your app design before it's public."
        }
    ];

    return (
        <DocsLayout title="Frequently Asked Questions">
            <h1>Common Questions</h1>
            <p className="text-gray-500 mb-12">Everything you need to know about the platform.</p>

            <div className="space-y-8">
                {faqs.map((faq, index) => (
                    <div key={index} className="border-b dark:border-slate-800 pb-8">
                        <h3 className="text-gray-900 dark:text-white font-black text-lg mb-2">
                            {faq.q}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {faq.a}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-3xl text-white">
                <h3 className="m-0 text-white">Still have questions?</h3>
                <p className="text-slate-400 mt-2 mb-6">Our support team is always here to help you build your dream app.</p>
                <Link href="/" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold no-underline inline-block">Contact Support</Link>
            </div>
        </DocsLayout>
    );
}
