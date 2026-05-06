<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppAnalyticsEvent extends Model
{
    protected $fillable = [
        'app_id',
        'user_id',
        'event',
        'channel',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function app()
    {
        return $this->belongsTo(App::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
