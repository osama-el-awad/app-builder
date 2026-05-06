# AppBuilder Flutter Runtime

This is the universal Android-first Flutter app for AppBuilder.

It loads one app definition from Laravel:

```text
GET /api/app/{id}?token={previewToken}
```

Then it renders pages, components, forms, dynamic lists, and navigation from JSON.

## Setup

Flutter is not committed with this project. After installing Flutter, run:

```bash
cd flutter_runtime
flutter create --platforms=android,ios .
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000 --dart-define=APP_ID=1 --dart-define=PREVIEW_TOKEN=your-token
```

For a public app, `PREVIEW_TOKEN` can be omitted.

## Android APK

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://your-domain.com --dart-define=APP_ID=1 --dart-define=PREVIEW_TOKEN=your-token
```

## Supported Components

- `text`
- `image`
- `button`
- `column`
- `row`
- `list`
- `form`
- `input`

Navigation supports page targets by page id or page name. Dynamic list children receive the selected item as params and can render fields such as `{{title}}`, `{{price}}`, or nested values like `{{user.name}}`.
