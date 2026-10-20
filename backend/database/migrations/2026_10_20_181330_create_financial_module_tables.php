<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Contas Financeiras e Caixas
        Schema::create('financial_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('congregation_id')->nullable()->constrained('congregations')->nullOnDelete();
            $table->string('name');
            $table->string('type', 20)->default('checking'); // checking (corrente), cash (caixa físico), savings (poupança), investment
            $table->string('bank_name')->nullable();
            $table->string('agency', 20)->nullable();
            $table->string('account_number', 30)->nullable();
            $table->decimal('initial_balance', 12, 2)->default(0.00);
            $table->decimal('current_balance', 12, 2)->default(0.00);
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
        });

        // 2. Plano de Contas / Categorias Financeiras
        Schema::create('financial_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('financial_categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('type', 20)->index(); // income (receita), expense (despesa)
            $table->string('color', 10)->default('#10b981');
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();

            $table->index(['tenant_id', 'type', 'status']);
        });

        // 3. Lançamentos Financeiros (Transações)
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('congregation_id')->nullable()->constrained('congregations')->nullOnDelete();
            $table->foreignId('account_id')->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('financial_categories')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('type', 20)->index(); // income, expense, transfer
            $table->decimal('amount', 12, 2);
            $table->string('payment_method', 20)->default('pix'); // pix, cash, bank_slip, card, transfer
            $table->date('transaction_date')->index();
            $table->string('description');
            $table->string('document_number', 50)->nullable();
            $table->string('status', 20)->default('confirmed')->index(); // confirmed, pending, cancelled
            $table->boolean('reconciled')->default(false)->index();
            $table->timestamp('reconciled_at')->nullable();
            $table->foreignId('reconciled_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('receipt_url', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'transaction_date']);
            $table->index(['tenant_id', 'account_id']);
            $table->index(['tenant_id', 'member_id']);
        });

        // 4. Orçamentos Anuais / Centros de Custo
        Schema::create('financial_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('financial_categories')->cascadeOnDelete();
            $table->unsignedSmallInteger('year')->index();
            $table->unsignedTinyInteger('month')->nullable()->index(); // null = orçamento do ano inteiro
            $table->decimal('planned_amount', 12, 2);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'year', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_budgets');
        Schema::dropIfExists('financial_transactions');
        Schema::dropIfExists('financial_categories');
        Schema::dropIfExists('financial_accounts');
    }
};
