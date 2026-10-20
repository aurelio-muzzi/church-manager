<?php

namespace App\Services;

use App\Models\Congregation;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Models\Ministry;
use App\Models\MinistryVolunteer;
use App\Models\PrayerRequest;
use App\Models\ScheduleVolunteer;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardAnalyticsService
{
    /**
     * Indicadores Executivos Globais (KPIs).
     */
    public function getExecutiveOverview(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->toDateString();
        $endOfMonth = $now->copy()->endOfMonth()->toDateString();
        $startOfPrevMonth = $now->copy()->subMonth()->startOfMonth()->toDateString();
        $endOfPrevMonth = $now->copy()->subMonth()->endOfMonth()->toDateString();

        // 1. Membros
        $totalMembers = Member::where('membership_status', 'active')->count();

        $newMembersThisMonth = Member::where('membership_status', 'active')
            ->whereBetween('admission_date', [$startOfMonth, $endOfMonth])
            ->count();

        $newMembersPrevMonth = Member::where('membership_status', 'active')
            ->whereBetween('admission_date', [$startOfPrevMonth, $endOfPrevMonth])
            ->count();

        $growthRatePercentage = $totalMembers > 0 
            ? round(($newMembersThisMonth / $totalMembers) * 100, 1) 
            : 0.0;

        // 2. Voluntariado & Engajamento Ministerial
        $activeVolunteersCount = MinistryVolunteer::where('status', 'active')
            ->distinct('member_id')
            ->count('member_id');

        $volunteerEngagementRate = $totalMembers > 0 
            ? round(($activeVolunteersCount / $totalMembers) * 100, 1) 
            : 0.0;

        // 3. Frequência / Presença em Eventos (Últimos 30 dias)
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $attendanceLast30Days = EventAttendance::where('checked_in_at', '>=', $thirtyDaysAgo)->count();

        // 4. Financeiro Consolidado
        $totalBalance = (float) FinancialAccount::where('status', 'active')->sum('current_balance');

        $incomeThisMonth = (float) FinancialTransaction::where('status', 'confirmed')
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $expenseThisMonth = (float) FinancialTransaction::where('status', 'confirmed')
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $netResultThisMonth = $incomeThisMonth - $expenseThisMonth;

        return [
            'total_members' => $totalMembers,
            'new_members_this_month' => $newMembersThisMonth,
            'new_members_prev_month' => $newMembersPrevMonth,
            'growth_rate_percentage' => $growthRatePercentage,
            'active_volunteers_count' => $activeVolunteersCount,
            'volunteer_engagement_rate' => $volunteerEngagementRate,
            'attendance_last_30_days' => $attendanceLast30Days,
            'financial' => [
                'total_balance' => $totalBalance,
                'income_this_month' => $incomeThisMonth,
                'expense_this_month' => $expenseThisMonth,
                'net_result_this_month' => $netResultThisMonth,
                'is_surplus' => $netResultThisMonth >= 0,
            ],
        ];
    }

    /**
     * Distribuição Demográfica dos Membros.
     */
    public function getDemographics(): array
    {
        $members = Member::where('membership_status', 'active')->get(['gender', 'birth_date', 'congregation_id']);

        // 1. Por Gênero
        $genderCounts = [
            'male' => 0,
            'female' => 0,
            'other' => 0,
            'not_informed' => 0,
        ];

        foreach ($members as $m) {
            $g = $m->gender;
            if ($g === 'male') {
                $genderCounts['male']++;
            } elseif ($g === 'female') {
                $genderCounts['female']++;
            } elseif ($g === 'other') {
                $genderCounts['other']++;
            } else {
                $genderCounts['not_informed']++;
            }
        }

        // 2. Por Faixa Etária
        $ageGroups = [
            'kids' => 0,        // 0 a 11 anos
            'teens' => 0,       // 12 a 17 anos
            'young_adults' => 0,// 18 a 29 anos
            'adults' => 0,      // 30 a 59 anos
            'seniors' => 0,     // 60+ anos
            'not_informed' => 0,
        ];

        foreach ($members as $m) {
            if (!$m->birth_date) {
                $ageGroups['not_informed']++;
                continue;
            }

            $age = Carbon::parse($m->birth_date)->age;

            if ($age < 12) {
                $ageGroups['kids']++;
            } elseif ($age <= 17) {
                $ageGroups['teens']++;
            } elseif ($age <= 29) {
                $ageGroups['young_adults']++;
            } elseif ($age <= 59) {
                $ageGroups['adults']++;
            } else {
                $ageGroups['seniors']++;
            }
        }

        // 3. Por Congregação
        $congregations = Congregation::withCount(['members' => function ($q) {
            $q->where('membership_status', 'active');
        }])->get(['id', 'name', 'is_main']);

        $byCongregation = $congregations->map(fn($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'is_main' => (bool) $c->is_main,
            'members_count' => $c->members_count,
        ]);

        return [
            'by_gender' => $genderCounts,
            'by_age_group' => $ageGroups,
            'by_congregation' => $byCongregation,
        ];
    }

    /**
     * Métricas de Ministérios e Escalas de Serviço.
     */
    public function getMinistryStats(): array
    {
        $ministries = Ministry::where('status', 'active')
            ->withCount(['volunteers' => function ($q) {
                $q->where('status', 'active');
            }])
            ->get(['id', 'name', 'color']);

        // Escalas do mês atual
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        $scheduleVolunteers = ScheduleVolunteer::whereHas('schedule', function ($q) use ($startOfMonth, $endOfMonth) {
            $q->whereBetween('date', [$startOfMonth, $endOfMonth]);
        })->get(['status']);

        $totalAllocations = $scheduleVolunteers->count();
        $confirmedAllocations = $scheduleVolunteers->where('status', 'confirmed')->count();
        $declinedAllocations = $scheduleVolunteers->where('status', 'declined')->count();
        $pendingAllocations = $scheduleVolunteers->where('status', 'scheduled')->count();

        $confirmationRate = $totalAllocations > 0 
            ? round(($confirmedAllocations / $totalAllocations) * 100, 1) 
            : 0.0;

        return [
            'ministries' => $ministries,
            'schedules_this_month' => [
                'total_allocations' => $totalAllocations,
                'confirmed' => $confirmedAllocations,
                'declined' => $declinedAllocations,
                'pending' => $pendingAllocations,
                'confirmation_rate' => $confirmationRate,
            ],
        ];
    }

    /**
     * Evolução Histórica Financeira (Últimos 6 meses).
     */
    public function getFinancialEvolution(): array
    {
        $months = [];
        $now = Carbon::now();

        for ($i = 5; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i);
            $start = $m->copy()->startOfMonth()->toDateString();
            $end = $m->copy()->endOfMonth()->toDateString();
            $label = $m->translatedFormat('M/Y');

            $income = (float) FinancialTransaction::where('status', 'confirmed')
                ->where('type', 'income')
                ->whereBetween('transaction_date', [$start, $end])
                ->sum('amount');

            $expense = (float) FinancialTransaction::where('status', 'confirmed')
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$start, $end])
                ->sum('amount');

            $months[] = [
                'month' => $m->format('Y-m'),
                'label' => ucfirst($label),
                'income' => $income,
                'expense' => $expense,
                'net' => $income - $expense,
            ];
        }

        return $months;
    }

    /**
     * Alertas Pastorais e Cuidados (Risco de Evasão e Orações Pendentes).
     */
    public function getPastoralAlerts(): array
    {
        $sixtyDaysAgo = Carbon::now()->subDays(60);

        // Membros ativos que não tiveram check-in em eventos nos últimos 60 dias
        $membersWithoutRecentAttendance = Member::where('membership_status', 'active')
            ->whereDoesntHave('eventRegistrations.attendance', function ($q) use ($sixtyDaysAgo) {
                $q->where('checked_in_at', '>=', $sixtyDaysAgo);
            })
            ->with('congregation:id,name')
            ->take(15)
            ->get(['id', 'name', 'phone', 'email', 'congregation_id', 'admission_date']);

        // Pedidos de oração pendentes há mais de 7 dias
        $sevenDaysAgo = Carbon::now()->subDays(7);
        $pendingPrayerAlerts = PrayerRequest::where('status', 'pending')
            ->where('created_at', '<=', $sevenDaysAgo)
            ->with('member:id,name')
            ->take(10)
            ->get();

        return [
            'members_absent_60_days' => $membersWithoutRecentAttendance,
            'pending_prayer_alerts' => $pendingPrayerAlerts,
        ];
    }

    /**
     * Exportar Rol de Membros em formato CSV.
     */
    public function exportMembersCsv(): string
    {
        $members = Member::with('congregation:id,name')->orderBy('name')->get();

        $output = fopen('php://temp', 'r+');
        // UTF-8 BOM para garantir abertura correta de acentos no Excel
        fwrite($output, "\xEF\xBB\xBF");

        fputcsv($output, [
            'ID',
            'Nome',
            'E-mail',
            'Telefone',
            'Gênero',
            'Data de Nascimento',
            'Menor de Idade',
            'Estado Civil',
            'Status de Vínculo',
            'Congregação',
            'Data de Admissão',
            'Tipo de Admissão',
            'Endereço',
            'Bairro',
            'Cidade',
            'UF',
        ], ';');

        foreach ($members as $m) {
            fputcsv($output, [
                $m->id,
                $m->name,
                $m->email ?: '-',
                $m->phone ?: '-',
                $m->gender === 'male' ? 'Masculino' : ($m->gender === 'female' ? 'Feminino' : 'Outro'),
                $m->birth_date ? $m->birth_date->format('d/m/Y') : '-',
                $m->is_minor ? 'Sim' : 'Não',
                $m->marital_status ?: '-',
                $m->membership_status,
                $m->congregation ? $m->congregation->name : 'Sede',
                $m->admission_date ? $m->admission_date->format('d/m/Y') : '-',
                $m->admission_type ?: '-',
                $m->address ?: '-',
                $m->neighborhood ?: '-',
                $m->city ?: '-',
                $m->state ?: '-',
            ], ';');
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Exportar Lançamentos Financeiros em CSV.
     */
    public function exportFinancialCsv(): string
    {
        $transactions = FinancialTransaction::with(['account:id,name', 'category:id,name', 'member:id,name'])
            ->orderBy('transaction_date', 'desc')
            ->get();

        $output = fopen('php://temp', 'r+');
        fwrite($output, "\xEF\xBB\xBF");

        fputcsv($output, [
            'ID',
            'Data',
            'Tipo',
            'Categoria',
            'Conta Bancária / Caixa',
            'Membro (Dízimo Nominal)',
            'Forma de Pagamento',
            'Valor (R$)',
            'Documento',
            'Descrição',
            'Status',
            'Conciliado',
        ], ';');

        foreach ($transactions as $t) {
            fputcsv($output, [
                $t->id,
                Carbon::parse($t->transaction_date)->format('d/m/Y'),
                $t->type === 'income' ? 'Entrada (Receita)' : 'Saída (Despesa)',
                $t->category ? $t->category->name : '-',
                $t->account ? $t->account->name : '-',
                $t->member ? $t->member->name : '-',
                strtoupper($t->payment_method),
                number_format((float) $t->amount, 2, ',', '.'),
                $t->document_number ?: '-',
                $t->description,
                $t->status,
                $t->reconciled ? 'Sim' : 'Não',
            ], ';');
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Exportar Frequência de Eventos em CSV.
     */
    public function exportAttendanceCsv(): string
    {
        $attendances = EventAttendance::with(['event:id,title,start_date', 'registration', 'checkedInBy:id,name'])
            ->orderBy('checked_in_at', 'desc')
            ->get();

        $output = fopen('php://temp', 'r+');
        fwrite($output, "\xEF\xBB\xBF");

        fputcsv($output, [
            'ID',
            'Evento',
            'Data do Evento',
            'Participante',
            'Tipo de Registro',
            'Forma de Check-in',
            'Data/Hora do Check-in',
            'Validado Por',
        ], ';');

        foreach ($attendances as $a) {
            fputcsv($output, [
                $a->id,
                $a->event ? $a->event->title : '-',
                $a->event ? Carbon::parse($a->event->start_date)->format('d/m/Y') : '-',
                $a->name,
                $a->member_id ? 'Membro' : 'Visitante / Convidado',
                $a->check_in_type === 'qr_code' ? 'QR Code' : 'Manual',
                Carbon::parse($a->checked_in_at)->format('d/m/Y H:i:s'),
                $a->checkedInBy ? $a->checkedInBy->name : 'Sistema',
            ], ';');
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}
