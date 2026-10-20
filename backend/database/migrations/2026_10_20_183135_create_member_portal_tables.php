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
        // 1. Pedidos de Oração e Atendimento Pastoral
        Schema::create('prayer_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('requester_name')->nullable();
            $table->string('title');
            $table->text('description');
            $table->boolean('is_confidential')->default(false); // Visível apenas para liderança pastoral
            $table->enum('status', ['pending', 'praying', 'answered', 'archived'])->default('pending');
            $table->text('pastoral_notes')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'member_id']);
        });

        // 2. Mural de Avisos da Igreja
        Schema::create('church_notices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('congregation_id')->nullable()->constrained('congregations')->nullOnDelete();
            $table->string('title');
            $table->text('content');
            $table->enum('category', ['general', 'youth', 'kids', 'urgent', 'events'])->default('general');
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('published_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'is_pinned']);
            $table->index(['tenant_id', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('church_notices');
        Schema::dropIfExists('prayer_requests');
    }
};
