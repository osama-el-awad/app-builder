import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ isSubscribed, plans }) {
    const handleCheckout = (planId) => {
        router.post(route('subscription.checkout'), { plan_id: planId });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Pricing Plans
                </h2>
            }
        >
            <Head title="Subscription" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {isSubscribed ? (
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <h3 className="text-2xl font-bold text-green-600 mb-4">You are a Pro Member!</h3>
                            <p className="mb-6">Enjoy all premium features without limits.</p>
                            <a 
                                href={route('subscription.portal')}
                                className="inline-block bg-gray-800 text-white px-6 py-2 rounded font-bold hover:bg-gray-700"
                            >
                                Manage Billing
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.map((plan) => (
                                <div key={plan.id} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col">
                                    <h3 className="text-xl font-black mb-2">{plan.name}</h3>
                                    <div className="text-4xl font-black mb-6">
                                        ${plan.price}<span className="text-sm font-normal text-gray-400">/mo</span>
                                    </div>
                                    <ul className="mb-8 space-y-3 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-sm text-gray-600">
                                                <span className="text-green-500 mr-2">✔</span> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handleCheckout(plan.id)}
                                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                                    >
                                        Choose {plan.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
