<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && !$request->user()->subscribed()) {
            return redirect()->route('subscription.index')->with('error', 'You need a subscription to access this feature.');
        }

        return $next($request);
    }
}
