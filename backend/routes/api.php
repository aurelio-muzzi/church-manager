<?php

use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\PlatformTenantController;
use App\Http\Controllers\Api\v1\TenantProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health Check público
    Route::get('/health', function () {
        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
        } catch (\Throwable $e) {
            $dbStatus = 'disconnected';
        }

        return response()->json([
            'status' => 'ok',
            'app' => 'ChurchManager API',
            'version' => '1.0.0',
            'environment' => config('app.env'),
            'timezone' => config('app.timezone', 'America/Manaus'),
            'database' => $dbStatus,
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // Autenticação Pública
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Rotas Autenticadas
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/switch-tenant', [AuthController::class, 'switchTenant']);

        // Rotas exclusivas do Administrador da Plataforma (Gerenciamento de Igrejas/Tenants)
        Route::middleware('platform.admin')->prefix('platform')->group(function () {
            Route::get('/tenants', [PlatformTenantController::class, 'index']);
            Route::post('/tenants', [PlatformTenantController::class, 'store']);
            Route::get('/tenants/{tenant}', [PlatformTenantController::class, 'show']);
            Route::patch('/tenants/{tenant}/status', [PlatformTenantController::class, 'updateStatus']);
        });

        // Rotas de Tenant (com isolamento lógico estrito e verificação de suspensão)
        Route::middleware('tenant.identify')->prefix('tenant')->group(function () {
            Route::get('/profile', [TenantProfileController::class, 'show']);
        });
    });
});
