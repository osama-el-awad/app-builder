<?php

namespace App\Http\Controllers;

use App\Models\App;
use App\Support\Analytics;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShowcaseController extends Controller
{
    public function index()
    {
        return Inertia::render('Showcase/Index', [
            'apps' => App::where('is_public', true)->get()
        ]);
    }

    public function clone(App $app)
    {
        if (!$app->is_public) {
            abort(403);
        }

        $user = auth()->user();

        // Check limits before cloning
        $appCount = $user->apps()->count();
        if (!$user->subscribed() && $appCount >= 1) {
            return back()->with('error', 'Free plan is limited to 1 app. Upgrade to clone more!');
        }

        if ($user->isBasic() && $appCount >= 3) {
            return back()->with('error', 'Basic plan is limited to 3 apps. Upgrade to Pro for unlimited apps!');
        }

        $newApp = $user->apps()->create([
            'name' => $app->name . ' (Clone)',
            'platform' => $app->platform,
            'settings' => $app->settings,
        ]);

        foreach ($app->pages as $page) {
            $newPage = $newApp->pages()->create([
                'name' => $page->name,
                'layout_json' => $page->layout_json,
            ]);

            $this->cloneComponents($page->components()->whereNull('parent_id')->get(), $newPage->id);
        }

        $app->increment('clones_count');
        Analytics::track('clone', $app, $user->id, request(), 'showcase', [
            'new_app_id' => $newApp->id,
        ]);
        Analytics::conversion('cloned_showcase_app', $newApp, $user->id, request(), [
            'source_app_id' => $app->id,
        ]);

        return redirect()->route('apps.show', $newApp->id)->with('success', 'App cloned successfully!');
    }

    private function cloneComponents($components, $pageId, $parentId = null)
    {
        foreach ($components as $component) {
            $newComp = \App\Models\AppComponent::create([
                'app_page_id' => $pageId,
                'parent_id' => $parentId,
                'type' => $component->type,
                'config' => $component->config,
                'order' => $component->order,
            ]);

            if ($component->children()->count() > 0) {
                $this->cloneComponents($component->children, $pageId, $newComp->id);
            }
        }
    }
}
