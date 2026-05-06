import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';

const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8000',
);
const String appId = String.fromEnvironment('APP_ID', defaultValue: '1');
const String previewToken = String.fromEnvironment('PREVIEW_TOKEN');

void main() {
  runApp(const RuntimeApp());
}

class RuntimeApp extends StatelessWidget {
  const RuntimeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AppBuilder Runtime',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo),
      home: const RuntimeLoader(),
    );
  }
}

class RuntimeLoader extends StatefulWidget {
  const RuntimeLoader({super.key});

  @override
  State<RuntimeLoader> createState() => _RuntimeLoaderState();
}

class _RuntimeLoaderState extends State<RuntimeLoader> {
  late Future<RuntimeAppDefinition> _definition;

  @override
  void initState() {
    super.initState();
    _definition = _loadApp();
  }

  Future<RuntimeAppDefinition> _loadApp() async {
    try {
      // 1. Try to load from bundled assets first (Offline/Build mode)
      final String jsonString = await DefaultAssetBundle.of(context).loadString('assets/app.json');
      final Map<String, dynamic> data = jsonDecode(jsonString);
      // If asset exists but is empty or dummy, fallback to API
      if (data.containsKey('app')) {
        return RuntimeAppDefinition.fromJson(data['app']);
      }
    } catch (e) {
      debugPrint('Local asset not found or invalid, falling back to API: $e');
    }

    // 2. Fallback to API (Live Preview / Debug mode)
    return RuntimeApi(apiBaseUrl).fetchApp(appId, previewToken);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<RuntimeAppDefinition>(
      future: _definition,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        if (snapshot.hasError) {
          return Scaffold(
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Unable to load app.\n${snapshot.error}',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          );
        }

        return RuntimeShell(definition: snapshot.requireData);
      },
    );
  }
}

class RuntimeShell extends StatefulWidget {
  const RuntimeShell({required this.definition, super.key});

  final RuntimeAppDefinition definition;

  @override
  State<RuntimeShell> createState() => _RuntimeShellState();
}

class _RuntimeShellState extends State<RuntimeShell> {
  late RuntimePage _currentPage;
  Map<String, dynamic> _params = const {};

  @override
  void initState() {
    super.initState();
    _currentPage = widget.definition.pages.first;
  }

  void navigate(dynamic target, [Map<String, dynamic> params = const {}]) {
    final page = widget.definition.findPage(target);
    if (page == null) return;

    setState(() {
      _currentPage = page;
      _params = params;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = widget.definition.theme;

    return Theme(
      data: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: theme.primaryColor,
        fontFamily: theme.fontFamily,
      ),
      child: Scaffold(
        appBar: AppBar(title: Text(_currentPage.name)),
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: _currentPage.components
                .map((component) => RuntimeComponentView(
                      component: component,
                      definition: widget.definition,
                      pageParams: _params,
                      onNavigate: navigate,
                    ))
                .toList(),
          ),
        ),
        bottomNavigationBar: widget.definition.pages.length < 2
            ? null
            : NavigationBar(
                selectedIndex: widget.definition.pages.indexWhere((page) => page.id == _currentPage.id),
                onDestinationSelected: (index) => navigate(widget.definition.pages[index].id),
                destinations: widget.definition.pages
                    .map((page) => NavigationDestination(
                          icon: const Icon(Icons.phone_android),
                          label: page.name,
                        ))
                    .toList(),
              ),
      ),
    );
  }
}

class RuntimeComponentView extends StatelessWidget {
  const RuntimeComponentView({
    required this.component,
    required this.definition,
    required this.onNavigate,
    this.pageParams = const {},
    super.key,
  });

  final RuntimeComponent component;
  final RuntimeAppDefinition definition;
  final Map<String, dynamic> pageParams;
  final void Function(dynamic target, [Map<String, dynamic> params]) onNavigate;

  @override
  Widget build(BuildContext context) {
    final config = component.config;
    final theme = definition.theme;

    switch (component.type) {
      case 'text':
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            interpolate(config.string('content', ''), pageParams),
            style: TextStyle(
              fontSize: config.number('fontSize', 16),
              color: parseColor(config.string('color')) ?? Colors.black87,
              fontWeight: config.string('fontWeight') == 'bold' ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        );

      case 'image':
        final url = interpolate(config.string('url', ''), pageParams);
        if (url.isEmpty) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(theme.radius),
            child: Image.network(
              url,
              height: config.number('height', 180),
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: config.number('height', 180),
                color: Colors.black12,
                alignment: Alignment.center,
                child: const Icon(Icons.broken_image),
              ),
            ),
          ),
        );

      case 'button':
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: parseColor(config.string('color')) ?? theme.primaryColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(theme.radius)),
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
            ),
            onPressed: () {
              final action = config.object('action');
              if (action['type'] == 'navigate') {
                onNavigate(action['target'], pageParams);
              }
            },
            child: Text(interpolate(config.string('label', 'Button'), pageParams)),
          ),
        );

      case 'column':
        return Padding(
          padding: EdgeInsets.all(config.number('padding', 0)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: component.children
                .map((child) => RuntimeComponentView(
                      component: child,
                      definition: definition,
                      pageParams: pageParams,
                      onNavigate: onNavigate,
                    ))
                .toList(),
          ),
        );

      case 'row':
        return Padding(
          padding: EdgeInsets.all(config.number('padding', 0)),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: component.children
                .map((child) => Expanded(
                      child: RuntimeComponentView(
                        component: child,
                        definition: definition,
                        pageParams: pageParams,
                        onNavigate: onNavigate,
                      ),
                    ))
                .toList(),
          ),
        );

      case 'list':
        return RuntimeDynamicList(
          component: component,
          definition: definition,
          onNavigate: onNavigate,
        );

      case 'form':
        return RuntimeForm(
          component: component,
          definition: definition,
          pageParams: pageParams,
        );

      default:
        return const SizedBox.shrink();
    }
  }
}

