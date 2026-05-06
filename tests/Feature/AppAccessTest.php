<?php

namespace Tests\Feature;

use App\Models\App;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_free_user_can_create_one_blank_app(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('apps.store'), [
            'name' => 'Free Android App',
            'template_id' => null,
        ]);

        $app = App::query()->first();

        $response->assertRedirect(route('apps.show', $app));
        $this->assertDatabaseHas('apps', [
            'user_id' => $user->id,
            'name' => 'Free Android App',
            'platform' => 'android',
        ]);
    }

    public function test_free_user_cannot_create_more_than_one_app(): void
    {
        $user = User::factory()->create();
        App::factory()->for($user)->create();

        $response = $this->actingAs($user)->post(route('apps.store'), [
            'name' => 'Second App',
            'template_id' => null,
        ]);

        $response->assertRedirect(route('subscription.index'));
    }

    public function test_private_preview_requires_preview_token(): void
    {
        $app = App::factory()->create([
            'is_public' => false,
            'preview_token' => 'private-preview-token',
        ]);

        $this->get(route('apps.public.show', $app))->assertForbidden();

        $this->get(route('apps.public.show', [$app, 'private-preview-token']))->assertOk();
    }

    public function test_private_runtime_api_requires_preview_token(): void
    {
        $app = App::factory()->create([
            'is_public' => false,
            'preview_token' => 'runtime-token',
        ]);

        $this->getJson("/api/app/{$app->id}")->assertForbidden();

        $this->getJson("/api/app/{$app->id}?token=runtime-token")
            ->assertOk()
            ->assertJsonPath('id', $app->id);
    }

    public function test_runtime_form_submission_is_persisted(): void
    {
        $app = App::factory()->create([
            'is_public' => false,
            'preview_token' => 'runtime-token',
        ]);

        $this->postJson("/api/app/{$app->id}/submit?token=runtime-token", [
            'name' => 'Runtime User',
            'message' => 'Hello from Flutter',
        ])->assertOk();

        $this->assertDatabaseHas('app_form_submissions', [
            'app_id' => $app->id,
        ]);
    }
}
