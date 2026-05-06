<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

trait HasSegmentation
{
    /**
     * Scope a query to include users based on a segment.
     */
    public function scopeSegment(Builder $query, string $segment): void
    {
        switch ($segment) {
            case 'premium':
                $query->whereHas('subscriptions', function ($q) {
                    $q->active();
                });
                break;

            case 'active_last_7d':
                $query->where('last_login_at', '>=', now()->subDays(7));
                break;

            case 'new_this_month':
                $query->where('created_at', '>=', now()->startOfMonth());
                break;

            default:
                // 'all' or fallback
                break;
        }
    }
}
