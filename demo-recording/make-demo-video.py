from pathlib import Path
import io
import math
import struct

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path.cwd()
OUT = ROOT / "demo-recording"
VIDEO = OUT / "rateb-appbuilder-demo.avi"
W, H = 1366, 768
FPS = 8

SCENES = [
    ("01-dashboard.png", "App Builder Platform", "A quick professional demo for Rateb", "أهلاً أستاذ Rateb، هذا عرض سريع للمنصة اللي طورتها", 5),
    ("01-dashboard.png", "Dashboard", "Apps, charts and live activity in one place", "هنا المستخدم يشوف تطبيقاته وإحصائياته", 8),
    ("02-builder-before.png", "Drag & Drop Builder", "Open Coffee Shop App and customize the screen", "هذا محرر Drag & Drop، المستخدم يقدر يبني التطبيق بدون برمجة", 8),
    ("03-builder-edited.png", "Edit Content", "Add a text component and update it instantly", "نضيف عنصر نص ونعدله مباشرة ثم نحفظ التغييرات", 10),
    ("04-live-preview-saved.png", "Live Preview", "The final mobile preview updates immediately", "وهذا الشكل النهائي مباشرة داخل معاينة الموبايل", 8),
    ("05-builds-before.png", "Build APK", "Queue an Android APK build from the platform", "وبضغطة زر يتم تحويله إلى تطبيق Android APK", 9),
    ("06-build-request.png", "CI/CD Ready", "Build request is queued and ready for workflow automation", "نظام البناء جاهز ومربوط مع CI/CD", 9),
    ("06-build-request.png", "Ready For Custom Demo", "A real working model, ready to develop further", "هذا نموذج حقيقي جاهز للتطوير حسب طلبك. وإذا حاب، أخصص لك نسخة Demo خاصة فيك", 7),
]


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/tahoma.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


F_SMALL = font(18, True)
F_TITLE = font(34, True)
F_BODY = font(19)
F_AR = font(22, True)


def rounded(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def wrap(draw, text, font_obj, max_width):
    words = text.split()
    lines, line = [], ""
    for word in words:
        test = f"{line} {word}".strip()
        if draw.textlength(test, font=font_obj) > max_width and line:
            lines.append(line)
            line = word
        else:
            line = test
    if line:
        lines.append(line)
    return lines


def frame_for(scene, scene_progress, global_progress):
    shot_name, title, body, arabic, _ = scene
    img = Image.open(OUT / shot_name).convert("RGB")
    scale = 0.86 + scene_progress * 0.035
    nw, nh = int(W * scale), int(H * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    frame = Image.new("RGB", (W, H), "#0b1020")
    frame.paste(resized, ((W - nw) // 2, 34 - int(scene_progress * 10)))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(H):
        alpha = int(max(0, (y - H * 0.56) / (H * 0.44)) * 215)
        od.line([(0, y), (W, y)], fill=(11, 16, 32, min(230, alpha)))
    frame = Image.alpha_composite(frame.convert("RGBA"), overlay)

    card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    rounded(d, (72, H - 190, 852, H - 62), 18, (255, 255, 255, 245))
    rounded(d, (884, H - 168, 1294, H - 86), 16, (15, 23, 42, 224))
    d.text((104, H - 154), "APP BUILDER DEMO", font=F_SMALL, fill="#4f46e5")
    d.text((104, H - 118), title, font=F_TITLE, fill="#111827")
    d.text((104, H - 82), body, font=F_BODY, fill="#4b5563")

    ar_lines = wrap(d, arabic, F_AR, 360)
    y = H - 142
    for line in ar_lines[:2]:
        line_w = d.textlength(line, font=F_AR)
        d.text((1260 - line_w, y), line, font=F_AR, fill="#ffffff")
        y += 30

    rounded(d, (72, H - 34, W - 72, H - 26), 4, (255, 255, 255, 64))
    rounded(d, (72, H - 34, 72 + int((W - 144) * global_progress), H - 26), 4, (34, 197, 94, 255))
    return Image.alpha_composite(frame, card).convert("RGB")


def jpeg_bytes(image):
    buf = io.BytesIO()
    image.save(buf, "JPEG", quality=88, optimize=True)
    data = buf.getvalue()
    if len(data) % 2:
        data += b"\0"
    return data


def chunk(fourcc, data):
    return fourcc + struct.pack("<I", len(data)) + data + (b"\0" if len(data) % 2 else b"")


def list_chunk(kind, data):
    return b"LIST" + struct.pack("<I", len(data) + 4) + kind + data


frames = []
total_scene_seconds = sum(scene[-1] for scene in SCENES)
total_frames = total_scene_seconds * FPS
frame_index = 0
for scene in SCENES:
    scene_frames = scene[-1] * FPS
    for i in range(scene_frames):
        sp = i / max(1, scene_frames - 1)
        gp = frame_index / max(1, total_frames - 1)
        frames.append(jpeg_bytes(frame_for(scene, sp, gp)))
        frame_index += 1

max_frame = max(len(frame) for frame in frames)
avih = struct.pack(
    "<IIIIIIIIIIIIII",
    int(1_000_000 / FPS),
    max_frame * FPS,
    0,
    0x10,
    len(frames),
    0,
    1,
    max_frame,
    W,
    H,
    0,
    0,
    0,
    0,
)
strh = (
    b"vids"
    + b"MJPG"
    + struct.pack("<IHHIIIIIIII", 0, 0, 0, 0, 1, FPS, 0, len(frames), max_frame, 0xFFFFFFFF, 0)
    + struct.pack("<hhhh", 0, 0, W, H)
)
strf = struct.pack("<IiiHH4sIiiII", 40, W, H, 1, 24, b"MJPG", max_frame, 0, 0, 0, 0)
hdrl = list_chunk(b"hdrl", chunk(b"avih", avih) + list_chunk(b"strl", chunk(b"strh", strh) + chunk(b"strf", strf)))

movi_data = bytearray()
idx_entries = []
offset = 4
for data in frames:
    idx_entries.append((offset, len(data)))
    movi_data += b"00dc" + struct.pack("<I", len(data)) + data
    offset += 8 + len(data)
movi = list_chunk(b"movi", bytes(movi_data))
idx = b"".join(b"00dc" + struct.pack("<III", 0x10, off, size) for off, size in idx_entries)
idx1 = chunk(b"idx1", idx)
riff_payload = hdrl + movi + idx1
VIDEO.write_bytes(b"RIFF" + struct.pack("<I", len(riff_payload) + 4) + b"AVI " + riff_payload)
print(VIDEO)
print(f"duration={total_scene_seconds}s frames={len(frames)} size={VIDEO.stat().st_size}")
