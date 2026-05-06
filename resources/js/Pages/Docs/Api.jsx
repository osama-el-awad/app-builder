import React from 'react';
import DocsLayout from '@/Layouts/DocsLayout';

export default function Api() {
    return (
        <DocsLayout title="Developer API">
            <h1>API Documentation</h1>
            <p>
                Developers can interact with the AppBuilder core to fetch app configurations, 
                submit form data, and track analytics events programmatically.
            </p>

            <h3>Authentication</h3>
            <p>
                Mobile clients use <strong>Sanctum Tokens</strong> or <strong>Preview Tokens</strong> to access the API. 
                Ensure you include the `Authorization: Bearer {token}` header for protected endpoints.
            </p>

            <div className="space-y-12 my-12">
                <section>
                    <h3 className="text-indigo-600 dark:text-indigo-400">GET /api/app/{"{id}"}</h3>
                    <p>Fetches the full JSON structure of an app, including all pages and components.</p>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto">
{`{
  "id": 42,
  "name": "My App",
  "settings": { "primary": "#6366f1", "font": "Inter" },
  "pages": [
    {
      "id": 101,
      "name": "Home",
      "components": [...]
    }
  ]
}`}
                    </pre>
                </section>

                <section>
                    <h3 className="text-indigo-600 dark:text-indigo-400">POST /api/app/{"{id}"}/submit</h3>
                    <p>Submit form data from an app's interactive form. Data is stored and viewable in the dashboard.</p>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm">
{`{
  "form_id": 505,
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}`}
                    </pre>
                </section>

                <section>
                    <h3 className="text-indigo-600 dark:text-indigo-400">POST /api/app/{"{id}"}/track</h3>
                    <p>Track custom analytics events from the mobile runtime.</p>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm">
{`{
  "event": "view_product",
  "metadata": { "product_id": "abc-123" }
}`}
                    </pre>
                </section>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800">
                <h4 className="m-0 text-amber-700 dark:text-amber-400">Security Note</h4>
                <p className="mb-0 text-amber-900 dark:text-amber-300 text-sm">
                    Never expose your private API tokens in public repositories. Use environment variables to manage your keys securely.
                </p>
            </div>
        </DocsLayout>
    );
}
