<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!Auth::check() || !$user) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            return redirect()->guest(route('login'));
        }

        if (!$user->isAdmin() && !$user->isSuperAdmin() && !in_array(strtolower($user->role ?? ''), ['admin', 'superadmin'])) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
            }
            return redirect()->route('dashboard')->with('error', 'Unauthorized. Admin access required.');
        }

        return $next($request);
    }
}
