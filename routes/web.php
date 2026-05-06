<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AppController;
use App\Http\Controllers\AppBuildController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/demo/playground', [\App\Http\Controllers\DemoController::class, 'playground'])->name('demo.playground');
Route::get('/showcase', [\App\Http\Controllers\ShowcaseController::class, 'index'])->name('showcase.index');
Route::get('/app/{app}/preview/{token?}', [\App\Http\Controllers\PublicAppController::class, 'show'])->name('apps.public.show');
Route::get('/terms', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('legal.privacy');

// Documentation Routes
Route::get('/docs', [\App\Http\Controllers\DocsController::class, 'index'])->name('docs.index');
Route::get('/docs/guide', [\App\Http\Controllers\DocsController::class, 'guide'])->name('docs.guide');
Route::get('/docs/faq', [\App\Http\Controllers\DocsController::class, 'faq'])->name('docs.faq');
Route::get('/docs/api', [\App\Http\Controllers\DocsController::class, 'api'])->name('docs.api');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/showcase/{app}/clone', [\App\Http\Controllers\ShowcaseController::class, 'clone'])->name('showcase.clone');
    Route::get('/dashboard', [AppController::class, 'index'])->name('dashboard');
    
    Route::resource('apps', AppController::class)->except(['index']);
    Route::post('/apps/{app}/share', [AnalyticsController::class, 'share'])->name('apps.share');
    Route::get('/apps/{app}/builds', [AppBuildController::class, 'index'])->name('apps.builds.index');
    Route::post('/apps/{app}/builds', [AppBuildController::class, 'store'])->name('apps.builds.store');
    Route::get('/app-builds/{build}/download', [AppBuildController::class, 'download'])->name('apps.builds.download');
    
    // Subscriptions
    Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
    Route::post('/subscription/checkout', [SubscriptionController::class, 'checkout'])->name('subscription.checkout');
    Route::get('/subscription/portal', [SubscriptionController::class, 'portal'])->name('subscription.portal');

    Route::get('/referrals', [ReferralController::class, 'index'])->name('referrals.index');
    Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');
    Route::post('/backups', [BackupController::class, 'store'])->name('backups.store');
    Route::post('/backups/system', [BackupController::class, 'runSystemBackup'])->name('backups.system');
    Route::get('/backups/{backup}/download', [BackupController::class, 'download'])->name('backups.download');

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\PushNotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/send', [\App\Http\Controllers\PushNotificationController::class, 'send'])->name('notifications.send');
});

// Stripe Webhook (Handled by Cashier)
Route::post('/stripe/webhook', [\Laravel\Cashier\Http\Controllers\WebhookController::class, 'handleWebhook']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
