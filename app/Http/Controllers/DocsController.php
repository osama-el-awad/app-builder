<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DocsController extends Controller
{
    public function index()
    {
        return Inertia::render('Docs/Index');
    }

    public function guide()
    {
        return Inertia::render('Docs/Guide');
    }

    public function faq()
    {
        return Inertia::render('Docs/Faq');
    }

    public function api()
    {
        return Inertia::render('Docs/Api');
    }
}
