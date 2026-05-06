import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const money = (cents) => `$${(Number(cents || 0) / 100).toFixed(2)}`;

export default function Index({ referralCode, referralUrl, bonusCents, referrals }) {
    const copy = () => {
        navigator.clipboard.writeText(referralUrl);
        alert('Referral link copied.');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Referral Program</h2>}
        >
            <Head title="Referral Program" />

            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8 space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-100">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Your Code</p>
                            <p className="text-3xl font-black text-indigo-600">{referralCode}</p>
                        </div>
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-100">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Bonus Credit</p>
                            <p className="text-3xl font-black text-emerald-600">{money(bonusCents)}</p>
                        </div>
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-100">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Successful Referrals</p>
                            <p className="text-3xl font-black text-slate-900">{referrals.length}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Referral Link</label>
                        <div className="flex gap-3">
                            <input readOnly value={referralUrl} className="flex-1 rounded-lg border-gray-300 text-sm" />
                            <button type="button" onClick={copy} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold">
                                Copy
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            Current policy: referrer receives $10 credit and the new user receives $5 credit after signup.
                        </p>
                    </div>

                    <div className="bg-white shadow-sm sm:rounded-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-black text-lg">Referral History</h3>
                        </div>
                        {referrals.length === 0 ? (
                            <div className="p-6 text-gray-500">No referrals yet.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-400">
                                    <tr>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Your Bonus</th>
                                        <th className="p-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.map((referral) => (
                                        <tr key={referral.id} className="border-t border-gray-100">
                                            <td className="p-4 font-bold">{referral.referred_user?.name}</td>
                                            <td className="p-4">{referral.status}</td>
                                            <td className="p-4">{money(referral.referrer_bonus_cents)}</td>
                                            <td className="p-4 text-gray-500">{new Date(referral.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
