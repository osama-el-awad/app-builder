<?php

namespace Database\Seeders;

use App\Models\App;
use App\Models\AppPage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'test@example.com')->first();
        if (!$user) {
            $user = User::create([
                'name' => 'Admin User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
        }

        // Assign Admin Role
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        $user->assignRole($adminRole);

        $apps = [
            [
                'name' => 'Coffee Shop App',
                'color' => '#8B4513',
                'desc' => 'Order your favorite coffee beans and brews.'
            ],
            [
                'name' => 'Fitness Tracker',
                'color' => '#EF4444',
                'desc' => 'Track your workouts and nutrition.'
            ],
            [
                'name' => 'Portfolio Pro',
                'color' => '#3B82F6',
                'desc' => 'Showcase your work with style.'
            ]
        ];

        foreach ($apps as $appData) {
            $app = App::create([
                'user_id' => $user->id,
                'name' => $appData['name'],
                'settings' => ['primary' => $appData['color']],
                'description' => $appData['desc'],
                'is_public' => true,
                'preview_token' => Str::random(32),
            ]);

            AppPage::create([
                'app_id' => $app->id,
                'name' => 'Home',
            ]);

            \App\Models\AppBuild::create([
                'user_id' => $user->id,
                'app_id' => $app->id,
                'platform' => 'android',
                'status' => 'completed',
                'build_name' => 'Production v1.0.0',
                'workflow' => 'build-android-apk.yml',
                'parameters' => ['version' => '1.0.0'],
                'artifact_url' => 'https://example.com/build.apk',
                'completed_at' => now()->subHours(rand(1, 48)),
            ]);

            \App\Http\Controllers\BackupController::createBackup($app, 'manual');
        }
    }
}
