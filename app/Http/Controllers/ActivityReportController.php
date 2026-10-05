<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\DocumentRequest;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class ActivityReportController extends Controller
{
    public function admin(): Response
    {
        return $this->report('admin/reports');
    }

    private function report(string $component): Response
    {
        return Inertia::render($component, [
            'summary' => [
                'totalActivities' => ActivityLog::count(),
                'totalRequests' => DocumentRequest::count(),
                'pendingRequests' => DocumentRequest::where('status', 'pending')->count(),
                'processingRequests' => DocumentRequest::where('status', 'processing')->count(),
                'readyToClaim' => DocumentRequest::where('status', 'ready')->count(),
                'claimedRequests' => DocumentRequest::where('status', 'claimed')->count(),
                'totalResidents' => User::where('role', 'resident')->count(),
            ],
            'activities' => ActivityLog::query()
                ->select([
                    'id',
                    'actor_id',
                    'actor_name',
                    'actor_role',
                    'event',
                    'description',
                    'created_at',
                ])
                ->with('actor:id,name,role')
                ->latest()
                ->paginate(25)
                ->withQueryString(),
        ]);
    }
}
