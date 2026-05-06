<?php

use App\Http\Controllers\Api\AppController;
use App\Http\Controllers\Api\AppBuildController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/fcm-token', [\App\Http\Controllers\Api\NotificationController::class, 'updateToken']);
    Route::post('/apps/{app}/build', [AppBuildController::class, 'store']);
});

Route::get('/app/{app}', [AppController::class, 'show']);
Route::post('/app/{app}/submit', [AppController::class, 'submitForm']);
