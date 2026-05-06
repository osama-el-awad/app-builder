<?php

namespace App\Console\Commands;

use App\Http\Controllers\BackupController;
use App\Models\App;
use Illuminate\Console\Command;

class BackupAppsCommand extends Command
{
    protected $signature = 'apps:backup {--frequency=daily : Backup frequency label: daily or weekly}';

    protected $description = 'Export all user apps to JSON backups.';

    public function handle(): int
    {
        $frequency = (string) $this->option('frequency');
        $count = 0;

        App::query()->with('user')->chunkById(100, function ($apps) use (&$count, $frequency) {
            foreach ($apps as $app) {
                BackupController::createBackup($app, 'scheduled', $frequency);
                $count++;
            }
        });

        $this->info("Created {$count} {$frequency} app backups.");

        return self::SUCCESS;
    }
}
