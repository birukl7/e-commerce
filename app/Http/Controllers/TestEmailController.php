<?php

namespace App\Http\Controllers;

use App\View\Components\TestEmails;
use Illuminate\Http\Request;

class TestEmailController extends Controller
{
    public function __invoke(Request $request)
    {
        $component = new TestEmails(app('App\Services\NotificationService'));
        return response()->json($component->sendTestEmail($request->type));
    }
}
