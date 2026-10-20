<?php

namespace Tests\Feature;

use App\Models\Congregation;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventRegistration;
use App\Models\Member;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventAttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenantA;
    protected Tenant $tenantB;
    protected User $userAdminA;
    protected string $tokenAdminA;
    protected Congregation $congregationA;
    protected Member $member1;
    protected Member $member2;

    protected function setUp(): void
    {
        parent::setUp();

        $tenantContext = app(TenantContext::class);

        // 1. Setup Tenant A
        $this->tenantA = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Avivamento',
            'slug' => 'igreja-avivamento',
            'status' => 'active',
        ]);

        $this->userAdminA = User::create([
            'name' => 'Pastor Líder',
            'email' => 'pastor@avivamento.local',
            'password' => bcrypt('Secret@123456'),
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
                'name' => 'Sede Avivamento',
                'slug' => 'sede-avivamento',
                'is_main' => true,
                'status' => 'active',
            ]);

            $this->member1 = Member::create([
                'congregation_id' => $this->congregationA->id,
                'name' => 'André Souza',
                'email' => 'andre@avivamento.local',
                'membership_status' => 'active',
            ]);

            $this->member2 = Member::create([
                'congregation_id' => $this->congregationA->id,
                'name' => 'Beatriz Lima',
                'email' => 'beatriz@avivamento.local',
                'membership_status' => 'active',
            ]);
        });

        // 2. Setup Tenant B
        $this->tenantB = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Videira',
            'slug' => 'igreja-videira',
            'status' => 'active',
        ]);
    }

    public function test_can_create_event_with_capacity_and_registration(): void
    {
        $payload = [
            'title' => 'Conferência Profética 2026',
            'type' => 'conference',
            'description' => 'Encontro anual de jovens e líderes.',
            'location' => 'Templo Central',
            'start_date' => '2026-11-20',
            'start_time' => '19:00',
            'end_time' => '22:00',
            'max_capacity' => 100,
            'requires_registration' => true,
            'is_free' => true,
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/events', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.title', 'Conferência Profética 2026')
            ->assertJsonPath('data.max_capacity', 100);

        $this->assertDatabaseHas('events', [
            'tenant_id' => $this->tenantA->id,
            'title' => 'Conferência Profética 2026',
            'max_capacity' => 100,
        ]);
    }

    public function test_can_register_participant_with_automatic_qr_code_token(): void
    {
        $tenantContext = app(TenantContext::class);
        $event = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$event) {
            $event = Event::create([
                'title' => 'Seminário de Louvor',
                'type' => 'workshop',
                'start_date' => '2026-11-25',
                'start_time' => '14:00',
                'max_capacity' => 50,
                'requires_registration' => true,
            ]);
        });

        $payload = [
            'member_id' => $this->member1->id,
            'name' => $this->member1->name,
            'email' => $this->member1->email,
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/events/{$event->id}/registrations", $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'confirmed');

        $qrCodeToken = $response->json('data.qr_code_token');
        $this->assertNotEmpty($qrCodeToken);
        $this->assertStringStartsWith('EVT-', $qrCodeToken);

        $this->assertDatabaseHas('event_registrations', [
            'tenant_id' => $this->tenantA->id,
            'event_id' => $event->id,
            'qr_code_token' => $qrCodeToken,
            'status' => 'confirmed',
        ]);
    }

    public function test_registration_goes_to_waitlist_when_capacity_reached(): void
    {
        $tenantContext = app(TenantContext::class);
        $event = null;

        // Cria evento com capacidade limitada a apenas 1 vaga
        $tenantContext->runWithTenant($this->tenantA, function () use (&$event) {
            $event = Event::create([
                'title' => 'Workshop Exclusivo',
                'type' => 'workshop',
                'start_date' => '2026-12-01',
                'start_time' => '10:00',
                'max_capacity' => 1,
                'requires_registration' => true,
            ]);

            // Preenche a única vaga
            EventRegistration::create([
                'event_id' => $event->id,
                'name' => 'Primeiro Participante',
                'status' => 'confirmed',
            ]);
        });

        // Tentativa de inscrever o segundo participante
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/events/{$event->id}/registrations", [
            'name' => 'Segundo Participante Excedente',
            'email' => 'excedente@teste.local',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'waitlist');

        $this->assertDatabaseHas('event_registrations', [
            'event_id' => $event->id,
            'name' => 'Segundo Participante Excedente',
            'status' => 'waitlist',
        ]);
    }

    public function test_can_check_in_using_qr_code_token(): void
    {
        $tenantContext = app(TenantContext::class);
        $event = null;
        $registration = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$event, &$registration) {
            $event = Event::create([
                'title' => 'Culto Especial com Check-in',
                'start_date' => '2026-11-28',
                'start_time' => '19:30',
            ]);

            $registration = EventRegistration::create([
                'event_id' => $event->id,
                'member_id' => $this->member1->id,
                'name' => $this->member1->name,
                'qr_code_token' => 'EVT-TESTE123456',
                'status' => 'confirmed',
            ]);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/events/{$event->id}/check-in", [
            'qr_code_token' => 'EVT-TESTE123456',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.name', $this->member1->name)
            ->assertJsonPath('data.check_in_type', 'qr_code');

        $this->assertDatabaseHas('event_attendances', [
            'tenant_id' => $this->tenantA->id,
            'event_id' => $event->id,
            'registration_id' => $registration->id,
            'name' => $this->member1->name,
        ]);
    }

    public function test_check_in_is_idempotent_and_prevents_duplicate_attendance(): void
    {
        $tenantContext = app(TenantContext::class);
        $event = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$event) {
            $event = Event::create([
                'title' => 'Culto de Domingo Manhã',
                'start_date' => '2026-11-29',
                'start_time' => '09:00',
            ]);

            $reg = EventRegistration::create([
                'event_id' => $event->id,
                'name' => 'Marcos Teste',
                'qr_code_token' => 'EVT-MARCOS999',
            ]);

            EventAttendance::create([
                'event_id' => $event->id,
                'registration_id' => $reg->id,
                'name' => 'Marcos Teste',
                'check_in_type' => 'qr_code',
            ]);
        });

        // Segunda tentativa com o mesmo token
        $responseDuplicate = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/events/{$event->id}/check-in", [
            'qr_code_token' => 'EVT-MARCOS999',
        ]);

        $responseDuplicate->assertStatus(200)
            ->assertJsonPath('status', 'already_checked_in');

        // Garante que só há 1 registro no banco
        $this->assertEquals(1, EventAttendance::where('event_id', $event->id)->count());
    }

    public function test_can_check_in_manually_by_member(): void
    {
        $tenantContext = app(TenantContext::class);
        $event = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$event) {
            $event = Event::create([
                'title' => 'Culto de Quarta-feira',
                'start_date' => '2026-11-18',
                'start_time' => '19:30',
            ]);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/events/{$event->id}/check-in", [
            'member_id' => $this->member2->id,
            'check_in_type' => 'manual',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.name', $this->member2->name)
            ->assertJsonPath('data.check_in_type', 'manual');

        $this->assertDatabaseHas('event_attendances', [
            'event_id' => $event->id,
            'member_id' => $this->member2->id,
            'check_in_type' => 'manual',
        ]);
    }

    public function test_event_statistics_endpoint_calculates_correctly(): void
    {
        $tenantContext = app(TenantContext::class);
        $event = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$event) {
            $event = Event::create([
                'title' => 'Congresso de Jovens',
                'start_date' => '2026-12-10',
                'start_time' => '19:00',
                'max_capacity' => 10,
            ]);

            // 3 Inscrições confirmadas
            $r1 = EventRegistration::create(['event_id' => $event->id, 'name' => 'P1', 'status' => 'confirmed']);
            $r2 = EventRegistration::create(['event_id' => $event->id, 'name' => 'P2', 'status' => 'confirmed']);
            EventRegistration::create(['event_id' => $event->id, 'name' => 'P3', 'status' => 'confirmed']);

            // 2 Check-ins realizados
            EventAttendance::create(['event_id' => $event->id, 'registration_id' => $r1->id, 'name' => 'P1', 'check_in_type' => 'qr_code']);
            EventAttendance::create(['event_id' => $event->id, 'registration_id' => $r2->id, 'name' => 'P2', 'check_in_type' => 'manual']);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->getJson("/api/v1/tenant/events/{$event->id}/stats");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.total_confirmed_registrations', 3)
            ->assertJsonPath('data.total_attendances', 2)
            ->assertJsonPath('data.attendance_rate', 66.7)
            ->assertJsonPath('data.occupancy_rate', 20);
    }

    public function test_tenant_isolation_on_events_and_attendances(): void
    {
        $tenantContext = app(TenantContext::class);

        // Tenant A cria evento
        $tenantContext->runWithTenant($this->tenantA, function () {
            Event::create(['title' => 'Evento Exclusivo A', 'slug' => 'evento-a', 'start_date' => '2026-11-20', 'start_time' => '19:00']);
        });

        // Tenant B cria evento
        $tenantContext->runWithTenant($this->tenantB, function () {
            Event::create(['title' => 'Evento Videira B', 'slug' => 'evento-b', 'start_date' => '2026-11-20', 'start_time' => '19:00']);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->getJson('/api/v1/tenant/events');

        $response->assertStatus(200);
        $titles = collect($response->json('data'))->pluck('title');

        $this->assertTrue($titles->contains('Evento Exclusivo A'));
        $this->assertFalse($titles->contains('Evento Videira B'), 'Tenant A não pode visualizar eventos de Tenant B.');
    }
}
