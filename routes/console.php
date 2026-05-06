<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('apps:backup --frequency=daily')->dailyAt('02:00');
Schedule::command('apps:backup --frequency=weekly')->weeklyOn(1, '03:00');

// System-wide backups (Database & Files)
Schedule::command('backup:run')->daily()->at('01:00');
Schedule::command('backup:clean')->daily()->at('01:30');
