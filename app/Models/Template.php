<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    protected $fillable = ['name', 'description', 'thumbnail', 'structure', 'default_settings'];

    protected $casts = [
        'structure' => 'array',
        'default_settings' => 'array',
    ];
}
