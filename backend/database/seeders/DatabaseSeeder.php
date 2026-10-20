<?php

namespace Database\Seeders;

use App\Models\Congregation;
use App\Models\Family;
use App\Models\Member;
use App\Models\MemberChangeRequest;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Models\Visitor;
use App\Models\VisitorVisit;
use App\Services\TenantContext;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $tenantContext = app(TenantContext::class);

        // 1. Super Administrador da Plataforma (Platform Admin)
        User::firstOrCreate(
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

        // Secretaria do Tenant 1
        $tenantContext->runWithTenant($tenant1, function () use ($tenant1, $membroTenant1) {
            // Congregações
            $sede = Congregation::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'slug' => 'templo-central'],
                [
                    'name' => 'Templo Central (Sede)',
                    'address' => 'Av. das Flores, 1000',
                    'neighborhood' => 'Centro',
                    'city' => 'Manaus',
                    'state' => 'AM',
                    'postal_code' => '69000-000',
                    'phone' => '(92) 3211-1000',
                    'leader_name' => 'Pastor João Silva',
                    'is_main' => true,
                    'status' => 'active',
                ]
            );

            $filial = Congregation::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'slug' => 'congregacao-zona-norte'],
                [
                    'name' => 'Congregação Zona Norte',
                    'address' => 'Rua das Palmeiras, 250',
                    'neighborhood' => 'Cidade Nova',
                    'city' => 'Manaus',
                    'state' => 'AM',
                    'postal_code' => '69090-000',
                    'phone' => '(92) 3211-2000',
                    'leader_name' => 'Evangelista Marcos',
                    'is_main' => false,
                    'status' => 'active',
                ]
            );

            // Família
            $familiaSilva = Family::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'name' => 'Família Silva'],
                [
                    'address' => 'Av. das Flores, 1000, Apto 201',
                    'notes' => 'Família pastoral atuante na liderança.',
                ]
            );

            // Membro (Adulto com acesso ao portal)
            $membroCarlos = Member::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'email' => 'membro@batistacentral.local'],
                [
                    'congregation_id' => $sede->id,
                    'user_id' => $membroTenant1->id,
                    'family_id' => $familiaSilva->id,
                    'family_role' => 'head',
                    'name' => 'Carlos Alberto Santos',
                    'phone' => '(92) 99123-4567',
                    'gender' => 'male',
                    'birth_date' => '1985-06-15',
                    'marital_status' => 'married',
                    'membership_status' => 'active',
                    'admission_date' => '2015-01-10',
                    'admission_type' => 'baptism',
                    'baptism_date' => '2015-01-10',
                    'address' => 'Rua B, 45',
                    'neighborhood' => 'Adrianópolis',
                    'city' => 'Manaus',
                    'state' => 'AM',
                    'postal_code' => '69057-000',
                ]
            );

            // Membro (Menor de idade)
            Member::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'name' => 'Lucas Alberto Santos'],
                [
                    'congregation_id' => $sede->id,
                    'family_id' => $familiaSilva->id,
                    'family_role' => 'child',
                    'gender' => 'male',
                    'birth_date' => '2014-08-20', // menor de idade
                    'membership_status' => 'active',
                    'emergency_contact_name' => 'Carlos Alberto Santos',
                    'emergency_contact_phone' => '(92) 99123-4567',
                ]
            );

            // Visitante
            $visitante = Visitor::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'phone' => '(92) 98888-7777'],
                [
                    'congregation_id' => $sede->id,
                    'name' => 'Mariana Oliveira',
                    'email' => 'mariana.visitante@gmail.local',
                    'first_visit_date' => now()->subDays(5)->toDateString(),
                    'how_met_church' => 'Convite de amigo',
                    'prayer_request' => 'Pela saúde da minha família',
                    'status' => 'active',
                ]
            );

            VisitorVisit::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'visitor_id' => $visitante->id, 'visited_at' => now()->subDays(5)->toDateString()],
                [
                    'congregation_id' => $sede->id,
                    'service_type' => 'Culto de Celebração de Domingo',
                    'welcomed_by' => 'Equipe de Recepção',
                ]
            );

            // Solicitação de alteração cadastral pendente
            MemberChangeRequest::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'member_id' => $membroCarlos->id, 'status' => 'pending'],
                [
                    'requested_by_user_id' => $membroTenant1->id,
                    'proposed_changes' => [
                        'phone' => '(92) 99999-1122',
                        'address' => 'Nova Rua dos Lírios, 880',
                    ],
                    'original_data' => [
                        'phone' => '(92) 99123-4567',
                        'address' => 'Rua B, 45',
                    ],
                ]
            );
        });

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

        // Secretaria do Tenant 2
        $tenantContext->runWithTenant($tenant2, function () use ($tenant2) {
            $sedeTenant2 = Congregation::firstOrCreate(
                ['tenant_id' => $tenant2->id, 'slug' => 'sede-comunidade-fe'],
                [
                    'name' => 'Sede Comunidade da Fé',
                    'address' => 'Rua Manaus Antiga, 50',
                    'neighborhood' => 'Ponta Negra',
                    'city' => 'Manaus',
                    'state' => 'AM',
                    'is_main' => true,
                    'status' => 'active',
                ]
            );

            Member::firstOrCreate(
                ['tenant_id' => $tenant2->id, 'name' => 'Fernando Dias'],
                [
                    'congregation_id' => $sedeTenant2->id,
                    'email' => 'fernando@comunidadefe.local',
                    'phone' => '(92) 97777-6655',
                    'gender' => 'male',
                    'membership_status' => 'active',
                ]
            );
        });
    }
}
