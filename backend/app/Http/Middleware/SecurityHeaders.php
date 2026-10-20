<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request and attach production-grade security headers.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Previne ataques de Clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');

        // Previne MIME sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Proteção contra XSS em navegadores legados
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Política de Referrer segura
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Restringe acesso a recursos sensíveis do dispositivo
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // Previne vazamento de versão do PHP / Servidor
        if (function_exists('header_remove')) {
            @header_remove('X-Powered-By');
        }
        $response->headers->remove('X-Powered-By');

        // Content Security Policy segura para API / SPA
        if (! $response->headers->has('Content-Security-Policy')) {
            $response->headers->set(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http: https: ws: wss:;"
            );
        }

        // HSTS em conexões seguras ou em ambiente de produção
        if ($request->isSecure() || app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return $response;
    }
}
