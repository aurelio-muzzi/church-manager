<?php

use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\Event\EventController;
use App\Http\Controllers\Api\v1\Financial\FinancialAccountController;
use App\Http\Controllers\Api\v1\Financial\FinancialCategoryController;
use App\Http\Controllers\Api\v1\Financial\FinancialReportController;
use App\Http\Controllers\Api\v1\Financial\FinancialTransactionController;
use App\Http\Controllers\Api\v1\PlatformTenantController;
use App\Http\Controllers\Api\v1\Ministry\MinistryController;
use App\Http\Controllers\Api\v1\Ministry\ScheduleController;
use App\Http\Controllers\Api\v1\Portal\MemberPortalController;
use App\Http\Controllers\Api\v1\Secretary\CongregationController;
use App\Http\Controllers\Api\v1\Secretary\FamilyController;
use App\Http\Controllers\Api\v1\Secretary\MemberChangeRequestController;
use App\Http\Controllers\Api\v1\Secretary\MemberController;
use App\Http\Controllers\Api\v1\Secretary\VisitorController;
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

        // Rotas exclusivas do Administrador da Plataforma (Gerenciamento Global de Igrejas)
        Route::middleware('platform.admin')->prefix('platform')->group(function () {
            Route::get('/tenants', [PlatformTenantController::class, 'index']);
            Route::post('/tenants', [PlatformTenantController::class, 'store']);
            Route::get('/tenants/{tenant}', [PlatformTenantController::class, 'show']);
            Route::patch('/tenants/{tenant}/status', [PlatformTenantController::class, 'updateStatus']);
        });

        // Rotas de Tenant (Isolamento Lógico por Tenant)
        Route::middleware('tenant.identify')->prefix('tenant')->group(function () {
            // Perfil da Igreja
            Route::get('/profile', [TenantProfileController::class, 'show']);

            // Módulo de Secretaria (Membros, Famílias, Visitantes, Congregações, Aprovações)
            Route::apiResource('congregations', CongregationController::class);
            Route::apiResource('members', MemberController::class);
            Route::apiResource('families', FamilyController::class);

            // Visitantes
            Route::get('/visitors', [VisitorController::class, 'index']);
            Route::post('/visitors', [VisitorController::class, 'store']);
            Route::post('/visitors/{visitor}/visits', [VisitorController::class, 'recordVisit']);
            Route::post('/visitors/{visitor}/convert-to-member', [VisitorController::class, 'convertToMember']);

            // Solicitações de Alteração Cadastral
            Route::get('/change-requests', [MemberChangeRequestController::class, 'index']);
            Route::post('/change-requests', [MemberChangeRequestController::class, 'store']);
            Route::post('/change-requests/{changeRequest}/review', [MemberChangeRequestController::class, 'review'])
                ->middleware('tenant.role:church_admin,secretary');

            // Módulo de Ministérios e Escalas de Voluntários
            Route::apiResource('ministries', MinistryController::class);
            Route::post('/ministries/{ministry}/volunteers', [MinistryController::class, 'addVolunteer']);
            Route::delete('/ministries/{ministry}/volunteers/{ministryVolunteer}', [MinistryController::class, 'removeVolunteer']);

            Route::post('/schedules/check-conflicts', [ScheduleController::class, 'checkConflicts']);
            Route::apiResource('schedules', ScheduleController::class);
            Route::post('/schedules/{schedule}/respond', [ScheduleController::class, 'respond']);
            Route::post('/schedules/{schedule}/volunteers/{scheduleVolunteer}/respond', [ScheduleController::class, 'respond']);

            // Módulo de Eventos, Inscrições e Presença (Check-in via QR Code e Manual)
            Route::apiResource('events', EventController::class);
            Route::get('/events/{event}/registrations', [EventController::class, 'registrations']);
            Route::post('/events/{event}/registrations', [EventController::class, 'register']);
            Route::post('/events/{event}/check-in', [EventController::class, 'checkIn']);
            Route::get('/events/{event}/stats', [EventController::class, 'stats']);

            // Módulo Financeiro Avançado (Contas, Caixas, Plano de Contas, Lançamentos, Conciliação, Orçamentos)
            Route::apiResource('financial-accounts', FinancialAccountController::class);
            Route::apiResource('financial-categories', FinancialCategoryController::class);
            Route::apiResource('financial-transactions', FinancialTransactionController::class);
            Route::post('/financial-transactions/{financialTransaction}/reconcile', [FinancialTransactionController::class, 'reconcile']);

            Route::get('/financial-reports/summary', [FinancialReportController::class, 'summary']);
            Route::get('/financial-reports/member-contributions/{member}', [FinancialReportController::class, 'memberContributions']);
            Route::get('/financial-budgets', [FinancialReportController::class, 'budgets']);
            Route::post('/financial-budgets', [FinancialReportController::class, 'storeBudget']);

            // Portal do Membro (Área restrita de autoatendimento, escalas, eventos, oração e avisos)
            Route::prefix('member-portal')->group(function () {
                Route::get('/dashboard', [MemberPortalController::class, 'dashboard']);
                Route::get('/profile', [MemberPortalController::class, 'profile']);
                Route::post('/profile/update-request', [MemberPortalController::class, 'requestProfileUpdate']);
                Route::get('/schedules', [MemberPortalController::class, 'schedules']);
                Route::post('/schedules/{scheduleVolunteer}/respond', [MemberPortalController::class, 'respondSchedule']);
                Route::get('/events', [MemberPortalController::class, 'events']);
                Route::post('/events/{event}/register', [MemberPortalController::class, 'registerEvent']);
                Route::get('/contributions', [MemberPortalController::class, 'contributions']);
                Route::get('/prayer-requests', [MemberPortalController::class, 'prayerRequests']);
                Route::post('/prayer-requests', [MemberPortalController::class, 'storePrayerRequest']);
                Route::get('/notices', [MemberPortalController::class, 'notices']);
            });
        });
    });
});
