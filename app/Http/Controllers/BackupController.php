<?php

namespace App\Http\Controllers;

use App\Models\App;
use App\Models\AppBackup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BackupController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // System backups are only for admins (simple check)
        $systemBackups = [];
        if ($user->hasRole('admin') || $user->email === 'admin@example.com') {
            $systemBackups = collect(Storage::disk('local')->allFiles('Laravel'))
                ->map(fn($file) => [
                    'name' => basename($file),
                    'path' => $file,
                    'size' => Storage::disk('local')->size($file),
                    'date' => date('Y-m-d H:i:s', Storage::disk('local')->lastModified($file)),
                ])->reverse()->values();
        }

        return Inertia::render('Backups/Index', [
            'apps' => $user->apps()->select('id', 'name', 'platform')->orderBy('name')->get(),
            'backups' => $user->backups()->with('app:id,name')->latest()->get(),
            'systemBackups' => $systemBackups,
        ]);
    }

    public function runSystemBackup()
    {
        abort_unless(auth()->user()->hasRole('admin') || auth()->user()->email === 'admin@example.com', 403);

        \Illuminate\Support\Facades\Artisan::call('backup:run');

        return back()->with('success', 'System backup started in the background.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'app_id' => 'required|exists:apps,id',
            'frequency' => 'nullable|in:manual,daily,weekly',
        ]);

        $app = auth()->user()->apps()->findOrFail($request->app_id);
        $backup = $this->createBackup($app, 'manual', $request->frequency);

        return back()->with('success', "Backup created for {$app->name} ({$backup->size} bytes).");
    }

    public function download(AppBackup $backup)
    {
        abort_unless($backup->user_id === auth()->id(), 403);
        abort_unless(Storage::disk($backup->disk)->exists($backup->path), 404);

        return Storage::disk($backup->disk)->download($backup->path, basename($backup->path));
    }

    public static function createBackup(App $app, string $type = 'manual', ?string $frequency = null): AppBackup
    {
        $app->load(['pages.components', 'formSubmissions']);

        $payload = [
            'exported_at' => now()->toISOString(),
            'schema_version' => 1,
            'app' => $app->toArray(),
        ];

        $path = sprintf(
            'backups/users/%d/apps/%d/%s.json',
            $app->user_id,
            $app->id,
            now()->format('Ymd_His')
        );

        $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        Storage::disk('local')->put($path, $json);

        return AppBackup::create([
            'user_id' => $app->user_id,
            'app_id' => $app->id,
            'type' => $type,
            'frequency' => $frequency,
            'disk' => 'local',
            'path' => $path,
            'size' => strlen($json),
            'completed_at' => now(),
        ]);
    }
}
