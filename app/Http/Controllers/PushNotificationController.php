<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\NotificationController;
use App\Models\App;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PushNotificationController extends Controller
{
    public function index()
    {
        return Inertia::render('Notifications/Index', [
            'apps' => auth()->user()->apps()->select('id', 'name')->get(),
        ]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'app_id' => 'required|exists:apps,id',
            'title' => 'required|string|max:100',
            'body' => 'required|string|max:500',
        ]);

        $app = auth()->user()->apps()->findOrFail($request->app_id);
        
        // In a real scenario, you'd send this to all users of this specific app.
        // For this MVP, we notify the app owner as a test of the FCM system.
        NotificationController::send(
            auth()->user(),
            $request->title,
            $request->body,
            ['app_id' => $app->id]
        );

        return back()->with('success', 'Notification sent successfully to your device (Test Mode).');
    }
}
