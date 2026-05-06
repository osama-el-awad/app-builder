<?php

namespace App\Http\Controllers;

use App\Models\App;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemoController extends Controller
{
    public function playground()
    {
        // For the demo, we'll pick the 'News App' template
        $template = Template::where('name', 'News App')->first() ?? Template::first();
        
        // Create a 'Pseudo-App' object for the Inertia view
        // We don't save it to the DB to avoid cluttering, 
        // but we pass enough data for the Builder to work in 'Demo Mode'
        
        $demoApp = [
            'id' => 'demo',
            'name' => 'Demo: My First App',
            'platform' => 'android',
            'settings' => $template->default_settings,
            'pages' => array_map(function($pageData, $index) {
                return [
                    'id' => 'demo-page-' . ($index + 1),
                    'name' => $pageData['name'],
                    'components' => $pageData['components']
                ];
            }, $template->structure['pages'], array_keys($template->structure['pages']))
        ];

        return Inertia::render('Apps/Builder', [
            'app' => $demoApp,
            'isDemo' => true
        ]);
    }
}
