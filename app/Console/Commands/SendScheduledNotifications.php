<?php

namespace App\Console\Commands;

use App\Models\PushNotification;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Console\Command;

class SendScheduledNotifications extends Command
{
    protected $signature = 'notifications:send-scheduled';
    protected $description = 'Send push notifications that are scheduled for the current time';

    public function handle()
    {
        $notifications = PushNotification::where('status', 'pending')
            ->where('scheduled_at', '<=', now())
            ->get();

        if ($notifications->isEmpty()) {
            $this->info('No scheduled notifications to send.');
            return;
        }

        foreach ($notifications as $notification) {
            $notification->update(['status' => 'sending']);

            try {
                // In a production environment, you would iterate through app users 
                // based on the segment (e.g., all, premium, etc.)
                // For this MVP, we simulate sending by notifying the owner or a target list.
                
                NotificationController::send(
                    $notification->user, // Simulating sending to the relevant audience
                    $notification->title,
                    $notification->body,
                    ['app_id' => $notification->app_id, 'segment' => $notification->segment]
                );

                $notification->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                $this->info("Sent notification ID: {$notification->id}");
            } catch (\Exception $e) {
                $notification->update([
                    'status' => 'failed',
                    'error_log' => $e->getMessage(),
                ]);

                $this->error("Failed to send notification ID: {$notification->id}");
            }
        }
    }
}
