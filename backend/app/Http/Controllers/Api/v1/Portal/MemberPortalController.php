<?php

namespace App\Http\Controllers\Api\v1\Portal;

use App\Http\Controllers\Controller;
use App\Models\ChurchNotice;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Models\MemberChangeRequest;
use App\Models\PrayerRequest;
use App\Models\ScheduleVolunteer;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MemberPortalController extends Controller
{
    /**
     * Resolve o registro de membro correspondente ao usuário logado no tenant ativo.
     */
    protected function resolveMember(): Member
    {
        $user = auth()->user();
        $tenantId = app(\App\Services\TenantContext::class)->getTenantId();

        // 1. Busca por user_id no tenant
        $member = Member::where('user_id', $user->id)
            ->where('tenant_id', $tenantId)
            ->first();

        // 2. Se não encontrou, busca por email
        if (!$member && $user->email) {
            $member = Member::where('email', $user->email)
                ->where('tenant_id', $tenantId)
                ->first();

            if ($member) {
                $member->update(['user_id' => $user->id]);
            }
        }

        // 3. Se ainda não existir, cria perfil automático do membro para o usuário da igreja
        if (!$member) {
            $member = Member::create([
                'tenant_id' => $tenantId,
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'membership_status' => 'active',
                'admission_date' => Carbon::today(),
                'admission_type' => 'profession_of_faith',
            ]);
        }

        return $member;
    }

    /**
     * Dashboard resumo do portal do membro.
     */
    public function dashboard(): JsonResponse
    {
        $member = $this->resolveMember();

        // Escalas pendentes de resposta
        $pendingSchedulesCount = ScheduleVolunteer::where('member_id', $member->id)
            ->where('status', 'scheduled')
            ->count();

        // Próximas escalas
        $upcomingSchedules = ScheduleVolunteer::where('member_id', $member->id)
            ->with(['schedule.ministry:id,name,color', 'role:id,name'])
            ->whereHas('schedule', function ($q) {
                $q->where('date', '>=', Carbon::today()->toDateString());
            })
            ->take(5)
            ->get();

        // Inscrições ativas em eventos
        $myRegistrations = EventRegistration::where('member_id', $member->id)
            ->orWhere('email', $member->email)
            ->with(['event:id,title,start_date,start_time,location'])
            ->whereHas('event', function ($q) {
                $q->where('start_date', '>=', Carbon::today()->toDateString());
            })
            ->latest()
            ->take(5)
            ->get();

        // Avisos fixados recentes do mural
        $pinnedNotices = ChurchNotice::where('is_pinned', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', Carbon::now());
            })
            ->latest('published_at')
            ->take(3)
            ->get();

        // Pedidos de oração do membro
        $prayerRequestsCount = PrayerRequest::where('member_id', $member->id)->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'member' => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'membership_status' => $member->membership_status,
                    'admission_date' => $member->admission_date?->format('d/m/Y'),
                ],
                'pending_schedules_count' => $pendingSchedulesCount,
                'upcoming_schedules' => $upcomingSchedules,
                'my_registrations' => $myRegistrations,
                'pinned_notices' => $pinnedNotices,
                'prayer_requests_count' => $prayerRequestsCount,
            ],
        ]);
    }

    /**
     * Perfil completo do membro.
     */
    public function profile(): JsonResponse
    {
        $member = $this->resolveMember();
        $member->load([
            'congregation:id,name',
            'family.members:id,family_id,name,family_role',
            'ministryVolunteers.ministry:id,name,color',
            'ministryVolunteers.role:id,name',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $member,
        ]);
    }

    /**
     * Solicitação de atualização cadastral (enviada para aprovação da secretaria).
     */
    public function requestProfileUpdate(Request $request): JsonResponse
    {
        $member = $this->resolveMember();

        $validated = $request->validate([
            'phone' => 'nullable|string|max:30',
            'marital_status' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'postal_code' => 'nullable|string|max:10',
            'emergency_contact_name' => 'nullable|string|max:150',
            'emergency_contact_phone' => 'nullable|string|max:30',
        ]);

        $requestedData = array_filter($validated, fn($val) => !is_null($val));
        $originalData = $member->only(array_keys($requestedData));

        $changeRequest = MemberChangeRequest::create([
            'tenant_id' => $member->tenant_id,
            'member_id' => $member->id,
            'requested_by_user_id' => auth()->id(),
            'proposed_changes' => $requestedData,
            'original_data' => $originalData,
            'status' => 'pending',
        ]);

        AuditService::log('member_portal.change_requested', $changeRequest, null, $requestedData);

        return response()->json([
            'status' => 'success',
            'message' => 'Solicitação de alteração enviada à secretaria com sucesso.',
            'data' => $changeRequest,
        ], 201);
    }

    /**
     * Escalas do voluntário.
     */
    public function schedules(): JsonResponse
    {
        $member = $this->resolveMember();

        $schedules = ScheduleVolunteer::where('member_id', $member->id)
            ->with([
                'schedule.ministry:id,name,color',
                'schedule.congregation:id,name',
                'role:id,name',
            ])
            ->join('schedules', 'schedule_volunteers.schedule_id', '=', 'schedules.id')
            ->select('schedule_volunteers.*')
            ->orderBy('schedules.date', 'desc')
            ->orderBy('schedules.start_time', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $schedules,
        ]);
    }

    /**
     * Resposta do membro à escala de serviço (confirmar ou recusar com motivo).
     */
    public function respondSchedule(Request $request, ScheduleVolunteer $scheduleVolunteer): JsonResponse
    {
        $member = $this->resolveMember();

        if ($scheduleVolunteer->member_id !== $member->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Você não tem permissão para responder a escala de outro voluntário.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:confirmed,declined',
            'decline_reason' => 'required_if:status,declined|nullable|string|max:255',
        ]);

        $scheduleVolunteer->update([
            'status' => $validated['status'],
            'decline_reason' => $validated['status'] === 'declined' ? $validated['decline_reason'] : null,
            'responded_at' => Carbon::now(),
        ]);

        AuditService::log('member_portal.schedule_responded', $scheduleVolunteer, null, $validated);

        return response()->json([
            'status' => 'success',
            'message' => $validated['status'] === 'confirmed' ? 'Escala confirmada com sucesso!' : 'Escala recusada. Sua liderança foi notificada.',
            'data' => $scheduleVolunteer->load(['schedule.ministry:id,name,color', 'role:id,name']),
        ]);
    }

    /**
     * Inscrições do membro em eventos e eventos futuros disponíveis.
     */
    public function events(): JsonResponse
    {
        $member = $this->resolveMember();

        // 1. Minhas inscrições
        $myRegistrations = EventRegistration::where('member_id', $member->id)
            ->orWhere('email', $member->email)
            ->with(['event', 'attendance'])
            ->latest()
            ->get();

        // 2. Eventos abertos futuros
        $registeredEventIds = $myRegistrations->pluck('event_id')->toArray();

        $availableEvents = Event::where('status', 'scheduled')
            ->where('start_date', '>=', Carbon::today()->toDateString())
            ->whereNotIn('id', $registeredEventIds)
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'my_registrations' => $myRegistrations,
                'available_events' => $availableEvents,
            ],
        ]);
    }

    /**
     * Inscrição direta do membro em um evento.
     */
    public function registerEvent(Request $request, Event $event): JsonResponse
    {
        $member = $this->resolveMember();

        // Verifica se já está inscrito
        $alreadyRegistered = EventRegistration::where('event_id', $event->id)
            ->where(function ($q) use ($member) {
                $q->where('member_id', $member->id)
                    ->orWhere('email', $member->email);
            })
            ->first();

        if ($alreadyRegistered) {
            return response()->json([
                'status' => 'error',
                'message' => 'Você já está inscrito neste evento.',
                'data' => $alreadyRegistered,
            ], 422);
        }

        // Verifica capacidade
        $status = 'confirmed';
        if ($event->max_capacity) {
            $confirmedCount = EventRegistration::where('event_id', $event->id)
                ->where('status', 'confirmed')
                ->count();

            if ($confirmedCount >= $event->max_capacity) {
                $status = 'waitlist';
            }
        }

        $registration = EventRegistration::create([
            'tenant_id' => $event->tenant_id,
            'event_id' => $event->id,
            'member_id' => $member->id,
            'name' => $member->name,
            'email' => $member->email,
            'phone' => $member->phone,
            'status' => $status,
            'qr_code_token' => strtoupper(Str::random(12)),
        ]);

        AuditService::log('member_portal.event_registered', $registration, null, $registration->toArray());

        return response()->json([
            'status' => 'success',
            'message' => $status === 'confirmed' ? 'Inscrição realizada com sucesso! Apresente seu QR Code no dia.' : 'Capacidade máxima atingida. Você está na lista de espera.',
            'data' => $registration->load('event'),
        ], 201);
    }

    /**
     * Extrato pessoal de contribuições financeiras (dízimos e ofertas nominais).
     */
    public function contributions(Request $request): JsonResponse
    {
        $member = $this->resolveMember();
        $year = (int) $request->input('year', Carbon::now()->year);

        $contributions = FinancialTransaction::where('member_id', $member->id)
            ->where('type', 'income')
            ->where('status', 'confirmed')
            ->whereYear('transaction_date', $year)
            ->with(['category:id,name,color', 'account:id,name'])
            ->orderBy('transaction_date', 'desc')
            ->get();

        $totalContributed = (float) $contributions->sum('amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'year' => $year,
                'total_contributed' => $totalContributed,
                'contributions' => $contributions,
            ],
        ]);
    }

    /**
     * Pedidos de oração do membro.
     */
    public function prayerRequests(): JsonResponse
    {
        $member = $this->resolveMember();

        $prayers = PrayerRequest::where('member_id', $member->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $prayers,
        ]);
    }

    /**
     * Enviar novo pedido de oração.
     */
    public function storePrayerRequest(Request $request): JsonResponse
    {
        $member = $this->resolveMember();

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'required|string|max:2000',
            'is_confidential' => 'boolean',
        ]);

        $prayer = PrayerRequest::create([
            'tenant_id' => $member->tenant_id,
            'member_id' => $member->id,
            'requester_name' => $member->name,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'is_confidential' => $validated['is_confidential'] ?? false,
            'status' => 'pending',
        ]);

        AuditService::log('member_portal.prayer_requested', $prayer, null, $prayer->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Seu pedido de oração foi recebido e nossa equipe pastoral estará intercedendo por você.',
            'data' => $prayer,
        ], 201);
    }

    /**
     * Mural de avisos da igreja.
     */
    public function notices(): JsonResponse
    {
        $notices = ChurchNotice::where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', Carbon::now());
            })
            ->with('congregation:id,name')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notices,
        ]);
    }
}
