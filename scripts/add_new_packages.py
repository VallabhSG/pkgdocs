"""
Add 15 new packages to public/data/packages/.
Run from repo root: python scripts/add_new_packages.py
"""
import json, os

OUT = os.path.join(os.path.dirname(__file__), "../public/data/packages")

PACKAGES = [

# ──────────────── PYTHON ────────────────

{
  "id": "celery",
  "ecosystem": "pypi",
  "name": "celery",
  "summary": "Distributed task queue for async and scheduled background jobs in Python.",
  "tags": ["async", "queue", "tasks", "background", "distributed"],
  "difficulty": 2,
  "story": {
    "problem": "Web requests need to return fast. Sending emails, resizing images, calling slow APIs, or running ML inference inside a request handler blocks the server and degrades UX. You need a way to hand off work to a separate process and respond immediately.",
    "mental_model": "Celery is like a post office. Your web app drops tasks into a mailbox (broker — usually Redis or RabbitMQ). Worker processes pick them up, execute them, and optionally drop results in a result backend. The web app never waits.",
    "when_to_use": "Sending emails or notifications, processing uploads, running scheduled cron-style jobs, chaining multi-step workflows, fan-out parallel processing.",
    "when_not_to_use": "Simple scripts that don't serve web traffic — just use asyncio or threading. If you need sub-millisecond latency, Celery's overhead is too high. For tiny projects, consider RQ (simpler) or FastAPI BackgroundTasks.",
    "alternatives": [
      {"name": "RQ", "reason": "Simpler Redis-backed queue, no broker config, great for smaller projects."},
      {"name": "Dramatiq", "reason": "More reliable at-least-once semantics, simpler API, growing popularity."},
      {"name": "arq", "reason": "Async-first, asyncio-native, minimal overhead. Good for FastAPI/aiohttp stacks."},
      {"name": "Huey", "reason": "Lightweight, single-file, Redis-backed. Easy to embed in small Django/Flask apps."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "celery", "type": "module", "label": "celery", "summary": "Top-level package. Import Celery app class.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "Celery", "type": "class", "label": "Celery(app)", "summary": "App factory: `app = Celery('myapp', broker='redis://...')`. Holds config, task registry, beat scheduler.", "difficulty": 1, "tags": ["core", "common"]},
      {"id": "task", "type": "decorator", "label": "@app.task", "summary": "Turn any function into a Celery task. Adds .delay(), .apply_async(), .s() methods.", "difficulty": 1, "tags": ["task", "common"]},
      {"id": "delay", "type": "function", "label": ".delay(*args)", "summary": "Shortcut to enqueue a task: `add.delay(1, 2)`. Returns AsyncResult.", "difficulty": 1, "tags": ["enqueue", "common"]},
      {"id": "apply_async", "type": "function", "label": ".apply_async(args, kwargs, countdown, eta)", "summary": "Full task dispatch with options: delay countdown, ETA, expiry, queue routing.", "difficulty": 2, "tags": ["enqueue"]},
      {"id": "AsyncResult", "type": "class", "label": "AsyncResult", "summary": "Handle to a running/completed task. .get() blocks for result, .state, .ready(), .failed().", "difficulty": 2, "tags": ["result"]},
      {"id": "chain", "type": "function", "label": "chain / chord / group", "summary": "Canvas primitives: chain(a, b) pipes output, group([a, b]) runs in parallel, chord waits for group.", "difficulty": 3, "tags": ["workflow"]},
      {"id": "beat", "type": "concept", "label": "Celery Beat (scheduler)", "summary": "Periodic task scheduler. Define CELERYBEAT_SCHEDULE or use django-celery-beat for DB-backed schedules.", "difficulty": 2, "tags": ["scheduling"]},
      {"id": "broker", "type": "concept", "label": "Broker (Redis/RabbitMQ)", "summary": "Message transport. Redis is easiest; RabbitMQ is more durable. Set via broker_url.", "difficulty": 2, "tags": ["config"]},
      {"id": "worker", "type": "concept", "label": "Worker process", "summary": "`celery -A myapp worker`. Executes tasks. Concurrency via prefork, eventlet, or gevent.", "difficulty": 1, "tags": ["runtime"]},
    ],
    "edges": [
      {"id": "e1", "from": "celery", "to": "Celery", "label": "contains"},
      {"id": "e2", "from": "Celery", "to": "task", "label": "decorator"},
      {"id": "e3", "from": "task", "to": "delay", "label": "method"},
      {"id": "e4", "from": "task", "to": "apply_async", "label": "method"},
      {"id": "e5", "from": "delay", "to": "AsyncResult", "label": "returns"},
      {"id": "e6", "from": "apply_async", "to": "AsyncResult", "label": "returns"},
      {"id": "e7", "from": "Celery", "to": "chain", "label": "supports"},
      {"id": "e8", "from": "Celery", "to": "beat", "label": "includes"},
      {"id": "e9", "from": "Celery", "to": "broker", "label": "connects-to"},
      {"id": "e10", "from": "broker", "to": "worker", "label": "feeds"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Define and run your first background task", "difficulty": "beginner",
      "steps": [
        {"label": "Install", "code": "pip install celery redis", "explanation": "Also install a broker — Redis is the simplest choice."},
        {"label": "Create app", "code": "from celery import Celery\napp = Celery('tasks', broker='redis://localhost:6379/0')"},
        {"label": "Define task", "code": "@app.task\ndef send_email(to, subject):\n    # your email logic\n    print(f'Sending {subject} to {to}')"},
        {"label": "Enqueue", "code": "# In your web handler:\nsend_email.delay('user@example.com', 'Welcome!')"},
        {"label": "Start worker", "code": "celery -A tasks worker --loglevel=info"},
      ]
    },
    {
      "id": "t2", "title": "Schedule a periodic task with Celery Beat", "difficulty": "intermediate",
      "steps": [
        {"label": "Config", "code": "from celery.schedules import crontab\napp.conf.beat_schedule = {\n    'daily-report': {\n        'task': 'tasks.generate_report',\n        'schedule': crontab(hour=9, minute=0),\n    },\n}"},
        {"label": "Define task", "code": "@app.task\ndef generate_report():\n    print('Generating daily report...')"},
        {"label": "Start beat", "code": "celery -A tasks beat --loglevel=info"},
      ]
    },
    {
      "id": "t3", "title": "Chain tasks into a pipeline", "difficulty": "advanced",
      "steps": [
        {"label": "Define tasks", "code": "@app.task\ndef fetch_data(url): ...\n\n@app.task\ndef process(data): ...\n\n@app.task\ndef save(result): ..."},
        {"label": "Chain", "code": "from celery import chain\nresult = chain(fetch_data.s(url), process.s(), save.s()).delay()\nprint(result.get())"},
      ]
    },
  ],
  "meta": {"version": "5.4.0", "weekly_downloads": 3200000, "docs_url": "https://docs.celeryq.dev", "repo_url": "https://github.com/celery/celery", "pypi_url": "https://pypi.org/project/celery/"}
},

{
  "id": "redis-py",
  "ecosystem": "pypi",
  "name": "redis",
  "summary": "Python client for Redis — the in-memory data store for caching, pub/sub, and queues.",
  "tags": ["redis", "cache", "pubsub", "database", "async"],
  "difficulty": 2,
  "story": {
    "problem": "Your app hits the database on every request. Pages are slow, DB load spikes, repeated queries fetch identical data. You need a fast in-memory layer to cache results, share state between processes, or power real-time features like notifications.",
    "mental_model": "Redis is a giant dict in RAM shared across all your processes. redis-py is the Python key to that dict. You get/set strings, hashes, lists, sorted sets, and streams — all in microseconds. Think of it as a supercharged global variable that survives restarts.",
    "when_to_use": "Caching API responses or DB queries, session storage, rate limiting counters, pub/sub messaging, leaderboards (sorted sets), task queues (BLPOP), distributed locks.",
    "when_not_to_use": "Primary persistent storage — Redis is RAM-first and can evict data. Complex relational queries. Large blobs (Redis excels at small, fast values).",
    "alternatives": [
      {"name": "memcached", "reason": "Simpler, faster for pure key-value caching, but no persistence or advanced data types."},
      {"name": "valkey", "reason": "Open-source Redis fork, fully compatible, growing after Redis license change."},
      {"name": "aioredis", "reason": "Merged into redis-py 4.x. Use redis.asyncio for async support now."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "redis", "type": "module", "label": "redis", "summary": "Top-level package. Import Redis, ConnectionPool, asyncio variants.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "Redis", "type": "class", "label": "Redis(host, port, db)", "summary": "Sync client. Thread-safe. `r = redis.Redis(host='localhost')`. All commands are methods.", "difficulty": 1, "tags": ["client", "common"]},
      {"id": "asyncio_client", "type": "class", "label": "redis.asyncio.Redis", "summary": "Async client for use with asyncio/FastAPI/aiohttp. Same API as sync client, but awaitable.", "difficulty": 2, "tags": ["async", "common"]},
      {"id": "strings", "type": "concept", "label": "Strings (GET/SET/INCR)", "summary": "r.set('key', 'val', ex=60), r.get('key'), r.incr('counter'), r.mget(['k1','k2']).", "difficulty": 1, "tags": ["strings", "common"]},
      {"id": "hashes", "type": "concept", "label": "Hashes (HSET/HGET)", "summary": "Store objects: r.hset('user:1', mapping={'name':'Alice'}), r.hgetall('user:1').", "difficulty": 2, "tags": ["hashes"]},
      {"id": "lists", "type": "concept", "label": "Lists (LPUSH/RPOP)", "summary": "Queue pattern: LPUSH to push, RPOP/BLPOP to consume. Also LRANGE for paging.", "difficulty": 2, "tags": ["lists"]},
      {"id": "sorted_sets", "type": "concept", "label": "Sorted Sets (ZADD/ZRANGE)", "summary": "Leaderboards: zadd('scores', {'alice': 100}), zrange('scores', 0, 9, withscores=True, rev=True).", "difficulty": 2, "tags": ["sorted-sets"]},
      {"id": "pubsub", "type": "class", "label": "PubSub", "summary": "r.pubsub(); p.subscribe('channel'); p.get_message(). For real-time notifications.", "difficulty": 3, "tags": ["pubsub"]},
      {"id": "pipeline", "type": "class", "label": "Pipeline (transactions)", "summary": "r.pipeline(): batch commands into one round-trip. Use with watch() for optimistic locking.", "difficulty": 3, "tags": ["pipeline", "perf"]},
      {"id": "pool", "type": "class", "label": "ConnectionPool", "summary": "Shared connection pool: `pool = redis.ConnectionPool(...); r = redis.Redis(connection_pool=pool)`.", "difficulty": 2, "tags": ["perf"]},
    ],
    "edges": [
      {"id": "e1", "from": "redis", "to": "Redis", "label": "contains"},
      {"id": "e2", "from": "redis", "to": "asyncio_client", "label": "contains"},
      {"id": "e3", "from": "Redis", "to": "strings", "label": "method"},
      {"id": "e4", "from": "Redis", "to": "hashes", "label": "method"},
      {"id": "e5", "from": "Redis", "to": "lists", "label": "method"},
      {"id": "e6", "from": "Redis", "to": "sorted_sets", "label": "method"},
      {"id": "e7", "from": "Redis", "to": "pubsub", "label": "method"},
      {"id": "e8", "from": "Redis", "to": "pipeline", "label": "method"},
      {"id": "e9", "from": "Redis", "to": "pool", "label": "uses"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Cache a slow function result", "difficulty": "beginner",
      "steps": [
        {"label": "Connect", "code": "import redis, json\nr = redis.Redis(host='localhost', decode_responses=True)"},
        {"label": "Cache wrapper", "code": "def get_user(user_id):\n    key = f'user:{user_id}'\n    cached = r.get(key)\n    if cached:\n        return json.loads(cached)\n    user = db.fetch_user(user_id)  # slow\n    r.set(key, json.dumps(user), ex=300)  # 5min TTL\n    return user"},
      ]
    },
    {
      "id": "t2", "title": "Rate limiting with INCR + EXPIRE", "difficulty": "intermediate",
      "steps": [
        {"label": "Rate limiter", "code": "def is_rate_limited(ip: str, limit=100, window=60) -> bool:\n    key = f'rl:{ip}'\n    count = r.incr(key)\n    if count == 1:\n        r.expire(key, window)  # set TTL on first hit\n    return count > limit"},
      ]
    },
    {
      "id": "t3", "title": "Async Redis with FastAPI", "difficulty": "intermediate",
      "steps": [
        {"label": "Async client", "code": "import redis.asyncio as aioredis\nfrom fastapi import FastAPI\n\napp = FastAPI()\nr = aioredis.Redis(host='localhost', decode_responses=True)"},
        {"label": "Use in route", "code": "@app.get('/cache/{key}')\nasync def get_cache(key: str):\n    value = await r.get(key)\n    return {'value': value}"},
      ]
    },
  ],
  "meta": {"version": "5.0.8", "weekly_downloads": 8500000, "docs_url": "https://redis-py.readthedocs.io", "repo_url": "https://github.com/redis/redis-py", "pypi_url": "https://pypi.org/project/redis/"}
},

{
  "id": "beautifulsoup4",
  "ecosystem": "pypi",
  "name": "beautifulsoup4",
  "summary": "HTML and XML parsing library for extracting data from web pages with a simple Pythonic API.",
  "tags": ["scraping", "html", "parsing", "web", "xml"],
  "difficulty": 1,
  "story": {
    "problem": "You've fetched HTML from a web page with requests. Now you're staring at a wall of tags, trying to extract product prices, article text, or table rows with regex. Regex breaks the moment the site adds a CSS class. You need a proper HTML tree parser.",
    "mental_model": "BeautifulSoup turns an HTML string into a traversable tree. Every tag becomes an object with .text, .attrs, and child/parent navigation. You find elements by tag name, CSS class, id, or attribute — like jQuery selectors but in Python.",
    "when_to_use": "Scraping static HTML pages, extracting data from email templates, parsing HTML in tests, processing XML feeds, cleaning up messy HTML.",
    "when_not_to_use": "JavaScript-rendered pages (use Playwright or Selenium). High-volume scraping at scale (use Scrapy). When the site has a proper API — always prefer the API.",
    "alternatives": [
      {"name": "lxml", "reason": "Much faster for large documents. BS4 can use lxml as its parser backend."},
      {"name": "parsel", "reason": "Scrapy's selector library — XPath and CSS selectors, faster than BS4."},
      {"name": "playwright", "reason": "Needed for JS-rendered pages; can extract from the live DOM."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "bs4", "type": "module", "label": "bs4", "summary": "Import as `from bs4 import BeautifulSoup`.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "BeautifulSoup", "type": "class", "label": "BeautifulSoup(html, parser)", "summary": "Main class. `soup = BeautifulSoup(html, 'html.parser')`. Parsers: html.parser, lxml, html5lib.", "difficulty": 1, "tags": ["core", "common"]},
      {"id": "find", "type": "function", "label": ".find(tag, attrs)", "summary": "Find first matching element: `soup.find('h1')`, `soup.find('div', class_='price')`.", "difficulty": 1, "tags": ["search", "common"]},
      {"id": "find_all", "type": "function", "label": ".find_all(tag, attrs)", "summary": "Find all matching elements. Returns a list. Accepts tag, attrs dict, CSS class, id, string.", "difficulty": 1, "tags": ["search", "common"]},
      {"id": "select", "type": "function", "label": ".select(css_selector)", "summary": "CSS selector syntax: `soup.select('table.data tr td')`. Returns list like find_all.", "difficulty": 2, "tags": ["search", "common"]},
      {"id": "Tag", "type": "class", "label": "Tag object", "summary": "Represents an HTML element. .text (inner text), .attrs (dict), .get('href'), .children, .parent.", "difficulty": 1, "tags": ["element"]},
      {"id": "NavigableString", "type": "class", "label": "NavigableString", "summary": "A text node inside a tag. Accessed via tag.string or iterating tag.children.", "difficulty": 2, "tags": ["element"]},
      {"id": "navigate", "type": "concept", "label": "Tree Navigation", "summary": ".parent, .children, .next_sibling, .previous_sibling, .descendants for walking the tree.", "difficulty": 2, "tags": ["navigation"]},
    ],
    "edges": [
      {"id": "e1", "from": "bs4", "to": "BeautifulSoup", "label": "contains"},
      {"id": "e2", "from": "BeautifulSoup", "to": "find", "label": "method"},
      {"id": "e3", "from": "BeautifulSoup", "to": "find_all", "label": "method"},
      {"id": "e4", "from": "BeautifulSoup", "to": "select", "label": "method"},
      {"id": "e5", "from": "find", "to": "Tag", "label": "returns"},
      {"id": "e6", "from": "find_all", "to": "Tag", "label": "returns"},
      {"id": "e7", "from": "Tag", "to": "NavigableString", "label": "contains"},
      {"id": "e8", "from": "Tag", "to": "navigate", "label": "supports"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Scrape article titles from a news page", "difficulty": "beginner",
      "steps": [
        {"label": "Fetch", "code": "import requests\nfrom bs4 import BeautifulSoup\n\nhtml = requests.get('https://news.ycombinator.com').text\nsoup = BeautifulSoup(html, 'html.parser')"},
        {"label": "Extract", "code": "titles = soup.select('span.titleline > a')\nfor t in titles:\n    print(t.text, t['href'])"},
      ]
    },
    {
      "id": "t2", "title": "Parse a table into a list of dicts", "difficulty": "intermediate",
      "steps": [
        {"label": "Find table", "code": "table = soup.find('table', id='data-table')\nrows = table.find_all('tr')"},
        {"label": "Extract headers", "code": "headers = [th.text.strip() for th in rows[0].find_all('th')]"},
        {"label": "Extract rows", "code": "data = []\nfor row in rows[1:]:\n    cells = [td.text.strip() for td in row.find_all('td')]\n    data.append(dict(zip(headers, cells)))"},
      ]
    },
  ],
  "meta": {"version": "4.12.3", "weekly_downloads": 9000000, "docs_url": "https://www.crummy.com/software/BeautifulSoup/bs4/doc/", "repo_url": "https://github.com/waylan/beautifulsoup", "pypi_url": "https://pypi.org/project/beautifulsoup4/"}
},

{
  "id": "pillow",
  "ecosystem": "pypi",
  "name": "Pillow",
  "summary": "Friendly Python Imaging Library fork for opening, manipulating, and saving image files.",
  "tags": ["image", "PIL", "graphics", "thumbnail", "convert"],
  "difficulty": 1,
  "story": {
    "problem": "You need to resize user avatars, add watermarks, convert uploaded PNGs to WebP, extract EXIF data, or generate thumbnails — all server-side without a heavy graphics toolkit.",
    "mental_model": "Pillow represents any image as an Image object with a mode (RGB, RGBA, L), size (width, height), and pixel data. Operations return new Image objects (immutable pipeline). When done, call .save() or .tobytes().",
    "when_to_use": "Resizing/cropping/converting images, compositing overlays, generating thumbnails, basic drawing, reading EXIF metadata, converting between formats.",
    "when_not_to_use": "High-performance batch processing at scale (use ImageMagick or libvips/pyvips). Video processing. Complex image recognition (use OpenCV or ML models).",
    "alternatives": [
      {"name": "pyvips", "reason": "10-100x faster for large images, low memory. Steeper API but worth it for scale."},
      {"name": "opencv-python", "reason": "Computer vision operations, real-time video, more ML-friendly."},
      {"name": "wand", "reason": "Python bindings for ImageMagick — broader format support, more effects."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "PIL", "type": "module", "label": "PIL (Pillow)", "summary": "Import from PIL: `from PIL import Image, ImageDraw, ImageFilter`.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "Image", "type": "module", "label": "PIL.Image", "summary": "Core module. Image.open(), Image.new(), Image.fromarray(). Returns Image objects.", "difficulty": 1, "tags": ["core", "common"]},
      {"id": "Image_obj", "type": "class", "label": "Image object", "summary": "Represents a raster image. .size, .mode, .format, .resize(), .crop(), .rotate(), .convert(), .save().", "difficulty": 1, "tags": ["core"]},
      {"id": "ImageDraw", "type": "module", "label": "PIL.ImageDraw", "summary": "Draw lines, rectangles, ellipses, text on an image. `draw = ImageDraw.Draw(img)`.", "difficulty": 2, "tags": ["draw"]},
      {"id": "ImageFilter", "type": "module", "label": "PIL.ImageFilter", "summary": "Filters: BLUR, SHARPEN, EDGE_ENHANCE, GaussianBlur(radius). Apply with img.filter(...).", "difficulty": 2, "tags": ["filter"]},
      {"id": "ImageFont", "type": "module", "label": "PIL.ImageFont", "summary": "Load fonts for text rendering: ImageFont.truetype('font.ttf', 24).", "difficulty": 2, "tags": ["text"]},
      {"id": "ImageOps", "type": "module", "label": "PIL.ImageOps", "summary": "High-level operations: fit(), contain(), grayscale(), invert(), autocontrast().", "difficulty": 2, "tags": ["ops"]},
      {"id": "ExifTags", "type": "module", "label": "PIL.ExifTags", "summary": "Read EXIF metadata: `img._getexif()` returns raw EXIF dict; use ExifTags.TAGS to decode keys.", "difficulty": 3, "tags": ["exif"]},
    ],
    "edges": [
      {"id": "e1", "from": "PIL", "to": "Image", "label": "contains"},
      {"id": "e2", "from": "PIL", "to": "ImageDraw", "label": "contains"},
      {"id": "e3", "from": "PIL", "to": "ImageFilter", "label": "contains"},
      {"id": "e4", "from": "PIL", "to": "ImageFont", "label": "contains"},
      {"id": "e5", "from": "PIL", "to": "ImageOps", "label": "contains"},
      {"id": "e6", "from": "Image", "to": "Image_obj", "label": "returns"},
      {"id": "e7", "from": "Image_obj", "to": "ImageFilter", "label": "uses"},
      {"id": "e8", "from": "ImageDraw", "to": "ImageFont", "label": "uses"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Resize and save a thumbnail", "difficulty": "beginner",
      "steps": [
        {"label": "Open", "code": "from PIL import Image\nimg = Image.open('photo.jpg')"},
        {"label": "Thumbnail", "code": "img.thumbnail((400, 400))  # preserves aspect ratio\nimg.save('thumb.jpg', quality=85, optimize=True)"},
      ]
    },
    {
      "id": "t2", "title": "Add a text watermark", "difficulty": "intermediate",
      "steps": [
        {"label": "Setup", "code": "from PIL import Image, ImageDraw, ImageFont\nimg = Image.open('photo.jpg').convert('RGBA')"},
        {"label": "Overlay", "code": "overlay = Image.new('RGBA', img.size, (0,0,0,0))\ndraw = ImageDraw.Draw(overlay)\nfont = ImageFont.truetype('arial.ttf', 36)\ndraw.text((20, 20), '© MyBrand', fill=(255,255,255,128), font=font)"},
        {"label": "Merge", "code": "result = Image.alpha_composite(img, overlay)\nresult.convert('RGB').save('watermarked.jpg')"},
      ]
    },
    {
      "id": "t3", "title": "Batch convert PNG to WebP", "difficulty": "beginner",
      "steps": [
        {"label": "Batch", "code": "from pathlib import Path\nfrom PIL import Image\n\nfor p in Path('images').glob('*.png'):\n    img = Image.open(p)\n    img.save(p.with_suffix('.webp'), 'WEBP', quality=80)"},
      ]
    },
  ],
  "meta": {"version": "10.4.0", "weekly_downloads": 12000000, "docs_url": "https://pillow.readthedocs.io", "repo_url": "https://github.com/python-pillow/Pillow", "pypi_url": "https://pypi.org/project/Pillow/"}
},

{
  "id": "alembic",
  "ecosystem": "pypi",
  "name": "alembic",
  "summary": "Database migration tool for SQLAlchemy — tracks schema changes as versioned scripts.",
  "tags": ["migrations", "database", "sqlalchemy", "schema", "orm"],
  "difficulty": 2,
  "story": {
    "problem": "You change a SQLAlchemy model — add a column, rename a table. Now production's DB schema is out of sync with your code. You can't just drop and recreate the DB. You need to apply the change safely, track what version each environment is at, and roll back if something goes wrong.",
    "mental_model": "Alembic is Git for your database schema. Each migration is a versioned Python file with `upgrade()` and `downgrade()` functions. Alembic tracks which version your DB is at in an `alembic_version` table. `alembic upgrade head` runs all pending migrations in order.",
    "when_to_use": "Any production SQLAlchemy app. Column additions/renames, index creation, constraint changes, data backfills as part of schema migrations.",
    "when_not_to_use": "Non-SQLAlchemy databases (use Flyway, Liquibase, or Django migrations). Throwaway dev DBs where you can afford to drop and recreate.",
    "alternatives": [
      {"name": "Django migrations", "reason": "Built into Django — tightly integrated but Django-only."},
      {"name": "Flyway", "reason": "SQL-file based, language-agnostic, popular in Java/enterprise environments."},
      {"name": "sqlmodel", "reason": "Uses Alembic under the hood; SQLModel provides a simpler model definition layer."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "alembic", "type": "module", "label": "alembic", "summary": "CLI and programmatic migration framework for SQLAlchemy.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "env_py", "type": "concept", "label": "env.py", "summary": "Migration environment script generated by `alembic init`. Connects Alembic to your DB and models.", "difficulty": 2, "tags": ["config"]},
      {"id": "revision", "type": "command", "label": "alembic revision", "summary": "`alembic revision --autogenerate -m 'add users'` — compares models to DB and writes a migration script.", "difficulty": 1, "tags": ["cli", "common"]},
      {"id": "upgrade", "type": "command", "label": "alembic upgrade", "summary": "`alembic upgrade head` — apply all pending migrations. `alembic upgrade +1` — apply one.", "difficulty": 1, "tags": ["cli", "common"]},
      {"id": "downgrade", "type": "command", "label": "alembic downgrade", "summary": "`alembic downgrade -1` — revert one migration. `alembic downgrade base` — revert all.", "difficulty": 2, "tags": ["cli"]},
      {"id": "op", "type": "module", "label": "alembic.op", "summary": "Operations inside migration scripts: op.add_column(), op.drop_table(), op.create_index(), op.execute().", "difficulty": 2, "tags": ["operations", "common"]},
      {"id": "version_table", "type": "concept", "label": "alembic_version table", "summary": "Single-row table Alembic creates in your DB to track the current revision hash.", "difficulty": 1, "tags": ["internals"]},
      {"id": "branches", "type": "concept", "label": "Branches & Merge", "summary": "Multiple migration heads (e.g. in a monorepo). `alembic merge` to reconcile divergent histories.", "difficulty": 3, "tags": ["advanced"]},
    ],
    "edges": [
      {"id": "e1", "from": "alembic", "to": "env_py", "label": "uses"},
      {"id": "e2", "from": "alembic", "to": "revision", "label": "cli"},
      {"id": "e3", "from": "alembic", "to": "upgrade", "label": "cli"},
      {"id": "e4", "from": "alembic", "to": "downgrade", "label": "cli"},
      {"id": "e5", "from": "revision", "to": "op", "label": "generates-scripts-using"},
      {"id": "e6", "from": "upgrade", "to": "version_table", "label": "updates"},
      {"id": "e7", "from": "alembic", "to": "branches", "label": "supports"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Set up Alembic in a new project", "difficulty": "beginner",
      "steps": [
        {"label": "Install", "code": "pip install alembic"},
        {"label": "Init", "code": "alembic init migrations"},
        {"label": "Configure", "code": "# In alembic.ini:\nsqlalchemy.url = postgresql://user:pass@localhost/mydb"},
        {"label": "Point to models", "code": "# In migrations/env.py:\nfrom myapp.models import Base\ntarget_metadata = Base.metadata"},
      ]
    },
    {
      "id": "t2", "title": "Auto-generate and apply a migration", "difficulty": "beginner",
      "steps": [
        {"label": "Add column to model", "code": "# models.py\nclass User(Base):\n    __tablename__ = 'users'\n    id = Column(Integer, primary_key=True)\n    email = Column(String)  # NEW"},
        {"label": "Generate", "code": "alembic revision --autogenerate -m 'add email to users'"},
        {"label": "Review", "code": "# Check generated file in migrations/versions/\n# Verify upgrade() adds column, downgrade() drops it"},
        {"label": "Apply", "code": "alembic upgrade head"},
      ]
    },
  ],
  "meta": {"version": "1.13.2", "weekly_downloads": 3800000, "docs_url": "https://alembic.sqlalchemy.org", "repo_url": "https://github.com/sqlalchemy/alembic", "pypi_url": "https://pypi.org/project/alembic/"}
},

{
  "id": "uvicorn",
  "ecosystem": "pypi",
  "name": "uvicorn",
  "summary": "Lightning-fast ASGI server for running async Python web apps (FastAPI, Starlette).",
  "tags": ["asgi", "server", "fastapi", "async", "production"],
  "difficulty": 1,
  "story": {
    "problem": "You've built a FastAPI or Starlette app. Now how do you actually run it? Flask had Flask run, but ASGI apps need an ASGI server. And when you deploy to production, you need something that handles concurrency, workers, and doesn't crash under load.",
    "mental_model": "Uvicorn is the engine under your ASGI app. It handles TCP connections, HTTP parsing, and translates them into ASGI scope/receive/send calls that your app understands. Pair with Gunicorn (uvicorn workers) in production for multi-core scaling.",
    "when_to_use": "Running any ASGI framework: FastAPI, Starlette, Django Channels, Litestar. Development server with hot reload. Production with Gunicorn+uvicorn workers.",
    "when_not_to_use": "WSGI apps (Flask, Django without Channels) — use gunicorn with sync workers instead.",
    "alternatives": [
      {"name": "gunicorn", "reason": "WSGI server, but pairs with uvicorn workers for production ASGI deployments."},
      {"name": "hypercorn", "reason": "ASGI server with HTTP/2 and HTTP/3 support out of the box."},
      {"name": "daphne", "reason": "Django Channels' official ASGI server, tightly integrated with Django."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "uvicorn", "type": "module", "label": "uvicorn", "summary": "CLI and programmatic ASGI server.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "run", "type": "function", "label": "uvicorn.run(app, host, port)", "summary": "Programmatic start: `uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)`.", "difficulty": 1, "tags": ["start", "common"]},
      {"id": "cli", "type": "command", "label": "uvicorn CLI", "summary": "`uvicorn main:app --reload --workers 4 --host 0.0.0.0 --port 8000`.", "difficulty": 1, "tags": ["cli", "common"]},
      {"id": "reload", "type": "concept", "label": "--reload (dev mode)", "summary": "Hot-reloads on file changes. Only use in development — not safe for production.", "difficulty": 1, "tags": ["dev"]},
      {"id": "workers", "type": "concept", "label": "--workers (multi-process)", "summary": "Fork N worker processes. Use with Gunicorn in production: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`.", "difficulty": 2, "tags": ["production"]},
      {"id": "ssl", "type": "concept", "label": "SSL/TLS", "summary": "`--ssl-keyfile key.pem --ssl-certfile cert.pem`. In production, usually handled by nginx/load balancer.", "difficulty": 2, "tags": ["ssl"]},
      {"id": "lifespan", "type": "concept", "label": "Lifespan events", "summary": "Uvicorn calls ASGI lifespan startup/shutdown events. FastAPI's @asynccontextmanager lifespan.", "difficulty": 2, "tags": ["lifecycle"]},
    ],
    "edges": [
      {"id": "e1", "from": "uvicorn", "to": "run", "label": "contains"},
      {"id": "e2", "from": "uvicorn", "to": "cli", "label": "provides"},
      {"id": "e3", "from": "cli", "to": "reload", "label": "flag"},
      {"id": "e4", "from": "cli", "to": "workers", "label": "flag"},
      {"id": "e5", "from": "cli", "to": "ssl", "label": "flag"},
      {"id": "e6", "from": "run", "to": "lifespan", "label": "triggers"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Run a FastAPI app for development", "difficulty": "beginner",
      "steps": [
        {"label": "Install", "code": "pip install uvicorn[standard]"},
        {"label": "CLI", "code": "uvicorn main:app --reload --port 8000"},
        {"label": "Programmatic", "code": "# main.py\nimport uvicorn\nif __name__ == '__main__':\n    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)"},
      ]
    },
    {
      "id": "t2", "title": "Production deploy with Gunicorn + Uvicorn workers", "difficulty": "intermediate",
      "steps": [
        {"label": "Install", "code": "pip install gunicorn uvicorn[standard]"},
        {"label": "Run", "code": "gunicorn main:app \\\n  --workers 4 \\\n  --worker-class uvicorn.workers.UvicornWorker \\\n  --bind 0.0.0.0:8000"},
        {"label": "Rule of thumb", "code": "# workers = (2 × CPU cores) + 1\n# For 2-core machine: --workers 5"},
      ]
    },
  ],
  "meta": {"version": "0.30.6", "weekly_downloads": 7200000, "docs_url": "https://www.uvicorn.org", "repo_url": "https://github.com/encode/uvicorn", "pypi_url": "https://pypi.org/project/uvicorn/"}
},

{
  "id": "boto3",
  "ecosystem": "pypi",
  "name": "boto3",
  "summary": "Official AWS SDK for Python — interact with S3, EC2, DynamoDB, Lambda, and 200+ AWS services.",
  "tags": ["aws", "s3", "cloud", "lambda", "dynamodb"],
  "difficulty": 2,
  "story": {
    "problem": "Your app needs to store user uploads in S3, send emails via SES, trigger a Lambda function, or read from DynamoDB. The AWS Console is for humans — you need to do this from code, with proper credentials, error handling, and pagination.",
    "mental_model": "Boto3 has two layers: resource (high-level, Pythonic objects like `s3.Bucket`) and client (low-level, 1:1 mapping to AWS API calls). Resources are friendlier for common tasks; clients give you full control. Both share the same credential chain (env vars → ~/.aws/credentials → IAM role).",
    "when_to_use": "Any Python code running against AWS services: uploading to S3, querying DynamoDB, invoking Lambda, sending SQS messages, managing EC2 instances.",
    "when_not_to_use": "Infrastructure provisioning — use CDK, Terraform, or CloudFormation instead. If you're on Google Cloud or Azure, use their respective SDKs.",
    "alternatives": [
      {"name": "aiobotocore", "reason": "Async wrapper around botocore for asyncio apps."},
      {"name": "s3fs", "reason": "File-system interface over S3 — use it with pandas read_csv/to_csv on s3:// paths."},
      {"name": "AWS CDK", "reason": "Infrastructure as code, not runtime API calls. Different tool."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "boto3", "type": "module", "label": "boto3", "summary": "Import as `import boto3`.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "client", "type": "function", "label": "boto3.client(service)", "summary": "Low-level client: `s3 = boto3.client('s3')`. All operations map 1:1 to AWS API. Returns raw dicts.", "difficulty": 1, "tags": ["client", "common"]},
      {"id": "resource", "type": "function", "label": "boto3.resource(service)", "summary": "High-level resource: `s3 = boto3.resource('s3')`. Pythonic objects (Bucket, Object, Table).", "difficulty": 1, "tags": ["resource", "common"]},
      {"id": "Session", "type": "class", "label": "boto3.Session", "summary": "Manages credentials and region. Useful for switching profiles or assuming roles.", "difficulty": 2, "tags": ["auth"]},
      {"id": "s3", "type": "concept", "label": "S3 operations", "summary": "upload_file(), download_file(), put_object(), get_object(), list_objects_v2(), generate_presigned_url().", "difficulty": 1, "tags": ["s3", "common"]},
      {"id": "dynamodb", "type": "concept", "label": "DynamoDB operations", "summary": "table.put_item(), table.get_item(), table.query(), table.scan(), batch_writer().", "difficulty": 2, "tags": ["dynamodb"]},
      {"id": "paginator", "type": "class", "label": "Paginator", "summary": "Auto-paginate results: `paginator = client.get_paginator('list_objects_v2')`. Iterates all pages.", "difficulty": 2, "tags": ["pagination"]},
      {"id": "waiter", "type": "class", "label": "Waiter", "summary": "Poll until a condition is met: `ec2.get_waiter('instance_running').wait(InstanceIds=[id])`.", "difficulty": 2, "tags": ["async"]},
    ],
    "edges": [
      {"id": "e1", "from": "boto3", "to": "client", "label": "contains"},
      {"id": "e2", "from": "boto3", "to": "resource", "label": "contains"},
      {"id": "e3", "from": "boto3", "to": "Session", "label": "contains"},
      {"id": "e4", "from": "client", "to": "s3", "label": "accesses"},
      {"id": "e5", "from": "client", "to": "dynamodb", "label": "accesses"},
      {"id": "e6", "from": "client", "to": "paginator", "label": "method"},
      {"id": "e7", "from": "client", "to": "waiter", "label": "method"},
      {"id": "e8", "from": "Session", "to": "client", "label": "creates"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Upload a file to S3", "difficulty": "beginner",
      "steps": [
        {"label": "Connect", "code": "import boto3\ns3 = boto3.client('s3')"},
        {"label": "Upload", "code": "s3.upload_file(\n    Filename='local_file.pdf',\n    Bucket='my-bucket',\n    Key='uploads/file.pdf'\n)"},
        {"label": "Presigned URL", "code": "url = s3.generate_presigned_url(\n    'get_object',\n    Params={'Bucket': 'my-bucket', 'Key': 'uploads/file.pdf'},\n    ExpiresIn=3600\n)"},
      ]
    },
    {
      "id": "t2", "title": "Read and write DynamoDB items", "difficulty": "intermediate",
      "steps": [
        {"label": "Get table", "code": "dynamodb = boto3.resource('dynamodb')\ntable = dynamodb.Table('Users')"},
        {"label": "Put item", "code": "table.put_item(Item={\n    'user_id': '123',\n    'name': 'Alice',\n    'email': 'alice@example.com'\n})"},
        {"label": "Get item", "code": "resp = table.get_item(Key={'user_id': '123'})\nuser = resp.get('Item')"},
      ]
    },
  ],
  "meta": {"version": "1.35.0", "weekly_downloads": 28000000, "docs_url": "https://boto3.amazonaws.com/v1/documentation/api/latest/index.html", "repo_url": "https://github.com/boto/boto3", "pypi_url": "https://pypi.org/project/boto3/"}
},

{
  "id": "scrapy",
  "ecosystem": "pypi",
  "name": "Scrapy",
  "summary": "Fast, batteries-included web scraping and crawling framework for Python.",
  "tags": ["scraping", "crawling", "spider", "async", "pipelines"],
  "difficulty": 2,
  "story": {
    "problem": "requests + BeautifulSoup works for one page, but you need to scrape 10,000 product pages, follow pagination, handle retries, avoid getting banned, store results to a database, and run it on a schedule. Doing all that by hand is a full project in itself.",
    "mental_model": "Scrapy is a framework, not a library. You define Spiders (what to crawl and how to parse), Items (what data to extract), and Pipelines (what to do with it). Scrapy's async engine handles concurrency, retries, politeness delays, and deduplication — you just write the parsing logic.",
    "when_to_use": "Large-scale crawling, production spiders that run regularly, structured data extraction with pipelines (to DB, CSV, JSON), sites with pagination or login.",
    "when_not_to_use": "Single-page quick scrapes (use requests+BS4). JavaScript-heavy sites (use Playwright; or scrapy-playwright to integrate). When a proper API exists.",
    "alternatives": [
      {"name": "requests + BS4", "reason": "Simpler for one-off scrapes, but no concurrency, retries, or pipelines built in."},
      {"name": "playwright", "reason": "Required for JS-rendered pages; can be integrated with Scrapy via scrapy-playwright."},
      {"name": "apify", "reason": "Managed scraping platform — handles infrastructure, proxies, and scheduling for you."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "scrapy", "type": "module", "label": "scrapy", "summary": "Framework package. Import Spider, Item, Field, Request, etc.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "Spider", "type": "class", "label": "scrapy.Spider", "summary": "Base class for all spiders. Define name, start_urls, and parse() to extract data and yield more Requests.", "difficulty": 1, "tags": ["spider", "common"]},
      {"id": "CrawlSpider", "type": "class", "label": "CrawlSpider + Rules", "summary": "Auto-follows links matching Rules/LinkExtractors. Good for crawling whole sites.", "difficulty": 2, "tags": ["spider"]},
      {"id": "Request", "type": "class", "label": "scrapy.Request", "summary": "Represents a URL to fetch. Yield from parse() to queue more pages. Supports callback, meta, headers.", "difficulty": 1, "tags": ["request"]},
      {"id": "Response", "type": "class", "label": "Response", "summary": "Scrapy response object. .css(), .xpath() for selecting. .follow() for relative links. .text, .url.", "difficulty": 1, "tags": ["response", "common"]},
      {"id": "Item", "type": "class", "label": "scrapy.Item", "summary": "Dict-like container for scraped data. Defines allowed fields. Passed through Pipelines.", "difficulty": 1, "tags": ["data"]},
      {"id": "Pipeline", "type": "concept", "label": "Item Pipelines", "summary": "Process Items after extraction: validate, deduplicate, save to DB or file. Defined in pipelines.py.", "difficulty": 2, "tags": ["pipeline"]},
      {"id": "Middleware", "type": "concept", "label": "Middlewares", "summary": "Downloader middlewares: user-agent rotation, proxy handling, retry logic, cookies.", "difficulty": 3, "tags": ["middleware"]},
      {"id": "settings", "type": "concept", "label": "Settings", "summary": "settings.py controls: DOWNLOAD_DELAY, CONCURRENT_REQUESTS, ROBOTSTXT_OBEY, pipelines, middlewares.", "difficulty": 2, "tags": ["config"]},
    ],
    "edges": [
      {"id": "e1", "from": "scrapy", "to": "Spider", "label": "contains"},
      {"id": "e2", "from": "scrapy", "to": "CrawlSpider", "label": "contains"},
      {"id": "e3", "from": "Spider", "to": "Request", "label": "yields"},
      {"id": "e4", "from": "Request", "to": "Response", "label": "produces"},
      {"id": "e5", "from": "Response", "to": "Item", "label": "yields"},
      {"id": "e6", "from": "Item", "to": "Pipeline", "label": "passes-through"},
      {"id": "e7", "from": "scrapy", "to": "Middleware", "label": "supports"},
      {"id": "e8", "from": "scrapy", "to": "settings", "label": "configured-by"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Build a basic spider", "difficulty": "beginner",
      "steps": [
        {"label": "Create project", "code": "scrapy startproject myproject\ncd myproject\nscrapy genspider quotes quotes.toscrape.com"},
        {"label": "Write spider", "code": "import scrapy\n\nclass QuotesSpider(scrapy.Spider):\n    name = 'quotes'\n    start_urls = ['https://quotes.toscrape.com']\n\n    def parse(self, response):\n        for q in response.css('div.quote'):\n            yield {\n                'text': q.css('span.text::text').get(),\n                'author': q.css('small.author::text').get(),\n            }\n        next_page = response.css('li.next a::attr(href)').get()\n        if next_page:\n            yield response.follow(next_page, self.parse)"},
        {"label": "Run", "code": "scrapy crawl quotes -o quotes.json"},
      ]
    },
    {
      "id": "t2", "title": "Save items to a database via Pipeline", "difficulty": "intermediate",
      "steps": [
        {"label": "Pipeline", "code": "# pipelines.py\nclass DatabasePipeline:\n    def open_spider(self, spider):\n        self.db = connect_db()\n\n    def process_item(self, item, spider):\n        self.db.insert(item)\n        return item\n\n    def close_spider(self, spider):\n        self.db.close()"},
        {"label": "Enable", "code": "# settings.py\nITEM_PIPELINES = {'myproject.pipelines.DatabasePipeline': 300}"},
      ]
    },
  ],
  "meta": {"version": "2.11.2", "weekly_downloads": 1400000, "docs_url": "https://docs.scrapy.org", "repo_url": "https://github.com/scrapy/scrapy", "pypi_url": "https://pypi.org/project/Scrapy/"}
},

# ──────────────── NPM ────────────────

{
  "id": "prisma",
  "ecosystem": "npm",
  "name": "prisma",
  "summary": "Next-generation Node.js and TypeScript ORM with type-safe queries, migrations, and a visual schema editor.",
  "tags": ["orm", "database", "typescript", "sql", "migrations"],
  "difficulty": 2,
  "story": {
    "problem": "Writing raw SQL is tedious and error-prone. Traditional ORMs like Sequelize give you objects but lose TypeScript types as soon as you query. You end up casting `any` everywhere and discovering schema mismatches at runtime.",
    "mental_model": "Prisma has three parts: Schema (define models in schema.prisma), Migrate (generate SQL migrations from schema diffs), and Client (auto-generated, fully type-safe query builder). When you run `prisma generate`, it reads your schema and generates a `PrismaClient` with exact types for every model and query.",
    "when_to_use": "TypeScript backends with relational DBs (PostgreSQL, MySQL, SQLite, SQL Server). Projects where type safety and DX matter. Next.js full-stack apps.",
    "when_not_to_use": "If you need very complex SQL that Prisma can't express — you can fall back to $queryRaw. Pure NoSQL (use Mongoose for MongoDB). Extreme performance-critical paths (Prisma adds overhead vs raw SQL).",
    "alternatives": [
      {"name": "drizzle-orm", "reason": "Lighter, SQL-first, no code generation. Faster queries, smaller bundle, growing fast."},
      {"name": "typeorm", "reason": "Decorator-based ORM, similar to Java Hibernate. More mature, more complex."},
      {"name": "kysely", "reason": "Type-safe SQL query builder without ORM abstractions. Full SQL control with types."},
      {"name": "sequelize", "reason": "Older, battle-tested ORM. Less TypeScript-friendly but has a huge ecosystem."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "prisma", "type": "module", "label": "prisma", "summary": "CLI tool: `npx prisma generate`, `prisma migrate dev`, `prisma studio`.", "difficulty": 1, "tags": ["entry-point", "cli"]},
      {"id": "schema", "type": "concept", "label": "schema.prisma", "summary": "Declarative schema file: datasource (DB connection), generator (client config), model (table definitions).", "difficulty": 1, "tags": ["schema", "common"]},
      {"id": "PrismaClient", "type": "class", "label": "PrismaClient", "summary": "Auto-generated type-safe client. `const prisma = new PrismaClient()`. One instance per app.", "difficulty": 1, "tags": ["client", "common"]},
      {"id": "find", "type": "concept", "label": "find* queries", "summary": "prisma.user.findUnique(), findFirst(), findMany(). Accept where, select, include, orderBy, skip, take.", "difficulty": 1, "tags": ["query", "common"]},
      {"id": "write", "type": "concept", "label": "Write operations", "summary": "create(), update(), upsert(), delete(), createMany(), updateMany(), deleteMany().", "difficulty": 1, "tags": ["mutation", "common"]},
      {"id": "relations", "type": "concept", "label": "Relations & include", "summary": "Define 1:1, 1:N, N:M in schema. Query with `include: { posts: true }` for eager loading.", "difficulty": 2, "tags": ["relations"]},
      {"id": "migrate", "type": "command", "label": "prisma migrate dev", "summary": "Compares schema to DB, generates SQL migration file, applies it. Tracks migration history.", "difficulty": 1, "tags": ["migrations", "common"]},
      {"id": "studio", "type": "tool", "label": "Prisma Studio", "summary": "`npx prisma studio` — visual DB browser in the browser. Browse, filter, edit records.", "difficulty": 1, "tags": ["devtools"]},
      {"id": "transactions", "type": "concept", "label": "$transaction", "summary": "prisma.$transaction([...ops]) for sequential atomic ops. Or callback form for interactive transactions.", "difficulty": 3, "tags": ["advanced"]},
    ],
    "edges": [
      {"id": "e1", "from": "prisma", "to": "schema", "label": "reads"},
      {"id": "e2", "from": "prisma", "to": "PrismaClient", "label": "generates"},
      {"id": "e3", "from": "prisma", "to": "migrate", "label": "cli"},
      {"id": "e4", "from": "prisma", "to": "studio", "label": "cli"},
      {"id": "e5", "from": "PrismaClient", "to": "find", "label": "method"},
      {"id": "e6", "from": "PrismaClient", "to": "write", "label": "method"},
      {"id": "e7", "from": "PrismaClient", "to": "transactions", "label": "method"},
      {"id": "e8", "from": "schema", "to": "relations", "label": "defines"},
      {"id": "e9", "from": "find", "to": "relations", "label": "via-include"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Set up Prisma with PostgreSQL", "difficulty": "beginner",
      "steps": [
        {"label": "Install", "code": "npm install prisma @prisma/client\nnpx prisma init"},
        {"label": "Schema", "code": "// prisma/schema.prisma\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n  name  String?\n}"},
        {"label": "Migrate", "code": "npx prisma migrate dev --name init"},
        {"label": "Generate client", "code": "npx prisma generate"},
      ]
    },
    {
      "id": "t2", "title": "CRUD operations with PrismaClient", "difficulty": "beginner",
      "steps": [
        {"label": "Setup", "code": "import { PrismaClient } from '@prisma/client'\nconst prisma = new PrismaClient()"},
        {"label": "Create", "code": "const user = await prisma.user.create({\n  data: { email: 'alice@example.com', name: 'Alice' }\n})"},
        {"label": "Read", "code": "const users = await prisma.user.findMany({\n  where: { name: { contains: 'Alice' } },\n  orderBy: { id: 'desc' },\n  take: 10\n})"},
        {"label": "Update", "code": "await prisma.user.update({\n  where: { id: user.id },\n  data: { name: 'Alice Smith' }\n})"},
      ]
    },
    {
      "id": "t3", "title": "Query with relations (include)", "difficulty": "intermediate",
      "steps": [
        {"label": "Schema relation", "code": "model Post {\n  id     Int  @id @default(autoincrement())\n  title  String\n  author User @relation(fields: [authorId], references: [id])\n  authorId Int\n}"},
        {"label": "Query with include", "code": "const usersWithPosts = await prisma.user.findMany({\n  include: { posts: true }\n})\n// Each user has a typed posts: Post[] array"},
      ]
    },
  ],
  "meta": {"version": "5.19.1", "weekly_downloads": 4800000, "docs_url": "https://www.prisma.io/docs", "repo_url": "https://github.com/prisma/prisma"}
},

{
  "id": "drizzle-orm",
  "ecosystem": "npm",
  "name": "drizzle-orm",
  "summary": "Lightweight TypeScript ORM with SQL-first design, zero magic, and edge-runtime support.",
  "tags": ["orm", "typescript", "sql", "database", "edge"],
  "difficulty": 2,
  "story": {
    "problem": "Prisma's generated client adds bundle weight and requires a sidecar query engine. You want type-safe SQL queries that are transparent (you can see the SQL), work at the edge, and don't have a heavy codegen step.",
    "mental_model": "Drizzle is a thin TypeScript layer over SQL. You define tables as TypeScript objects, and queries look almost like SQL. `db.select().from(users).where(eq(users.id, 1))` compiles to `SELECT * FROM users WHERE id = 1`. No magic, no query engine — just your DB driver.",
    "when_to_use": "Edge runtimes (Cloudflare Workers, Vercel Edge), projects where you want full SQL control with types, lighter bundle size than Prisma, serverless environments.",
    "when_not_to_use": "If you prefer Prisma's schema-first DX and Studio. Complex ORM features like polymorphism. Teams more comfortable with ActiveRecord-style ORMs.",
    "alternatives": [
      {"name": "prisma", "reason": "More DX polish, visual Studio, better for traditional Node.js backends."},
      {"name": "kysely", "reason": "Even more SQL-first, no schema definition layer, just a type-safe query builder."},
      {"name": "typeorm", "reason": "Decorator-based, more features but heavier and less type-safe."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "drizzle-orm", "type": "module", "label": "drizzle-orm", "summary": "Core package. Provides query builder and schema definition utilities.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "schema", "type": "concept", "label": "Schema definition (pgTable / sqliteTable)", "summary": "Define tables as TS objects: `const users = pgTable('users', { id: serial('id').primaryKey() })`.", "difficulty": 1, "tags": ["schema", "common"]},
      {"id": "drizzle", "type": "function", "label": "drizzle(driver)", "summary": "Create DB instance: `const db = drizzle(pool)`. Wraps your DB driver (pg, better-sqlite3, libsql).", "difficulty": 1, "tags": ["connection", "common"]},
      {"id": "select", "type": "function", "label": "db.select()", "summary": "Type-safe SELECT: `db.select().from(users).where(eq(users.id, 1)).limit(10)`.", "difficulty": 1, "tags": ["query", "common"]},
      {"id": "insert", "type": "function", "label": "db.insert()", "summary": "`db.insert(users).values({ name: 'Alice' }).returning()`.", "difficulty": 1, "tags": ["mutation"]},
      {"id": "update_delete", "type": "function", "label": "db.update() / db.delete()", "summary": "Type-safe updates and deletes with where clauses.", "difficulty": 1, "tags": ["mutation"]},
      {"id": "relations", "type": "concept", "label": "relations() helper", "summary": "Define JS-side relations for query joins: `relations(users, ({ many }) => ({ posts: many(posts) }))`.", "difficulty": 2, "tags": ["relations"]},
      {"id": "migrate", "type": "concept", "label": "drizzle-kit migrate", "summary": "`drizzle-kit generate` creates SQL migration files from schema. `drizzle-kit push` for dev.", "difficulty": 2, "tags": ["migrations"]},
    ],
    "edges": [
      {"id": "e1", "from": "drizzle-orm", "to": "schema", "label": "contains"},
      {"id": "e2", "from": "drizzle-orm", "to": "drizzle", "label": "contains"},
      {"id": "e3", "from": "drizzle", "to": "select", "label": "method"},
      {"id": "e4", "from": "drizzle", "to": "insert", "label": "method"},
      {"id": "e5", "from": "drizzle", "to": "update_delete", "label": "method"},
      {"id": "e6", "from": "schema", "to": "relations", "label": "uses"},
      {"id": "e7", "from": "drizzle-orm", "to": "migrate", "label": "tooling"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Define a schema and query it", "difficulty": "beginner",
      "steps": [
        {"label": "Install", "code": "npm install drizzle-orm pg\nnpm install -D drizzle-kit @types/pg"},
        {"label": "Schema", "code": "import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core'\n\nexport const users = pgTable('users', {\n  id: serial('id').primaryKey(),\n  name: text('name').notNull(),\n  age: integer('age'),\n})"},
        {"label": "Connect + query", "code": "import { drizzle } from 'drizzle-orm/node-postgres'\nimport { Pool } from 'pg'\nimport { users } from './schema'\nimport { eq } from 'drizzle-orm'\n\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL })\nconst db = drizzle(pool)\n\nconst result = await db.select().from(users).where(eq(users.id, 1))"},
      ]
    },
    {
      "id": "t2", "title": "Insert and update records", "difficulty": "beginner",
      "steps": [
        {"label": "Insert", "code": "const newUser = await db.insert(users)\n  .values({ name: 'Alice', age: 30 })\n  .returning()"},
        {"label": "Update", "code": "await db.update(users)\n  .set({ age: 31 })\n  .where(eq(users.id, newUser[0].id))"},
        {"label": "Delete", "code": "await db.delete(users).where(eq(users.id, 99))"},
      ]
    },
  ],
  "meta": {"version": "0.33.0", "weekly_downloads": 1900000, "docs_url": "https://orm.drizzle.team", "repo_url": "https://github.com/drizzle-team/drizzle-orm"}
},

{
  "id": "trpc",
  "ecosystem": "npm",
  "name": "@trpc/server",
  "summary": "End-to-end type-safe APIs — share TypeScript types between server and client without code generation.",
  "tags": ["typescript", "api", "rpc", "fullstack", "nextjs"],
  "difficulty": 3,
  "story": {
    "problem": "You write a REST endpoint and manually duplicate its input/output types in the frontend. They drift apart. A field rename breaks the client silently. You add Zod schemas for validation, then OpenAPI for docs, then a codegen step to sync types. It's a lot of ceremony for what's just a function call.",
    "mental_model": "tRPC removes the HTTP abstraction between frontend and backend. You define procedures (queries/mutations) on the server, and call them from the client as if they were local async functions. TypeScript infers all types across the boundary — no schemas, no codegen, no REST at all.",
    "when_to_use": "Full-stack TypeScript monorepos, Next.js apps where frontend and backend share a codebase, projects where you want type safety without REST/GraphQL ceremony.",
    "when_not_to_use": "Public APIs consumed by third parties (use REST or GraphQL). Polyglot teams where some consumers aren't TypeScript. Microservices with many separate repos.",
    "alternatives": [
      {"name": "GraphQL (Apollo)", "reason": "Language-agnostic, great for complex data graphs, third-party consumers."},
      {"name": "REST + OpenAPI", "reason": "Standard, interoperable, better for public APIs."},
      {"name": "ts-rest", "reason": "REST with tRPC-like type safety — keeps HTTP semantics for when you need them."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "trpc", "type": "module", "label": "@trpc/server", "summary": "Server-side package. Define router, procedures, context.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "initTRPC", "type": "function", "label": "initTRPC.create()", "summary": "Initialize tRPC: `const t = initTRPC.context<Context>().create()`. Returns router/procedure builders.", "difficulty": 1, "tags": ["setup", "common"]},
      {"id": "router", "type": "function", "label": "t.router()", "summary": "Group procedures: `appRouter = t.router({ getUser: ..., createUser: ... })`. Routers are nestable.", "difficulty": 1, "tags": ["router", "common"]},
      {"id": "procedure", "type": "concept", "label": "t.procedure (query/mutation)", "summary": "query for reads, mutation for writes. `.input(zodSchema).query(({ input, ctx }) => ...)`.", "difficulty": 1, "tags": ["procedure", "common"]},
      {"id": "context", "type": "concept", "label": "Context", "summary": "Per-request data (user session, DB client) injected into every procedure via `createContext`.", "difficulty": 2, "tags": ["context"]},
      {"id": "middleware", "type": "concept", "label": "Middleware (.use)", "summary": "`.use(authMiddleware)` — runs before procedure. Used for auth, logging, rate limiting.", "difficulty": 2, "tags": ["middleware"]},
      {"id": "client", "type": "module", "label": "@trpc/client", "summary": "Client package. `createTRPCProxyClient` calls server procedures as typed async functions.", "difficulty": 1, "tags": ["client", "common"]},
      {"id": "react", "type": "module", "label": "@trpc/react-query", "summary": "React hooks integration: `trpc.getUser.useQuery({ id: 1 })` wraps React Query automatically.", "difficulty": 2, "tags": ["react", "common"]},
    ],
    "edges": [
      {"id": "e1", "from": "trpc", "to": "initTRPC", "label": "contains"},
      {"id": "e2", "from": "initTRPC", "to": "router", "label": "returns"},
      {"id": "e3", "from": "initTRPC", "to": "procedure", "label": "returns"},
      {"id": "e4", "from": "router", "to": "procedure", "label": "contains"},
      {"id": "e5", "from": "procedure", "to": "context", "label": "receives"},
      {"id": "e6", "from": "procedure", "to": "middleware", "label": "uses"},
      {"id": "e7", "from": "trpc", "to": "client", "label": "pairs-with"},
      {"id": "e8", "from": "client", "to": "react", "label": "extended-by"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Define a tRPC router with queries", "difficulty": "intermediate",
      "steps": [
        {"label": "Install", "code": "npm install @trpc/server @trpc/client zod"},
        {"label": "Init", "code": "import { initTRPC } from '@trpc/server'\nimport { z } from 'zod'\n\nconst t = initTRPC.create()\nexport const router = t.router\nexport const publicProcedure = t.procedure"},
        {"label": "Define router", "code": "export const appRouter = router({\n  getUser: publicProcedure\n    .input(z.object({ id: z.number() }))\n    .query(async ({ input }) => {\n      return db.users.findUnique({ where: { id: input.id } })\n    }),\n})\n\nexport type AppRouter = typeof appRouter"},
      ]
    },
    {
      "id": "t2", "title": "Call procedures from a client", "difficulty": "intermediate",
      "steps": [
        {"label": "Client setup", "code": "import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'\nimport type { AppRouter } from './server'\n\nconst trpc = createTRPCProxyClient<AppRouter>({\n  links: [httpBatchLink({ url: 'http://localhost:3000/trpc' })],\n})"},
        {"label": "Call", "code": "// Fully typed — TypeScript knows the return type\nconst user = await trpc.getUser.query({ id: 1 })\nconsole.log(user.name)  // TypeScript autocompletes .name"},
      ]
    },
  ],
  "meta": {"version": "11.0.0", "weekly_downloads": 1200000, "docs_url": "https://trpc.io/docs", "repo_url": "https://github.com/trpc/trpc"}
},

{
  "id": "jotai",
  "ecosystem": "npm",
  "name": "jotai",
  "summary": "Primitive and flexible state management for React based on atomic state units.",
  "tags": ["state", "react", "atoms", "hooks", "typescript"],
  "difficulty": 1,
  "story": {
    "problem": "Redux has too much boilerplate. Context re-renders everything. Zustand is great but stores are global objects — you can't easily create per-component or per-instance state that still works across the tree. You want something simpler that feels like useState but works globally.",
    "mental_model": "Jotai models state as atoms — tiny independent units, like useState but shared. Any component can read or write any atom. Atoms can derive from other atoms (like computed properties). The React tree only re-renders where the atom is actually used.",
    "when_to_use": "React apps needing shared state without prop drilling, derived/computed state that updates automatically, fine-grained re-render control, per-route or per-feature isolated state.",
    "when_not_to_use": "Non-React environments (Jotai is React-only). Complex state machines (use XState). Apps already committed to Redux with large middleware ecosystems.",
    "alternatives": [
      {"name": "zustand", "reason": "Store-based rather than atom-based, slightly simpler for flat state, easier devtools."},
      {"name": "recoil", "reason": "Facebook's atom model, similar concept but larger bundle and less maintained."},
      {"name": "valtio", "reason": "Proxy-based reactive state, mutable-style mutations, very simple API."},
      {"name": "redux", "reason": "Battle-tested, excellent devtools, best for very large apps with complex state logic."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "jotai", "type": "module", "label": "jotai", "summary": "Import atom, useAtom, useAtomValue, useSetAtom from 'jotai'.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "atom", "type": "function", "label": "atom(initialValue)", "summary": "Create an atom: `const countAtom = atom(0)`. Can be number, object, array, or derived.", "difficulty": 1, "tags": ["core", "common"]},
      {"id": "useAtom", "type": "function", "label": "useAtom(atom)", "summary": "Like useState but global: `const [count, setCount] = useAtom(countAtom)`. Re-renders only this component.", "difficulty": 1, "tags": ["hook", "common"]},
      {"id": "useAtomValue", "type": "function", "label": "useAtomValue(atom)", "summary": "Read-only hook. Doesn't trigger re-render when atom is written to but value unchanged.", "difficulty": 1, "tags": ["hook"]},
      {"id": "useSetAtom", "type": "function", "label": "useSetAtom(atom)", "summary": "Write-only hook. Doesn't subscribe to value changes — no re-render on read.", "difficulty": 2, "tags": ["hook"]},
      {"id": "derived", "type": "concept", "label": "Derived atoms", "summary": "`atom(get => get(a) + get(b))` — computed value. Re-computes when dependencies change.", "difficulty": 2, "tags": ["derived", "common"]},
      {"id": "async_atom", "type": "concept", "label": "Async atoms", "summary": "`atom(async (get) => fetch(...))` — suspense-compatible async data. Works with React Suspense.", "difficulty": 2, "tags": ["async"]},
      {"id": "Provider", "type": "component", "label": "Provider (optional)", "summary": "Wrap subtree to scope atoms: `<Provider>`. Without it, atoms use a global default store.", "difficulty": 2, "tags": ["scoping"]},
    ],
    "edges": [
      {"id": "e1", "from": "jotai", "to": "atom", "label": "contains"},
      {"id": "e2", "from": "jotai", "to": "useAtom", "label": "contains"},
      {"id": "e3", "from": "jotai", "to": "useAtomValue", "label": "contains"},
      {"id": "e4", "from": "jotai", "to": "useSetAtom", "label": "contains"},
      {"id": "e5", "from": "atom", "to": "derived", "label": "can-be"},
      {"id": "e6", "from": "atom", "to": "async_atom", "label": "can-be"},
      {"id": "e7", "from": "useAtom", "to": "atom", "label": "reads-writes"},
      {"id": "e8", "from": "jotai", "to": "Provider", "label": "contains"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Replace useState with a shared atom", "difficulty": "beginner",
      "steps": [
        {"label": "Install", "code": "npm install jotai"},
        {"label": "Define atom", "code": "// store.ts\nimport { atom } from 'jotai'\nexport const darkModeAtom = atom(false)"},
        {"label": "Use in components", "code": "import { useAtom } from 'jotai'\nimport { darkModeAtom } from './store'\n\nfunction Toggle() {\n  const [dark, setDark] = useAtom(darkModeAtom)\n  return <button onClick={() => setDark(v => !v)}>{dark ? '🌙' : '☀️'}</button>\n}\n\nfunction Page() {\n  const dark = useAtomValue(darkModeAtom)  // read-only, no re-render on write\n  return <div className={dark ? 'dark' : ''}><Toggle /></div>\n}"},
      ]
    },
    {
      "id": "t2", "title": "Derived atom for computed state", "difficulty": "intermediate",
      "steps": [
        {"label": "Base atoms", "code": "const priceAtom = atom(100)\nconst quantityAtom = atom(3)"},
        {"label": "Derived", "code": "const totalAtom = atom(get => get(priceAtom) * get(quantityAtom))\n// totalAtom updates automatically when price or quantity changes"},
        {"label": "Use", "code": "function Total() {\n  const total = useAtomValue(totalAtom)\n  return <p>Total: ${total}</p>\n}"},
      ]
    },
  ],
  "meta": {"version": "2.9.3", "weekly_downloads": 900000, "docs_url": "https://jotai.org/docs", "repo_url": "https://github.com/pmndrs/jotai"}
},

{
  "id": "playwright",
  "ecosystem": "npm",
  "name": "@playwright/test",
  "summary": "End-to-end browser testing framework that runs tests in Chromium, Firefox, and WebKit.",
  "tags": ["testing", "e2e", "browser", "automation", "typescript"],
  "difficulty": 2,
  "story": {
    "problem": "Unit tests pass but users still hit broken flows. The checkout button works in isolation but breaks when combined with auth state and the cart. You need tests that run in a real browser, click real buttons, and verify what users actually see.",
    "mental_model": "Playwright controls a real browser (Chromium, Firefox, or WebKit) via the DevTools protocol. You navigate pages, interact with elements using locators (resilient selectors), and assert on page state. Tests run in parallel across browsers. Failed tests auto-save screenshots and traces.",
    "when_to_use": "Critical user flows (login, checkout, onboarding), cross-browser compatibility checks, visual regression testing, scraping JS-rendered content, accessibility audits.",
    "when_not_to_use": "Unit or integration testing (Vitest/Jest is faster). Tests that don't need a real browser. Simple API testing (use supertest or fetch).",
    "alternatives": [
      {"name": "cypress", "reason": "Better DX, interactive test runner, but Chromium-only and slower on CI."},
      {"name": "puppeteer", "reason": "Google's CDP library, Chromium-only, no test runner built in."},
      {"name": "selenium", "reason": "Mature, multi-language, but verbose API and slower than Playwright."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "playwright", "type": "module", "label": "@playwright/test", "summary": "Import test, expect, Browser, Page from '@playwright/test'.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "test", "type": "function", "label": "test(name, fn)", "summary": "`test('login flow', async ({ page }) => {...})`. Page fixture is auto-provided.", "difficulty": 1, "tags": ["test", "common"]},
      {"id": "expect", "type": "function", "label": "expect(locator)", "summary": "Async assertions: `await expect(page.getByText('Welcome')).toBeVisible()`. Auto-waits.", "difficulty": 1, "tags": ["assertion", "common"]},
      {"id": "Page", "type": "class", "label": "Page", "summary": "Represents a browser tab. page.goto(), page.click(), page.fill(), page.screenshot(), page.waitFor*.", "difficulty": 1, "tags": ["page", "common"]},
      {"id": "Locator", "type": "class", "label": "Locator", "summary": "Resilient element selector. page.getByRole(), getByText(), getByLabel(), getByTestId(), locator(css).", "difficulty": 1, "tags": ["locator", "common"]},
      {"id": "fixtures", "type": "concept", "label": "Fixtures", "summary": "test.extend() to create custom fixtures (authenticated page, DB state). Shared across tests.", "difficulty": 2, "tags": ["fixtures"]},
      {"id": "config", "type": "concept", "label": "playwright.config.ts", "summary": "Define projects (browser/device matrix), baseURL, retries, reporter, use options.", "difficulty": 2, "tags": ["config"]},
      {"id": "trace", "type": "concept", "label": "Trace Viewer", "summary": "`--trace on` records a trace on failure. `npx playwright show-trace` shows step-by-step with screenshots.", "difficulty": 1, "tags": ["debug"]},
    ],
    "edges": [
      {"id": "e1", "from": "playwright", "to": "test", "label": "contains"},
      {"id": "e2", "from": "playwright", "to": "expect", "label": "contains"},
      {"id": "e3", "from": "test", "to": "Page", "label": "injects"},
      {"id": "e4", "from": "Page", "to": "Locator", "label": "returns"},
      {"id": "e5", "from": "expect", "to": "Locator", "label": "asserts-on"},
      {"id": "e6", "from": "test", "to": "fixtures", "label": "uses"},
      {"id": "e7", "from": "playwright", "to": "config", "label": "configured-by"},
      {"id": "e8", "from": "playwright", "to": "trace", "label": "produces"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Write your first E2E test", "difficulty": "beginner",
      "steps": [
        {"label": "Install", "code": "npm init playwright@latest"},
        {"label": "Write test", "code": "import { test, expect } from '@playwright/test'\n\ntest('homepage loads', async ({ page }) => {\n  await page.goto('https://example.com')\n  await expect(page).toHaveTitle(/Example/)\n  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()\n})"},
        {"label": "Run", "code": "npx playwright test\nnpx playwright test --ui  # interactive mode"},
      ]
    },
    {
      "id": "t2", "title": "Test a login form", "difficulty": "intermediate",
      "steps": [
        {"label": "Fill and submit", "code": "test('login', async ({ page }) => {\n  await page.goto('/login')\n  await page.getByLabel('Email').fill('user@example.com')\n  await page.getByLabel('Password').fill('secret')\n  await page.getByRole('button', { name: 'Sign in' }).click()\n  await expect(page).toHaveURL('/dashboard')\n})"},
        {"label": "Screenshot on pass", "code": "  await page.screenshot({ path: 'dashboard.png', fullPage: true })"},
      ]
    },
    {
      "id": "t3", "title": "Create an authenticated page fixture", "difficulty": "advanced",
      "steps": [
        {"label": "Fixture", "code": "import { test as base } from '@playwright/test'\n\nconst test = base.extend<{ authedPage: Page }>({\n  authedPage: async ({ page }, use) => {\n    await page.goto('/login')\n    await page.getByLabel('Email').fill('user@test.com')\n    await page.getByLabel('Password').fill('password')\n    await page.getByRole('button', { name: 'Sign in' }).click()\n    await use(page)\n  },\n})"},
        {"label": "Use fixture", "code": "test('dashboard shows username', async ({ authedPage }) => {\n  await authedPage.goto('/dashboard')\n  await expect(authedPage.getByText('Welcome, User')).toBeVisible()\n})"},
      ]
    },
  ],
  "meta": {"version": "1.47.2", "weekly_downloads": 5200000, "docs_url": "https://playwright.dev/docs", "repo_url": "https://github.com/microsoft/playwright"}
},

{
  "id": "react-router",
  "ecosystem": "npm",
  "name": "react-router",
  "summary": "Declarative client-side routing for React — maps URLs to components with nested routes, loaders, and actions.",
  "tags": ["routing", "react", "spa", "navigation", "fullstack"],
  "difficulty": 2,
  "story": {
    "problem": "A React app is a single HTML page. Clicking a link reloads the page and loses all state. You need URL changes to render different components without full reloads, while keeping the address bar in sync, supporting back/forward, and handling nested layouts.",
    "mental_model": "React Router maps URL patterns to component trees. A <Route path='/users/:id'> renders when the URL matches. Nested routes render inside their parent's <Outlet>. v6.4+ adds loaders (fetch data before render) and actions (handle form submissions) — making it a full request/response model.",
    "when_to_use": "Any React SPA needing URL-based navigation, nested layouts (dashboard sidebar + content), data loading tied to routes, form actions, protected routes.",
    "when_not_to_use": "Next.js (use its file-based router). Remix (built on React Router but adds SSR). Very simple apps with only one or two views — a state variable suffices.",
    "alternatives": [
      {"name": "tanstack-router", "reason": "Fully type-safe routes, file-based or code-based, excellent TypeScript DX."},
      {"name": "wouter", "reason": "Tiny (1.5kB) React Router alternative, great for small projects."},
      {"name": "next.js router", "reason": "File-based, SSR-first. Use if you're already on Next.js."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "react-router", "type": "module", "label": "react-router", "summary": "Import createBrowserRouter, RouterProvider, Route, Link, etc.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "createBrowserRouter", "type": "function", "label": "createBrowserRouter(routes)", "summary": "Modern router factory. Define route tree as array of objects. Supports loaders/actions.", "difficulty": 1, "tags": ["setup", "common"]},
      {"id": "RouterProvider", "type": "component", "label": "RouterProvider", "summary": "<RouterProvider router={router} /> — mounts the router. Replaces old <BrowserRouter>.", "difficulty": 1, "tags": ["setup"]},
      {"id": "Route", "type": "concept", "label": "Route objects", "summary": "{ path, element, loader, action, children, errorElement, index }.", "difficulty": 1, "tags": ["route", "common"]},
      {"id": "Outlet", "type": "component", "label": "<Outlet />", "summary": "Renders matched child route inside a layout component. The key to nested layouts.", "difficulty": 1, "tags": ["layout", "common"]},
      {"id": "Link", "type": "component", "label": "<Link> / <NavLink>", "summary": "<Link to='/about'> for navigation. <NavLink> adds active class when route matches.", "difficulty": 1, "tags": ["navigation", "common"]},
      {"id": "hooks", "type": "concept", "label": "useNavigate / useParams / useLoaderData", "summary": "useNavigate() for imperative nav, useParams() for :id params, useLoaderData() for loader results.", "difficulty": 2, "tags": ["hooks", "common"]},
      {"id": "loader", "type": "concept", "label": "loader (data fetching)", "summary": "async function loader({ params }) — runs before component renders. Return data, redirect, or Response.", "difficulty": 2, "tags": ["data", "common"]},
    ],
    "edges": [
      {"id": "e1", "from": "react-router", "to": "createBrowserRouter", "label": "contains"},
      {"id": "e2", "from": "react-router", "to": "RouterProvider", "label": "contains"},
      {"id": "e3", "from": "createBrowserRouter", "to": "Route", "label": "accepts"},
      {"id": "e4", "from": "Route", "to": "Outlet", "label": "renders"},
      {"id": "e5", "from": "Route", "to": "loader", "label": "runs"},
      {"id": "e6", "from": "react-router", "to": "Link", "label": "contains"},
      {"id": "e7", "from": "react-router", "to": "hooks", "label": "contains"},
      {"id": "e8", "from": "loader", "to": "hooks", "label": "consumed-by"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Set up routing in a React app", "difficulty": "beginner",
      "steps": [
        {"label": "Install", "code": "npm install react-router"},
        {"label": "Define routes", "code": "import { createBrowserRouter, RouterProvider } from 'react-router'\n\nconst router = createBrowserRouter([\n  { path: '/', element: <Home /> },\n  { path: '/about', element: <About /> },\n  { path: '/users/:id', element: <UserProfile /> },\n])"},
        {"label": "Mount", "code": "ReactDOM.createRoot(document.getElementById('root')!).render(\n  <RouterProvider router={router} />\n)"},
      ]
    },
    {
      "id": "t2", "title": "Nested layouts with Outlet", "difficulty": "intermediate",
      "steps": [
        {"label": "Layout component", "code": "function DashboardLayout() {\n  return (\n    <div className='flex'>\n      <Sidebar />\n      <main><Outlet /></main>  {/* child route renders here */}\n    </div>\n  )\n}"},
        {"label": "Nested routes", "code": "{\n  path: '/dashboard',\n  element: <DashboardLayout />,\n  children: [\n    { index: true, element: <Overview /> },\n    { path: 'settings', element: <Settings /> },\n  ]\n}"},
      ]
    },
    {
      "id": "t3", "title": "Fetch data with a loader", "difficulty": "intermediate",
      "steps": [
        {"label": "Define loader", "code": "async function userLoader({ params }: LoaderFunctionArgs) {\n  const user = await fetchUser(params.id!)\n  if (!user) throw new Response('Not Found', { status: 404 })\n  return user\n}"},
        {"label": "Attach to route", "code": "{ path: '/users/:id', element: <UserProfile />, loader: userLoader }"},
        {"label": "Consume in component", "code": "function UserProfile() {\n  const user = useLoaderData() as User\n  return <h1>{user.name}</h1>\n}"},
      ]
    },
  ],
  "meta": {"version": "7.1.1", "weekly_downloads": 11000000, "docs_url": "https://reactrouter.com/", "repo_url": "https://github.com/remix-run/react-router"}
},

{
  "id": "tailwindcss",
  "ecosystem": "npm",
  "name": "tailwindcss",
  "summary": "Utility-first CSS framework — compose designs directly in markup with small, single-purpose class names.",
  "tags": ["css", "styling", "utility", "design", "frontend"],
  "difficulty": 1,
  "story": {
    "problem": "Writing CSS means constantly context-switching between HTML and CSS files, naming things (what do you call this div?), and fighting specificity wars. Component-scoped CSS still means maintaining a separate styling system. Designs drift as CSS grows.",
    "mental_model": "Tailwind replaces CSS files with a vocabulary of utility classes directly in your HTML. Instead of `.card { padding: 1rem; border-radius: 0.5rem; }` you write `class='p-4 rounded-lg'`. The design system (spacing, colors, typography) is defined once in config — every class enforces it.",
    "when_to_use": "Any web project where you control the markup. Especially powerful with component frameworks (React, Vue, Svelte). Rapid prototyping, design systems, teams that want consistency without writing CSS.",
    "when_not_to_use": "When you don't control the HTML (CMS-generated content). Projects with existing CSS codebases where a migration isn't worth it. Developers who strongly prefer semantic CSS.",
    "alternatives": [
      {"name": "CSS Modules", "reason": "Scoped CSS files without the utility class approach. Less opinionated."},
      {"name": "styled-components", "reason": "CSS-in-JS, keeps styles co-located with components."},
      {"name": "UnoCSS", "reason": "Tailwind-compatible utility engine but faster and more customizable."},
      {"name": "Bootstrap", "reason": "Component-first, pre-styled. Faster for prototypes, less flexible for custom designs."},
    ]
  },
  "graph": {
    "nodes": [
      {"id": "tailwindcss", "type": "module", "label": "tailwindcss", "summary": "PostCSS plugin and CLI. `@import 'tailwindcss'` in CSS or use CLI.", "difficulty": 1, "tags": ["entry-point"]},
      {"id": "config", "type": "concept", "label": "tailwind.config.js", "summary": "Customize theme (colors, spacing, fonts), extend with new values, add plugins. v4 uses CSS config.", "difficulty": 2, "tags": ["config"]},
      {"id": "utilities", "type": "concept", "label": "Utility classes", "summary": "p-4, m-2, text-lg, font-bold, flex, grid, bg-blue-500, text-white, rounded-xl, shadow-md, etc.", "difficulty": 1, "tags": ["core", "common"]},
      {"id": "responsive", "type": "concept", "label": "Responsive prefixes", "summary": "sm:, md:, lg:, xl: — `class='text-sm md:text-base lg:text-lg'`. Mobile-first breakpoints.", "difficulty": 1, "tags": ["responsive", "common"]},
      {"id": "states", "type": "concept", "label": "State variants", "summary": "hover:, focus:, active:, disabled:, dark:, group-hover: — `hover:bg-blue-700`.", "difficulty": 1, "tags": ["states", "common"]},
      {"id": "arbitrary", "type": "concept", "label": "Arbitrary values", "summary": "[value] syntax: `top-[117px]`, `text-[#1da1f2]`, `grid-cols-[1fr_2fr]`. Escape hatch for one-offs.", "difficulty": 2, "tags": ["advanced"]},
      {"id": "components", "type": "concept", "label": "@apply directive", "summary": "Extract repeated utility combinations into CSS class: `.btn { @apply px-4 py-2 rounded font-bold; }`.", "difficulty": 2, "tags": ["extract"]},
      {"id": "plugins", "type": "concept", "label": "Plugins (typography, forms, animate)", "summary": "@tailwindcss/typography for prose, @tailwindcss/forms for styled form elements, tailwindcss-animate.", "difficulty": 2, "tags": ["plugins"]},
    ],
    "edges": [
      {"id": "e1", "from": "tailwindcss", "to": "config", "label": "configured-by"},
      {"id": "e2", "from": "tailwindcss", "to": "utilities", "label": "provides"},
      {"id": "e3", "from": "utilities", "to": "responsive", "label": "prefixed-by"},
      {"id": "e4", "from": "utilities", "to": "states", "label": "prefixed-by"},
      {"id": "e5", "from": "utilities", "to": "arbitrary", "label": "extended-by"},
      {"id": "e6", "from": "tailwindcss", "to": "components", "label": "provides"},
      {"id": "e7", "from": "tailwindcss", "to": "plugins", "label": "supports"},
    ]
  },
  "tasks": [
    {
      "id": "t1", "title": "Install Tailwind CSS v4 in a Next.js project", "difficulty": "beginner",
      "steps": [
        {"label": "Install", "code": "npm install tailwindcss @tailwindcss/postcss"},
        {"label": "postcss.config.mjs", "code": "export default { plugins: { '@tailwindcss/postcss': {} } }"},
        {"label": "globals.css", "code": "@import 'tailwindcss';"},
        {"label": "Use", "code": "<button className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors'>\n  Click me\n</button>"},
      ]
    },
    {
      "id": "t2", "title": "Build a responsive card component", "difficulty": "beginner",
      "steps": [
        {"label": "Card", "code": "<div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow'>\n  <h3 className='text-lg font-bold text-slate-900 mb-2'>Card Title</h3>\n  <p className='text-slate-500 text-sm leading-relaxed'>Card description text.</p>\n  <button className='mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800'>Learn more →</button>\n</div>"},
      ]
    },
    {
      "id": "t3", "title": "Dark mode with dark: variant", "difficulty": "intermediate",
      "steps": [
        {"label": "Config (v3)", "code": "// tailwind.config.js\nmodule.exports = { darkMode: 'class' }"},
        {"label": "Toggle", "code": "// Toggle dark class on <html>\ndocument.documentElement.classList.toggle('dark')"},
        {"label": "Use dark: prefix", "code": "<div className='bg-white dark:bg-slate-900 text-slate-900 dark:text-white'>\n  Adapts to dark mode\n</div>"},
      ]
    },
  ],
  "meta": {"version": "4.0.0", "weekly_downloads": 11000000, "docs_url": "https://tailwindcss.com/docs", "repo_url": "https://github.com/tailwindlabs/tailwindcss"}
},

]


def write_package(pkg: dict) -> None:
    path = os.path.join(OUT, f"{pkg['id']}.json")
    if os.path.exists(path):
        print(f"  SKIP (exists): {pkg['id']}")
        return
    with open(path, "w", encoding="utf-8") as f:
        json.dump(pkg, f, ensure_ascii=False, indent=2)
    nodes = len(pkg["graph"]["nodes"])
    edges = len(pkg["graph"]["edges"])
    tasks = len(pkg["tasks"])
    print(f"  OK: {pkg['id']} ({pkg['ecosystem']}) — {nodes} nodes, {edges} edges, {tasks} tasks")


if __name__ == "__main__":
    print(f"Writing {len(PACKAGES)} new packages...")
    for p in PACKAGES:
        write_package(p)
    print("Done.")
