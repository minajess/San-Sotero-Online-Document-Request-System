<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\DocumentRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityReportController extends Controller
{
    public function admin(Request $request): Response
    {
        return $this->report('admin/reports', $request);
    }

    private function report(string $component, Request $request): Response
    {
        $search = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ])['search'] ?? null;

        $activities = ActivityLog::query();
        $terms = preg_split('/\s+/', trim((string) $search), -1, PREG_SPLIT_NO_EMPTY);
        foreach ($terms ?: [] as $term) {
            $activities->where(function ($query) use ($term): void {
                $query->where('description', 'like', '%'.$term.'%')
                    ->orWhereExists(function ($requestQuery) use ($term): void {
                        $requestQuery->selectRaw('1')
                            ->from('document_requests')
                            ->whereColumn('document_requests.id', 'activity_logs.subject_id')
                            ->where(
                                'activity_logs.subject_type',
                                (new DocumentRequest)->getMorphClass(),
                            )
                            ->where(function ($requestQuery) use ($term): void {
                                foreach ([
                                    'first_name',
                                    'middle_name',
                                    'surname',
                                    'claimed_by_name',
                                ] as $column) {
                                    $requestQuery->orWhere(
                                        'document_requests.'.$column,
                                        'like',
                                        '%'.$term.'%',
                                    );
                                }
                            });
                    });
            });
        }

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
            'activities' => $activities
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
            'search' => $search ?? '',
        ]);
    }
}
