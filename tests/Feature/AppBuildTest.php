<?php

namespace Tests\Feature;

use App\Models\App;
use App\Models\User;
use App\Jobs\BuildFlutterAppJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppBuildTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_view_android_build_page(): void
    {
        $user = User::factory()->create();
        $app = App::factory()->for($user)->create([
            'name' => 'Client Store',
            'is_public' => false,
            'preview_token' => 'build-token',
        ]);

        $this->actingAs($user)
            ->get(route('apps.builds.index', $app))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Apps/Builds')
                ->where('defaultParameters.app_id', (string) $app->id)
                ->where('defaultParameters.preview_token', 'build-token')
            );
    }

    public function test_owner_can_queue_android_build_request(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $app = App::factory()->for($user)->create([
            'name' => 'Client Store',
            'is_public' => true,
        ]);

        $this->actingAs($user)
            ->post(route('apps.builds.store', $app), [
                'api_base_url' => 'https://apps.example.com',
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('app_builds', [
            'user_id' => $user->id,
            'app_id' => $app->id,
            'platform' => 'android',
            'status' => 'pending',
            'build_name' => 'client-store',
        ]);

        Queue::assertPushed(BuildFlutterAppJob::class);

        $this->assertDatabaseHas('app_analytics_events', [
            'app_id' => $app->id,
            'user_id' => $user->id,
            'event' => 'conversion',
            'channel' => 'build_requested',
        ]);
    }

    public function test_api_trigger_creates_pending_build_and_dispatches_job(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $app = App::factory()->for($user)->create([
            'name' => 'Mobile Catalog',
            'is_public' => false,
            'preview_token' => 'api-build-token',
        ]);

        Sanctum::actingAs($user);

        $this->postJson("/api/apps/{$app->id}/build", [
            'api_base_url' => 'https://apps.example.com',
        ])
            ->assertAccepted()
            ->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('app_builds', [
            'user_id' => $user->id,
            'app_id' => $app->id,
            'status' => 'pending',
            'workflow' => 'local-queue',
        ]);

        Queue::assertPushed(BuildFlutterAppJob::class);
    }

    public function test_non_owner_cannot_trigger_api_build(): void
    {
        Queue::fake();

        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $app = App::factory()->for($owner)->create();

        Sanctum::actingAs($otherUser);

        $this->postJson("/api/apps/{$app->id}/build", [
            'api_base_url' => 'https://apps.example.com',
        ])->assertForbidden();

        Queue::assertNotPushed(BuildFlutterAppJob::class);
    }
}
