<?php

namespace App\Http\Controllers;

use App\Models\App;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\AppAnalyticsEvent;
use App\Support\Analytics;

class AppController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $apps = auth()->user()->apps()->withCount('pages')->get();
        $appIds = $apps->pluck('id');

        // Fetch time-series data for the last 7 days
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $chartData[] = [
                'date' => now()->subDays($i)->format('M d'),
                'conversions' => AppAnalyticsEvent::whereIn('app_id', $appIds)
                    ->where('event', 'conversion')
                    ->whereDate('created_at', $date)
                    ->count(),
                'views' => AppAnalyticsEvent::whereIn('app_id', $appIds)
                    ->where('event', 'view')
                    ->whereDate('created_at', $date)
                    ->count(),
            ];
        }

        return Inertia::render('Dashboard', [
            'apps' => $apps,
            'analytics' => [
                'views' => $apps->sum('views_count'),
                'shares' => $apps->sum('shares_count'),
                'clones' => $apps->sum('clones_count'),
                'conversions' => AppAnalyticsEvent::whereIn('app_id', $appIds)->where('event', 'conversion')->count(),
                'chartData' => $chartData,
            ],
            'onboarding' => [
                'registered' => true,
                'created_app' => $apps->isNotEmpty(),
                'customized_app' => AppAnalyticsEvent::whereIn('app_id', $appIds)->where('event', 'conversion')->where('channel', 'customized_app')->exists(),
                'published_app' => $apps->contains(fn ($app) => $app->is_public),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $templates = cache()->remember('templates_list', now()->addHours(24), function () {
            return \App\Models\Template::all();
        });

        return Inertia::render('Apps/Create', [
            'templates' => $templates
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        $appCount = $user->apps()->count();

        // 1. Free tier limit (Not subscribed)
        if (!$user->subscribed() && $appCount >= 1) {
            return redirect()->route('subscription.index')->with('error', 'Free plan is limited to 1 app. Upgrade to Basic for more!');
        }

        // 2. Basic plan limit
        if ($user->isBasic() && $appCount >= 3) {
            return redirect()->route('subscription.index')->with('error', 'Basic plan is limited to 3 apps. Upgrade to Pro for unlimited apps!');
        }

        $request->validate([
            'name' => 'nullable|string|max:255',
            'template_id' => 'nullable|exists:templates,id',
        ]);

        $template = $request->template_id ? \App\Models\Template::find($request->template_id) : null;
        $appName = $request->name ?: ($template ? $template->name : 'My Awesome App');

        if ($template && !auth()->user()->isPro()) {
            $restrictedTypes = ['list', 'dynamic_list', 'form', 'input'];
            foreach ($template->structure['pages'] ?? [] as $pageData) {
                if ($this->containsRestrictedComponents($pageData['components'] ?? [], $restrictedTypes)) {
                    return redirect()->route('subscription.index')->with('error', 'Templates with Dynamic Data and Forms are only available in the Pro plan. You can still create a blank app for free.');
                }
            }
        }

        $app = auth()->user()->apps()->create([
            'name' => $appName,
            'platform' => 'android',
        ]);

        if ($template) {
            $this->createFromTemplate($app, $template);
        } else {
            // Create a default home page
            $app->pages()->create([
                'name' => 'Home',
                'layout_json' => ['components' => []]
            ]);
        }

        Analytics::conversion('created_app', $app, $user->id, $request, [
            'template_id' => $template?->id,
            'template_name' => $template?->name,
        ]);

        return redirect()->route('apps.show', $app->id);
    }

    private function createFromTemplate($app, $template)
    {
        $app->update(['settings' => $template->default_settings]);
        
        $pageMap = []; // Map template page index to actual page ID

        foreach ($template->structure['pages'] as $index => $pageData) {
            $page = $app->pages()->create([
                'name' => $pageData['name'],
                'layout_json' => ['components' => $pageData['components']]
            ]);
            $pageMap[$index + 1] = $page->id; // Using 1-based index as in the seeder

            foreach ($pageData['components'] as $compIndex => $compData) {
                $this->saveComponent($page->id, $compData, $compIndex);
            }
        }

        // Fix navigation targets if they reference template indices
        foreach ($app->pages as $page) {
            foreach ($page->components as $component) {
                $config = $component->config;
                if (isset($config['action']['type']) && $config['action']['type'] === 'navigate') {
                    $target = $config['action']['target'];
                    if (isset($pageMap[$target])) {
                        $config['action']['target'] = $pageMap[$target];
                        $component->update(['config' => $config]);
                    }
                }
            }
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(App $app)
    {
        $this->authorize('view', $app);

        if (!$app->preview_token) {
            $app->update(['preview_token' => Str::random(48)]);
        }

        return Inertia::render('Apps/Builder', [
            'app' => $app->load(['pages' => function($query) {
                $query->orderBy('id');
                $query->with(['components' => function($q) {
                    $q->whereNull('parent_id')->with('children')->orderBy('order');
                }]);
            }])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(App $app)
    {
        $this->authorize('update', $app);

        if (!$app->preview_token) {
            $app->update(['preview_token' => Str::random(48)]);
        }

        return Inertia::render('Apps/Settings', [
            'app' => $app,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, App $app)
    {
        $this->authorize('update', $app);

        if ($request->has('new_page_name')) {
            $request->validate([
                'new_page_name' => 'required|string|max:255',
            ]);

            $page = $app->pages()->create([
                'name' => $request->new_page_name,
                'layout_json' => ['components' => []]
            ]);

            return redirect()->route('apps.show', $app)->with('success', "Page {$page->name} added successfully!");
        }

        if ($request->has('settings_only')) {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'thumbnail' => 'nullable|url|max:2048',
                'is_public' => 'boolean',
                'platform' => 'required|in:android,ios',
            ]);

            $wasPublic = $app->is_public;

            $app->update([
                'name' => $request->name,
                'description' => $request->description,
                'thumbnail' => $request->thumbnail,
                'is_public' => $request->boolean('is_public'),
                'platform' => $request->platform,
                'preview_token' => $app->preview_token ?: Str::random(48),
            ]);

            if (!$wasPublic && $app->is_public) {
                Analytics::conversion('published_app', $app, auth()->id(), $request, [
                    'source' => 'settings',
                ]);
            }

            return back()->with('success', 'App settings updated successfully!');
        }

        if ($request->has('publish_quick')) {
            $app->update([
                'is_public' => true,
                'preview_token' => $app->preview_token ?: Str::random(48),
            ]);

            Analytics::conversion('published_app', $app, auth()->id(), $request, [
                'source' => 'builder',
            ]);

            return back()->with('success', 'App published successfully!');
        }

        if ($request->has('regenerate_preview_token')) {
            $app->update(['preview_token' => Str::random(48)]);

            return back()->with('success', 'Preview link regenerated successfully!');
        }

        $request->validate([
            'page_id' => 'required|exists:app_pages,id',
            'components' => 'required|array',
            'settings' => 'nullable|array',
        ]);

        $page = $app->pages()->findOrFail($request->page_id);

        // Validate types first
        if (!auth()->user()->isPro()) {
            $restrictedTypes = ['list', 'dynamic_list', 'form', 'input'];
            if ($this->containsRestrictedComponents($request->components, $restrictedTypes)) {
                return back()->with('error', 'Dynamic Data and Forms are only available in the Pro plan.');
            }
        }

        // Recursive delete is handled by cascade in DB
        $page->components()->delete();

        foreach ($request->components as $index => $compData) {
            $this->saveComponent($page->id, $compData, $index);
        }

        // Also update layout_json for quick access
        $page->update([
            'layout_json' => ['components' => $request->components]
        ]);

        if ($request->has('settings')) {
            $app->update(['settings' => $request->settings]);
        }

        Analytics::conversion('customized_app', $app, auth()->id(), $request, [
            'page_id' => $page->id,
            'components_count' => count($request->components),
        ]);

        return back()->with('success', 'App saved successfully!');
    }

    private function containsRestrictedComponents(array $components, array $restrictedTypes): bool
    {
        foreach ($components as $component) {
            if (in_array($component['type'] ?? null, $restrictedTypes, true)) {
                return true;
            }

            if (!empty($component['children']) && $this->containsRestrictedComponents($component['children'], $restrictedTypes)) {
                return true;
            }
        }

        return false;
    }

    private function saveComponent($pageId, $data, $order, $parentId = null)
    {
        $component = \App\Models\AppComponent::create([
            'app_page_id' => $pageId,
            'parent_id' => $parentId,
            'type' => $data['type'],
            'config' => $data['config'] ?? [],
            'order' => $order,
        ]);

        if (isset($data['children']) && is_array($data['children'])) {
            foreach ($data['children'] as $childIndex => $childData) {
                $this->saveComponent($pageId, $childData, $childIndex, $component->id);
            }
        }

        return $component;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(App $app)
    {
        $this->authorize('delete', $app);

        $app->delete();

        return redirect()->route('dashboard')->with('success', 'App deleted successfully!');
    }
}
