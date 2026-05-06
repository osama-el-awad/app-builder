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
        // 1. E-commerce Store
        DB::table('templates')->updateOrInsert(
            ['name' => 'Elite Shop'],
            [
                'description' => 'A premium store layout with product listings and order forms. Ideal for small businesses.',
                'structure' => json_encode([
                    'pages' => [
                        [
                            'name' => 'Home',
                            'components' => [
                                ['type' => 'image', 'config' => ['url' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', 'height' => 220]],
                                ['type' => 'text', 'config' => ['content' => 'New Collection 2024', 'fontSize' => 24, 'fontWeight' => 'bold', 'color' => '#111827']],
                                ['type' => 'text', 'config' => ['content' => 'Explore the finest items curated just for you. Quality meets elegance in every piece.', 'fontSize' => 14, 'color' => '#6B7280']],
                                ['type' => 'button', 'config' => ['label' => 'Shop Now', 'action' => ['type' => 'navigate', 'target' => 'Products']]],
                            ],
                        ],
                        [
                            'name' => 'Products',
                            'components' => [
                                ['type' => 'text', 'config' => ['content' => 'Our Products', 'fontSize' => 20, 'fontWeight' => 'bold']],
                                ['type' => 'list', 'config' => ['dataSource' => 'https://fakestoreapi.com/products', 'itemLimit' => 6], 'children' => [
                                    ['type' => 'text', 'config' => ['content' => '{{title}}', 'fontSize' => 14, 'fontWeight' => 'bold']],
                                    ['type' => 'text', 'config' => ['content' => '${{price}}', 'fontSize' => 12, 'color' => '#059669']],
                                ]],
                            ],
                        ],
                        [
                            'name' => 'Order',
                            'components' => [
                                ['type' => 'text', 'config' => ['content' => 'Place Your Order', 'fontSize' => 20, 'fontWeight' => 'bold']],
                                ['type' => 'form', 'config' => ['successMessage' => 'Order received! We will contact you soon.'], 'children' => [
                                    ['type' => 'input', 'config' => ['label' => 'Full Name', 'name' => 'name', 'placeholder' => 'Enter your name']],
                                    ['type' => 'input', 'config' => ['label' => 'Product Name', 'name' => 'product', 'placeholder' => 'What are you buying?']],
                                    ['type' => 'input', 'config' => ['label' => 'Phone Number', 'name' => 'phone', 'placeholder' => '05xxxxxxx']],
                                ]],
                            ],
                        ],
                    ],
                ]),
                'default_settings' => json_encode(['primary' => '#059669', 'font' => 'Poppins', 'radius' => 12]),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        // 2. Photography Portfolio
        DB::table('templates')->updateOrInsert(
            ['name' => 'Visual Canvas'],
            [
                'description' => 'High-impact visual layout for photographers and artists to showcase their best work.',
                'structure' => json_encode([
                    'pages' => [
                        [
                            'name' => 'Portfolio',
                            'components' => [
                                ['type' => 'text', 'config' => ['content' => 'The Gallery', 'fontSize' => 32, 'fontWeight' => 'bold', 'color' => '#000000']],
                                ['type' => 'image', 'config' => ['url' => 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d', 'height' => 250]],
                                ['type' => 'text', 'config' => ['content' => 'Urban Explorations', 'fontSize' => 12, 'color' => '#9CA3AF']],
                                ['type' => 'image', 'config' => ['url' => 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07', 'height' => 250]],
                                ['type' => 'text', 'config' => ['content' => 'Nature & Light', 'fontSize' => 12, 'color' => '#9CA3AF']],
                            ],
                        ],
                        [
                            'name' => 'About Me',
                            'components' => [
                                ['type' => 'image', 'config' => ['url' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', 'height' => 150]],
                                ['type' => 'text', 'config' => ['content' => 'Hi, I am Sarah.', 'fontSize' => 20, 'fontWeight' => 'bold']],
                                ['type' => 'text', 'config' => ['content' => 'Capturing moments through a lens for over 10 years. Specializing in street and portrait photography.', 'fontSize' => 14, 'color' => '#4B5563']],
                                ['type' => 'button', 'config' => ['label' => 'Book a Session', 'action' => ['type' => 'navigate', 'target' => 'Contact']]],
                            ],
                        ],
                    ],
                ]),
                'default_settings' => json_encode(['primary' => '#000000', 'font' => 'Merriweather', 'radius' => 4]),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        // 3. Blog App
        DB::table('templates')->updateOrInsert(
            ['name' => 'Modern Reader'],
            [
                'description' => 'Clean, content-focused blog template with dynamic feeds and subscription forms.',
                'structure' => json_encode([
                    'pages' => [
                        [
                            'name' => 'Feed',
                            'components' => [
                                ['type' => 'text', 'config' => ['content' => 'Latest Stories', 'fontSize' => 24, 'fontWeight' => 'bold']],
                                ['type' => 'list', 'config' => ['dataSource' => 'https://jsonplaceholder.typicode.com/posts', 'itemLimit' => 5], 'children' => [
                                    ['type' => 'text', 'config' => ['content' => '{{title}}', 'fontSize' => 16, 'fontWeight' => 'bold', 'color' => '#1F2937']],
                                    ['type' => 'text', 'config' => ['content' => 'Read more...', 'fontSize' => 12, 'color' => '#F97316']],
                                ]],
                            ],
                        ],
                        [
                            'name' => 'Newsletter',
                            'components' => [
                                ['type' => 'image', 'config' => ['url' => 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f', 'height' => 180]],
                                ['type' => 'text', 'config' => ['content' => 'Stay Updated', 'fontSize' => 20, 'fontWeight' => 'bold']],
                                ['type' => 'text', 'config' => ['content' => 'Get the best stories delivered straight to your inbox every Monday.', 'fontSize' => 14]],
                                ['type' => 'form', 'config' => ['successMessage' => 'Subscribed!'], 'children' => [
                                    ['type' => 'input', 'config' => ['label' => 'Email Address', 'name' => 'email', 'placeholder' => 'your@email.com']],
                                    ['type' => 'button', 'config' => ['label' => 'Subscribe Now', 'color' => '#F97316']],
                                ]],
                            ],
                        ],
                    ],
                ]),
                'default_settings' => json_encode(['primary' => '#F97316', 'font' => 'Roboto', 'radius' => 8]),
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
        DB::table('templates')->whereIn('name', ['Elite Shop', 'Visual Canvas', 'Modern Reader'])->delete();
    }
};
