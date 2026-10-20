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
        // 1. Congregações (Sede e Congregações filiais)
        Schema::create('congregations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('address')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('city')->nullable();
            $table->string('state', 2)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('leader_name')->nullable();
            $table->boolean('is_main')->default(false);
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->unique(['tenant_id', 'slug']);
        });

        // 2. Famílias
        Schema::create('families', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->string('address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'name']);
        });

        // 3. Membros
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('congregation_id')->nullable()->constrained('congregations')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('family_id')->nullable()->constrained('families')->nullOnDelete();
            $table->string('family_role', 20)->nullable(); // head, spouse, child, parent, other
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('gender', 10)->nullable(); // male, female, other
            $table->date('birth_date')->nullable();
            $table->boolean('is_minor')->default(false);
            $table->string('marital_status', 20)->nullable();
            $table->string('membership_status', 25)->default('active')->index(); // active, inactive, under_discipline, transferred, deceased
            $table->date('baptism_date')->nullable();
            $table->date('admission_date')->nullable();
            $table->string('admission_type', 30)->nullable(); // baptism, profession_of_faith, transfer, acclamation
            $table->string('address')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('city')->nullable();
            $table->string('state', 2)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 30)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'membership_status']);
            $table->index(['tenant_id', 'congregation_id']);
            $table->index(['tenant_id', 'name']);
        });

        // 4. Visitantes
        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('congregation_id')->nullable()->constrained('congregations')->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->date('first_visit_date')->nullable();
            $table->string('how_met_church')->nullable();
            $table->text('prayer_request')->nullable();
            $table->foreignId('converted_to_member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->timestamp('converted_at')->nullable();
            $table->string('status', 20)->default('active')->index(); // active, converted, archived
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'phone']);
        });

        // 5. Histórico de Visitas
        Schema::create('visitor_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('visitor_id')->constrained('visitors')->cascadeOnDelete();
            $table->foreignId('congregation_id')->nullable()->constrained('congregations')->nullOnDelete();
            $table->date('visited_at');
            $table->string('service_type')->nullable();
            $table->string('welcomed_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'visitor_id']);
        });

        // 6. Solicitações de Alteração Cadastral (Portal do Membro -> Secretaria)
        Schema::create('member_change_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('requested_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('pending')->index(); // pending, approved, rejected
            $table->json('proposed_changes');
            $table->json('original_data')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'member_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_change_requests');
        Schema::dropIfExists('visitor_visits');
        Schema::dropIfExists('visitors');
        Schema::dropIfExists('members');
        Schema::dropIfExists('families');
        Schema::dropIfExists('congregations');
    }
};
