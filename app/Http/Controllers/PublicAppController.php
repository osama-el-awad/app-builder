<?php

namespace App\Http\Controllers;

use App\Models\App;
use App\Support\Analytics;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicAppController extends Controller
{
    public function show(Request $request, App $app, ?string $token = null)
    {
        $providedToken = $token ?: $request->query('token');
        $isOwner = $request->user()?->id === $app->user_id;
        $hasToken = $app->preview_token && hash_equals($app->preview_token, (string) $providedToken);

        abort_unless($app->is_public || $hasToken || $isOwner, 403);

        if (!$isOwner) {
            $app->increment('views_count');
            Analytics::track('view', $app, $request->user()?->id, $request, $app->is_public ? 'public' : 'token');
        }
        
        return Inertia::render('Apps/PublicPreview', [
            'app' => $app->load(['pages' => function ($query) {
                $query->orderBy('id')->with(['components' => function ($q) {
                    $q->whereNull('parent_id')->with('children')->orderBy('order');
                }]);
            }]),
            'author' => $app->user->name
        ]);
    }
}
