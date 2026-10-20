<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleVolunteer extends Model
{
    use HasFactory, BelongsToTenant;

    protected $attributes = [
        'status' => 'pending',
    ];

    protected $fillable = [
        'tenant_id',
        'schedule_id',
        'member_id',
        'ministry_role_id',
        'status',
        'decline_reason',
        'substituted_by_member_id',
        'confirmed_at',
        'notes',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(MinistryRole::class, 'ministry_role_id');
    }

    public function substitutedBy(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'substituted_by_member_id');
    }

    public function confirm(): void
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
            'decline_reason' => null,
        ]);
    }

    public function decline(string $reason): void
    {
        $this->update([
            'status' => 'declined',
            'decline_reason' => $reason,
        ]);
    }

    public function substitute(int $substituteMemberId): void
    {
        $this->update([
            'status' => 'substituted',
            'substituted_by_member_id' => $substituteMemberId,
        ]);
    }
}
