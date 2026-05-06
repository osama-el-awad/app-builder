<?php

namespace App\Http\Controllers;

use App\Models\App;
use App\Models\AppBuild;
use App\Jobs\BuildFlutterAppJob;
use App\Support\Analytics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AppBuildController extends Controller
{
    public function index(App $app)
    {
        $this->authorize('view', $app);

        $apiBaseUrl = config('app.url');
        $parameters = $this->parametersFor($app, $apiBaseUrl);

        return Inertia::render('Apps/Builds', [
            'app' => $app,
            'apiBaseUrl' => $apiBaseUrl,
            'defaultParameters' => $parameters,
            'workflowCommand' => $this->workflowCommand($parameters, 'android'),
            'workflowCommandIos' => $this->workflowCommand($parameters, 'ios'),
            'builds' => $app->builds()->latest()->get(),
        ]);
    }

    public function store(Request $request, App $app)
    {
        $this->authorize('update', $app);

        $request->validate([
            'api_base_url' => 'required|url|max:2048',
            'platform' => 'required|in:android,ios',
        ]);

        if (!$app->preview_token) {
            $app->update(['preview_token' => Str::random(48)]);
        }

        $parameters = $this->parametersFor($app, $request->api_base_url);

        $build = AppBuild::create([
            'user_id' => auth()->id(),
            'app_id' => $app->id,
            'platform' => $request->platform,
            'status' => 'pending',
            'build_name' => $parameters['build_name'],
            'workflow' => 'local-queue',
            'parameters' => $parameters,
        ]);

        BuildFlutterAppJob::dispatch($build->id)->onQueue('builds');

        Analytics::conversion('build_requested', $app, auth()->id(), $request, [
            'build_id' => $build->id,
            'platform' => $request->platform,
            'source' => 'web',
        ]);

        return back()->with('success', ucfirst($request->platform) . ' build request queued. The queue job will produce an artifact when Flutter and the platform tools are available, or a Flutter project archive otherwise.');
    }

    public function download(AppBuild $build)
    {
        abort_unless($build->user_id === auth()->id(), 403);
        abort_unless($build->artifact_url && Storage::disk('local')->exists($build->artifact_url), 404);

        return Storage::disk('local')->download($build->artifact_url);
    }

    private function parametersFor(App $app, string $apiBaseUrl): array
    {
        return [
            'app_id' => (string) $app->id,
            'api_base_url' => rtrim($apiBaseUrl, '/'),
            'preview_token' => $app->is_public ? '' : (string) $app->preview_token,
            'build_name' => Str::slug($app->name ?: 'appbuilder-app'),
        ];
    }

    private function workflowCommand(array $parameters, string $platform = 'android'): string
    {
        $workflow = $platform === 'ios' ? 'build-ios-ipa.yml' : 'build-android-apk.yml';
        
        return sprintf(
            'gh workflow run %s -f app_id=%s -f api_base_url=%s -f preview_token=%s -f build_name=%s',
            $workflow,
            escapeshellarg($parameters['app_id']),
            escapeshellarg($parameters['api_base_url']),
            escapeshellarg($parameters['preview_token']),
            escapeshellarg($parameters['build_name'])
        );
    }
}
