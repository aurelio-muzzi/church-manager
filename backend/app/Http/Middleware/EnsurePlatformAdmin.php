<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePlatformAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isPlatformAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Acesso restrito ao Administrador da Plataforma.',
            ], 403);
        }

        return $next($request);
    }
}
