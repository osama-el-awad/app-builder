<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppBackup extends Model
{
    protected $fillable = [
        'user_id',
        'app_id',
        'type',
        'frequency',
        'disk',
        'path',
        'size',
        'completed_at',
    ];

    protected $casts = [
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
