<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class App extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'platform', 'settings', 'is_public', 'preview_token', 'description', 'thumbnail', 'views_count', 'shares_count', 'clones_count'];

    protected $casts = [
        'settings' => 'array',
        'is_public' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (App $app) {
            $app->preview_token ??= Str::random(48);
        });

        static::updated(fn (App $app) => $app->clearCache());
        static::deleted(fn (App $app) => $app->clearCache());
    }

    public function clearCache(): void
    {
        cache()->forget("app_config_{$this->id}");
    }

    /**
     * Get the user that owns the app.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the pages for the app.
     */
    public function pages()
    {
        return $this->hasMany(AppPage::class);
    }

    public function formSubmissions()
    {
        return $this->hasMany(AppFormSubmission::class);
    }

    public function analyticsEvents()
    {
        return $this->hasMany(AppAnalyticsEvent::class);
    }

    public function builds()
    {
        return $this->hasMany(AppBuild::class);
    }
}
