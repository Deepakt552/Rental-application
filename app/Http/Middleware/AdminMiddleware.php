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

        if (!$user->isAdmin() && !$user->isSuperAdmin() && !$user->isPropertyManager() && !in_array(strtolower($user->role ?? ''), ['admin', 'superadmin', 'property_manager'])) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
            }
            return redirect()->route('dashboard')->with('error', 'Unauthorized. Admin access required.');
        }

        // Property Manager role can only access Applications and Payments
        if ($user->isPropertyManager() || $user->role === 'property_manager') {
            if ($request->is('admin/users*') || 
                $request->is('admin/email-logs*') || 
                $request->is('admin/settings*') || 
                $request->is('admin/properties*')) {
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json(['message' => 'Unauthorized. Property Managers cannot access this section.'], 403);
                }
                return redirect()->route('admin.applications.index')->with('error', 'Unauthorized. Property Managers can only access Applications and Payments for assigned properties.');
            }

            if ($request->is('admin/dashboard') || $request->routeIs('admin.dashboard')) {
                return redirect()->route('admin.applications.index');
            }
        }

        return $next($request);
    }
}
