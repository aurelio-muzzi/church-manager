<?php

namespace App\Providers;

use App\Services\TenantContext;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(TenantContext::class, function () {
            return new TenantContext();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate Limiter para API geral
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        // Rate Limiter estrito para rotas de autenticação (proteção contra brute-force)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(15)->by($request->ip());
        });

        // Rate Limiter para check-in e autoatendimento
        RateLimiter::for('checkin', function (Request $request) {
            return Limit::perMinute(40)->by($request->ip());
        });

        // Alerta de Lazy Loading não otimizado em ambiente local/testes
        Model::preventLazyLoading(! $this->app->isProduction());
    }
}
