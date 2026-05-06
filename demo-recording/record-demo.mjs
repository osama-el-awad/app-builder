import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const cwd = process.cwd();
const outDir = path.join(cwd, 'demo-recording');
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const browserPath = chromeCandidates.find(existsSync);
if (!browserPath) throw new Error('Chrome or Edge was not found.');

const port = 9333;
const userDataDir = path.join(outDir, 'chrome-profile');
const width = 1366;
const height = 768;
const appId = 1;

await fs.mkdir(outDir, { recursive: true });

const chrome = spawn(browserPath, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--disable-gpu',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  `--window-size=${width},${height}`,
  'about:blank',
], { stdio: 'ignore' });

process.on('exit', () => chrome.kill());

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForJson(url, timeoutMs = 15000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

const targets = await waitForJson(`http://127.0.0.1:${port}/json`);
let pageTarget = targets.find((target) => target.type === 'page');
if (!pageTarget) {
  const created = await waitForJson(`http://127.0.0.1:${port}/json/new`);
  pageTarget = Array.isArray(created) ? created[0] : created;
}

let nextId = 1;
const pending = new Map();
const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
});

function send(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression, awaitPromise = true) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
  }
  return result.result?.value;
}

async function goto(url, waitMs = 2500) {
  await send('Page.navigate', { url });
  await sleep(waitMs);
}

async function waitForReady(extraMs = 1000) {
  await evaluate(`new Promise(resolve => {
    const done = () => setTimeout(resolve, ${extraMs});
    if (document.readyState === 'complete') done();
    else window.addEventListener('load', done, { once: true });
  })`);
}

async function screenshot(name) {
  await waitForReady(700);
  const result = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  const file = path.join(outDir, `${name}.png`);
  await fs.writeFile(file, Buffer.from(result.data, 'base64'));
  return { name, file, dataUrl: `data:image/png;base64,${result.data}` };
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: false,
});

await goto('http://127.0.0.1:8000/login', 1500);
await evaluate(`document.querySelector('input[name="email"], input[type="email"]')?.focus()`);
await send('Input.insertText', { text: 'test@example.com' });
await evaluate(`document.querySelector('input[name="password"], input[type="password"]')?.focus()`);
await send('Input.insertText', { text: 'password' });
await evaluate(`(() => {
  const form = document.querySelector('form');
  const button = [...document.querySelectorAll('button')].find(el => /log in|login/i.test(el.textContent));
  if (button) button.click();
  else if (form) form.requestSubmit();
})()`);
await sleep(3500);
await goto('http://127.0.0.1:8000/dashboard', 2500);
const loggedIn = await evaluate(`!location.pathname.includes('/login') && document.body.innerText.includes('My Apps')`);
if (!loggedIn) throw new Error('Could not log in to the dashboard with test@example.com/password.');

const shots = [];
shots.push(await screenshot('01-dashboard'));

await goto(`http://127.0.0.1:8000/apps/${appId}`, 3000);
shots.push(await screenshot('02-builder-before'));

await evaluate(`(() => {
  const textButton = [...document.querySelectorAll('button')].find(el => el.textContent.includes('Text Block'));
  if (textButton) textButton.click();
})()`);
await sleep(800);
await evaluate(`(() => {
  const inputs = [...document.querySelectorAll('input[type="text"]')];
  const target = inputs.find(input => input.value === 'New Text') || inputs[inputs.length - 1];
  if (target) {
    target.focus();
    target.value = 'Special Coffee Menu';
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  }
})()`);
await sleep(700);
shots.push(await screenshot('03-builder-edited'));
await evaluate(`(() => {
  const save = [...document.querySelectorAll('button')].find(el => el.textContent.includes('Save Changes'));
  if (save) save.click();
})()`);
await sleep(1800);
shots.push(await screenshot('04-live-preview-saved'));

await goto(`http://127.0.0.1:8000/apps/${appId}/builds`, 2500);
shots.push(await screenshot('05-builds-before'));
await evaluate(`(() => {
  const input = document.querySelector('input[type="url"]');
  if (input && !input.value) {
    input.value = 'http://127.0.0.1:8000';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const queue = [...document.querySelectorAll('button')].find(el => /Queue Android Build/i.test(el.textContent));
  if (queue) queue.click();
})()`);
await sleep(2500);
shots.push(await screenshot('06-build-request'));

