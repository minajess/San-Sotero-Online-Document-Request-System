<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function admin(Request $request): Response
    {
        $totalUsers = User::count();
        $totalResidents = User::where('role', 'resident')->count();
        $totalStaff = User::whereIn('role', [
            'secretary',
            'super_admin',
        ])->count();

        $recentUsers = User::latest()
            ->take(5)
            ->get([
                'id',
                'name',
                'email',
                'role',
                'created_at',
            ]);

        return Inertia::render('admin/dashboard', [
            'user' => $request->user(),

            'statistics' => [
                'totalUsers' => $totalUsers,
                'totalResidents' => $totalResidents,
                'totalStaff' => $totalStaff,

                'totalRequests' => DocumentRequest::count(),
                'completedRequests' => DocumentRequest::where('status', 'claimed')->count(),
            ],

            'recentActivity' => $recentUsers,
        ]);
    }

    public function secretary(Request $request): Response
    {
        return Inertia::render('secretary/dashboard', [
            'user' => $request->user(),
        ]);
    }

    public function resident(Request $request): Response
    {
        return Inertia::render('resident/dashboard', [
            'user' => $request->user(),
        ]);
    }
}
