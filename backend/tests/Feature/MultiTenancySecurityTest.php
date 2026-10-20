<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MultiTenancySecurityTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenantA;
    protected Tenant $tenantB;
    protected User $userTenantA;
    protected User $userTenantB;
    protected User $platformAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Tenant A
        $this->tenantA = Tenant::create([
            'name' => 'Igreja Alpha',
            'slug' => 'igreja-alpha',
            'status' => 'active',
        ]);

        $this->userTenantA = User::create([
            'name' => 'Pastor Alpha',
            'email' => 'pastor@alpha.local',
            'password' => Hash::make('Secret@123456'),
            'status' => 'active',
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenantA->id,
            'user_id' => $this->userTenantA->id,
            'role' => 'church_admin',
            'is_default' => true,
            'status' => 'active',
        ]);

        // 2. Tenant B
        $this->tenantB = Tenant::create([
            'name' => 'Igreja Beta',
            'slug' => 'igreja-beta',
            'status' => 'active',
        ]);

        $this->userTenantB = User::create([
            'name' => 'Pastor Beta',
            'email' => 'pastor@beta.local',
            'password' => Hash::make('Secret@123456'),
            'status' => 'active',
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenantB->id,
            'user_id' => $this->userTenantB->id,
            'role' => 'church_admin',
            'is_default' => true,
            'status' => 'active',
        ]);

        // 3. Platform Admin
        $this->platformAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@platform.local',
            'password' => Hash::make('Secret@123456'),
            'is_platform_admin' => true,
            'status' => 'active',
        ]);
    }

    public function test_user_of_tenant_a_cannot_access_tenant_b_resources(): void
    {
        $token = $this->userTenantA->createToken('token-a')->plainTextToken;

        // Tenta acessar dados forçando o header da Igreja Beta (Tenant B)
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'X-Tenant-ID' => $this->tenantB->id,
        ])->getJson('/api/v1/tenant/profile');

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'Você não possui permissão para acessar esta igreja.',
            ]);
    }

    public function test_user_of_tenant_a_can_access_own_tenant_profile(): void
    {
        $token = $this->userTenantA->createToken('token-a')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/tenant/profile');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'id' => $this->tenantA->id,
                    'name' => 'Igreja Alpha',
                    'slug' => 'igreja-alpha',
                ],
            ]);
    }

    public function test_regular_user_cannot_access_platform_admin_routes(): void
    {
        $token = $this->userTenantA->createToken('token-a')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/platform/tenants');

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'Acesso restrito ao Administrador da Plataforma.',
            ]);
    }

    public function test_platform_admin_can_create_new_church_with_admin(): void
    {
        $token = $this->platformAdmin->createToken('admin-token')->plainTextToken;

        $payload = [
            'name' => 'Nova Igreja da Graça',
            'slug' => 'nova-igreja-graca',
            'document_number' => '11.222.333/0001-44',
            'admin_name' => 'Pastor Lucas',
            'admin_email' => 'pastor.lucas@graca.local',
            'admin_password' => 'SenhaForte@987',
        ];

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/platform/tenants', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'name' => 'Nova Igreja da Graça',
                    'slug' => 'nova-igreja-graca',
                ],
            ]);

        $this->assertDatabaseHas('tenants', ['slug' => 'nova-igreja-graca']);
        $this->assertDatabaseHas('users', ['email' => 'pastor.lucas@graca.local']);

        // Verifica log de auditoria
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'tenant.created',
        ]);
    }

    public function test_platform_admin_can_suspend_and_reactivate_church(): void
    {
        $token = $this->platformAdmin->createToken('admin-token')->plainTextToken;

        // Suspender
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/platform/tenants/{$this->tenantA->id}/status", [
                'status' => 'suspended',
                'reason' => 'Inadimplência ou solicitação judicial',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'status' => 'suspended',
                ],
            ]);

        $this->tenantA->refresh();
        $this->assertTrue($this->tenantA->isSuspended());

        // Usuário do Tenant A tenta acessar após suspensão -> deve receber 403
        auth()->forgetGuards();
        $userToken = $this->userTenantA->createToken('token-a')->plainTextToken;
        $blockedResponse = $this->withHeader('Authorization', "Bearer {$userToken}")
            ->getJson('/api/v1/tenant/profile');

        $blockedResponse->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'O acesso desta igreja está suspenso.',
            ]);


        // Reativar
        auth()->forgetGuards();
        $reactivateResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/platform/tenants/{$this->tenantA->id}/status", [
                'status' => 'active',
            ]);


        $reactivateResponse->assertStatus(200);
        $this->tenantA->refresh();
        $this->assertTrue($this->tenantA->isActive());
    }

    public function test_passwords_are_redacted_in_audit_logs(): void
    {
        $token = $this->platformAdmin->createToken('admin-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/platform/tenants', [
                'name' => 'Igreja Segurança',
                'slug' => 'igreja-seguranca',
                'admin_name' => 'Pastor Seguro',
                'admin_email' => 'seguro@igreja.local',
                'admin_password' => 'MinhaSenhaUltraSecreta!99',
            ]);

        $auditLog = AuditLog::where('action', 'tenant.created')->latest('id')->first();
        $this->assertNotNull($auditLog);
        $this->assertStringNotContainsString('MinhaSenhaUltraSecreta!99', json_encode($auditLog->new_values));
    }
}
