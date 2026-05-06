<?php

namespace App\Http\Controllers;

use App\Models\App;
use App\Support\Analytics;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function share(Request $request, App $app)
    {
        $this->authorize('view', $app);

        $request->validate([
            'channel' => 'nullable|string|max:40',
        ]);

        $channel = $request->input('channel', 'copy');

        $app->increment('shares_count');
        Analytics::track('share', $app, auth()->id(), $request, $channel);

        return response()->json([
            'shares_count' => $app->fresh()->shares_count,
        ]);
    }
}
