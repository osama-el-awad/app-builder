import React from 'react';
import DocsLayout from '@/Layouts/DocsLayout';

export default function Index() {
    return (
        <DocsLayout title="Documentation">
            <h1>Welcome to AppBuilder</h1>
            <p className="text-lg">
                AppBuilder is a powerful platform designed to help you create, customize, and publish mobile applications 
                without writing a single line of code. Our platform uses a high-performance Flutter runtime to ensure 
                your apps feel native and snappy.
            </p>

            <h3>Core Concepts</h3>
            <ul>
                <li><strong>The Builder:</strong> Our drag-and-drop editor where you design your app screens.</li>
                <li><strong>Components:</strong> Modular blocks like Text, Images, and Buttons that you can combine.</li>
                <li><strong>Build Pipeline:</strong> A cloud-based system that packages your design into a real Android APK or iOS IPA.</li>
                <li><strong>Growth Layer:</strong> Integrated analytics to track how users interact with your app.</li>
            </ul>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 my-8">
                <h4 className="m-0 text-indigo-700 dark:text-indigo-400">Ready to start?</h4>
                <p className="mb-4 text-indigo-900 dark:text-indigo-300">Check out our 5-minute guide to launch your first app today.</p>
                <a href={route('docs.guide')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold no-underline inline-block">Go to Guide &rarr;</a>
            </div>
        </DocsLayout>
    );
}
