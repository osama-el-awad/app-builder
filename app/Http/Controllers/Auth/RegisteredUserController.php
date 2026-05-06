<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use App\Support\Analytics;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Register', [
            'referralCode' => $request->query('ref', ''),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->filled('referral_code')) {
            $request->merge(['referral_code' => strtoupper($request->referral_code)]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'referral_code' => ['nullable', 'string', Rule::exists('users', 'referral_code')],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $referrer = $request->filled('referral_code')
            ? User::where('referral_code', strtoupper($request->referral_code))->first()
            : null;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'referred_by_id' => $referrer?->id,
            'password' => Hash::make($request->password),
        ]);

        if ($referrer && $referrer->id !== $user->id) {
            $referrerBonus = 1000;
            $referredBonus = 500;

            \App\Models\Referral::create([
                'referrer_id' => $referrer->id,
                'referred_user_id' => $user->id,
                'code' => $referrer->referral_code,
                'referrer_bonus_cents' => $referrerBonus,
                'referred_bonus_cents' => $referredBonus,
                'status' => 'credited',
            ]);

            $referrer->increment('referral_bonus_cents', $referrerBonus);
            $user->increment('referral_bonus_cents', $referredBonus);
        }

        event(new Registered($user));

        Analytics::conversion('registered', null, $user->id, $request, [
            'referred_by_id' => $referrer?->id,
        ]);

        Auth::login($user);

        return redirect(route('apps.create', absolute: false));
    }
}
