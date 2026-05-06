<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppPage extends Model
{
    protected $fillable = ['app_id', 'name', 'layout_json'];

    protected $casts = [
        'layout_json' => 'array',
    ];

    /**
     * Get the app that owns the page.
     */
    public function app()
    {
        return $this->belongsTo(App::class);
    }

    /**
     * Get the components for the page.
     */
    public function components()
    {
        return $this->hasMany(AppComponent::class)->orderBy('order');
    }
}
