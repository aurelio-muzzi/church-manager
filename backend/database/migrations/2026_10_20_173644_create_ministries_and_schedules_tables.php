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
        // 1. Ministérios / Departamentos
        Schema::create('ministries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('leader_member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('color', 10)->default('#3b82f6');
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->unique(['tenant_id', 'slug']);
        });

        // 2. Funções / Papeis nos Ministérios (Ex: Vocalista, Tecladista, Professor)
        Schema::create('ministry_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('ministry_id')->constrained('ministries')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'ministry_id']);
        });

        // 3. Voluntários dos Ministérios
        Schema::create('ministry_volunteers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('ministry_id')->constrained('ministries')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('ministry_role_id')->nullable()->constrained('ministry_roles')->nullOnDelete();
            $table->string('status', 20)->default('active')->index();
            $table->date('joined_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'member_id']);
            $table->unique(['ministry_id', 'member_id', 'ministry_role_id'], 'min_vol_unique');
        });

        // 4. Escalas de Serviço / Evento
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('ministry_id')->constrained('ministries')->cascadeOnDelete();
            $table->foreignId('congregation_id')->nullable()->constrained('congregations')->nullOnDelete();
            $table->string('title');
            $table->date('date')->index();
            $table->time('start_time');
            $table->time('end_time');
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('published')->index(); // draft, published, completed, cancelled
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'ministry_id', 'date']);
        });

        // 5. Voluntários Escalados (com confirmação, recusa e substituição)
        Schema::create('schedule_volunteers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('schedule_id')->constrained('schedules')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('ministry_role_id')->nullable()->constrained('ministry_roles')->nullOnDelete();
            $table->string('status', 20)->default('pending')->index(); // pending, confirmed, declined, substituted
            $table->text('decline_reason')->nullable();
            $table->foreignId('substituted_by_member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'member_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_volunteers');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('ministry_volunteers');
        Schema::dropIfExists('ministry_roles');
        Schema::dropIfExists('ministries');
    }
};
