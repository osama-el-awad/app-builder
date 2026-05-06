<?php

namespace App\Support;

use App\Models\App;
use App\Models\AppAnalyticsEvent;
use Illuminate\Http\Request;

class Analytics
{
    public static function track(
        string $event,
        ?App $app = null,
        ?int $userId = null,
        ?Request $request = null,
        ?string $channel = null,
        array $metadata = []
    ): AppAnalyticsEvent {
        return AppAnalyticsEvent::create([
            'app_id' => $app?->id,
            'user_id' => $userId,
            'event' => $event,
            'channel' => $channel,
            'metadata' => $metadata ?: null,
            'ip_address' => $request?->ip(),
            'user_agent' => $request ? substr((string) $request->userAgent(), 0, 255) : null,
        ]);
    }

    public static function conversion(
        string $step,
        ?App $app = null,
        ?int $userId = null,
        ?Request $request = null,
        array $metadata = []
    ): AppAnalyticsEvent {
        return self::track('conversion', $app, $userId, $request, $step, [
            'step' => $step,
            ...$metadata,
        ]);
    }
}