class RuntimeDynamicList extends StatefulWidget {
  const RuntimeDynamicList({
    required this.component,
    required this.definition,
    required this.onNavigate,
    super.key,
  });

  final RuntimeComponent component;
  final RuntimeAppDefinition definition;
  final void Function(dynamic target, [Map<String, dynamic> params]) onNavigate;

  @override
  State<RuntimeDynamicList> createState() => _RuntimeDynamicListState();
}

class _RuntimeDynamicListState extends State<RuntimeDynamicList> {
  late Future<List<Map<String, dynamic>>> _items;

  @override
  void initState() {
    super.initState();
    _items = RuntimeApi(apiBaseUrl).fetchList(widget.component.config.string('dataSource'));
  }

  @override
  Widget build(BuildContext context) {
    final limit = widget.component.config.number('itemLimit', 10).toInt();

    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _items,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text('Unable to load list: ${snapshot.error}'),
          );
        }

        final items = snapshot.requireData.take(limit).toList();
        return Column(
          children: items
              .map((item) => Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: widget.component.children
                            .map((child) => RuntimeComponentView(
                                  component: child,
                                  definition: widget.definition,
                                  pageParams: item,
                                  onNavigate: widget.onNavigate,
                                ))
                            .toList(),
                      ),
                    ),
                  ))
              .toList(),
        );
      },
    );
  }
}

class RuntimeForm extends StatefulWidget {
  const RuntimeForm({
    required this.component,
    required this.definition,
    this.pageParams = const {},
    super.key,
  });

  final RuntimeComponent component;
  final RuntimeAppDefinition definition;
  final Map<String, dynamic> pageParams;

  @override
  State<RuntimeForm> createState() => _RuntimeFormState();
}

class _RuntimeFormState extends State<RuntimeForm> {
  final Map<String, TextEditingController> _controllers = {};
  bool _submitting = false;
  String? _message;

  @override
  void initState() {
    super.initState();
    for (final child in widget.component.children.where((child) => child.type == 'input')) {
      _controllers[child.config.string('name', 'field_${child.id}')] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> submit() async {
    setState(() {
      _submitting = true;
      _message = null;
    });

    try {
      final payload = {
        for (final entry in _controllers.entries) entry.key: entry.value.text,
        if (widget.pageParams.isNotEmpty) '_params': widget.pageParams,
      };
      await RuntimeApi(apiBaseUrl).submitForm(appId, previewToken, payload);
      setState(() => _message = widget.component.config.string('successMessage', 'Submitted successfully.'));
    } catch (error) {
      setState(() => _message = 'Unable to submit form: $error');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            for (final child in widget.component.children.where((child) => child.type == 'input'))
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: TextField(
                  controller: _controllers[child.config.string('name', 'field_${child.id}')],
                  keyboardType: inputType(child.config.string('inputType')),
                  maxLines: child.config.string('inputType') == 'textarea' ? 4 : 1,
                  decoration: InputDecoration(
                    labelText: child.config.string('label', 'Field'),
                    hintText: child.config.string('placeholder'),
                    border: const OutlineInputBorder(),
                  ),
                ),
              ),
            FilledButton(
              onPressed: _submitting ? null : submit,
              child: Text(_submitting ? 'Submitting...' : 'Submit'),
            ),
            if (_message != null) ...[
              const SizedBox(height: 12),
              Text(_message!),
            ],
          ],
        ),
      ),
    );
  }
}

class RuntimeApi {
  RuntimeApi(this.baseUrl);

  final String baseUrl;

  Future<RuntimeAppDefinition> fetchApp(String appId, String token) async {
    final uri = apiUri('/api/app/$appId', token);
    final json = await getJson(uri);
    return RuntimeAppDefinition.fromJson(json);
  }

  Future<List<Map<String, dynamic>>> fetchList(String url) async {
    if (url.isEmpty) return [];
    final json = await getJson(Uri.parse(url));
    if (json is List) {
      return json.whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
    }
    if (json is Map && json['data'] is List) {
      return (json['data'] as List).whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
    }
    return [];
  }

