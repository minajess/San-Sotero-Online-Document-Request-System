<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$secretary = App\Models\User::factory()->create(['role' => 'secretary']);
Illuminate\Support\Facades\Auth::login($secretary);
$request = Illuminate\Http\Request::create('/secretary/claimed-documents?month=2026-05', 'GET');
$response = Illuminate\Support\Facades\Route::dispatch($request);
file_put_contents('debug_route_output.txt', "STATUS=" . $response->getStatusCode() . PHP_EOL . substr((string) $response->getContent(), 0, 1000) . PHP_EOL);