<?php

namespace Tests\Feature;

use App\Models\Congregation;
use App\Models\Member;
use App\Models\MemberChangeRequest;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Models\Visitor;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SecretaryTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenantA;
    protected Tenant $tenantB;
    protected User $pastorA;
    protected User $pastorB;
    protected User $memberUserA;

    protected function setUp(): void
    {
        parent::setUp();

        // Tenant A
        $this->tenantA = Tenant::create([
            'name' => 'Igreja Alpha',
            'slug' => 'igreja-alpha',
            'status' => 'active',
        ]);

        $this->pastorA = User::create([
            'name' => 'Pastor Alpha',
            'email' => 'pastor@alpha.local',
            'password' => Hash::make('Secret@123456'),
            'status' => 'active',
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenantA->id,
            'user_id' => $this->pastorA->id,
            'role' => 'church_admin',
            'is_default' => true,
            'status' => 'active',
        ]);

        $this->memberUserA = User::create([
            'name' => 'Membro Alpha',
            'email' => 'membro@alpha.local',
            'password' => Hash::make('Secret@123456'),
            'status' => 'active',
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenantA->id,
            'user_id' => $this->memberUserA->id,
            'role' => 'member',
            'is_default' => true,
            'status' => 'active',
        ]);

        // Tenant B
        $this->tenantB = Tenant::create([
            'name' => 'Igreja Beta',
            'slug' => 'igreja-beta',
            'status' => 'active',
        ]);

        $this->pastorB = User::create([
            'name' => 'Pastor Beta',
            'email' => 'pastor@beta.local',
            'password' => Hash::make('Secret@123456'),
            'status' => 'active',
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenantB->id,
            'user_id' => $this->pastorB->id,
            'role' => 'church_admin',
            'is_default' => true,
            'status' => 'active',
        ]);
    }

    public function test_can_create_and_list_congregations(): void
    {
        $token = $this->pastorA->createToken('token')->plainTextToken;

        // Criar congregação
        $createResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/tenant/congregations', [
                'name' => 'Congregação Jardim',
                'city' => 'Manaus',
                'state' => 'AM',
                'is_main' => true,
            ]);

        $createResponse->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'name' => 'Congregação Jardim',
                    'tenant_id' => $this->tenantA->id,
                ],
            ]);

        // Listar congregações
        $listResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/tenant/congregations');

        $listResponse->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_can_create_member_with_automatic_is_minor_calculation(): void
    {
        $token = $this->pastorA->createToken('token')->plainTextToken;

        // Membro adulto (nascido em 1990)
        $adultResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/tenant/members', [
                'name' => 'Gabriel Adulto',
                'birth_date' => '1990-01-01',
                'phone' => '(92) 99111-2222',
            ]);

        $adultResponse->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'name' => 'Gabriel Adulto',
                    'is_minor' => false,
                ],
            ]);

        // Membro menor de idade (nascido há 10 anos)
        $minorBirth = now()->subYears(10)->toDateString();
        $minorResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/tenant/members', [
                'name' => 'Lucas Menor',
                'birth_date' => $minorBirth,
                'emergency_contact_name' => 'Gabriel Adulto',
            ]);

        $minorResponse->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'name' => 'Lucas Menor',
                    'is_minor' => true,
                ],
            ]);
    }

    public function test_members_are_strictly_isolated_between_tenants(): void
    {
        $tenantContext = app(TenantContext::class);

        // Cria membro na Igreja Beta (Tenant B)
        $memberB = $tenantContext->runWithTenant($this->tenantB, function () {
            return Member::create([
                'name' => 'Membro da Igreja Beta',
                'email' => 'beta@igreja.local',
                'membership_status' => 'active',
            ]);
        });

        // Pastor da Igreja Alpha (Tenant A) tenta listar membros
        $tokenA = $this->pastorA->createToken('token-a')->plainTextToken;
        $responseList = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson('/api/v1/tenant/members');

        $responseList->assertStatus(200)
            ->assertJsonCount(0, 'data.data');

        // Pastor da Igreja Alpha tenta buscar diretamente o ID do membro da Igreja Beta
        $responseShow = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson("/api/v1/tenant/members/{$memberB->id}");

        $responseShow->assertStatus(404);
    }

    public function test_can_register_visitor_and_convert_to_member(): void
    {
        $token = $this->pastorA->createToken('token')->plainTextToken;

        // Registrar visitante
        $visitorResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/tenant/visitors', [
                'name' => 'Visitante Esperança',
                'phone' => '(92) 99888-1111',
                'first_visit_date' => now()->toDateString(),
            ]);

        $visitorResponse->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'name' => 'Visitante Esperança',
                    'status' => 'active',
                ],
            ]);

        $visitorId = $visitorResponse->json('data.id');

        // Registrar nova visita
        $visitResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/tenant/visitors/{$visitorId}/visits", [
                'visited_at' => now()->toDateString(),
                'service_type' => 'Culto de Oração',
            ]);

        $visitResponse->assertStatus(201);

        // Converter visitante em membro
        $convertResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/tenant/visitors/{$visitorId}/convert-to-member", [
                'admission_date' => now()->toDateString(),
                'admission_type' => 'profession_of_faith',
            ]);

        $convertResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'visitor' => [
                        'status' => 'converted',
                    ],
                    'member' => [
                        'name' => 'Visitante Esperança',
                        'membership_status' => 'active',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('members', [
            'tenant_id' => $this->tenantA->id,
            'name' => 'Visitante Esperança',
        ]);
    }

    public function test_member_change_request_approval_workflow(): void
    {
        $tenantContext = app(TenantContext::class);

        // Cria o cadastro de membro vinculado ao usuário memberUserA
        $member = $tenantContext->runWithTenant($this->tenantA, function () {
            return Member::create([
                'name' => 'Membro Solicitante',
                'user_id' => $this->memberUserA->id,
                'phone' => '(92) 91111-0000',
                'address' => 'Rua Antiga, 10',
                'membership_status' => 'active',
            ]);
        });

        // 1. Membro solicita alteração cadastral via portal
        $memberToken = $this->memberUserA->createToken('member-token')->plainTextToken;
        $requestResponse = $this->withHeader('Authorization', "Bearer {$memberToken}")
            ->postJson('/api/v1/tenant/change-requests', [
                'proposed_changes' => [
                    'phone' => '(92) 99999-8888',
                    'address' => 'Avenida Nova, 500',
                ],
            ]);

        $requestResponse->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'status' => 'pending',
                ],
            ]);

        $changeRequestId = $requestResponse->json('data.id');

        // Confirma que os dados oficiais do membro ainda NÃO foram alterados antes da aprovação
        $member->refresh();
        $this->assertEquals('(92) 91111-0000', $member->phone);
        $this->assertEquals('Rua Antiga, 10', $member->address);

        // 2. Secretaria/Pastor analisa e aprova a solicitação
        auth()->forgetGuards();
        $pastorToken = $this->pastorA->createToken('pastor-token')->plainTextToken;
        $reviewResponse = $this->withHeader('Authorization', "Bearer {$pastorToken}")
            ->postJson("/api/v1/tenant/change-requests/{$changeRequestId}/review", [
                'action' => 'approve',
                'review_notes' => 'Documentação comprovatória conferida.',
            ]);

        $reviewResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'status' => 'approved',
                ],
            ]);

        // 3. Confirma que os dados oficiais do membro foram atualizados atomicamente
        $member->refresh();
        $this->assertEquals('(92) 99999-8888', $member->phone);
        $this->assertEquals('Avenida Nova, 500', $member->address);
    }

    public function test_member_change_request_rejection_workflow(): void
    {
        $tenantContext = app(TenantContext::class);

        $member = $tenantContext->runWithTenant($this->tenantA, function () {
            return Member::create([
                'name' => 'Membro Solicitante Rejeitado',
                'user_id' => $this->memberUserA->id,
                'phone' => '(92) 92222-0000',
                'membership_status' => 'active',
            ]);
        });

        $memberToken = $this->memberUserA->createToken('member-token')->plainTextToken;
        $requestResponse = $this->withHeader('Authorization', "Bearer {$memberToken}")
            ->postJson('/api/v1/tenant/change-requests', [
                'proposed_changes' => [
                    'phone' => '(92) 98888-9999',
                ],
            ]);

        $changeRequestId = $requestResponse->json('data.id');

        // Pastor rejeita com motivo
        auth()->forgetGuards();
        $pastorToken = $this->pastorA->createToken('pastor-token')->plainTextToken;
        $reviewResponse = $this->withHeader('Authorization', "Bearer {$pastorToken}")
            ->postJson("/api/v1/tenant/change-requests/{$changeRequestId}/review", [
                'action' => 'reject',
                'review_notes' => 'Telefone incorreto com ddd inválido.',
            ]);

        $reviewResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'status' => 'rejected',
                    'review_notes' => 'Telefone incorreto com ddd inválido.',
                ],
            ]);

        // Cadastro não é alterado
        $member->refresh();
        $this->assertEquals('(92) 92222-0000', $member->phone);
    }
}
