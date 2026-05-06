<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        return Inertia::render('Subscription/Index', [
            'isSubscribed' => auth()->user()->subscribed(),
            'plans' => [
                [
                    'id' => 'free',
                    'name' => 'Free',
                    'price' => 0,
                    'features' => ['1 App', 'Watermark included', 'Community Support']
                ],
                [
                    'id' => env('STRIPE_PRICE_BASIC', 'price_basic_id'),
                    'name' => 'Basic',
                    'price' => 10,
                    'features' => ['3 Apps', 'No Watermark', 'Static Components', 'Email Support']
                ],
                [
                    'id' => env('STRIPE_PRICE_PRO', 'price_pro_id'),
                    'name' => 'Pro',
                    'price' => 29,
                    'features' => ['Unlimited Apps', 'Dynamic Data (Lists)', 'Interactive Forms', 'Priority Support']
                ],
                [
                    'id' => env('STRIPE_PRICE_ENTERPRISE', 'price_enterprise_id'),
                    'name' => 'Enterprise',
                    'price' => 99,
                    'features' => ['Custom Branding', 'API Access', 'Dedicated Support', 'SLA']
                ]
            ]
        ]);
    }

    public function checkout(Request $request)
    {
        return $request->user()
            ->newSubscription('default', $request->plan_id)
            ->checkout([
                'success_url' => route('dashboard'),
                'cancel_url' => route('subscription.index'),
            ]);
    }

    public function portal(Request $request)
    {
        return $request->user()->redirectToBillingPortal(route('dashboard'));
    }
}
