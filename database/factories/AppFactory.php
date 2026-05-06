<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\App>
 */
class AppFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true),
            'platform' => 'android',
            'settings' => [
                'primary' => '#4F46E5',
                'font' => 'Inter',
                'radius' => 8,
            ],
            'is_public' => false,
            'preview_token' => Str::random(48),
        ];
    }
}
