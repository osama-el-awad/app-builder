<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('templates')->updateOrInsert(
            ['name' => 'Starter Landing App'],
            [
                'description' => 'A free static starter template for fast onboarding and publishing.',
                'structure' => json_encode([
                    'pages' => [
                        [
                            'name' => 'Home',
                            'components' => [
                                ['type' => 'text', 'config' => ['content' => 'Welcome to My App', 'fontSize' => 28, 'fontWeight' => 'bold', 'color' => '#111827']],
                                ['type' => 'image', 'config' => ['url' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3', 'height' => 180]],
                                ['type' => 'text', 'config' => ['content' => 'Launch your first Android-ready app in minutes with a clean, editable landing screen.', 'fontSize' => 16, 'color' => '#4B5563']],
                                ['type' => 'button', 'config' => ['label' => 'Contact Us', 'action' => ['type' => 'navigate', 'target' => '2']]],
                            ],
                        ],
                        [
                            'name' => 'Contact',
                            'components' => [
                                ['type' => 'text', 'config' => ['content' => 'Contact', 'fontSize' => 24, 'fontWeight' => 'bold']],
                                ['type' => 'text', 'config' => ['content' => 'Email: hello@example.com', 'fontSize' => 16]],
                                ['type' => 'text', 'config' => ['content' => 'Phone: +1 555 0100', 'fontSize' => 16]],
                            ],
                        ],
                    ],
                ]),
                'default_settings' => json_encode(['primary' => '#2563EB', 'font' => 'Inter', 'radius' => 10]),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('templates')->where('name', 'Starter Landing App')->delete();
    }
};
