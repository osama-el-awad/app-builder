<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppBuild extends Model
{
    protected $fillable = [
        'user_id',
        'app_id',
        'platform',
        'status',
        'build_name',
        'workflow',
        'parameters',
        'artifact_url',
        'download_url',
        'log',
        'completed_at',
    ];

    protected $casts = [
        'parameters' => 'array',
        'completed_at' => 'datetime',
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
