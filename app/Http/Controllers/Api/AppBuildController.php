<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\BuildFlutterAppJob;
use App\Models\App;
use App\Models\AppBuild;
use App\Support\Analytics;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AppBuildController extends Controller
{
    public function store(Request $request, App $app)
    {
        abort_unless($request->user()?->id === $app->user_id, 403);

        $request->validate([
            'api_base_url' => 'nullable|url|max:2048',
        ]);

        if (!$app->preview_token) {
            $app->update(['preview_token' => Str::random(48)]);
        }

        $parameters = [
            'app_id' => (string) $app->id,
            'api_base_url' => rtrim($request->input('api_base_url', config('app.url')), '/'),
            'preview_token' => $app->is_public ? '' : (string) $app->preview_token,
            'build_name' => Str::slug($app->name ?: 'appbuilder-app'),
        ];

        $build = AppBuild::create([
            'user_id' => $request->user()->id,
            'app_id' => $app->id,
            'platform' => 'android',
            'status' => 'pending',
            'build_name' => $parameters['build_name'],
            'workflow' => 'local-queue',
            'parameters' => $parameters,
        ]);

        BuildFlutterAppJob::dispatch($build->id)->onQueue('builds');

        Analytics::conversion('build_requested', $app, $request->user()->id, $request, [
            'build_id' => $build->id,
            'source' => 'api',
        ]);

        return response()->json([
            'id' => $build->id,
            'status' => $build->status,
            'download_url' => $build->download_url,
        ], 202);
    }
}
