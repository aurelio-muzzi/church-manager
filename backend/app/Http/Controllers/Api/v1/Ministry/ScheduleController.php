<?php

namespace App\Http\Controllers\Api\v1\Ministry;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ministry\RespondScheduleRequest;
use App\Http\Requests\Ministry\StoreScheduleRequest;
use App\Models\Schedule;
use App\Models\ScheduleVolunteer;
use App\Services\AuditService;
use App\Services\ScheduleConflictService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Schedule::query()->with([
            'ministry:id,name,color',
            'congregation:id,name',
            'volunteers.member:id,name,email,phone',
            'volunteers.role:id,name',
            'volunteers.substitutedBy:id,name',
        ]);

        if ($request->filled('ministry_id')) {
            $query->where('ministry_id', $request->ministry_id);
        }

        if ($request->filled('congregation_id')) {
            $query->where('congregation_id', $request->congregation_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $schedules = $query->orderBy('date', 'desc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $schedules,
        ]);
    }

    public function store(StoreScheduleRequest $request, ScheduleConflictService $conflictService): JsonResponse
    {
        $validated = $request->validated();
        $volunteersData = $validated['volunteers'] ?? [];
        $allowConflicts = $request->boolean('allow_conflicts');

        // Detecção de conflitos de horário para cada voluntário
        if (!$allowConflicts && !empty($volunteersData)) {
            foreach ($volunteersData as $vol) {
                $conflict = $conflictService->detectConflict(
                    $vol['member_id'],
                    $validated['date'],
                    $validated['start_time'],
                    $validated['end_time']
                );

                if ($conflict) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Conflito de escala detectado: o voluntário já possui escala em horário sobreposto nesta mesma data.',
                        'conflict' => $conflict,
                        'conflicting_member_id' => $vol['member_id'],
                    ], 422);
                }
            }
        }

        $schedule = DB::transaction(function () use ($validated, $volunteersData) {
            $schedule = Schedule::create([
                'ministry_id' => $validated['ministry_id'],
                'congregation_id' => $validated['congregation_id'] ?? null,
                'title' => $validated['title'],
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'notes' => $validated['notes'] ?? null,
                'status' => $validated['status'] ?? 'published',
            ]);

            foreach ($volunteersData as $vol) {
                ScheduleVolunteer::create([
                    'schedule_id' => $schedule->id,
                    'member_id' => $vol['member_id'],
                    'ministry_role_id' => $vol['ministry_role_id'] ?? null,
                    'status' => 'pending',
                ]);
            }

            AuditService::log('schedule.created', $schedule, null, $schedule->toArray());

            return $schedule;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Escala criada com sucesso.',
            'data' => $schedule->load([
                'ministry:id,name,color',
                'congregation:id,name',
                'volunteers.member:id,name,email,phone',
                'volunteers.role:id,name',
            ]),
        ], 201);
    }

    public function show(Schedule $schedule): JsonResponse
    {
        $schedule->load([
            'ministry:id,name,color',
            'congregation:id,name',
            'volunteers.member:id,name,email,phone',
            'volunteers.role:id,name',
            'volunteers.substitutedBy:id,name',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $schedule,
        ]);
    }

    public function update(StoreScheduleRequest $request, Schedule $schedule, ScheduleConflictService $conflictService): JsonResponse
    {
        $validated = $request->validated();
        $volunteersData = $validated['volunteers'] ?? null;
        $allowConflicts = $request->boolean('allow_conflicts');

        if (!$allowConflicts && !empty($volunteersData)) {
            foreach ($volunteersData as $vol) {
                $conflict = $conflictService->detectConflict(
                    $vol['member_id'],
                    $validated['date'],
                    $validated['start_time'],
                    $validated['end_time'],
                    $schedule->id
                );

                if ($conflict) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Conflito de escala detectado: o voluntário já possui escala em horário sobreposto.',
                        'conflict' => $conflict,
                        'conflicting_member_id' => $vol['member_id'],
                    ], 422);
                }
            }
        }

        DB::transaction(function () use ($schedule, $validated, $volunteersData) {
            $oldData = $schedule->toArray();
            $schedule->update([
                'ministry_id' => $validated['ministry_id'],
                'congregation_id' => $validated['congregation_id'] ?? null,
                'title' => $validated['title'],
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'notes' => $validated['notes'] ?? null,
                'status' => $validated['status'] ?? $schedule->status,
            ]);

            if ($volunteersData !== null) {
                // Atualiza lista de voluntários
                $schedule->volunteers()->delete();
                foreach ($volunteersData as $vol) {
                    ScheduleVolunteer::create([
                        'schedule_id' => $schedule->id,
                        'member_id' => $vol['member_id'],
                        'ministry_role_id' => $vol['ministry_role_id'] ?? null,
                        'status' => 'pending',
                    ]);
                }
            }

            AuditService::log('schedule.updated', $schedule, $oldData, $schedule->toArray());
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Escala atualizada com sucesso.',
            'data' => $schedule->load([
                'ministry:id,name,color',
                'congregation:id,name',
                'volunteers.member:id,name,email,phone',
                'volunteers.role:id,name',
            ]),
        ]);
    }

    public function destroy(Schedule $schedule): JsonResponse
    {
        AuditService::log('schedule.deleted', $schedule, $schedule->toArray());
        $schedule->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Escala removida com sucesso.',
        ]);
    }

    public function respond(
        RespondScheduleRequest $request,
        Schedule $schedule,
        ?ScheduleVolunteer $scheduleVolunteer = null
    ): JsonResponse {
        $validated = $request->validated();
        $volunteer = $scheduleVolunteer;

        if (!$volunteer || !$volunteer->exists) {
            $volunteerId = $request->input('schedule_volunteer_id');
            if ($volunteerId) {
                $volunteer = $schedule->volunteers()->findOrFail($volunteerId);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Voluntário da escala não especificado.',
                ], 422);
            }
        }

        switch ($validated['action']) {
            case 'confirm':
                $volunteer->confirm();
                $message = 'Presença confirmada na escala com sucesso.';
                AuditService::log('schedule.volunteer_confirmed', $schedule, null, ['volunteer_id' => $volunteer->id]);
                break;

            case 'decline':
                $volunteer->decline($validated['decline_reason']);
                $message = 'Recusa de escala registrada.';
                AuditService::log('schedule.volunteer_declined', $schedule, null, [
                    'volunteer_id' => $volunteer->id,
                    'reason' => $validated['decline_reason'],
                ]);
                break;

            case 'substitute':
                $volunteer->substitute($validated['substituted_by_member_id']);
                $message = 'Substituição registrada com sucesso.';
                AuditService::log('schedule.volunteer_substituted', $schedule, null, [
                    'volunteer_id' => $volunteer->id,
                    'substituted_by' => $validated['substituted_by_member_id'],
                ]);
                break;

            default:
                $message = 'Resposta processada.';
        }

        if (!empty($validated['notes'])) {
            $volunteer->notes = $validated['notes'];
            $volunteer->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $volunteer->fresh(['member:id,name', 'role:id,name', 'substitutedBy:id,name']),
        ]);
    }

    public function checkConflicts(Request $request, ScheduleConflictService $conflictService): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'ignore_schedule_id' => ['nullable', 'integer'],
        ]);

        $conflict = $conflictService->detectConflict(
            $validated['member_id'],
            $validated['date'],
            $validated['start_time'],
            $validated['end_time'],
            $validated['ignore_schedule_id'] ?? null
        );

        return response()->json([
            'status' => 'success',
            'has_conflict' => $conflict !== null,
            'conflict' => $conflict,
        ]);
    }
}
