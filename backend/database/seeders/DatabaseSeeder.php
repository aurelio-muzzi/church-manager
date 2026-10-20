<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Super Administrador da Plataforma (Platform Admin)
        $platformAdmin = User::firstOrCreate(
            ['email' => 'admin@churchmanager.local'],
            [
                'name' => 'Administrador da Plataforma',
                'password' => Hash::make('Secret@123456'),
                'is_platform_admin' => true,
                'status' => 'active',
            ]
        );

        // 2. Tenant 1 - Igreja Batista Central
        $tenant1 = Tenant::firstOrCreate(
            ['slug' => 'batista-central'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Igreja Batista Central',
                'document_number' => '12.345.678/0001-90',
                'email' => 'contato@batistacentral.local',
                'phone' => '(92) 98111-2233',
                'timezone' => 'America/Manaus',
                'status' => 'active',
            ]
        );

        $pastorTenant1 = User::firstOrCreate(
            ['email' => 'pastor@batistacentral.local'],
            [
                'name' => 'Pastor João Silva',
                'password' => Hash::make('Secret@123456'),
                'is_platform_admin' => false,
                'status' => 'active',
            ]
        );

        TenantUser::firstOrCreate(
            ['tenant_id' => $tenant1->id, 'user_id' => $pastorTenant1->id],
            [
                'role' => 'church_admin',
                'is_default' => true,
                'status' => 'active',
            ]
        );

        $membroTenant1 = User::firstOrCreate(
            ['email' => 'membro@batistacentral.local'],
            [
                'name' => 'Carlos Alberto (Membro)',
                'password' => Hash::make('Secret@123456'),
                'is_platform_admin' => false,
                'status' => 'active',
            ]
        );

        TenantUser::firstOrCreate(
            ['tenant_id' => $tenant1->id, 'user_id' => $membroTenant1->id],
            [
                'role' => 'member',
                'is_default' => true,
                'status' => 'active',
            ]
        );

        // 3. Tenant 2 - Comunidade da Fé
        $tenant2 = Tenant::firstOrCreate(
            ['slug' => 'comunidade-da-fe'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Comunidade da Fé',
                'document_number' => '98.765.432/0001-10',
                'email' => 'contato@comunidadefe.local',
                'phone' => '(92) 99444-5566',
                'timezone' => 'America/Manaus',
                'status' => 'active',
            ]
        );

        $pastorTenant2 = User::firstOrCreate(
            ['email' => 'pastor@comunidadefe.local'],
            [
                'name' => 'Pastora Maria Souza',
                'password' => Hash::make('Secret@123456'),
                'is_platform_admin' => false,
                'status' => 'active',
            ]
        );

        TenantUser::firstOrCreate(
            ['tenant_id' => $tenant2->id, 'user_id' => $pastorTenant2->id],
            [
                'role' => 'church_admin',
                'is_default' => true,
                'status' => 'active',
            ]
        );
    }
}
