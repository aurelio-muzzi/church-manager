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
        $tenantContext->runWithTenant($tenant1, function () use ($tenant1, $membroTenant1, $pastorTenant1) {
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

            // ==========================================
            // ETAPA 4: MINISTÉRIOS, VOLUNTÁRIOS E ESCALAS
            // ==========================================

            // Membros adicionais para equipes ministeriais
            $membroJuliana = Member::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'email' => 'juliana.musica@batistacentral.local'],
                [
                    'congregation_id' => $sede->id,
                    'name' => 'Juliana Mendes',
                    'phone' => '(92) 98222-3344',
                    'gender' => 'female',
                    'birth_date' => '1992-04-12',
                    'membership_status' => 'active',
                ]
            );

            $membroRoberto = Member::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'email' => 'roberto.kids@batistacentral.local'],
                [
                    'congregation_id' => $sede->id,
                    'name' => 'Roberto Souza',
                    'phone' => '(92) 98333-4455',
                    'gender' => 'male',
                    'birth_date' => '1988-11-23',
                    'membership_status' => 'active',
                ]
            );

            $membroAline = Member::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'email' => 'aline.recepcao@batistacentral.local'],
                [
                    'congregation_id' => $sede->id,
                    'name' => 'Aline Castro',
                    'phone' => '(92) 98444-5566',
                    'gender' => 'female',
                    'birth_date' => '1995-09-05',
                    'membership_status' => 'active',
                ]
            );

            $membroLucasMidia = Member::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'email' => 'lucas.midia@batistacentral.local'],
                [
                    'congregation_id' => $sede->id,
                    'name' => 'Lucas Ferreira',
                    'phone' => '(92) 98555-6677',
                    'gender' => 'male',
                    'birth_date' => '1997-03-30',
                    'membership_status' => 'active',
                ]
            );

            // 1. Ministério de Louvor & Adoração
            $louvor = \App\Models\Ministry::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'slug' => 'louvor-adoracao'],
                [
                    'name' => 'Ministério de Louvor & Adoração',
                    'description' => 'Responsável pela ministração do louvor, bandas e técnica instrumental.',
                    'leader_member_id' => $membroJuliana->id,
                    'color' => '#8b5cf6',
                    'status' => 'active',
                ]
            );

            $roleVocal = \App\Models\MinistryRole::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $louvor->id, 'name' => 'Vocal Principal']
            );
            $roleViolao = \App\Models\MinistryRole::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $louvor->id, 'name' => 'Violão / Guitarra']
            );
            $roleTeclado = \App\Models\MinistryRole::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $louvor->id, 'name' => 'Teclado']
            );

            // 2. Ministério Infantil (Kids)
            $kids = \App\Models\Ministry::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'slug' => 'ministerio-kids'],
                [
                    'name' => 'Ministério Infantil (Kids)',
                    'description' => 'Cuidado, ensino bíblico e atividades para crianças de 0 a 11 anos.',
                    'leader_member_id' => $membroRoberto->id,
                    'color' => '#f59e0b',
                    'status' => 'active',
                ]
            );

            $roleProfMaternal = \App\Models\MinistryRole::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $kids->id, 'name' => 'Professor(a) Maternal']
            );
            $roleProfPrimarios = \App\Models\MinistryRole::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $kids->id, 'name' => 'Professor(a) Primários']
            );

            // 3. Ministério de Recepção e Boas-Vindas
            $recepcao = \App\Models\Ministry::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'slug' => 'recepcao-boas-vindas'],
                [
                    'name' => 'Recepção e Boas-Vindas',
                    'description' => 'Acolhimento de membros e visitantes na entrada da igreja.',
                    'leader_member_id' => $membroAline->id,
                    'color' => '#10b981',
                    'status' => 'active',
                ]
            );

            $rolePortaPrincipal = \App\Models\MinistryRole::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $recepcao->id, 'name' => 'Recepcionista Porta Principal']
            );

            // Voluntários dos Ministérios
            \App\Models\MinistryVolunteer::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $louvor->id, 'member_id' => $membroJuliana->id],
                ['ministry_role_id' => $roleVocal->id, 'status' => 'active', 'joined_at' => '2023-01-15']
            );
            \App\Models\MinistryVolunteer::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $louvor->id, 'member_id' => $membroCarlos->id],
                ['ministry_role_id' => $roleViolao->id, 'status' => 'active', 'joined_at' => '2023-02-01']
            );
            \App\Models\MinistryVolunteer::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $kids->id, 'member_id' => $membroRoberto->id],
                ['ministry_role_id' => $roleProfPrimarios->id, 'status' => 'active', 'joined_at' => '2023-03-10']
            );
            \App\Models\MinistryVolunteer::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'ministry_id' => $recepcao->id, 'member_id' => $membroAline->id],
                ['ministry_role_id' => $rolePortaPrincipal->id, 'status' => 'active', 'joined_at' => '2023-04-05']
            );

            // Escala Próximo Domingo (Louvor)
            $escalaDomingo = \App\Models\Schedule::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'title' => 'Culto de Celebração - Louvor'],
                [
                    'ministry_id' => $louvor->id,
                    'congregation_id' => $sede->id,
                    'date' => now()->next('Sunday')->toDateString(),
                    'start_time' => '18:30',
                    'end_time' => '20:30',
                    'notes' => 'Chegar para ensaio e passagem de som às 17h30.',
                    'status' => 'published',
                ]
            );

            \App\Models\ScheduleVolunteer::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'schedule_id' => $escalaDomingo->id, 'member_id' => $membroJuliana->id],
                ['ministry_role_id' => $roleVocal->id, 'status' => 'confirmed', 'confirmed_at' => now()]
            );

            \App\Models\ScheduleVolunteer::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'schedule_id' => $escalaDomingo->id, 'member_id' => $membroCarlos->id],
                ['ministry_role_id' => $roleViolao->id, 'status' => 'pending']
            );

            // ==========================================
            // ETAPA 5: EVENTOS, INSCRIÇÕES E CHECK-IN
            // ==========================================

            // 1. Grande Conferência com Inscrições Obrigatórias e Limite
            $conferencia = \App\Models\Event::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'slug' => 'conferencia-avivamento-2026'],
                [
                    'congregation_id' => $sede->id,
                    'title' => 'Conferência de Avivamento & Liderança 2026',
                    'type' => 'conference',
                    'description' => 'Três noites de louvor, capacitação de líderes e ministração profética.',
                    'location' => 'Auditório Principal - Sede Central',
                    'start_date' => now()->addDays(14)->toDateString(),
                    'end_date' => now()->addDays(16)->toDateString(),
                    'start_time' => '19:30',
                    'end_time' => '22:00',
                    'max_capacity' => 150,
                    'requires_registration' => true,
                    'is_free' => true,
                    'status' => 'published',
                ]
            );

            // Inscrição 1: Carlos Alberto
            $regCarlos = \App\Models\EventRegistration::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'event_id' => $conferencia->id, 'qr_code_token' => 'EVT-CARLOS2026'],
                [
                    'member_id' => $membroCarlos->id,
                    'name' => $membroCarlos->name,
                    'email' => $membroCarlos->email,
                    'phone' => $membroCarlos->phone,
                    'status' => 'confirmed',
                    'registered_at' => now()->subDays(3),
                ]
            );

            // Check-in já efetuado de Carlos Alberto
            \App\Models\EventAttendance::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'event_id' => $conferencia->id, 'registration_id' => $regCarlos->id],
                [
                    'member_id' => $membroCarlos->id,
                    'name' => $membroCarlos->name,
                    'check_in_type' => 'qr_code',
                    'checked_in_at' => now()->subHours(1),
                    'checked_in_by_user_id' => $pastorTenant1->id,
                ]
            );

            // Inscrição 2: Juliana Mendes (Ainda não fez check-in)
            \App\Models\EventRegistration::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'event_id' => $conferencia->id, 'qr_code_token' => 'EVT-JULIANA2026'],
                [
                    'member_id' => $membroJuliana->id,
                    'name' => $membroJuliana->name,
                    'email' => $membroJuliana->email,
                    'phone' => $membroJuliana->phone,
                    'status' => 'confirmed',
                    'registered_at' => now()->subDays(2),
                ]
            );

            // Inscrição 3: Visitante Mariana Oliveira
            \App\Models\EventRegistration::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'event_id' => $conferencia->id, 'qr_code_token' => 'EVT-MARIANA2026'],
                [
                    'name' => 'Mariana Oliveira (Convidada)',
                    'email' => 'mariana.visitante@gmail.local',
                    'phone' => '(92) 98888-7777',
                    'status' => 'confirmed',
                    'registered_at' => now()->subDay(),
                ]
            );

            // 2. Culto Regular de Domingo (Sem necessidade de inscrição prévia)
            \App\Models\Event::firstOrCreate(
                ['tenant_id' => $tenant1->id, 'slug' => 'culto-celebracao-domingo'],
                [
                    'congregation_id' => $sede->id,
                    'title' => 'Culto de Celebração & Santa Ceia',
                    'type' => 'service',
                    'description' => 'Culto solene com celebração da Ceia do Senhor.',
                    'location' => 'Nave Principal',
                    'start_date' => now()->next('Sunday')->toDateString(),
                    'start_time' => '18:30',
                    'end_time' => '20:45',
                    'requires_registration' => false,
                    'is_free' => true,
                    'status' => 'published',
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
