<?php

namespace Tests\Feature;

use App\Models\Congregation;
use App\Models\Member;
use App\Models\Ministry;
use App\Models\MinistryRole;
use App\Models\MinistryVolunteer;
use App\Models\Schedule;
use App\Models\ScheduleVolunteer;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MinistryScheduleTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenantA;
    protected Tenant $tenantB;
    protected User $userAdminA;
    protected string $tokenAdminA;
    protected Congregation $congregationA;
    protected Member $member1;
    protected Member $member2;
    protected Member $member3;

    protected function setUp(): void
    {
        parent::setUp();

        $tenantContext = app(TenantContext::class);

        // 1. Setup Tenant A
        $this->tenantA = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Vida Nova',
            'slug' => 'vida-nova',
            'document_number' => '11.111.111/0001-11',
            'email' => 'contato@vidanova.local',
            'status' => 'active',
        ]);

        $this->userAdminA = User::create([
            'name' => 'Pastor Admin',
            'email' => 'pastor@vidanova.local',
            'password' => bcrypt('Password123!'),
            'status' => 'active',
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenantA->id,
            'user_id' => $this->userAdminA->id,
            'role' => 'church_admin',
            'is_default' => true,
            'status' => 'active',
        ]);

        $this->tokenAdminA = $this->userAdminA->createToken('test_token')->plainTextToken;

        $tenantContext->runWithTenant($this->tenantA, function () {
            $this->congregationA = Congregation::create([
                'name' => 'Sede Vida Nova',
                'slug' => 'sede-vida-nova',
                'is_main' => true,
                'status' => 'active',
            ]);

            $this->member1 = Member::create([
                'congregation_id' => $this->congregationA->id,
                'name' => 'Mateus Cantor',
                'email' => 'mateus@vidanova.local',
                'phone' => '92991112222',
                'membership_status' => 'active',
            ]);

            $this->member2 = Member::create([
                'congregation_id' => $this->congregationA->id,
                'name' => 'Lucas Baterista',
                'email' => 'lucas@vidanova.local',
                'phone' => '92993334444',
                'membership_status' => 'active',
            ]);

            $this->member3 = Member::create([
                'congregation_id' => $this->congregationA->id,
                'name' => 'Ana Paula Auxiliar',
                'email' => 'ana@vidanova.local',
                'phone' => '92995556666',
                'membership_status' => 'active',
            ]);
        });

        // 2. Setup Tenant B
        $this->tenantB = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Betel',
            'slug' => 'igreja-betel',
            'document_number' => '22.222.222/0001-22',
            'email' => 'contato@betel.local',
            'status' => 'active',
        ]);
    }

    public function test_can_create_ministry_with_roles(): void
    {
        $payload = [
            'name' => 'Ministério de Louvor',
            'description' => 'Banda e adoração dominical',
            'color' => '#8b5cf6',
            'leader_member_id' => $this->member1->id,
            'roles' => [
                ['name' => 'Vocal Principal'],
                ['name' => 'Bateria'],
            ],
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/ministries', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.name', 'Ministério de Louvor')
            ->assertJsonCount(2, 'data.roles');

        $this->assertDatabaseHas('ministries', [
            'tenant_id' => $this->tenantA->id,
            'name' => 'Ministério de Louvor',
            'leader_member_id' => $this->member1->id,
        ]);

        $this->assertDatabaseHas('ministry_roles', [
            'tenant_id' => $this->tenantA->id,
            'name' => 'Vocal Principal',
        ]);
    }

    public function test_can_add_and_remove_volunteer_to_ministry(): void
    {
        $tenantContext = app(TenantContext::class);
        $ministry = null;
        $role = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$ministry, &$role) {
            $ministry = Ministry::create([
                'name' => 'Recepção',
                'slug' => 'recepcao',
            ]);
            $role = MinistryRole::create([
                'ministry_id' => $ministry->id,
                'name' => 'Portaria',
            ]);
        });

        // 1. Add Volunteer
        $responseAdd = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/ministries/{$ministry->id}/volunteers", [
            'member_id' => $this->member3->id,
            'ministry_role_id' => $role->id,
            'notes' => 'Disponível aos domingos',
        ]);

        $responseAdd->assertStatus(201)
            ->assertJsonPath('status', 'success');

        $volunteerId = $responseAdd->json('data.id');

        $this->assertDatabaseHas('ministry_volunteers', [
            'id' => $volunteerId,
            'ministry_id' => $ministry->id,
            'member_id' => $this->member3->id,
            'status' => 'active',
        ]);

        // 2. Remove Volunteer
        $responseRemove = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->deleteJson("/api/v1/tenant/ministries/{$ministry->id}/volunteers/{$volunteerId}");

        $responseRemove->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('ministry_volunteers', [
            'id' => $volunteerId,
        ]);
    }

    public function test_can_create_schedule_with_volunteers(): void
    {
        $tenantContext = app(TenantContext::class);
        $ministry = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$ministry) {
            $ministry = Ministry::create([
                'name' => 'Mídia',
                'slug' => 'midia',
            ]);
        });

        $payload = [
            'ministry_id' => $ministry->id,
            'congregation_id' => $this->congregationA->id,
            'title' => 'Culto de Domingo Noite',
            'date' => '2026-11-01',
            'start_time' => '18:00',
            'end_time' => '20:00',
            'notes' => 'Chegar com 30min de antecedência',
            'volunteers' => [
                [
                    'member_id' => $this->member1->id,
                ],
                [
                    'member_id' => $this->member2->id,
                ],
            ],
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/schedules', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.title', 'Culto de Domingo Noite')
            ->assertJsonCount(2, 'data.volunteers');

        $this->assertDatabaseHas('schedules', [
            'tenant_id' => $this->tenantA->id,
            'title' => 'Culto de Domingo Noite',
            'date' => '2026-11-01 00:00:00',
        ]);

        $this->assertDatabaseHas('schedule_volunteers', [
            'tenant_id' => $this->tenantA->id,
            'member_id' => $this->member1->id,
            'status' => 'pending',
        ]);
    }

    public function test_conflict_detection_blocks_overlapping_schedule(): void
    {
        $tenantContext = app(TenantContext::class);
        $ministry1 = null;
        $ministry2 = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$ministry1, &$ministry2) {
            $ministry1 = Ministry::create(['name' => 'Louvor', 'slug' => 'louvor']);
            $ministry2 = Ministry::create(['name' => 'Kids', 'slug' => 'kids']);

            // Escala 1: Louvor das 18:00 às 20:00 com o membro 1
            $schedule1 = Schedule::create([
                'ministry_id' => $ministry1->id,
                'title' => 'Culto da Noite - Louvor',
                'date' => '2026-11-08',
                'start_time' => '18:00',
                'end_time' => '20:00',
                'status' => 'published',
            ]);

            ScheduleVolunteer::create([
                'schedule_id' => $schedule1->id,
                'member_id' => $this->member1->id,
                'status' => 'confirmed',
            ]);
        });

        // Tentativa de criar Escala 2 no mesmo dia com horário sobreposto (19:00 às 21:00) para o mesmo membro 1
        $overlappingPayload = [
            'ministry_id' => $ministry2->id,
            'title' => 'Culto da Noite - Kids',
            'date' => '2026-11-08',
            'start_time' => '19:00',
            'end_time' => '21:00',
            'volunteers' => [
                ['member_id' => $this->member1->id], // Conflito!
            ],
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/schedules', $overlappingPayload);

        // Deve retornar 422 Unprocessable Entity
        $response->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('conflict.has_conflict', true)
            ->assertJsonPath('conflicting_member_id', $this->member1->id);

        // Agora testamos com allow_conflicts = true (forçando a gravação)
        $forcedPayload = array_merge($overlappingPayload, ['allow_conflicts' => true]);

        $responseForced = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/schedules', $forcedPayload);

        $responseForced->assertStatus(201)
            ->assertJsonPath('status', 'success');
    }

    public function test_check_conflicts_endpoint(): void
    {
        $tenantContext = app(TenantContext::class);

        $tenantContext->runWithTenant($this->tenantA, function () {
            $ministry = Ministry::create(['name' => 'Sonoplastia', 'slug' => 'sonoplastia']);

            $schedule = Schedule::create([
                'ministry_id' => $ministry->id,
                'title' => 'Ensaio Geral',
                'date' => '2026-11-15',
                'start_time' => '14:00',
                'end_time' => '17:00',
                'status' => 'published',
            ]);

            ScheduleVolunteer::create([
                'schedule_id' => $schedule->id,
                'member_id' => $this->member2->id,
                'status' => 'pending',
            ]);
        });

        // 1. Horário com conflito (15:00 às 16:30)
        $responseConflict = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/schedules/check-conflicts', [
            'member_id' => $this->member2->id,
            'date' => '2026-11-15',
            'start_time' => '15:00',
            'end_time' => '16:30',
        ]);

        $responseConflict->assertStatus(200)
            ->assertJsonPath('has_conflict', true);

        // 2. Horário sem conflito no mesmo dia (18:00 às 20:00)
        $responseNoConflict = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/schedules/check-conflicts', [
            'member_id' => $this->member2->id,
            'date' => '2026-11-15',
            'start_time' => '18:00',
            'end_time' => '20:00',
        ]);

        $responseNoConflict->assertStatus(200)
            ->assertJsonPath('has_conflict', false);
    }

    public function test_volunteer_can_confirm_decline_and_substitute(): void
    {
        $tenantContext = app(TenantContext::class);
        $schedule = null;
        $volunteer = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$schedule, &$volunteer) {
            $min = Ministry::create(['name' => 'Diaconato', 'slug' => 'diaconato']);
            $schedule = Schedule::create([
                'ministry_id' => $min->id,
                'title' => 'Culto de Ceia',
                'date' => '2026-11-22',
                'start_time' => '09:00',
                'end_time' => '11:30',
            ]);

            $volunteer = ScheduleVolunteer::create([
                'schedule_id' => $schedule->id,
                'member_id' => $this->member1->id,
                'status' => 'pending',
            ]);
        });

        // 1. Confirmação
        $responseConfirm = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/schedules/{$schedule->id}/volunteers/{$volunteer->id}/respond", [
            'action' => 'confirm',
        ]);

        $responseConfirm->assertStatus(200)
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('schedule_volunteers', [
            'id' => $volunteer->id,
            'status' => 'confirmed',
        ]);

        // 2. Recusa com justificativa
        $responseDecline = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/schedules/{$schedule->id}/volunteers/{$volunteer->id}/respond", [
            'action' => 'decline',
            'decline_reason' => 'Viagem de trabalho inadiável',
        ]);

        $responseDecline->assertStatus(200)
            ->assertJsonPath('data.status', 'declined');

        $this->assertDatabaseHas('schedule_volunteers', [
            'id' => $volunteer->id,
            'status' => 'declined',
            'decline_reason' => 'Viagem de trabalho inadiável',
        ]);

        // 3. Substituição
        $responseSub = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/schedules/{$schedule->id}/volunteers/{$volunteer->id}/respond", [
            'action' => 'substitute',
            'substituted_by_member_id' => $this->member3->id,
        ]);

        $responseSub->assertStatus(200)
            ->assertJsonPath('data.status', 'substituted')
            ->assertJsonPath('data.substituted_by.id', $this->member3->id);
    }

    public function test_tenant_isolation_on_ministries_and_schedules(): void
    {
        $tenantContext = app(TenantContext::class);

        // Tenant A cria ministério
        $tenantContext->runWithTenant($this->tenantA, function () {
            Ministry::create(['name' => 'Ministério Exclusivo A', 'slug' => 'exclusivo-a']);
        });

        // Tenant B cria ministério
        $tenantContext->runWithTenant($this->tenantB, function () {
            Ministry::create(['name' => 'Ministério Betel B', 'slug' => 'betel-b']);
        });

        // Usuário de A lista ministérios no contexto de Tenant A
        $responseA = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->getJson('/api/v1/tenant/ministries');

        $responseA->assertStatus(200);
        $namesA = collect($responseA->json('data'))->pluck('name');

        $this->assertTrue($namesA->contains('Ministério Exclusivo A'));
        $this->assertFalse($namesA->contains('Ministério Betel B'), 'Tenant A não pode visualizar dados de Tenant B.');
    }
}
