<?php

namespace Tests\Feature;

use App\Models\App;
use App\Models\AppAnalyticsEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GrowthLayerTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_preview_tracks_views_for_non_owner(): void
    {
        $owner = User::factory()->create();
        $app = App::factory()->for($owner)->create([
            'is_public' => true,
            'views_count' => 0,
        ]);

        $this->get(route('apps.public.show', $app))->assertOk();

        $this->assertSame(1, $app->fresh()->views_count);
        $this->assertDatabaseHas('app_analytics_events', [
            'app_id' => $app->id,
            'event' => 'view',
            'channel' => 'public',
        ]);
    }

    public function test_share_endpoint_tracks_shares(): void
    {
        $user = User::factory()->create();
        $app = App::factory()->for($user)->create(['shares_count' => 0]);

        $this->actingAs($user)
            ->postJson(route('apps.share', $app), ['channel' => 'copy'])
            ->assertOk()
            ->assertJsonPath('shares_count', 1);

        $this->assertDatabaseHas('app_analytics_events', [
            'app_id' => $app->id,
            'user_id' => $user->id,
            'event' => 'share',
            'channel' => 'copy',
        ]);
    }

    public function test_quick_publish_tracks_conversion(): void
    {
        $user = User::factory()->create();
        $app = App::factory()->for($user)->create(['is_public' => false]);

        $this->actingAs($user)
            ->put(route('apps.update', $app), ['publish_quick' => true])
            ->assertSessionHas('success');

        $this->assertTrue($app->fresh()->is_public);
        $this->assertDatabaseHas('app_analytics_events', [
            'app_id' => $app->id,
            'user_id' => $user->id,
            'event' => 'conversion',
            'channel' => 'published_app',
        ]);
    }

    public function test_dashboard_exposes_growth_metrics_and_onboarding_state(): void
    {
        $user = User::factory()->create();
        $app = App::factory()->for($user)->create([
            'is_public' => true,
            'views_count' => 7,
            'shares_count' => 2,
            'clones_count' => 1,
        ]);
        AppAnalyticsEvent::create([
            'app_id' => $app->id,
            'user_id' => $user->id,
            'event' => 'conversion',
            'channel' => 'customized_app',
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('analytics.views', 7)
                ->where('analytics.shares', 2)
                ->where('analytics.clones', 1)
                ->where('analytics.conversions', 1)
                ->where('onboarding.created_app', true)
                ->where('onboarding.customized_app', true)
                ->where('onboarding.published_app', true)
            );
    }
}
