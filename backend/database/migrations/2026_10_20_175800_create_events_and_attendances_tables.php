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
        // 1. Eventos e Cultos
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('congregation_id')->nullable()->constrained('congregations')->nullOnDelete();
            $table->foreignId('ministry_id')->nullable()->constrained('ministries')->nullOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->string('type', 30)->default('service')->index(); // service, conference, course, workshop, retreat, other
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('banner_url')->nullable();
            $table->date('start_date')->index();
            $table->date('end_date')->nullable();
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->unsignedInteger('max_capacity')->nullable();
            $table->boolean('requires_registration')->default(false);
            $table->boolean('is_free')->default(true);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->string('status', 20)->default('published')->index(); // draft, published, cancelled, completed
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status', 'start_date']);
            $table->unique(['tenant_id', 'slug']);
        });

        // 2. Inscrições no Evento (com token único para QR Code)
        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('qr_code_token', 64)->unique()->index();
            $table->string('status', 20)->default('confirmed')->index(); // confirmed, cancelled, waitlist
            $table->timestamp('registered_at')->useCurrent();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'event_id', 'status']);
        });

        // 3. Registro de Presença / Check-in
        Schema::create('event_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('registration_id')->nullable()->constrained('event_registrations')->nullOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->foreignId('visitor_id')->nullable()->constrained('visitors')->nullOnDelete();
            $table->string('name');
            $table->string('check_in_type', 20)->default('qr_code'); // qr_code, manual
            $table->timestamp('checked_in_at')->useCurrent();
            $table->foreignId('checked_in_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'event_id', 'checked_in_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_attendances');
        Schema::dropIfExists('event_registrations');
        Schema::dropIfExists('events');
    }
};
