<?php

namespace App\Support;

use App\Models\LandingPageSetting;

class LandingPageContent
{
    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'site_name' => 'Barangay San Sotero',
            'logo_image' => '/brgyLogo.png',
            'hero_image' => '/brgyHall.png',
            'navigation' => [
                ['label' => 'Home', 'href' => '#home'],
                ['label' => 'Services', 'href' => '#services'],
                ['label' => 'How It Works', 'href' => '#how-it-works'],
                ['label' => 'About', 'href' => '#about'],
            ],
            'login_label' => 'Login',
            'dashboard_label' => 'Dashboard',
            'footer_left' => 'All rights reserved.',
            'footer_right' => 'Online Barangay Document Request System',
            'section_order' => ['hero', 'services', 'process', 'about', 'cta'],
            'sections' => [
                'hero' => [
                    'enabled' => true,
                    'badge' => 'Barangay San Sotero Online Services',
                    'title' => 'Your Barangay Documents,',
                    'highlight' => 'Made Simple.',
                    'description' => 'Request barangay documents online, monitor your request status, and receive notifications when your document is ready for claiming.',
                    'primary_label' => 'Get Started',
                    'primary_link' => null,
                    'secondary_label' => 'View Services',
                    'secondary_link' => '#services',
                    'highlights' => ['Easy to use', 'Secure', 'Convenient'],
                    'panel_eyebrow' => 'Welcome to',
                    'panel_title' => 'Barangay San Sotero',
                    'panel_description' => 'Online Document Request System',
                    'panel_items' => ['Online Requests', 'Notifications'],
                ],
                'services' => [
                    'enabled' => true,
                    'eyebrow' => 'OUR SERVICES',
                    'title' => 'Barangay Documents',
                    'description' => 'Submit your document requests online and avoid unnecessary waiting time.',
                    'items' => [
                        ['title' => 'Barangay Clearance', 'description' => 'Request your barangay clearance online without waiting in long lines.'],
                        ['title' => 'Certificate of Residency', 'description' => 'Submit your residency certificate request from anywhere.'],
                        ['title' => 'Certificate of Indigency', 'description' => 'Request your certificate and receive updates online.'],
                    ],
                ],
                'process' => [
                    'enabled' => true,
                    'eyebrow' => 'SIMPLE PROCESS',
                    'title' => 'How It Works',
                    'items' => [
                        ['title' => 'Submit Request', 'description' => 'Choose the document you need and complete the request form.'],
                        ['title' => 'Processing', 'description' => 'The barangay secretary reviews and processes your request.'],
                        ['title' => 'Get Notified', 'description' => 'You will receive a notification once your document is ready.'],
                        ['title' => 'Claim Document', 'description' => 'Visit the barangay hall and claim your prepared document.'],
                    ],
                ],
                'about' => [
                    'enabled' => true,
                    'eyebrow' => 'ABOUT THE SYSTEM',
                    'title' => 'Better public service through technology.',
                    'description' => 'The San Sotero Online Barangay Document Request System provides residents with a convenient way to submit and monitor barangay document requests.',
                    'features' => ['Resident Friendly', 'Secure Access'],
                ],
                'cta' => [
                    'enabled' => true,
                    'title' => 'Need a barangay document?',
                    'description' => 'Create an account and start your request online.',
                    'button_label' => 'Request a Document',
                    'button_link' => '/register',
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function current(): array
    {
        $defaults = self::defaults();
        $stored = LandingPageSetting::query()->find(1)?->content ?? [];
        $content = array_replace($defaults, $stored);
        $content['sections'] = [];

        foreach ($defaults['sections'] as $key => $sectionDefaults) {
            $content['sections'][$key] = array_replace(
                $sectionDefaults,
                $stored['sections'][$key] ?? [],
            );
        }

        foreach (['logo_image', 'hero_image'] as $imageKey) {
            if (! str_starts_with($content[$imageKey], '/') && ! preg_match('/^https?:\/\//i', $content[$imageKey])) {
                $content[$imageKey] = asset('storage/'.$content[$imageKey]);
            }
        }

        return $content;
    }
}
