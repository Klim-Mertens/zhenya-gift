"""Собирает игру в один HTML-файл для запуска без интернета.

python3 tools/build_offline.py [папка_с_личными_файлами] [куда_сохранить]

Личные записи (музыка, фото, видео) в репозиторий НЕ кладём: репо публичное.
Если указана папка с media.json ({"имя_трека": "файл.mp3"}), файлы оттуда
встраиваются в HTML как data:-ссылки (window.ZG_MEDIA) — только в офлайн-копию.
"""
import base64, json, mimetypes, os, re, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
private = sys.argv[1] if len(sys.argv) > 1 else None
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(root, "Leto-Zheni.html")

def read(p):
    with open(os.path.join(root, p), encoding="utf-8") as f:
        return f.read()

s = read("index.html")
s = s.replace('<link rel="stylesheet" href="css/style.css">', "<style>\n" + read("css/style.css") + "\n</style>")
def inline(m):
    src = m.group(1)
    if src.startswith("private/"):   # личные файлы — из папки private (если её нет, тег просто убираем)
        path = os.path.join(private or "", os.path.basename(src))
        if not private or not os.path.exists(path):
            return ""
        with open(path, encoding="utf-8") as f:
            code = f.read()
    else:
        code = read(src)
    return "<script>\n" + code.replace("</script", "<\\/script") + "\n</script>"
s = re.sub(r'<script src="([^"]+)"></script>', inline, s)

if private and os.path.exists(os.path.join(private, "media.json")):
    with open(os.path.join(private, "media.json"), encoding="utf-8") as f:
        mapping = json.load(f)
    media = {}
    for name, fn in mapping.items():
        path = os.path.join(private, os.path.basename(fn))   # только файлы из этой папки
        mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
        with open(path, "rb") as f:
            media[name] = "data:%s;base64,%s" % (mime, base64.b64encode(f.read()).decode())
    # личные записи подключаем до остальных скриптов
    s = s.replace("<script>", "<script>window.ZG_MEDIA = " + json.dumps(media) + ";</script>\n<script>", 1)
    print("встроено:", ", ".join(media))

with open(out, "w", encoding="utf-8") as f:
    f.write(s)
print("готово:", out, round(os.path.getsize(out) / 1e6, 1), "МБ")
