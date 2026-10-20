<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\ScheduleVolunteer;

class ScheduleConflictService
{
    /**
     * Verifica se um membro possui conflito de horário em outra escala na mesma data.
     * Retorna array com detalhes do conflito se houver, ou null caso o horário esteja livre.
     */
    public function detectConflict(
        int $memberId,
        string $date,
        string $startTime,
        string $endTime,
        ?int $ignoreScheduleId = null
    ): ?array {
        $tenantContext = app(TenantContext::class);
        $tenantId = $tenantContext->getTenantId();

        $normStartTime = substr($startTime, 0, 5);
        $normEndTime = substr($endTime, 0, 5);

        $query = ScheduleVolunteer::query()
            ->where('schedule_volunteers.member_id', $memberId)
            ->whereIn('schedule_volunteers.status', ['pending', 'confirmed'])
            ->join('schedules', 'schedule_volunteers.schedule_id', '=', 'schedules.id')
            ->whereDate('schedules.date', $date)
            ->whereNull('schedules.deleted_at')
            ->where('schedules.status', '!=', 'cancelled')
            // Interseção de intervalos de tempo: (start_A < end_B) AND (end_A > start_B)
            ->whereRaw('SUBSTR(schedules.start_time, 1, 5) < ?', [$normEndTime])
            ->whereRaw('SUBSTR(schedules.end_time, 1, 5) > ?', [$normStartTime]);

        if ($tenantId) {
            $query->where('schedules.tenant_id', $tenantId);
        }

        if ($ignoreScheduleId) {
            $query->where('schedules.id', '!=', $ignoreScheduleId);
        }

        $conflictingItem = $query->with(['schedule.ministry', 'role'])->select('schedule_volunteers.*')->first();

        if ($conflictingItem) {
            $schedule = $conflictingItem->schedule;
            return [
                'has_conflict' => true,
                'schedule_id' => $schedule->id,
                'schedule_title' => $schedule->title,
                'ministry_name' => $schedule->ministry?->name ?? 'Ministério',
                'date' => $schedule->date->toDateString(),
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'status' => $conflictingItem->status,
                'message' => "O voluntário já está escalado no '{$schedule->ministry?->name}' ({$schedule->start_time} às {$schedule->end_time}) nesta mesma data.",
            ];
        }

        return null;
    }
}
