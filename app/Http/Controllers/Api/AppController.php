<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App;
use App\Models\AppFormSubmission;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\NotificationController;
use App\Support\Analytics;

class AppController extends Controller
{
    public function show(Request $request, App $app)
    {
        $this->authorizePublicAccess($request, $app);

        $cacheKey = "app_config_{$app->id}";
        
        $data = cache()->remember($cacheKey, now()->addHours(24), function () use ($app) {
            return [
                ...$app->load(['pages' => function ($query) {
                    $query->orderBy('id')->with(['components' => function ($q) {
                        $q->whereNull('parent_id')->with('children')->orderBy('order');
                    }]);
                }])->toArray(),
                'is_premium' => $app->user->subscribed(),
            ];
        });

        return response()->json($data);
    }

    public function submitForm(Request $request, App $app)
    {
        $this->authorizePublicAccess($request, $app);

        $data = $request->except(['_token']);

        AppFormSubmission::create([
            'app_id' => $app->id,
            'payload' => $data,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        // Notify the app owner
        NotificationController::send(
            $app->user,
            'New Form Submission',
            "You received a new message from your app: {$app->name}",
            ['app_id' => $app->id]
        );

        Analytics::conversion('form_submission', $app, null, $request, [
            'fields' => array_keys($data),
        ]);

        return response()->json([
            'message' => 'Form submitted successfully'
        ]);
    }

    private function authorizePublicAccess(Request $request, App $app): void
    {
        $isOwner = $request->user()?->id === $app->user_id;
        $hasToken = $app->preview_token && hash_equals($app->preview_token, (string) $request->query('token'));

        abort_unless($app->is_public || $hasToken || $isOwner, 403);
    }
}
