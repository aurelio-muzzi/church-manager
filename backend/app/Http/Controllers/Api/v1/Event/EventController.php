<?php

namespace App\Http\Controllers\Api\v1\Event;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\CheckInRequest;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\StoreRegistrationRequest;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventRegistration;
use App\Models\Member;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()->with([
            'congregation:id,name',
            'ministry:id,name,color',
        ])->withCount(['registrations', 'attendances']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('congregation_id')) {
            $query->where('congregation_id', $request->congregation_id);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('start_date', '>=', $request->start_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $events = $query->orderBy('start_date', 'desc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $events,
        ]);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $event = DB::transaction(function () use ($validated) {
            $slug = $validated['slug'] ?? Str::slug($validated['title']);
            if (Event::where('slug', $slug)->exists()) {
                $slug .= '-' . Str::random(4);
            }

            $event = Event::create([
                'congregation_id' => $validated['congregation_id'] ?? null,
                'ministry_id' => $validated['ministry_id'] ?? null,
                'title' => $validated['title'],
                'slug' => $slug,
                'type' => $validated['type'] ?? 'service',
                'description' => $validated['description'] ?? null,
                'location' => $validated['location'] ?? null,
                'banner_url' => $validated['banner_url'] ?? null,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'] ?? null,
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'] ?? null,
                'max_capacity' => $validated['max_capacity'] ?? null,
                'requires_registration' => $validated['requires_registration'] ?? false,
                'is_free' => $validated['is_free'] ?? true,
                'price' => $validated['price'] ?? 0.00,
                'status' => $validated['status'] ?? 'published',
            ]);

            AuditService::log('event.created', $event, null, $event->toArray());

            return $event;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Evento criado com sucesso.',
            'data' => $event->load(['congregation', 'ministry']),
        ], 201);
    }

    public function show(Event $event): JsonResponse
    {
        $event->load([
            'congregation:id,name',
            'ministry:id,name,color',
            'registrations' => function ($q) {
                $q->with('member:id,name,email,phone')->latest()->take(50);
            },
            'attendances' => function ($q) {
                $q->with('checkedInBy:id,name')->latest('checked_in_at')->take(50);
            },
        ])->loadCount(['registrations', 'attendances']);

        return response()->json([
            'status' => 'success',
            'data' => $event,
        ]);
    }

    public function update(StoreEventRequest $request, Event $event): JsonResponse
    {
        $oldData = $event->toArray();
        $event->update($request->validated());

        AuditService::log('event.updated', $event, $oldData, $event->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Evento atualizado com sucesso.',
            'data' => $event->load(['congregation', 'ministry']),
        ]);
    }

    public function destroy(Event $event): JsonResponse
    {
        AuditService::log('event.deleted', $event, $event->toArray());
        $event->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Evento removido com sucesso.',
        ]);
    }

    public function registrations(Event $event): JsonResponse
    {
        $registrations = $event->registrations()
            ->with(['member:id,name,email,phone', 'attendance:id,registration_id,checked_in_at'])
            ->latest('registered_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $registrations,
        ]);
    }

    public function register(StoreRegistrationRequest $request, Event $event): JsonResponse
    {
        $validated = $request->validated();

        $status = 'confirmed';
        $message = 'Inscrição realizada com sucesso!';

        // Verificação de capacidade máxima do evento
        if ($event->max_capacity) {
            $confirmedCount = $event->registrations()->where('status', 'confirmed')->count();
            if ($confirmedCount >= $event->max_capacity) {
                $status = 'waitlist';
                $message = 'Capacidade máxima atingida. Inscrição adicionada à Lista de Espera.';
            }
        }

        // Se informou member_id e não preencheu nome/email, recupera dados do membro
        if (!empty($validated['member_id']) && empty($validated['name'])) {
            $member = Member::find($validated['member_id']);
            if ($member) {
                $validated['name'] = $member->name;
                $validated['email'] = $validated['email'] ?? $member->email;
                $validated['phone'] = $validated['phone'] ?? $member->phone;
            }
        }

        $registration = EventRegistration::create([
            'event_id' => $event->id,
            'member_id' => $validated['member_id'] ?? null,
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'status' => $status,
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditService::log('event.registered', $event, null, [
            'registration_id' => $registration->id,
            'name' => $registration->name,
            'qr_code_token' => $registration->qr_code_token,
            'status' => $status,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $registration->load('member:id,name'),
        ], 201);
    }

    public function checkIn(CheckInRequest $request, Event $event): JsonResponse
    {
        $validated = $request->validated();
        $registration = null;
        $memberId = $validated['member_id'] ?? null;
        $visitorId = $validated['visitor_id'] ?? null;
        $name = $validated['name'] ?? null;
        $checkInType = $validated['check_in_type'] ?? 'qr_code';

        // 1. Check-in via QR Code Token
        if (!empty($validated['qr_code_token'])) {
            $token = trim($validated['qr_code_token']);
            $registration = $event->registrations()->where('qr_code_token', $token)->first();

            if (!$registration) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token de QR Code inválido ou não pertencente a este evento.',
                ], 404);
            }

            $name = $registration->name;
            $memberId = $registration->member_id;
            $checkInType = 'qr_code';
        }
        // 2. Check-in via ID de Inscrição
        elseif (!empty($validated['registration_id'])) {
            $registration = $event->registrations()->findOrFail($validated['registration_id']);
            $name = $registration->name;
            $memberId = $registration->member_id;
            $checkInType = 'manual';
        }
        // 3. Check-in manual via Membro
        elseif ($memberId) {
            $member = Member::findOrFail($memberId);
            $name = $member->name;
            $checkInType = 'manual';
        }

        if (empty($name)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Informe ao menos o token do QR Code, número da inscrição ou membro para realizar o check-in.',
            ], 422);
        }

        // Validação de Duplicidade (Idempotência com retorno amigável)
        $existingQuery = EventAttendance::where('event_id', $event->id);

        if ($registration) {
            $existingQuery->where('registration_id', $registration->id);
        } elseif ($memberId) {
            $existingQuery->where('member_id', $memberId);
        } else {
            $existingQuery->where('name', $name);
        }

        $existing = $existingQuery->first();

        if ($existing) {
            return response()->json([
                'status' => 'already_checked_in',
                'message' => "Check-in já registrado anteriormente para {$name}.",
                'data' => $existing,
            ], 200);
        }

        // Cria o registro de presença
        $attendance = EventAttendance::create([
            'event_id' => $event->id,
            'registration_id' => $registration?->id,
            'member_id' => $memberId,
            'visitor_id' => $visitorId,
            'name' => $name,
            'check_in_type' => $checkInType,
            'checked_in_by_user_id' => auth()->id(),
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditService::log('event.checked_in', $event, null, [
            'attendance_id' => $attendance->id,
            'name' => $name,
            'type' => $checkInType,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Check-in confirmado com sucesso para {$name}!",
            'data' => $attendance->load(['registration', 'member:id,name']),
        ], 201);
    }

    public function stats(Event $event): JsonResponse
    {
        $totalConfirmed = $event->registrations()->where('status', 'confirmed')->count();
        $totalWaitlist = $event->registrations()->where('status', 'waitlist')->count();
        $totalAttendances = $event->attendances()->count();
        $maxCapacity = $event->max_capacity;

        $attendanceRate = $totalConfirmed > 0
            ? round(($totalAttendances / $totalConfirmed) * 100, 1)
            : 0;

        $occupancyRate = ($maxCapacity && $maxCapacity > 0)
            ? round(($totalAttendances / $maxCapacity) * 100, 1)
            : null;

        $checkInsByType = [
            'qr_code' => $event->attendances()->where('check_in_type', 'qr_code')->count(),
            'manual' => $event->attendances()->where('check_in_type', 'manual')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'event_id' => $event->id,
                'title' => $event->title,
                'max_capacity' => $maxCapacity,
                'total_confirmed_registrations' => $totalConfirmed,
                'total_waitlist' => $totalWaitlist,
                'total_attendances' => $totalAttendances,
                'attendance_rate' => $attendanceRate,
                'occupancy_rate' => $occupancyRate,
                'is_full' => $event->isCapacityFull(),
                'check_in_by_type' => $checkInsByType,
            ],
        ]);
    }
}
