<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppComponent extends Model
{
    protected $fillable = ['app_page_id', 'parent_id', 'type', 'config', 'order'];

    protected $casts = [
        'config' => 'array',
    ];

    /**
     * Get the page that owns the component.
     */
    public function page()
    {
        return $this->belongsTo(AppPage::class, 'app_page_id');
    }

    /**
     * Get the parent component.
     */
    public function parent()
    {
        return $this->belongsTo(AppComponent::class, 'parent_id');
    }

    /**
     * Get the child components.
     */
    public function children()
    {
        return $this->hasMany(AppComponent::class, 'parent_id')->with('children')->orderBy('order');
    }
}
