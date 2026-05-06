<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ReferralController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('Referrals/Index', [
            'referralCode' => $user->referral_code,
            'referralUrl' => route('register', ['ref' => $user->referral_code]),
            'bonusCents' => $user->referral_bonus_cents,
            'referrals' => $user->referrals()
                ->with('referredUser:id,name,email,created_at')
                ->latest()
                ->get(),
        ]);
    }
}
