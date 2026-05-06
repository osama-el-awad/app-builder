# app-builder-flutter-template

Standalone Flutter template used by Laravel build jobs and CI to turn an AppBuilder JSON app into an Android APK.

## Runtime Inputs

The template reads these compile-time values:

```bash
--dart-define=API_BASE_URL=https://your-laravel-domain.com
--dart-define=APP_ID=1
--dart-define=PREVIEW_TOKEN=optional-private-preview-token
```

## Local Build

```bash
flutter create --platforms=android .
flutter pub get
flutter build apk --release \
  --dart-define=API_BASE_URL=https://your-domain.com \
  --dart-define=APP_ID=1 \
  --dart-define=PREVIEW_TOKEN=your-token
```

## Responsibilities

- API client: fetches `/api/app/{id}` and submits forms.
- Renderer engine: converts AppBuilder JSON components into Flutter widgets.
- Navigation: supports page targets by id or name and passes params from dynamic lists.
- Output: Android APK from one universal runtime.
