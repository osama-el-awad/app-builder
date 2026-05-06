# Project Instructions: App Builder Platform

## Overview
A comprehensive platform for building and publishing mobile apps using Laravel (backend), React (dashboard/builder), and Flutter (mobile runtime).

## Core Technologies
- **Backend:** Laravel 12, Inertia.js, Sanctum, Cashier (Stripe), spatie/laravel-permission, spatie/laravel-backup.
- **Frontend:** React 18, Tailwind CSS, Headless UI, @hello-pangea/dnd.
- **Mobile:** Flutter (Renderer-based approach).
- **CI/CD:** GitHub Actions for Android (APK) and iOS (non-codesigned IPA).

## Architecture
- **App Builder:** React-based editor (`Builder.jsx`) that generates a JSON configuration stored in the database.
- **Flutter Runtime:** A generic Flutter app that fetches the JSON configuration via API and renders the UI dynamically.
- **Build System:** GitHub Actions triggered by Laravel Jobs (`BuildFlutterAppJob.php`) to compile the Flutter code with the app-specific configuration.

## Workflows & Conventions
- **UI:** Prefer Vanilla CSS or Tailwind. Focus on high visual impact and "alive" feel.
- **Testing:** Ensure features like app creation, component management, and build triggers are tested.
- **Security:** Protect API keys (Stripe, Firebase) and never log sensitive data.

## Roadmap
- [x] UI/UX Improvements (Dashboard Charts, Dark Mode).
- [x] iOS Build Pipeline Integration (Triggerable from Dashboard).
- [x] New Templates (E-commerce, Portfolio, Blog).
- [ ] iOS Code Signing integration (GitHub Secrets).
- [ ] Comprehensive Documentation.


## iOS Support
The system now supports queuing iOS build requests.
- **Local Worker:** If the worker is running macOS, it will attempt `flutter build ipa --no-codesign`.
- **GitHub Actions:** Preferred for production. Use the command generated in the Dashboard.
- **Code Signing:** To produce a signed IPA for App Store or TestFlight:
  1. Add `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`, and `APP_STORE_CONNECT_KEY_CONTENT` to GitHub Secrets.
  2. Update `build-ios-ipa.yml` to use `fastlane` or manual signing steps.

