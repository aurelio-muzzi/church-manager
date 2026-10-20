<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\TenantContext;
use Illuminate\Http\JsonResponse;

class TenantProfileController extends Controller
{
    public function show(): JsonResponse
    {
        $tenant = app(TenantContext::class)->getTenant();

        if (!$tenant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nenhuma igreja selecionada.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $tenant->id,
                'uuid' => $tenant->uuid,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'document_number' => $tenant->document_number,
                'email' => $tenant->email,
                'phone' => $tenant->phone,
                'timezone' => $tenant->timezone,
                'status' => $tenant->status,
                'created_at' => $tenant->created_at,
            ],
        ]);
    }
}
