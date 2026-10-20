<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditService
{
    protected static array $sensitiveKeys = [
        'password',
        'password_confirmation',
        'token',
        'remember_token',
        'secret',
        'api_key',
    ];

    public static function log(
        string $action,
        ?Model $auditable = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $tenantId = null,
        ?int $userId = null
    ): AuditLog {
        $user = auth()->user();
        $tenantContext = app(TenantContext::class);

        $resolvedTenantId = $tenantId ?? $tenantContext->getTenantId();
        $resolvedUserId = $userId ?? $user?->id;

        return AuditLog::create([
            'tenant_id' => $resolvedTenantId,
            'user_id' => $resolvedUserId,
            'action' => $action,
            'auditable_type' => $auditable ? get_class($auditable) : null,
            'auditable_id' => $auditable?->getKey(),
            'old_values' => $oldValues ? self::sanitize($oldValues) : null,
            'new_values' => $newValues ? self::sanitize($newValues) : null,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ]);
    }

    protected static function sanitize(array $data): array
    {
        $sanitized = [];
        foreach ($data as $key => $value) {
            if (in_array(strtolower($key), self::$sensitiveKeys, true)) {
                $sanitized[$key] = '***REDACTED***';
            } elseif (is_array($value)) {
                $sanitized[$key] = self::sanitize($value);
            } else {
                $sanitized[$key] = $value;
            }
        }
        return $sanitized;
    }
}
