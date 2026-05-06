<?php

namespace Tests\Feature;

use App\Models\App;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BusinessLayerTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_with_referral_code_credits_bonuses(): void
    {
        $referrer = User::factory()->create([
            'referral_code' => 'REFER123',
            'referral_bonus_cents' => 0,
        ]);

        $response = $this->post('/register', [
            'name' => 'Referred User',
            'email' => 'referred@example.com',
            'referral_code' => 'refer123',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('apps.create', absolute: false));
        $this->assertAuthenticated();

        $referredUser = User::where('email', 'referred@example.com')->firstOrFail();
        $this->assertSame($referrer->id, $referredUser->referred_by_id);
        $this->assertSame(1000, $referrer->fresh()->referral_bonus_cents);
        $this->assertSame(500, $referredUser->fresh()->referral_bonus_cents);
        $this->assertDatabaseHas('referrals', [
            'referrer_id' => $referrer->id,
            'referred_user_id' => $referredUser->id,
            'code' => 'REFER123',
            'status' => 'credited',
        ]);
    }

    public function test_referrals_page_shows_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        Referral::create([
            'referrer_id' => $user->id,
            'referred_user_id' => User::factory()->create()->id,
            'code' => $user->referral_code,
            'status' => 'credited',
        ]);

        $this->actingAs($user)->get(route('referrals.index'))->assertOk();
    }

    public function test_user_can_create_and_download_app_backup(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $app = App::factory()->for($user)->create(['name' => 'Backup Target']);

        $this->actingAs($user)->post(route('backups.store'), [
            'app_id' => $app->id,
            'frequency' => 'manual',
        ])->assertSessionHas('success');

        $backup = $user->backups()->firstOrFail();
        Storage::disk('local')->assertExists($backup->path);

        $this->actingAs($user)
            ->get(route('backups.download', $backup))
            ->assertOk();
    }

    public function test_legal_pages_are_public(): void
    {
        $this->get(route('legal.terms'))->assertOk();
        $this->get(route('legal.privacy'))->assertOk();
    }
}