const renderHtml = path.join(outDir, 'render-video.html');
const videoFile = path.join(outDir, 'rateb-appbuilder-demo.webm');
try {
  await fs.rm(videoFile, { force: true });
} catch {
  // Ignore cleanup failures; the next write/download will surface real errors.
}
const captions = [
  {
    title: 'App Builder Platform',
    body: 'A quick professional demo for Rateb',
    voice: 'أهلاً أستاذ Rateb، هذا عرض سريع للمنصة اللي طورتها',
    shot: shots[0],
    seconds: 5,
  },
  {
    title: 'Dashboard',
    body: 'Apps, charts and live activity in one place',
    voice: 'هنا المستخدم يشوف تطبيقاته وإحصائياته',
    shot: shots[0],
    seconds: 8,
  },
  {
    title: 'Drag & Drop Builder',
    body: 'Open Coffee Shop App and customize the screen',
    voice: 'هذا محرر Drag & Drop، المستخدم يقدر يبني التطبيق بدون برمجة',
    shot: shots[1],
    seconds: 8,
  },
  {
    title: 'Edit Content',
    body: 'Add a text component and update it instantly',
    voice: 'نضيف عنصر نص ونعدله مباشرة ثم نحفظ التغييرات',
    shot: shots[2],
    seconds: 10,
  },
  {
    title: 'Live Preview',
    body: 'The final mobile preview updates immediately',
    voice: 'وهذا الشكل النهائي مباشرة داخل معاينة الموبايل',
    shot: shots[3],
    seconds: 8,
  },
  {
    title: 'Build APK',
    body: 'Queue an Android APK build from the platform',
    voice: 'وبضغطة زر يتم تحويله إلى تطبيق Android APK',
    shot: shots[4],
    seconds: 9,
  },
  {
    title: 'CI/CD Ready',
    body: 'Build request is queued and ready for workflow automation',
    voice: 'نظام البناء جاهز ومربوط مع CI/CD',
    shot: shots[5],
    seconds: 9,
  },
  {
    title: 'Ready For Custom Demo',
    body: 'A real working model, ready to develop further',
    voice: 'هذا نموذج حقيقي جاهز للتطوير حسب طلبك. وإذا حاب، أخصص لك نسخة Demo خاصة فيك',
    shot: shots[5],
    seconds: 7,
  },
];

await fs.writeFile(renderHtml, `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin: 0; width: 100%; height: 100%; background: #0b1020; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
<canvas id="canvas" width="${width}" height="${height}"></canvas>
<script>
const W = ${width}, H = ${height};
const scenes = ${JSON.stringify(captions)};
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fps = 12;
const images = [];
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}
function drawScene(sceneIndex, localProgress, globalProgress) {
  const scene = scenes[sceneIndex];
  const img = images[sceneIndex];
  ctx.fillStyle = '#0b1020';
  ctx.fillRect(0, 0, W, H);
  const scale = 0.86 + localProgress * 0.035;
  const imgW = W * scale;
  const imgH = H * scale;
  const x = (W - imgW) / 2;
  const y = 34 - localProgress * 10;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.drawImage(img, x, y, imgW, imgH);
  ctx.restore();
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(11,16,32,0.04)');
  grad.addColorStop(0.62, 'rgba(11,16,32,0.08)');
  grad.addColorStop(1, 'rgba(11,16,32,0.90)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 18;
  roundRect(72, H - 190, 780, 128, 18);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#4f46e5';
  ctx.font = '700 18px Arial';
  ctx.fillText('APP BUILDER DEMO', 104, H - 150);
  ctx.fillStyle = '#111827';
  ctx.font = '800 34px Arial';
  ctx.fillText(scene.title, 104, H - 108);
  ctx.fillStyle = '#4b5563';
  ctx.font = '500 19px Arial';
  ctx.fillText(scene.body, 104, H - 76);
  ctx.fillStyle = 'rgba(15,23,42,0.88)';
  roundRect(884, H - 168, 410, 82, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 22px Arial';
  ctx.direction = 'rtl';
  wrapText(scene.voice, 1260, H - 126, 350, 30);
  ctx.direction = 'ltr';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(72, H - 34, W - 144, 8, 4);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  roundRect(72, H - 34, (W - 144) * globalProgress, 8, 4);
  ctx.fill();
}
(async () => {
  for (const scene of scenes) images.push(await loadImage(scene.shot.dataUrl));
  const stream = canvas.captureStream(fps);
  const chunks = [];
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
  recorder.onerror = (event) => {
    window.__videoError = event.error?.message || 'MediaRecorder failed';
    document.title = 'error';
  };
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rateb-appbuilder-demo.webm';
    document.body.appendChild(a);
    a.click();
    window.__downloadStarted = true;
    document.title = 'done';
  };
  recorder.start();
  const totalFrames = scenes.reduce((sum, scene) => sum + Math.round(scene.seconds * fps), 0);
  let frame = 0;
  for (let i = 0; i < scenes.length; i++) {
    const frames = Math.round(scenes[i].seconds * fps);
    for (let f = 0; f < frames; f++) {
      drawScene(i, f / Math.max(1, frames - 1), frame / Math.max(1, totalFrames - 1));
      frame++;
      await new Promise(resolve => setTimeout(resolve, 1000 / fps));
    }
  }
  recorder.stop();
})();
</script>
</body>
</html>`);

await goto(`file:///${renderHtml.replaceAll('\\', '/')}`, 1000);
try {
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: outDir });
} catch {
  try {
    await send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: outDir });
  } catch {
    // Some Chromium builds only allow default download behavior.
  }
}
for (let i = 0; i < 240; i++) {
  const error = await evaluate('window.__videoError || null');
  if (error) throw new Error(error);
  if (existsSync(videoFile)) {
    const stat = await fs.stat(videoFile);
    if (stat.size > 100000) break;
  }
  await sleep(500);
}
if (!existsSync(videoFile)) throw new Error('Video rendering timed out.');
console.log(videoFile);
console.log(`Duration: ${captions.reduce((sum, scene) => sum + scene.seconds, 0)} seconds`);
console.log(`Screenshots: ${shots.length}`);

ws.close();
chrome.kill();
