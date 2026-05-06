<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Cashier\Billable;
use Laravel\Sanctum\HasApiTokens;

use App\Traits\HasSegmentation;

use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, Billable, HasSegmentation, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'referral_code',
        'referred_by_id',
        'referral_bonus_cents',
        'password',
        'fcm_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            $user->referral_code ??= static::generateReferralCode();
        });
    }

    public static function generateReferralCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Get the apps for the user.
     */
    public function apps()
    {
        return $this->hasMany(App::class);
    }

    public function referrals()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referredBy()
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    public function backups()
    {
        return $this->hasMany(AppBackup::class);
    }

    public function analyticsEvents()
    {
        return $this->hasMany(AppAnalyticsEvent::class);
    }

    public function builds()
    {
        return $this->hasMany(AppBuild::class);
    }

    public function isBasic()
    {
        return $this->subscribedToPrice(env('STRIPE_PRICE_BASIC', 'price_basic_id'), 'default');
    }

    public function isPro()
    {
        return $this->subscribedToPrice(env('STRIPE_PRICE_PRO', 'price_pro_id'), 'default') || $this->isEnterprise();
    }

    public function isEnterprise()
    {
        return $this->subscribedToPrice(env('STRIPE_PRICE_ENTERPRISE', 'price_enterprise_id'), 'default');
    }
}
