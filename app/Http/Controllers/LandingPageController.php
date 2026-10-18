<?php

namespace App\Http\Controllers;

use App\Support\LandingPageContent;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('welcome', [
            'landingPage' => LandingPageContent::current(),
        ]);
    }
}