  Future<void> submitForm(String appId, String token, Map<String, dynamic> payload) async {
    final uri = apiUri('/api/app/$appId/submit', token);
    final client = HttpClient();
    try {
      final request = await client.postUrl(uri);
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode(payload));
      final response = await request.close();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('HTTP ${response.statusCode}', uri: uri);
      }
    } finally {
      client.close();
    }
  }

  Uri apiUri(String path, String token) {
    final uri = Uri.parse('$baseUrl$path');
    if (token.isEmpty) return uri;
    return uri.replace(queryParameters: {...uri.queryParameters, 'token': token});
  }

  Future<dynamic> getJson(Uri uri) async {
    final client = HttpClient();
    try {
      final request = await client.getUrl(uri);
      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('HTTP ${response.statusCode}: $body', uri: uri);
      }
      return jsonDecode(body);
    } finally {
      client.close();
    }
  }
}

class RuntimeAppDefinition {
  RuntimeAppDefinition({
    required this.id,
    required this.name,
    required this.pages,
    required this.theme,
  });

  final int id;
  final String name;
  final List<RuntimePage> pages;
  final RuntimeTheme theme;

  factory RuntimeAppDefinition.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from(json as Map);
    return RuntimeAppDefinition(
      id: map.intValue('id'),
      name: map.string('name', 'App'),
      pages: (map['pages'] as List? ?? [])
          .whereType<Map>()
          .map((page) => RuntimePage.fromJson(Map<String, dynamic>.from(page)))
          .toList(),
      theme: RuntimeTheme.fromJson(map.object('settings')),
    );
  }

  RuntimePage? findPage(dynamic target) {
    if (target == null) return null;
    final targetText = target.toString();
    for (final page in pages) {
      if (page.id.toString() == targetText || page.name == targetText) {
        return page;
      }
    }
    return null;
  }
}

class RuntimePage {
  RuntimePage({
    required this.id,
    required this.name,
    required this.components,
  });

  final int id;
  final String name;
  final List<RuntimeComponent> components;

  factory RuntimePage.fromJson(Map<String, dynamic> json) {
    return RuntimePage(
      id: json.intValue('id'),
      name: json.string('name', 'Page'),
      components: (json['components'] as List? ?? [])
          .whereType<Map>()
          .map((component) => RuntimeComponent.fromJson(Map<String, dynamic>.from(component)))
          .toList(),
    );
  }
}

class RuntimeComponent {
  RuntimeComponent({
    required this.id,
    required this.type,
    required this.config,
    required this.children,
  });

  final dynamic id;
  final String type;
  final Map<String, dynamic> config;
  final List<RuntimeComponent> children;

  factory RuntimeComponent.fromJson(Map<String, dynamic> json) {
    return RuntimeComponent(
      id: json['id'],
      type: json.string('type'),
      config: json.object('config'),
      children: (json['children'] as List? ?? [])
          .whereType<Map>()
          .map((component) => RuntimeComponent.fromJson(Map<String, dynamic>.from(component)))
          .toList(),
    );
  }
}

class RuntimeTheme {
  RuntimeTheme({
    required this.primaryColor,
    required this.fontFamily,
    required this.radius,
  });

  final Color primaryColor;
  final String fontFamily;
  final double radius;

  factory RuntimeTheme.fromJson(Map<String, dynamic> json) {
    return RuntimeTheme(
      primaryColor: parseColor(json.string('primary')) ?? Colors.indigo,
      fontFamily: json.string('font', 'Roboto'),
      radius: json.number('radius', 8),
    );
  }
}

extension RuntimeMap on Map<String, dynamic> {
  String string(String key, [String fallback = '']) => this[key]?.toString() ?? fallback;

  int intValue(String key, [int fallback = 0]) {
    final value = this[key];
    if (value is int) return value;
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  double number(String key, [double fallback = 0]) {
    final value = this[key];
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? fallback;
  }

  Map<String, dynamic> object(String key) {
    final value = this[key];
    if (value is Map) return Map<String, dynamic>.from(value);
    return {};
  }
}

String interpolate(String value, Map<String, dynamic> params) {
  return value.replaceAllMapped(RegExp(r'\{\{\s*([\w.]+)\s*\}\}'), (match) {
    final key = match.group(1)!;
    final resolved = resolvePath(params, key);
    return resolved?.toString() ?? '';
  });
}

dynamic resolvePath(Map<String, dynamic> source, String path) {
  dynamic current = source;
  for (final part in path.split('.')) {
    if (current is Map && current.containsKey(part)) {
      current = current[part];
    } else {
      return null;
    }
  }
  return current;
}

Color? parseColor(String? value) {
  if (value == null || value.isEmpty) return null;
  final normalized = value.replaceFirst('#', '');
  final parsed = int.tryParse(normalized.length == 6 ? 'ff$normalized' : normalized, radix: 16);
  if (parsed == null) return null;
  return Color(parsed);
}

TextInputType inputType(String type) {
  switch (type) {
    case 'email':
      return TextInputType.emailAddress;
    case 'number':
      return TextInputType.number;
    case 'phone':
      return TextInputType.phone;
    case 'url':
      return TextInputType.url;
    default:
      return TextInputType.text;
  }
}
