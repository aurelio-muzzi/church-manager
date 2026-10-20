<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\ChurchNotice;
use App\Models\Congregation;
use App\Models\Event;
use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Models\Ministry;
use App\Models\PrayerRequest;
use App\Models\Schedule;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProductionAuditTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenantA;
    private Tenant $tenantB;
    private User $userA;
    private User $userB;
    private string $tokenA;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenantA = Tenant::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Igreja Batista Central',
            'slug' => 'batista-central',
            'status' => 'active',
            'timezone' => 'America/Manaus',
        ]);

        $this->tenantB = Tenant::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Comunidade da Fé',
            'slug' => 'comunidade-fe',
            'status' => 'active',
            'timezone' => 'America/Sao_Paulo',
        ]);

        $this->userA = User::create([
            'name' => 'Pastor João Silva',
            'email' => 'joao@batistacentral.local',
            'password' => bcrypt('password123'),
        ]);

        $this->userB = User::create([
            'name' => 'Pastor Carlos Lima',
            'email' => 'carlos@comunidadefe.local',
            'password' => bcrypt('password123'),
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenantA->id,
            'user_id' => $this->userA->id,
            'role' => 'pastor',
            'status' => 'active',
            'is_default' => true,
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenantB->id,
            'user_id' => $this->userB->id,
            'role' => 'pastor',
            'status' => 'active',
            'is_default' => true,
        ]);

        $this->tokenA = $this->userA->createToken('test_token')->plainTextToken;
    }

    public function test_security_headers_are_present_on_all_responses(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200);
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->assertHeader('Content-Security-Policy');

        $this->assertFalse($response->headers->has('X-Powered-By'));
    }

    public function test_system_readiness_endpoint_returns_audit_checklist(): void
    {
        $response = $this->getJson('/api/v1/system/readiness');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'readiness_score',
            'summary' => [
                'total_checks',
                'passed_checks',
                'db_connected',
                'total_tenants',
                'total_members',
                'total_audit_logs',
                'php_version',
                'laravel_version',
                'server_time',
            ],
            'checklist' => [
                '*' => [
                    'category',
                    'name',
                    'status',
                    'detail',
                ],
            ],
        ]);

        $this->assertGreaterThanOrEqual(90, $response->json('readiness_score'));
        $this->assertTrue($response->json('summary.db_connected'));
        $this->assertEquals(2, $response->json('summary.total_tenants'));
    }

    public function test_tenant_can_run_live_isolation_self_audit(): void
    {
        // Seed resources in Tenant A via runWithTenant
        app(TenantContext::class)->runWithTenant($this->tenantA, function () {
            $congA = Congregation::create([
                'tenant_id' => $this->tenantA->id,
                'name' => 'Sede Batista',
                'is_main' => true,
            ]);

            Member::create([
                'tenant_id' => $this->tenantA->id,
                'congregation_id' => $congA->id,
                'name' => 'Lucas Evangelista',
                'membership_status' => 'active',
            ]);
        });

        // Seed resources in Tenant B via runWithTenant
        app(TenantContext::class)->runWithTenant($this->tenantB, function () {
            $congB = Congregation::create([
                'tenant_id' => $this->tenantB->id,
                'name' => 'Sede Comunidade',
                'is_main' => true,
            ]);

            Member::create([
                'tenant_id' => $this->tenantB->id,
                'congregation_id' => $congB->id,
                'name' => 'Membro Infiltrado B',
                'membership_status' => 'active',
            ]);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenA}",
            'X-Tenant-ID' => (string) $this->tenantA->id,
        ])->getJson('/api/v1/tenant/audit/simulate-isolation-test');

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'isolation_passed' => true,
            'audit_details' => [
                'members_verified' => 1,
                'members_leak_detected' => false,
                'foreign_tenant_probe_count' => 0,
            ],
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'tenant_id' => $this->tenantA->id,
            'action' => 'isolation_self_audit_verified',
        ]);
    }

    public function test_strict_cross_tenant_isolation_audit_across_all_modules(): void
    {
        // Seed comprehensive data in Tenant A
        app(TenantContext::class)->runWithTenant($this->tenantA, function () {
            $congA = Congregation::create([
                'tenant_id' => $this->tenantA->id,
                'name' => 'Sede A',
                'is_main' => true,
            ]);
            $memberA = Member::create([
                'tenant_id' => $this->tenantA->id,
                'congregation_id' => $congA->id,
                'name' => 'Membro Tenant A',
                'membership_status' => 'active',
            ]);
            $ministryA = Ministry::create([
                'tenant_id' => $this->tenantA->id,
                'name' => 'Louvor A',
                'color' => '#6366f1',
            ]);
            Schedule::create([
                'tenant_id' => $this->tenantA->id,
                'ministry_id' => $ministryA->id,
                'title' => 'Culto Domingo A',
                'date' => now()->toDateString(),
                'start_time' => '19:00:00',
                'end_time' => '21:00:00',
                'status' => 'published',
            ]);
            Event::create([
                'tenant_id' => $this->tenantA->id,
                'title' => 'Conferência A',
                'slug' => 'conferencia-a',
                'start_date' => now()->toDateString(),
                'start_time' => '19:00:00',
                'status' => 'open',
            ]);
            $accA = FinancialAccount::create([
                'tenant_id' => $this->tenantA->id,
                'name' => 'Caixa A',
                'type' => 'cash',
                'initial_balance' => 1000.00,
                'current_balance' => 1000.00,
            ]);
            $catA = FinancialCategory::create([
                'tenant_id' => $this->tenantA->id,
                'name' => 'Dízimos A',
                'type' => 'income',
            ]);
            FinancialTransaction::create([
                'tenant_id' => $this->tenantA->id,
                'account_id' => $accA->id,
                'category_id' => $catA->id,
                'type' => 'income',
                'amount' => 500.00,
                'transaction_date' => now()->toDateString(),
                'description' => 'Dízimo A',
            ]);
            ChurchNotice::create([
                'tenant_id' => $this->tenantA->id,
                'title' => 'Aviso Oficial A',
                'content' => 'Conteúdo A',
                'category' => 'general',
                'is_pinned' => true,
                'published_at' => now(),
            ]);
            PrayerRequest::create([
                'tenant_id' => $this->tenantA->id,
                'member_id' => $memberA->id,
                'title' => 'Oração A',
                'description' => 'Motivo A',
                'status' => 'pending',
            ]);
        });

        // Seed comprehensive data in Tenant B
        app(TenantContext::class)->runWithTenant($this->tenantB, function () {
            $congB = Congregation::create([
                'tenant_id' => $this->tenantB->id,
                'name' => 'Sede B',
                'is_main' => true,
            ]);
            $memberB = Member::create([
                'tenant_id' => $this->tenantB->id,
                'congregation_id' => $congB->id,
                'name' => 'Membro Tenant B',
                'membership_status' => 'active',
            ]);
            $ministryB = Ministry::create([
                'tenant_id' => $this->tenantB->id,
                'name' => 'Louvor B',
                'color' => '#ef4444',
            ]);
            Schedule::create([
                'tenant_id' => $this->tenantB->id,
                'ministry_id' => $ministryB->id,
                'title' => 'Culto Domingo B',
                'date' => now()->toDateString(),
                'start_time' => '19:00:00',
                'end_time' => '21:00:00',
                'status' => 'published',
            ]);
            Event::create([
                'tenant_id' => $this->tenantB->id,
                'title' => 'Conferência B',
                'slug' => 'conferencia-b',
                'start_date' => now()->toDateString(),
                'start_time' => '19:00:00',
                'status' => 'open',
            ]);
            $accB = FinancialAccount::create([
                'tenant_id' => $this->tenantB->id,
                'name' => 'Caixa B',
                'type' => 'cash',
                'initial_balance' => 2000.00,
                'current_balance' => 2000.00,
            ]);
            $catB = FinancialCategory::create([
                'tenant_id' => $this->tenantB->id,
                'name' => 'Dízimos B',
                'type' => 'income',
            ]);
            FinancialTransaction::create([
                'tenant_id' => $this->tenantB->id,
                'account_id' => $accB->id,
                'category_id' => $catB->id,
                'type' => 'income',
                'amount' => 700.00,
                'transaction_date' => now()->toDateString(),
                'description' => 'Dízimo B',
            ]);
            ChurchNotice::create([
                'tenant_id' => $this->tenantB->id,
                'title' => 'Aviso Oficial B',
                'content' => 'Conteúdo B',
                'category' => 'general',
                'is_pinned' => true,
                'published_at' => now(),
            ]);
            PrayerRequest::create([
                'tenant_id' => $this->tenantB->id,
                'member_id' => $memberB->id,
                'title' => 'Oração B',
                'description' => 'Motivo B',
                'status' => 'pending',
            ]);
        });

        $headers = [
            'Authorization' => "Bearer {$this->tokenA}",
            'X-Tenant-ID' => (string) $this->tenantA->id,
        ];

        // 1. Members endpoint
        $resMembers = $this->withHeaders($headers)->getJson('/api/v1/tenant/members');
        $resMembers->assertStatus(200);
        $membersList = $resMembers->json('data.data') ?? $resMembers->json('data');
        $this->assertTrue(collect($membersList)->contains('name', 'Membro Tenant A'));
        $this->assertFalse(collect($membersList)->contains('name', 'Membro Tenant B'));

        // 2. Ministries endpoint
        $resMinistries = $this->withHeaders($headers)->getJson('/api/v1/tenant/ministries');
        $resMinistries->assertStatus(200);
        $this->assertTrue(collect($resMinistries->json('data'))->contains('name', 'Louvor A'));
        $this->assertFalse(collect($resMinistries->json('data'))->contains('name', 'Louvor B'));

        // 3. Events endpoint
        $resEvents = $this->withHeaders($headers)->getJson('/api/v1/tenant/events');
        $resEvents->assertStatus(200);
        $this->assertTrue(collect($resEvents->json('data'))->contains('title', 'Conferência A'));
        $this->assertFalse(collect($resEvents->json('data'))->contains('title', 'Conferência B'));

        // 4. Financial Accounts endpoint
        $resAcc = $this->withHeaders($headers)->getJson('/api/v1/tenant/financial-accounts');
        $resAcc->assertStatus(200);
        $this->assertTrue(collect($resAcc->json('data'))->contains('name', 'Caixa A'));
        $this->assertFalse(collect($resAcc->json('data'))->contains('name', 'Caixa B'));

        // 5. Dashboard Demographics endpoint
        $resDemo = $this->withHeaders($headers)->getJson('/api/v1/tenant/dashboard/demographics');
        $resDemo->assertStatus(200);
        $this->assertTrue(collect($resDemo->json('data.by_congregation'))->contains('name', 'Sede A'));
        $this->assertFalse(collect($resDemo->json('data.by_congregation'))->contains('name', 'Sede B'));
        $this->assertEquals('Sede A', $resDemo->json('data.by_congregation.0.name'));

        // 6. CSV Export isolation
        $resCsv = $this->withHeaders($headers)->get('/api/v1/tenant/dashboard/export/members');
        $resCsv->assertStatus(200);
        $csvContent = $resCsv->getContent();
        $this->assertStringContainsString('Membro Tenant A', $csvContent);
        $this->assertStringNotContainsString('Membro Tenant B', $csvContent);
    }

    public function test_rate_limiter_throttles_excessive_logins(): void
    {
        // 15 attempts are permitted in 1 minute, the 16th should return 429
        for ($i = 0; $i < 15; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => 'invalido@teste.local',
                'password' => 'wrongpassword',
            ]);
            $response->assertStatus(422);
        }

        $throttledResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'invalido@teste.local',
            'password' => 'wrongpassword',
        ]);

        $throttledResponse->assertStatus(429);
    }
}
