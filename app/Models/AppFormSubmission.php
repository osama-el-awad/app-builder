<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppFormSubmission extends Model
{
    protected $fillable = [
        'app_id',
        'payload',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function app()
    {
        return $this->belongsTo(App::class);
    }
}
