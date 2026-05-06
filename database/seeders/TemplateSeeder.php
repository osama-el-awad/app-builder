<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Template::create([
            'name' => 'News App',
            'description' => 'Dynamic news feed with article details.',
            'structure' => [
                'pages' => [
                    [
                        'name' => 'Home',
                        'components' => [
                            ['type' => 'text', 'config' => ['content' => 'Latest News', 'fontSize' => 24]],
                            ['type' => 'list', 'config' => ['dataSource' => 'https://jsonplaceholder.typicode.com/posts', 'itemLimit' => 10], 'children' => [
                                ['type' => 'text', 'config' => ['content' => '{{title}}', 'fontSize' => 18, 'color' => '#4F46E5']],
                                ['type' => 'text', 'config' => ['content' => '{{body}}', 'fontSize' => 14]]
                            ]]
                        ]
                    ]
                ]
            ],
            'default_settings' => ['primary' => '#4F46E5', 'font' => 'Inter', 'radius' => 8]
        ]);

        Template::create([
            'name' => 'Simple Store',
            'description' => 'List products and collect orders via form.',
            'structure' => [
                'pages' => [
                    [
                        'name' => 'Products',
                        'components' => [
                            ['type' => 'text', 'config' => ['content' => 'Our Shop', 'fontSize' => 24]],
                            ['type' => 'list', 'config' => ['dataSource' => 'https://fakestoreapi.com/products', 'itemLimit' => 6], 'children' => [
                                ['type' => 'image', 'config' => ['url' => '{{image}}', 'height' => 150]],
                                ['type' => 'text', 'config' => ['content' => '{{title}}', 'fontSize' => 16, 'fontWeight' => 'bold']],
                                ['type' => 'text', 'config' => ['content' => '${{price}}', 'fontSize' => 14, 'color' => '#10B981']],
                                ['type' => 'button', 'config' => ['label' => 'View Details', 'action' => ['type' => 'navigate', 'target' => '2']]]
                            ]]
                        ]
                    ],
                    [
                        'name' => 'Order Now',
                        'components' => [
                            ['type' => 'text', 'config' => ['content' => 'Place Your Order', 'fontSize' => 24]],
                            ['type' => 'form', 'config' => ['actionUrl' => '/api/submit', 'successMessage' => 'Order received!'], 'children' => [
                                ['type' => 'input', 'config' => ['label' => 'Full Name', 'name' => 'name', 'placeholder' => 'Enter your name']],
                                ['type' => 'input', 'config' => ['label' => 'Address', 'name' => 'address', 'placeholder' => 'Shipping address', 'inputType' => 'textarea']]
                            ]]
                        ]
                    ]
                ]
            ],
            'default_settings' => ['primary' => '#10B981', 'font' => 'Roboto', 'radius' => 12]
        ]);

        Template::create([
            'name' => 'Business Profile',
            'description' => 'Professional profile with contact form.',
            'structure' => [
                'pages' => [
                    [
                        'name' => 'About Us',
                        'components' => [
                            ['type' => 'image', 'config' => ['url' => 'https://images.unsplash.com/photo-1497366216548-37526070297c', 'height' => 200]],
                            ['type' => 'text', 'config' => ['content' => 'Welcome to Our Company', 'fontSize' => 24]],
                            ['type' => 'text', 'config' => ['content' => 'We provide top-notch services for your business growth.', 'fontSize' => 16]],
                            ['type' => 'button', 'config' => ['label' => 'Contact Us', 'action' => ['type' => 'navigate', 'target' => '2']]]
                        ]
                    ],
                    [
                        'name' => 'Contact',
                        'components' => [
                            ['type' => 'text', 'config' => ['content' => 'Get in Touch', 'fontSize' => 24]],
                            ['type' => 'form', 'config' => ['actionUrl' => '/api/submit'], 'children' => [
                                ['type' => 'input', 'config' => ['label' => 'Email', 'name' => 'email', 'inputType' => 'email']],
                                ['type' => 'input', 'config' => ['label' => 'Message', 'name' => 'message', 'inputType' => 'textarea']]
                            ]]
                        ]
                    ]
                ]
            ],
            'default_settings' => ['primary' => '#1E293B', 'font' => 'Poppins', 'radius' => 4]
        ]);
    }
}
