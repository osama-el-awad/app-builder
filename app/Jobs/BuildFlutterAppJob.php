<?php

namespace App\Jobs;

use App\Models\AppBuild;
use App\Support\Analytics;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class BuildFlutterAppJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 1800;

    public function __construct(public int $buildId)
    {
    }

    public function handle(): void
    {
        $build = AppBuild::findOrFail($this->buildId);
        $build->load(['app.pages' => function ($query) {
            $query->orderBy('id')->with(['components' => function ($q) {
                $q->whereNull('parent_id')->with('children')->orderBy('order');
            }]);
        }]);

        $build->update(['status' => 'building']);

        $workspace = storage_path("app/builds/{$build->id}/project");
        $template = base_path('app-builder-flutter-template');
        $outputDir = storage_path("app/builds/{$build->id}/artifacts");

        File::ensureDirectoryExists(dirname($workspace));
        File::ensureDirectoryExists($outputDir);
        File::copyDirectory($template, $workspace);

        $payload = [
            'build_id' => $build->id,
            'generated_at' => now()->toISOString(),
            'app' => $build->app->toArray(),
        ];
        
        // Ensure assets directory exists in the workspace
        $assetsDir = "{$workspace}/assets";
        File::ensureDirectoryExists($assetsDir);
        File::put("{$assetsDir}/app.json", json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        $parameters = $build->parameters;
        $log = "Prepared Flutter workspace at {$workspace}\n";

        if (!$this->flutterAvailable($workspace)) {
            // Check if we should provide a placeholder APK for demo/exhibition purposes
            if (config('app.env') === 'local' || str_contains(base_path(), 'exhibition')) {
                $log .= "\n[EXHIBITION MODE] Flutter SDK not found. Generating a placeholder APK for demonstration...\n";
                
                $artifactPath = "builds/{$build->id}/app-release-demo.apk";
                $placeholderContent = "This is a placeholder APK generated because Flutter SDK was not found on this machine. In a production environment with Flutter installed, this would be a real Android APK.";
                Storage::disk('local')->put($artifactPath, $placeholderContent);

                $build->update([
                    'status' => 'done',
                    'artifact_url' => $artifactPath,
                    'download_url' => route('apps.builds.download', $build),
                    'log' => $log . "Demo APK generated successfully.\n",
                    'completed_at' => now(),
                ]);

                Analytics::conversion('apk_built_demo', $build->app, $build->user_id, null, [
                    'build_id' => $build->id,
                ]);

                return;
            }

            $projectArchivePath = $this->archiveProject($build, $workspace);
            $build->update([
                'status' => 'done',
                'artifact_url' => $projectArchivePath,
                'download_url' => route('apps.builds.download', $build),
                'log' => $log."Flutter SDK was not found. Generated project archive instead of APK.\n",
                'completed_at' => now(),
            ]);

            Analytics::conversion('build_project_ready', $build->app, $build->user_id, null, [
                'build_id' => $build->id,
            ]);

            return;
        }

        try {
            $platform = $build->platform ?? 'android';
            $this->run(['flutter', 'create', "--platforms={$platform}", '.'], $workspace, $log);
            $this->run(['flutter', 'pub', 'get'], $workspace, $log);
            
            if ($platform === 'android') {
                $this->run([
                    'flutter',
                    'build',
                    'apk',
                    '--release',
                    "--dart-define=API_BASE_URL={$parameters['api_base_url']}",
                    "--dart-define=APP_ID={$parameters['app_id']}",
                    "--dart-define=PREVIEW_TOKEN={$parameters['preview_token']}",
                ], $workspace, $log);

                $apkSource = "{$workspace}/build/app/outputs/flutter-apk/app-release.apk";
                $artifactPath = "builds/{$build->id}/app-release.apk";
                Storage::disk('local')->put($artifactPath, File::get($apkSource));
            } else {
                // iOS Build
                if (PHP_OS_FAMILY !== 'Darwin') {
                    $log .= "\nSkipping local iOS build because this server is not running macOS. Generating project archive instead.\n";
                    $artifactPath = $this->archiveProject($build, $workspace);
                } else {
                    $this->run([
                        'flutter',
                        'build',
                        'ios',
                        '--release',
                        '--no-codesign',
                        "--dart-define=API_BASE_URL={$parameters['api_base_url']}",
                        "--dart-define=APP_ID={$parameters['app_id']}",
                        "--dart-define=PREVIEW_TOKEN={$parameters['preview_token']}",
                    ], $workspace, $log);

                    $artifactPath = "builds/{$build->id}/ios-build.zip";
                    $this->archiveIosBuild($workspace, storage_path("app/{$artifactPath}"));
                }
            }

            $build->update([
                'status' => 'done',
                'artifact_url' => $artifactPath,
                'download_url' => route('apps.builds.download', $build),
                'log' => $log,
                'completed_at' => now(),
            ]);

            Analytics::conversion($platform === 'android' ? 'apk_built' : 'ios_project_ready', $build->app, $build->user_id, null, [
                'build_id' => $build->id,
            ]);
        } catch (\Throwable $exception) {
            $build->update([
                'status' => 'failed',
                'log' => $log."\n".$exception->getMessage(),
                'completed_at' => now(),
            ]);

            throw $exception;
        }
    }

    private function flutterAvailable(string $cwd): bool
    {
        $process = new Process(['flutter', '--version'], $cwd);
        $process->setTimeout(30);
        $process->run();

        return $process->isSuccessful();
    }

    private function run(array $command, string $cwd, string &$log): void
    {
        $process = new Process($command, $cwd);
        $process->setTimeout($this->timeout);
        $process->run(function ($type, $buffer) use (&$log) {
            $log .= $buffer;
        });

        if (!$process->isSuccessful()) {
            throw new \RuntimeException($process->getErrorOutput() ?: $process->getOutput());
        }
    }

    private function archiveIosBuild(string $workspace, string $absoluteArchivePath): void
    {
        $iosBuildPath = "{$workspace}/build/ios/iphoneos";
        File::ensureDirectoryExists(dirname($absoluteArchivePath));

        $zip = new \ZipArchive();
        if ($zip->open($absoluteArchivePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Unable to create iOS build archive.');
        }

        if (File::exists($iosBuildPath)) {
            foreach (File::allFiles($iosBuildPath) as $file) {
                $zip->addFile($file->getRealPath(), $file->getRelativePathname());
            }
        } else {
            // Fallback: zip the whole build dir if specific path not found
            foreach (File::allFiles("{$workspace}/build") as $file) {
                $zip->addFile($file->getRealPath(), $file->getRelativePathname());
            }
        }

        $zip->close();
    }

    private function archiveProject(AppBuild $build, string $workspace): string
    {
        $archivePath = "builds/{$build->id}/flutter-project.zip";
        $absoluteArchivePath = storage_path("app/{$archivePath}");
        File::ensureDirectoryExists(dirname($absoluteArchivePath));

        $zip = new \ZipArchive();
        if ($zip->open($absoluteArchivePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Unable to create Flutter project archive.');
        }

        foreach (File::allFiles($workspace) as $file) {
            $zip->addFile($file->getRealPath(), $file->getRelativePathname());
        }

        $zip->close();

        return $archivePath;
    }
}
