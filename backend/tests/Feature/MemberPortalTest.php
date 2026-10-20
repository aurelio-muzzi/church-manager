<?php

namespace Tests\Feature;

use App\Models\ChurchNotice;
use App\Models\Congregation;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Models\Ministry;
use App\Models\MinistryRole;
use App\Models\PrayerRequest;
use App\Models\Schedule;
use App\Models\ScheduleVolunteer;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\TenantContext;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberPortalTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant1;
    protected Tenant $tenant2;
    protected User $userMember1;
    protected User $userMember2;
    protected Member $member1;
    protected Member $member2;
    protected Congregation $congregation1;

    protected function setUp(): void
    {
        parent::setUp();

        // Tenants
        $this->tenant1 = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Vida Teste 1',
            'slug' => 'igreja-vida-1',
            'status' => 'active',
        ]);

        $this->tenant2 = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Vida Teste 2',
            'slug' => 'igreja-vida-2',
            'status' => 'active',
        ]);

        // Usuários
        $this->userMember1 = User::create([
            'name' => 'João Membro 1',
            'email' => 'joao.membro1@teste.local',
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        $this->userMember2 = User::create([
            'name' => 'Pedro Membro 2',
            'email' => 'pedro.membro2@teste.local',
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        // Associações
        TenantUser::create([
            'tenant_id' => $this->tenant1->id,
            'user_id' => $this->userMember1->id,
            'role' => 'member',
            'status' => 'active',
            'is_default' => true,
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenant2->id,
            'user_id' => $this->userMember2->id,
            'role' => 'member',
            'status' => 'active',
            'is_default' => true,
        ]);

        // Configura congregação e membros sob contexto de tenant
        app(TenantContext::class)->runWithTenant($this->tenant1, function () {
            $this->congregation1 = Congregation::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Sede Central',
                'slug' => 'sede-central',
                'is_main' => true,
                'status' => 'active',
            ]);

            $this->member1 = Member::create([
                'tenant_id' => $this->tenant1->id,
                'congregation_id' => $this->congregation1->id,
                'user_id' => $this->userMember1->id,
                'name' => 'João Membro 1',
                'email' => 'joao.membro1@teste.local',
                'phone' => '(92) 99111-2233',
                'membership_status' => 'active',
            ]);
        });

        app(TenantContext::class)->runWithTenant($this->tenant2, function () {
            $this->member2 = Member::create([
                'tenant_id' => $this->tenant2->id,
                'user_id' => $this->userMember2->id,
                'name' => 'Pedro Membro 2',
                'email' => 'pedro.membro2@teste.local',
                'phone' => '(92) 99444-5566',
                'membership_status' => 'active',
            ]);
        });
    }

    public function test_member_can_access_own_dashboard()
    {
        $response = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/member-portal/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.member.id', $this->member1->id)
            ->assertJsonPath('data.member.name', 'João Membro 1');
    }

    public function test_member_can_view_own_profile()
    {
        $response = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/member-portal/profile');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.id', $this->member1->id)
            ->assertJsonPath('data.congregation.name', 'Sede Central');
    }

    public function test_member_can_request_profile_update()
    {
        $payload = [
            'phone' => '(92) 98888-7777',
            'marital_status' => 'married',
            'address' => 'Rua Nova, 123',
            'neighborhood' => 'Flores',
            'city' => 'Manaus',
            'state' => 'AM',
            'postal_code' => '69058-000',
        ];

        $response = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->postJson('/api/v1/tenant/member-portal/profile/update-request', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('member_change_requests', [
            'tenant_id' => $this->tenant1->id,
            'member_id' => $this->member1->id,
            'status' => 'pending',
        ]);
    }

    public function test_member_can_view_and_respond_schedules()
    {
        $schedule = null;
        $volunteer = null;

        app(TenantContext::class)->runWithTenant($this->tenant1, function () use (&$schedule, &$volunteer) {
            $ministry = Ministry::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Ministério de Louvor',
                'slug' => 'louvor',
            ]);

            $role = MinistryRole::create([
                'tenant_id' => $this->tenant1->id,
                'ministry_id' => $ministry->id,
                'name' => 'Vocal',
            ]);

            $schedule = Schedule::create([
                'tenant_id' => $this->tenant1->id,
                'ministry_id' => $ministry->id,
                'title' => 'Culto de Domingo Manhã',
                'date' => Carbon::tomorrow()->toDateString(),
                'start_time' => '09:00',
                'end_time' => '11:00',
                'status' => 'published',
            ]);

            $volunteer = ScheduleVolunteer::create([
                'tenant_id' => $this->tenant1->id,
                'schedule_id' => $schedule->id,
                'member_id' => $this->member1->id,
                'ministry_role_id' => $role->id,
                'status' => 'scheduled',
            ]);
        });

        // 1. Consulta escalas
        $listResponse = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/member-portal/schedules');

        $listResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $volunteer->id);

        // 2. Confirma a escala
        $confirmResponse = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->postJson("/api/v1/tenant/member-portal/schedules/{$volunteer->id}/respond", [
                'status' => 'confirmed',
            ]);

        $confirmResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('schedule_volunteers', [
            'id' => $volunteer->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_member_cannot_respond_other_members_schedule()
    {
        $otherVolunteer = null;

        app(TenantContext::class)->runWithTenant($this->tenant1, function () use (&$otherVolunteer) {
            $otherMember = Member::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Outro Voluntário',
                'email' => 'outro@teste.local',
                'membership_status' => 'active',
            ]);

            $ministry = Ministry::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Mídia e Transmissão',
                'slug' => 'midia',
            ]);

            $role = MinistryRole::create([
                'tenant_id' => $this->tenant1->id,
                'ministry_id' => $ministry->id,
                'name' => 'Câmera 1',
            ]);

            $schedule = Schedule::create([
                'tenant_id' => $this->tenant1->id,
                'ministry_id' => $ministry->id,
                'title' => 'Culto de Quinta',
                'date' => Carbon::tomorrow()->toDateString(),
                'start_time' => '19:30',
                'end_time' => '21:00',
                'status' => 'published',
            ]);

            $otherVolunteer = ScheduleVolunteer::create([
                'tenant_id' => $this->tenant1->id,
                'schedule_id' => $schedule->id,
                'member_id' => $otherMember->id,
                'ministry_role_id' => $role->id,
                'status' => 'scheduled',
            ]);
        });

        // Membro 1 tenta responder a escala do Outro Membro
        $response = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->postJson("/api/v1/tenant/member-portal/schedules/{$otherVolunteer->id}/respond", [
                'status' => 'confirmed',
            ]);

        $response->assertStatus(403);
    }

    public function test_member_can_register_for_event_and_view_qr_code()
    {
        $event = null;

        app(TenantContext::class)->runWithTenant($this->tenant1, function () use (&$event) {
            $event = Event::create([
                'tenant_id' => $this->tenant1->id,
                'title' => 'Conferência Santidade 2026',
                'slug' => 'conferencia-santidade-2026',
                'type' => 'conference',
                'start_date' => Carbon::tomorrow()->toDateString(),
                'start_time' => '19:00',
                'max_capacity' => 200,
                'status' => 'scheduled',
            ]);
        });

        // 1. Inscrição direta no evento
        $registerResponse = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->postJson("/api/v1/tenant/member-portal/events/{$event->id}/register");

        $registerResponse->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'confirmed');

        $qrCodeToken = $registerResponse->json('data.qr_code_token');
        $this->assertNotEmpty($qrCodeToken);

        // 2. Consulta eventos no portal
        $eventsResponse = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/member-portal/events');

        $eventsResponse->assertStatus(200)
            ->assertJsonPath('data.my_registrations.0.qr_code_token', $qrCodeToken);
    }

    public function test_member_can_view_own_financial_contributions()
    {
        app(TenantContext::class)->runWithTenant($this->tenant1, function () {
            $account = FinancialAccount::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Banco do Brasil',
                'type' => 'checking',
                'initial_balance' => 0,
                'current_balance' => 1500,
                'status' => 'active',
            ]);

            $category = FinancialCategory::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Dízimos Nominais',
                'type' => 'income',
                'color' => '#10b981',
                'is_active' => true,
            ]);

            FinancialTransaction::create([
                'tenant_id' => $this->tenant1->id,
                'account_id' => $account->id,
                'category_id' => $category->id,
                'member_id' => $this->member1->id,
                'type' => 'income',
                'amount' => 500.00,
                'transaction_date' => Carbon::now()->toDateString(),
                'payment_method' => 'pix',
                'status' => 'confirmed',
                'description' => 'Dízimo referente ao mês atual',
                'document_number' => 'PIX-1010',
            ]);

            FinancialTransaction::create([
                'tenant_id' => $this->tenant1->id,
                'account_id' => $account->id,
                'category_id' => $category->id,
                'member_id' => $this->member1->id,
                'type' => 'income',
                'amount' => 300.00,
                'transaction_date' => Carbon::now()->toDateString(),
                'payment_method' => 'pix',
                'status' => 'confirmed',
                'description' => 'Oferta de Missões',
                'document_number' => 'PIX-1011',
            ]);
        });

        $response = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/member-portal/contributions');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.total_contributed', 800)
            ->assertJsonCount(2, 'data.contributions');
    }

    public function test_member_can_create_and_view_prayer_requests()
    {
        // 1. Cria pedido de oração
        $createResponse = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->postJson('/api/v1/tenant/member-portal/prayer-requests', [
                'title' => 'Oração por cura e livramento',
                'description' => 'Peço oração pelo tratamento médico do meu irmão.',
                'is_confidential' => true,
            ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.is_confidential', true);

        // 2. Consulta meus pedidos
        $listResponse = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/member-portal/prayer-requests');

        $listResponse->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Oração por cura e livramento');
    }

    public function test_member_can_view_church_notices()
    {
        app(TenantContext::class)->runWithTenant($this->tenant1, function () {
            ChurchNotice::create([
                'tenant_id' => $this->tenant1->id,
                'title' => 'Aviso Oficial da Liderança',
                'content' => 'Reunião de membros no próximo domingo após o culto.',
                'category' => 'general',
                'is_pinned' => true,
                'published_at' => Carbon::now(),
            ]);
        });

        $response = $this->actingAs($this->userMember1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/member-portal/notices');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Aviso Oficial da Liderança')
            ->assertJsonPath('data.0.is_pinned', true);
    }
}
