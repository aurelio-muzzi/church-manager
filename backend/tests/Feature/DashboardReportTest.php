<?php

namespace Tests\Feature;

use App\Models\Congregation;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventRegistration;
use App\Models\FinancialAccount;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Models\Ministry;
use App\Models\MinistryRole;
use App\Models\MinistryVolunteer;
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

class DashboardReportTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant1;
    protected Tenant $tenant2;
    protected User $adminTenant1;
    protected User $adminTenant2;
    protected Congregation $sede1;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Tenants
        $this->tenant1 = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Central 1',
            'slug' => 'igreja-central-1',
            'status' => 'active',
        ]);

        $this->tenant2 = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Comunidade 2',
            'slug' => 'igreja-comunidade-2',
            'status' => 'active',
        ]);

        // 2. Administradores dos Tenants
        $this->adminTenant1 = User::create([
            'name' => 'Pastor João 1',
            'email' => 'pastor1@teste.local',
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        $this->adminTenant2 = User::create([
            'name' => 'Pastora Maria 2',
            'email' => 'pastora2@teste.local',
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenant1->id,
            'user_id' => $this->adminTenant1->id,
            'role' => 'church_admin',
            'status' => 'active',
            'is_default' => true,
        ]);

        TenantUser::create([
            'tenant_id' => $this->tenant2->id,
            'user_id' => $this->adminTenant2->id,
            'role' => 'church_admin',
            'status' => 'active',
            'is_default' => true,
        ]);

        // 3. Dados no Tenant 1
        app(TenantContext::class)->runWithTenant($this->tenant1, function () {
            $this->sede1 = Congregation::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Templo Sede',
                'slug' => 'templo-sede',
                'is_main' => true,
                'status' => 'active',
            ]);

            // Membro 1 (Homem, 35 anos)
            $m1 = Member::create([
                'tenant_id' => $this->tenant1->id,
                'congregation_id' => $this->sede1->id,
                'name' => 'Carlos Alberto Santos',
                'email' => 'carlos@teste.local',
                'phone' => '(92) 99111-2233',
                'gender' => 'male',
                'birth_date' => Carbon::now()->subYears(35)->toDateString(),
                'membership_status' => 'active',
                'admission_date' => Carbon::now()->subMonths(2)->toDateString(),
            ]);

            // Membro 2 (Mulher, 25 anos, admitida este mês)
            $m2 = Member::create([
                'tenant_id' => $this->tenant1->id,
                'congregation_id' => $this->sede1->id,
                'name' => 'Juliana Mendes',
                'email' => 'juliana@teste.local',
                'gender' => 'female',
                'birth_date' => Carbon::now()->subYears(25)->toDateString(),
                'membership_status' => 'active',
                'admission_date' => Carbon::now()->startOfMonth()->toDateString(),
            ]);

            // Ministério e Voluntário
            $louvor = Ministry::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Ministério de Louvor',
                'slug' => 'louvor',
            ]);

            $roleVocal = MinistryRole::create([
                'tenant_id' => $this->tenant1->id,
                'ministry_id' => $louvor->id,
                'name' => 'Vocalista',
            ]);

            MinistryVolunteer::create([
                'tenant_id' => $this->tenant1->id,
                'ministry_id' => $louvor->id,
                'member_id' => $m1->id,
                'ministry_role_id' => $roleVocal->id,
                'status' => 'active',
            ]);

            // Conta Financeira e Transações
            $conta = FinancialAccount::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Conta BB',
                'type' => 'checking',
                'initial_balance' => 10000.00,
                'current_balance' => 10000.00,
                'status' => 'active',
            ]);

            $catDizimo = FinancialCategory::create([
                'tenant_id' => $this->tenant1->id,
                'name' => 'Dízimos',
                'type' => 'income',
                'color' => '#10b981',
                'is_active' => true,
            ]);

            FinancialTransaction::create([
                'tenant_id' => $this->tenant1->id,
                'account_id' => $conta->id,
                'category_id' => $catDizimo->id,
                'type' => 'income',
                'amount' => 1500.00,
                'transaction_date' => Carbon::now()->toDateString(),
                'payment_method' => 'pix',
                'status' => 'confirmed',
                'description' => 'Dízimo do Mês',
            ]);

            // Evento e Presença
            $evento = Event::create([
                'tenant_id' => $this->tenant1->id,
                'title' => 'Culto de Celebração',
                'slug' => 'culto-celebracao',
                'type' => 'service',
                'start_date' => Carbon::yesterday()->toDateString(),
                'start_time' => '19:00',
                'status' => 'completed',
            ]);

            EventAttendance::create([
                'tenant_id' => $this->tenant1->id,
                'event_id' => $evento->id,
                'member_id' => $m1->id,
                'name' => $m1->name,
                'check_in_type' => 'manual',
                'checked_in_at' => Carbon::yesterday(),
            ]);

            // Pedido de Oração antigo (alerta pastoral)
            $prayer = PrayerRequest::create([
                'tenant_id' => $this->tenant1->id,
                'member_id' => $m1->id,
                'title' => 'Pedido de oração pendente',
                'description' => 'Aguardando atendimento pastoral urgente',
                'status' => 'pending',
            ]);
            $prayer->created_at = Carbon::now()->subDays(10);
            $prayer->save();
        });

        // 4. Dados no Tenant 2 (para garantir isolamento estrito)
        app(TenantContext::class)->runWithTenant($this->tenant2, function () {
            Member::create([
                'tenant_id' => $this->tenant2->id,
                'name' => 'Membro Infiltrado Tenant 2',
                'membership_status' => 'active',
            ]);
        });
    }

    public function test_can_get_executive_overview()
    {
        $response = $this->actingAs($this->adminTenant1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/dashboard/executive');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.total_members', 2)
            ->assertJsonPath('data.new_members_this_month', 1)
            ->assertJsonPath('data.active_volunteers_count', 1)
            ->assertJsonPath('data.financial.income_this_month', 1500)
            ->assertJsonPath('data.attendance_last_30_days', 1);
    }

    public function test_can_get_demographics()
    {
        $response = $this->actingAs($this->adminTenant1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/dashboard/demographics');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.by_gender.male', 1)
            ->assertJsonPath('data.by_gender.female', 1)
            ->assertJsonPath('data.by_age_group.young_adults', 1) // 25 anos
            ->assertJsonPath('data.by_age_group.adults', 1);       // 35 anos
    }

    public function test_can_get_ministry_stats()
    {
        $response = $this->actingAs($this->adminTenant1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/dashboard/ministries');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(1, 'data.ministries')
            ->assertJsonPath('data.ministries.0.volunteers_count', 1);
    }

    public function test_can_get_financial_evolution()
    {
        $response = $this->actingAs($this->adminTenant1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/dashboard/financial-evolution');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(6, 'data'); // 6 meses
    }

    public function test_can_get_pastoral_alerts()
    {
        $response = $this->actingAs($this->adminTenant1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->getJson('/api/v1/tenant/dashboard/pastoral-alerts');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(1, 'data.pending_prayer_alerts')
            ->assertJsonPath('data.pending_prayer_alerts.0.title', 'Pedido de oração pendente');
    }

    public function test_can_export_members_csv()
    {
        $response = $this->actingAs($this->adminTenant1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->get('/api/v1/tenant/dashboard/export/members');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $content = $response->getContent();
        $this->assertStringContainsString('Carlos Alberto Santos', $content);
        $this->assertStringContainsString('Juliana Mendes', $content);
        // Garantir que o membro do tenant 2 NÃO está no CSV
        $this->assertStringNotContainsString('Membro Infiltrado Tenant 2', $content);
    }

    public function test_can_export_financial_csv()
    {
        $response = $this->actingAs($this->adminTenant1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->get('/api/v1/tenant/dashboard/export/financial');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $content = $response->getContent();
        $this->assertStringContainsString('Dízimo do Mês', $content);
        $this->assertStringContainsString('1.500,00', $content);
    }

    public function test_can_export_attendance_csv()
    {
        $response = $this->actingAs($this->adminTenant1, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant1->id)
            ->get('/api/v1/tenant/dashboard/export/attendance');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $content = $response->getContent();
        $this->assertStringContainsString('Culto de Celebração', $content);
        $this->assertStringContainsString('Carlos Alberto Santos', $content);
    }

    public function test_dashboard_strict_multitenant_isolation()
    {
        // Admin do Tenant 2 acessa o dashboard do Tenant 2
        $response = $this->actingAs($this->adminTenant2, 'sanctum')
            ->withHeader('X-Tenant-ID', (string) $this->tenant2->id)
            ->getJson('/api/v1/tenant/dashboard/executive');

        $response->assertStatus(200)
            ->assertJsonPath('data.total_members', 1)
            ->assertJsonPath('data.active_volunteers_count', 0)
            ->assertJsonPath('data.financial.income_this_month', 0);
    }
}
