<?php

namespace App\Http\Controllers\Api\v1\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\DashboardAnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DashboardController extends Controller
{
    protected DashboardAnalyticsService $analyticsService;

    public function __construct(DashboardAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function executive(): JsonResponse
    {
        $data = $this->analyticsService->getExecutiveOverview();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function demographics(): JsonResponse
    {
        $data = $this->analyticsService->getDemographics();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function ministries(): JsonResponse
    {
        $data = $this->analyticsService->getMinistryStats();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function financialEvolution(): JsonResponse
    {
        $data = $this->analyticsService->getFinancialEvolution();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function pastoralAlerts(): JsonResponse
    {
        $data = $this->analyticsService->getPastoralAlerts();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function exportMembers(): Response
    {
        $csv = $this->analyticsService->exportMembersCsv();
        $filename = 'rol-de-membros-' . Carbon::now()->format('Y-m-d') . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function exportFinancial(): Response
    {
        $csv = $this->analyticsService->exportFinancialCsv();
        $filename = 'relatorio-financeiro-' . Carbon::now()->format('Y-m-d') . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function exportAttendance(): Response
    {
        $csv = $this->analyticsService->exportAttendanceCsv();
        $filename = 'frequencia-eventos-' . Carbon::now()->format('Y-m-d') . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
