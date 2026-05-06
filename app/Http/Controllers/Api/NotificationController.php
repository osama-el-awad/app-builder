<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class NotificationController extends Controller
{
    public function updateToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        auth()->user()->update([
            'fcm_token' => $request->token
        ]);

        return response()->json([
            'message' => 'Token updated successfully'
        ]);
    }

    public static function send($user, $title, $body, $data = [])
    {
        if (!$user->fcm_token) {
            return;
        }

        $messaging = app('firebase.messaging');
        
        $message = CloudMessage::withTarget('token', $user->fcm_token)
            ->withNotification(Notification::create($title, $body))
            ->withData($data);

        try {
            $messaging->send($message);
        } catch (\Exception $e) {
            \Log::error('FCM Error: ' . $e->getMessage());
        }
    }
}
