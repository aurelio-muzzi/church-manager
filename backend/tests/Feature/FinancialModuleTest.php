<?php

namespace Tests\Feature;

use App\Models\Congregation;
use App\Models\FinancialAccount;
use App\Models\FinancialBudget;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialModuleTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenantA;
    protected Tenant $tenantB;
    protected User $userAdminA;
    protected string $tokenAdminA;
    protected Congregation $congregationA;
    protected Member $member1;

    protected function setUp(): void
    {
        parent::setUp();

        $tenantContext = app(TenantContext::class);

        // 1. Setup Tenant A
        $this->tenantA = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Graça e Paz',
            'slug' => 'graca-paz',
            'status' => 'active',
        ]);

        $this->userAdminA = User::create([
            'name' => 'Tesoureiro Geral',
            'email' => 'tesouraria@gracapaz.local',
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
                'name' => 'Sede Central',
                'slug' => 'sede-central',
                'is_main' => true,
                'status' => 'active',
            ]);

            $this->member1 = Member::create([
                'congregation_id' => $this->congregationA->id,
                'name' => 'Rodrigo Dízimista',
                'email' => 'rodrigo@gracapaz.local',
                'membership_status' => 'active',
            ]);
        });

        // 2. Setup Tenant B
        $this->tenantB = Tenant::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'name' => 'Igreja Monte Sião',
            'slug' => 'monte-siao',
            'status' => 'active',
        ]);
    }

    public function test_can_create_financial_account_and_category(): void
    {
        // 1. Criar Conta Bancária
        $accountPayload = [
            'name' => 'Conta Corrente Santander',
            'type' => 'checking',
            'bank_name' => 'Santander',
            'agency' => '0001',
            'account_number' => '12345-6',
            'initial_balance' => 5000.00,
        ];

        $resAccount = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/financial-accounts', $accountPayload);

        $resAccount->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.name', 'Conta Corrente Santander');

        $this->assertDatabaseHas('financial_accounts', [
            'tenant_id' => $this->tenantA->id,
            'name' => 'Conta Corrente Santander',
            'initial_balance' => 5000.00,
            'current_balance' => 5000.00,
        ]);

        // 2. Criar Categoria Financeira
        $catPayload = [
            'name' => 'Dízimos Pastorais',
            'type' => 'income',
            'color' => '#10b981',
        ];

        $resCat = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/financial-categories', $catPayload);

        $resCat->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.name', 'Dízimos Pastorais');

        $this->assertDatabaseHas('financial_categories', [
            'tenant_id' => $this->tenantA->id,
            'name' => 'Dízimos Pastorais',
            'type' => 'income',
        ]);
    }

    public function test_income_transaction_atomically_increments_account_balance(): void
    {
        $tenantContext = app(TenantContext::class);
        $account = null;
        $category = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$account, &$category) {
            $account = FinancialAccount::create([
                'name' => 'Conta Principal',
                'type' => 'checking',
                'initial_balance' => 1000.00,
                'current_balance' => 1000.00,
            ]);

            $category = FinancialCategory::create([
                'name' => 'Dízimos',
                'type' => 'income',
            ]);
        });

        // Lança receita de R$ 500.00
        $payload = [
            'account_id' => $account->id,
            'category_id' => $category->id,
            'member_id' => $this->member1->id,
            'type' => 'income',
            'amount' => 500.00,
            'payment_method' => 'pix',
            'transaction_date' => '2026-11-05',
            'description' => 'Dízimo Rodrigo',
            'status' => 'confirmed',
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/financial-transactions', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success');

        // Saldo deve ter subido de 1000 para 1500
        $this->assertEquals(1500.00, (float) $account->fresh()->current_balance);

        $this->assertDatabaseHas('financial_transactions', [
            'tenant_id' => $this->tenantA->id,
            'amount' => 500.00,
            'type' => 'income',
        ]);
    }

    public function test_expense_transaction_atomically_decrements_account_balance(): void
    {
        $tenantContext = app(TenantContext::class);
        $account = null;
        $category = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$account, &$category) {
            $account = FinancialAccount::create([
                'name' => 'Caixa Físico',
                'type' => 'cash',
                'initial_balance' => 800.00,
                'current_balance' => 800.00,
            ]);

            $category = FinancialCategory::create([
                'name' => 'Material de Limpeza',
                'type' => 'expense',
            ]);
        });

        // Lança despesa de R$ 150.00
        $payload = [
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 150.00,
            'payment_method' => 'cash',
            'transaction_date' => '2026-11-06',
            'description' => 'Compra de suprimentos de limpeza',
            'status' => 'confirmed',
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson('/api/v1/tenant/financial-transactions', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success');

        // Saldo deve ter caído de 800 para 650
        $this->assertEquals(650.00, (float) $account->fresh()->current_balance);
    }

    public function test_deleting_transaction_reverts_account_balance(): void
    {
        $tenantContext = app(TenantContext::class);
        $account = null;
        $category = null;
        $transaction = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$account, &$category, &$transaction) {
            $account = FinancialAccount::create([
                'name' => 'Banco do Brasil',
                'initial_balance' => 2000.00,
                'current_balance' => 2500.00, // Já com a receita de 500
            ]);

            $category = FinancialCategory::create(['name' => 'Ofertas', 'type' => 'income']);

            $transaction = FinancialTransaction::create([
                'account_id' => $account->id,
                'category_id' => $category->id,
                'type' => 'income',
                'amount' => 500.00,
                'payment_method' => 'pix',
                'transaction_date' => '2026-11-07',
                'description' => 'Oferta lançada incorretamente',
                'status' => 'confirmed',
                'reconciled' => false,
            ]);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->deleteJson("/api/v1/tenant/financial-transactions/{$transaction->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        // Saldo deve ter retornado para 2000.00
        $this->assertEquals(2000.00, (float) $account->fresh()->current_balance);
        $this->assertSoftDeleted('financial_transactions', ['id' => $transaction->id]);
    }

    public function test_can_reconcile_transaction(): void
    {
        $tenantContext = app(TenantContext::class);
        $transaction = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$transaction) {
            $acc = FinancialAccount::create(['name' => 'Conta', 'initial_balance' => 100]);
            $cat = FinancialCategory::create(['name' => 'Cat', 'type' => 'income']);
            $transaction = FinancialTransaction::create([
                'account_id' => $acc->id,
                'category_id' => $cat->id,
                'type' => 'income',
                'amount' => 100.00,
                'payment_method' => 'pix',
                'transaction_date' => '2026-11-08',
                'description' => 'Conferência bancária',
                'status' => 'confirmed',
                'reconciled' => false,
            ]);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->postJson("/api/v1/tenant/financial-transactions/{$transaction->id}/reconcile");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('financial_transactions', [
            'id' => $transaction->id,
            'reconciled' => true,
        ]);
    }

    public function test_cannot_delete_or_update_reconciled_transaction(): void
    {
        $tenantContext = app(TenantContext::class);
        $transaction = null;

        $tenantContext->runWithTenant($this->tenantA, function () use (&$transaction) {
            $acc = FinancialAccount::create(['name' => 'Conta Trancada', 'initial_balance' => 1000]);
            $cat = FinancialCategory::create(['name' => 'Aluguel', 'type' => 'expense']);
            $transaction = FinancialTransaction::create([
                'account_id' => $acc->id,
                'category_id' => $cat->id,
                'type' => 'expense',
                'amount' => 1000.00,
                'payment_method' => 'bank_slip',
                'transaction_date' => '2026-11-01',
                'description' => 'Aluguel templo já fechado pelo contador',
                'status' => 'confirmed',
                'reconciled' => true,
                'reconciled_at' => now(),
            ]);
        });

        // Tentativa de exclusão deve falhar com 422
        $deleteResponse = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->deleteJson("/api/v1/tenant/financial-transactions/{$transaction->id}");

        $deleteResponse->assertStatus(422)
            ->assertJsonPath('status', 'error');

        // Registro deve continuar ativo
        $this->assertDatabaseHas('financial_transactions', [
            'id' => $transaction->id,
            'deleted_at' => null,
        ]);
    }

    public function test_financial_summary_report(): void
    {
        $tenantContext = app(TenantContext::class);

        $tenantContext->runWithTenant($this->tenantA, function () {
            $acc = FinancialAccount::create(['name' => 'Conta BB', 'initial_balance' => 5000, 'current_balance' => 5500]);
            $catInc = FinancialCategory::create(['name' => 'Dízimos', 'type' => 'income']);
            $catExp = FinancialCategory::create(['name' => 'Energia', 'type' => 'expense']);

            FinancialTransaction::create([
                'account_id' => $acc->id,
                'category_id' => $catInc->id,
                'type' => 'income',
                'amount' => 1000.00,
                'payment_method' => 'pix',
                'transaction_date' => now()->toDateString(),
                'description' => 'Receita do mês',
                'status' => 'confirmed',
            ]);

            FinancialTransaction::create([
                'account_id' => $acc->id,
                'category_id' => $catExp->id,
                'type' => 'expense',
                'amount' => 500.00,
                'payment_method' => 'pix',
                'transaction_date' => now()->toDateString(),
                'description' => 'Despesa do mês',
                'status' => 'confirmed',
            ]);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->getJson('/api/v1/tenant/financial-reports/summary');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.total_income', 1000)
            ->assertJsonPath('data.total_expense', 500)
            ->assertJsonPath('data.net_result', 500);
    }

    public function test_member_contributions_report(): void
    {
        $tenantContext = app(TenantContext::class);

        $tenantContext->runWithTenant($this->tenantA, function () {
            $acc = FinancialAccount::create(['name' => 'Conta']);
            $cat = FinancialCategory::create(['name' => 'Dízimo', 'type' => 'income']);

            FinancialTransaction::create([
                'account_id' => $acc->id,
                'category_id' => $cat->id,
                'member_id' => $this->member1->id,
                'type' => 'income',
                'amount' => 450.00,
                'payment_method' => 'pix',
                'transaction_date' => now()->toDateString(),
                'description' => 'Dízimo Rodrigo',
                'status' => 'confirmed',
            ]);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->getJson("/api/v1/tenant/financial-reports/member-contributions/{$this->member1->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.total_contributed', 450)
            ->assertJsonPath('data.member.name', $this->member1->name);
    }

    public function test_tenant_isolation_on_financial_records(): void
    {
        $tenantContext = app(TenantContext::class);

        // Tenant A cria conta
        $tenantContext->runWithTenant($this->tenantA, function () {
            FinancialAccount::create(['name' => 'Conta Exclusiva A', 'initial_balance' => 1000]);
        });

        // Tenant B cria conta
        $tenantContext->runWithTenant($this->tenantB, function () {
            FinancialAccount::create(['name' => 'Conta Secreta B', 'initial_balance' => 99999]);
        });

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->tokenAdminA}",
            'X-Tenant-ID' => $this->tenantA->slug,
        ])->getJson('/api/v1/tenant/financial-accounts');

        $response->assertStatus(200);
        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains('Conta Exclusiva A'));
        $this->assertFalse($names->contains('Conta Secreta B'), 'Tenant A não pode visualizar contas financeiras de Tenant B.');
    }
}
