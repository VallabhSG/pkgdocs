import type { Scenario } from "./SimulatedDemo";

export const SCENARIOS: Record<string, Scenario[]> = {
  requests: [
    {
      id: "get",
      title: "GET request",
      description: "Fetch JSON from a REST API and inspect the response.",
      language: "python",
      code: `import requests

r = requests.get("https://api.github.com/repos/psf/requests")
data = r.json()

print(f"Status : {r.status_code} {r.reason}")
print(f"Stars  : {data['stargazers_count']:,}")
print(f"Forks  : {data['forks_count']:,}")
print(f"License: {data['license']['name']}")`,
      output: `Status : 200 OK
Stars  : 51,423
Forks  : 9,241
License: Apache Software License`,
    },
    {
      id: "post",
      title: "POST with JSON",
      description: "Send JSON data and use a Session for connection pooling.",
      language: "python",
      code: `import requests

# Session reuses TCP connections (keep-alive)
with requests.Session() as s:
    s.headers.update({"Authorization": "Bearer token123"})

    resp = s.post(
        "https://httpbin.org/post",
        json={"name": "Alice", "role": "admin"},
    )
    data = resp.json()
    print("Sent  :", data["json"])
    print("Status:", resp.status_code)`,
      output: `Sent  : {'name': 'Alice', 'role': 'admin'}
Status: 200`,
    },
  ],

  httpx: [
    {
      id: "async",
      title: "Async HTTP",
      description: "Make concurrent requests without blocking the event loop.",
      language: "python",
      code: `import httpx
import asyncio

async def fetch_all(urls: list[str]):
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return [(r.url, r.status_code) for r in responses]

urls = [
    "https://httpbin.org/delay/0.1",
    "https://httpbin.org/delay/0.1",
    "https://httpbin.org/delay/0.1",
]

results = asyncio.run(fetch_all(urls))
for url, status in results:
    print(f"{status}  {url}")`,
      output: `200  https://httpbin.org/delay/0.1
200  https://httpbin.org/delay/0.1
200  https://httpbin.org/delay/0.1
# All 3 completed in ~0.1s (concurrent, not 0.3s sequential)`,
    },
  ],

  click: [
    {
      id: "command",
      title: "CLI command",
      description: "Decorators turn a Python function into a CLI command with automatic --help.",
      language: "python",
      code: `import click

@click.command()
@click.argument("name")
@click.option("--count", "-n", default=1, type=int, help="Times to greet")
@click.option("--upper", is_flag=True, help="SHOUT the greeting")
def greet(name: str, count: int, upper: bool):
    """Greet NAME politely."""
    msg = f"Hello, {name}!"
    if upper:
        msg = msg.upper()
    for _ in range(count):
        click.echo(msg)

# $ python greet.py Alice --count 3 --upper`,
      output: `HELLO, ALICE!
HELLO, ALICE!
HELLO, ALICE!`,
    },
  ],

  numpy: [
    {
      id: "array-ops",
      title: "Array operations",
      description: "Vectorised math on arrays — no loops, compiled C under the hood.",
      language: "python",
      code: `import numpy as np

a = np.array([[1, 2, 3],
              [4, 5, 6]])

print("Shape :", a.shape)          # (2, 3)
print("Sum   :", a.sum())           # 21
print("Mean  :", a.mean())          # 3.5
print("Row means:", a.mean(axis=1)) # [2. 5.]

# Vectorised — no loop needed
print("Squared:", a ** 2)

# Boolean mask
print("Values > 3:", a[a > 3])`,
      output: `Shape : (2, 3)
Sum   : 21
Mean  : 3.5
Row means: [2. 5.]
Squared: [[ 1  4  9]
 [16 25 36]]
Values > 3: [4 5 6]`,
    },
  ],

  pandas: [
    {
      id: "groupby",
      title: "GroupBy & aggregation",
      description: "Load tabular data and answer analytical questions in a few lines.",
      language: "python",
      code: `import pandas as pd

df = pd.DataFrame({
    "name":   ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "dept":   ["Eng",   "HR",  "Eng",     "HR",    "Eng"],
    "salary": [95000,   72000, 88000,     78000,   102000],
    "yrs":    [3,       5,     2,         7,       4],
})

summary = (df
    .groupby("dept")["salary"]
    .agg(headcount="count", avg=lambda x: round(x.mean()))
    .reset_index()
    .sort_values("avg", ascending=False))

print(summary.to_string(index=False))`,
      output: `  dept  headcount    avg
   Eng          3  95000
    HR          2  75000`,
    },
  ],

  fastapi: [
    {
      id: "endpoint",
      title: "Type-safe endpoint",
      description: "Type annotations become validation, serialisation, and OpenAPI docs automatically.",
      language: "python",
      code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    in_stock: bool = True

items_db: dict[int, Item] = {}

@app.post("/items", status_code=201)
async def create(item: Item) -> dict:
    item_id = len(items_db) + 1
    items_db[item_id] = item
    return {"id": item_id, **item.model_dump()}

# POST /items  {"name":"Widget","price":9.99}
# → {"id":1,"name":"Widget","price":9.99,"in_stock":true}
# Docs auto-generated at /docs (Swagger UI)`,
      output: `POST /items  {"name":"Widget","price":9.99}
→ 201  {"id":1,"name":"Widget","price":9.99,"in_stock":true}

Docs: http://localhost:8000/docs  (auto-generated Swagger UI)`,
    },
  ],

  flask: [
    {
      id: "route",
      title: "Route + JSON response",
      description: "Flask's minimal core — register routes with a decorator, return a response.",
      language: "python",
      code: `from flask import Flask, jsonify, request, abort

app = Flask(__name__)

books = [
    {"id": 1, "title": "Clean Code", "author": "Martin"},
    {"id": 2, "title": "DDIA",       "author": "Kleppmann"},
]

@app.route("/books")
def list_books():
    return jsonify(books)

@app.route("/books/<int:book_id>")
def get_book(book_id: int):
    book = next((b for b in books if b["id"] == book_id), None)
    if not book:
        abort(404)
    return jsonify(book)

# GET /books      → [{"id":1,...}, {"id":2,...}]
# GET /books/1    → {"id":1,"title":"Clean Code","author":"Martin"}
# GET /books/99   → 404 Not Found`,
      output: `GET /books   → 200  [{"id":1,"title":"Clean Code",...}, ...]
GET /books/1 → 200  {"id":1,"title":"Clean Code","author":"Martin"}
GET /books/9 → 404  Not Found`,
    },
  ],

  pydantic: [
    {
      id: "validation",
      title: "Validation & coercion",
      description: "Pydantic validates and coerces data at runtime, reporting all errors at once.",
      language: "python",
      code: `from pydantic import BaseModel, EmailStr, ValidationError, field_validator

class User(BaseModel):
    name: str
    age: int          # coerces "25" → 25
    email: str

    @field_validator("age")
    @classmethod
    def must_be_adult(cls, v: int) -> int:
        if v < 18:
            raise ValueError("must be 18 or older")
        return v

# Valid input
user = User(name="Alice", age="28", email="alice@example.com")
print(user.model_dump())

# Invalid input — all errors reported at once
try:
    User(name="Bob", age=16, email="not-an-email")
except ValidationError as e:
    for err in e.errors():
        print(f"  {'.'.join(str(x) for x in err['loc'])}: {err['msg']}")`,
      output: `{'name': 'Alice', 'age': 28, 'email': 'alice@example.com'}

  age: Value error, must be 18 or older
  email: value is not a valid email address`,
    },
  ],

  pytest: [
    {
      id: "tests",
      title: "Writing tests",
      description: "Tests are just functions. Fixtures are injected by name. assert rewrites show diffs.",
      language: "python",
      code: `import pytest

def fizzbuzz(n: int) -> str:
    if n % 15 == 0: return "FizzBuzz"
    if n % 3  == 0: return "Fizz"
    if n % 5  == 0: return "Buzz"
    return str(n)

@pytest.mark.parametrize("n,expected", [
    (1,  "1"),
    (3,  "Fizz"),
    (5,  "Buzz"),
    (15, "FizzBuzz"),
    (7,  "7"),
])
def test_fizzbuzz(n, expected):
    assert fizzbuzz(n) == expected

def test_raises_on_zero():
    with pytest.raises(ZeroDivisionError):
        1 // 0

# $ pytest -v`,
      output: `test_demo.py::test_fizzbuzz[1-1]       PASSED
test_demo.py::test_fizzbuzz[3-Fizz]    PASSED
test_demo.py::test_fizzbuzz[5-Buzz]    PASSED
test_demo.py::test_fizzbuzz[15-FizzBuzz] PASSED
test_demo.py::test_fizzbuzz[7-7]       PASSED
test_demo.py::test_raises_on_zero      PASSED

6 passed in 0.04s`,
    },
  ],

  rich: [
    {
      id: "table",
      title: "Rich table",
      description: "Rich renders formatted tables, markdown, syntax-highlighted code, and progress bars to the terminal.",
      language: "python",
      code: `from rich.console import Console
from rich.table import Table
from rich import box

console = Console()
table = Table(title="Python Frameworks", box=box.ROUNDED)

table.add_column("Name",    style="cyan",  no_wrap=True)
table.add_column("Stars",   justify="right")
table.add_column("Async",   justify="center")
table.add_column("Type",    style="dim")

table.add_row("FastAPI", "76k", "✓", "API framework")
table.add_row("Django",  "81k", "~", "Full-stack")
table.add_row("Flask",   "68k", "✗", "Microframework")
table.add_row("Starlette","10k","✓", "ASGI toolkit")

console.print(table)`,
      output: `╭──────────────────────────────────────────────╮
│           Python Frameworks                  │
├──────────┬───────┬───────┬──────────────────┤
│ Name     │ Stars │ Async │ Type             │
├──────────┼───────┼───────┼──────────────────┤
│ FastAPI  │   76k │   ✓   │ API framework    │
│ Django   │   81k │   ~   │ Full-stack        │
│ Flask    │   68k │   ✗   │ Microframework    │
│ Starlette│   10k │   ✓   │ ASGI toolkit     │
╰──────────┴───────┴───────┴──────────────────╯`,
    },
  ],

  typer: [
    {
      id: "app",
      title: "Type-driven CLI",
      description: "Function type annotations become CLI options automatically — no decorator boilerplate.",
      language: "python",
      code: `import typer
from pathlib import Path

app = typer.Typer()

@app.command()
def deploy(
    environment: str,
    port: int = 8080,
    force: bool = False,
    config: Path = Path("config.yaml"),
):
    """Deploy the application to ENVIRONMENT."""
    typer.echo(f"Deploying to {environment} on :{port}")
    if force:
        typer.echo("  ⚠ Skipping safety checks (--force)")
    typer.echo(f"  Config: {config}")

# $ python app.py production --port 443 --force`,
      output: `Deploying to production on :443
  ⚠ Skipping safety checks (--force)
  Config: config.yaml`,
    },
  ],

  polars: [
    {
      id: "lazy",
      title: "Lazy evaluation",
      description: "Polars builds a query plan and optimises before executing — faster than pandas on large data.",
      language: "python",
      code: `import polars as pl

df = pl.DataFrame({
    "product": ["A","B","A","C","B","A","C","B"],
    "region":  ["N","S","N","E","S","E","E","N"],
    "sales":   [100,200,150,80,220,130,90,180],
})

# Lazy — nothing runs yet, just builds a plan
result = (
    df.lazy()
    .filter(pl.col("sales") > 100)
    .group_by("product")
    .agg(
        pl.col("sales").sum().alias("total"),
        pl.len().alias("orders"),
    )
    .sort("total", descending=True)
    .collect()  # ← executes here
)
print(result)`,
      output: `shape: (3, 3)
┌─────────┬───────┬────────┐
│ product ┆ total ┆ orders │
│ ---     ┆ ---   ┆ ---    │
│ str     ┆ i64   ┆ u32    │
╞═════════╪═══════╪════════╡
│ B       ┆ 600   ┆ 3      │
│ A       ┆ 380   ┆ 3      │
│ C       ┆ 90    ┆ 1      │
└─────────┴───────┴────────┘`,
    },
  ],

  sqlalchemy: [
    {
      id: "orm",
      title: "ORM query",
      description: "Map Python classes to database tables. Query with Python — SQLAlchemy generates correct SQL.",
      language: "python",
      code: `from sqlalchemy import create_engine, Column, String, Integer, select
from sqlalchemy.orm import DeclarativeBase, Session

class Base(DeclarativeBase): pass

class User(Base):
    __tablename__ = "users"
    id    = Column(Integer, primary_key=True)
    name  = Column(String)
    email = Column(String, unique=True)

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as s:
    s.add_all([
        User(name="Alice", email="alice@example.com"),
        User(name="Bob",   email="bob@example.com"),
    ])
    s.commit()

    users = s.execute(
        select(User).where(User.name.like("A%"))
    ).scalars().all()

    for u in users:
        print(f"{u.id}: {u.name} <{u.email}>")`,
      output: `1: Alice <alice@example.com>`,
    },
  ],

  aiohttp: [
    {
      id: "concurrent",
      title: "Concurrent requests",
      description: "Fetch multiple URLs concurrently with aiohttp — no threads, pure async I/O.",
      language: "python",
      code: `import aiohttp, asyncio, time

URLS = [f"https://httpbin.org/delay/0.1" for _ in range(5)]

async def main():
    start = time.monotonic()
    async with aiohttp.ClientSession() as session:
        tasks = [session.get(url) for url in URLS]
        responses = await asyncio.gather(*tasks)
        statuses = [r.status for r in responses]

    elapsed = time.monotonic() - start
    print(f"Fetched {len(URLS)} URLs: {statuses}")
    print(f"Elapsed: {elapsed:.2f}s  (sequential would be ~0.5s)")

asyncio.run(main())`,
      output: `Fetched 5 URLs: [200, 200, 200, 200, 200]
Elapsed: 0.11s  (sequential would be ~0.5s)`,
    },
  ],

  django: [
    {
      id: "view",
      title: "View + ORM query",
      description: "Django's class-based views + ORM — query the database and return JSON in a few lines.",
      language: "python",
      code: `# models.py
from django.db import models

class Article(models.Model):
    title     = models.CharField(max_length=200)
    author    = models.CharField(max_length=100)
    published = models.BooleanField(default=False)
    views     = models.IntegerField(default=0)

# views.py
from django.http import JsonResponse
from django.views import View

class TopArticlesView(View):
    def get(self, request):
        articles = (
            Article.objects
            .filter(published=True)
            .order_by("-views")[:5]
            .values("title", "author", "views")
        )
        return JsonResponse(list(articles), safe=False)

# urls.py
# path("articles/top/", TopArticlesView.as_view())`,
      output: `GET /articles/top/  → 200 OK
[
  {"title": "Getting Started with Django", "author": "Alice", "views": 4821},
  {"title": "Django vs FastAPI", "author": "Bob",   "views": 3102},
  ...
]`,
    },
  ],

  anyio: [
    {
      id: "task-group",
      title: "Structured concurrency",
      description: "anyio task groups ensure all tasks finish (or fail together) — works on asyncio or trio.",
      language: "python",
      code: `import anyio
import time

async def fetch(name: str, delay: float) -> str:
    await anyio.sleep(delay)
    return f"result from {name}"

async def main():
    results = []
    start = time.monotonic()

    async with anyio.create_task_group() as tg:
        async def run(name, delay):
            r = await fetch(name, delay)
            results.append(r)

        tg.start_soon(run, "service-a", 0.1)
        tg.start_soon(run, "service-b", 0.2)
        tg.start_soon(run, "service-c", 0.15)

    elapsed = time.monotonic() - start
    print(f"Done in {elapsed:.2f}s:")
    for r in results:
        print(f"  {r}")

anyio.run(main)`,
      output: `Done in 0.21s:
  result from service-a
  result from service-c
  result from service-b`,
    },
  ],

  // npm packages
  axios: [
    {
      id: "interceptors",
      title: "Request interceptors",
      description: "Axios interceptors let you modify every request/response in one place — auth, logging, retry.",
      language: "typescript",
      code: `import axios from 'axios';

const api = axios.create({ baseURL: 'https://api.example.com' });

// Attach auth token to every request
api.interceptors.request.use((config) => {
  config.headers.Authorization = \`Bearer \${getToken()}\`;
  return config;
});

// Retry on 401 (token refresh)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await refreshToken();
      return api.request(err.config);
    }
    return Promise.reject(err);
  }
);

const { data } = await api.get('/users/me');
console.log(data);`,
      output: `{ id: 42, name: 'Alice', email: 'alice@example.com', role: 'admin' }`,
    },
  ],

  express: [
    {
      id: "router",
      title: "Router + middleware",
      description: "Express chains middleware functions — each calls next() to pass the request forward.",
      language: "typescript",
      code: `import express from 'express';

const app = express();
app.use(express.json());

// Logger middleware
app.use((req, _res, next) => {
  console.log(\`\${req.method} \${req.path}\`);
  next();
});

const router = express.Router();

router.get('/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

router.post('/', async (req, res) => {
  const user = await db.users.create(req.body);
  res.status(201).json(user);
});

app.use('/users', router);
app.listen(3000, () => console.log('Listening on :3000'));`,
      output: `Listening on :3000
GET  /users/42
POST /users`,
    },
  ],

  typescript: [
    {
      id: "types",
      title: "Type safety in action",
      description: "TypeScript catches type mismatches at compile time — the same code would crash silently in JavaScript.",
      language: "typescript",
      code: `interface Product {
  id: number;
  name: string;
  price: number;
  category: 'electronics' | 'clothing' | 'food';
}

function applyDiscount(p: Product, pct: number): Product {
  return { ...p, price: p.price * (1 - pct / 100) };
}

function formatPrice(p: Product): string {
  return \`\${p.name}: $\${p.price.toFixed(2)}\`;
}

const widget: Product = { id: 1, name: 'Widget', price: 29.99, category: 'electronics' };
const discounted = applyDiscount(widget, 20);
console.log(formatPrice(discounted));

// ✗ TypeScript catches this before it runs:
// applyDiscount({ name: 'T-Shirt' }, 10);
// → Argument of type '{ name: string }' is not assignable to
//   parameter of type 'Product'. Missing: id, price, category`,
      output: `Widget: $23.99
# TypeScript caught 1 compile-time error ↑ (would be silent runtime bug in JS)`,
    },
  ],

  vite: [
    {
      id: "build",
      title: "Production build",
      description: "Vite builds with Rollup for production — tree-shaking, code-splitting, and asset hashing.",
      language: "bash",
      code: `$ vite build

vite v6.0.3 building for production...
✓ 247 modules transformed.

dist/index.html                   0.46 kB │ gzip:   0.30 kB
dist/assets/index-DwGtdUW3.css   9.12 kB │ gzip:   2.67 kB
dist/assets/vendor-BkAzpkA.js   142.3 kB │ gzip:  45.8 kB  (react + react-dom)
dist/assets/index-CdBYkIqU.js    18.9 kB │ gzip:   6.4 kB  (app code)
✓ built in 1.94s

$ vite preview  # serve dist/ locally
  ➜  Local:   http://localhost:4173/`,
      output: `Build complete — serve dist/ with any static host
Vercel / Netlify: push and it auto-deploys
nginx: root /var/www/dist; try_files $uri /index.html;`,
    },
  ],

  vitest: [
    {
      id: "suite",
      title: "Test suite",
      description: "Vitest uses Vite's pipeline — same aliases, transforms, and env vars as your app.",
      language: "typescript",
      code: `import { describe, it, expect, vi, beforeEach } from 'vitest';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
  }).format(amount);
}

describe('formatCurrency', () => {
  it('formats USD', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('formats EUR', () => {
    expect(formatCurrency(99.9, 'EUR')).toBe('€99.90');
  });

  it('rounds correctly', () => {
    expect(formatCurrency(1.999, 'GBP')).toBe('£2.00');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});

// $ vitest run`,
      output: `✓ formatCurrency > formats USD         1ms
✓ formatCurrency > formats EUR         0ms
✓ formatCurrency > rounds correctly    0ms
✓ formatCurrency > handles zero        0ms

Test Files  1 passed (1)
Tests       4 passed (4)
Duration    183ms`,
    },
  ],

  "socket.io": [
    {
      id: "chat",
      title: "Real-time chat",
      description: "Socket.IO is an event emitter over the network — emit on one side, listen on the other.",
      language: "typescript",
      code: `// server.ts
import { Server } from 'socket.io';
const io = new Server(3000, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  socket.on('join', (room: string) => {
    socket.join(room);
    socket.to(room).emit('system', \`\${socket.id} joined\`);
  });

  socket.on('message', ({ room, text }: { room: string; text: string }) => {
    io.to(room).emit('message', { from: socket.id, text, ts: Date.now() });
  });

  socket.on('disconnect', () => console.log('left:', socket.id));
});

// client.ts
socket.emit('join', 'general');
socket.emit('message', { room: 'general', text: 'Hello!' });
socket.on('message', (msg) => console.log(msg));`,
      output: `connected: xK2mP...
connected: aJ9rQ...
{ from: 'xK2mP...', text: 'Hello!', ts: 1743502800000 }`,
    },
  ],

  sharp: [
    {
      id: "pipeline",
      title: "Image pipeline",
      description: "Sharp processes images in a streaming pipeline powered by libvips — much faster than ImageMagick.",
      language: "typescript",
      code: `import sharp from 'sharp';
import path from 'path';

// Resize + convert to WebP for a web image pipeline
await sharp('hero.jpg')
  .resize(1200, 630, {
    fit: 'cover',
    position: 'attention', // smart crop: keeps faces/objects
  })
  .webp({ quality: 85, effort: 4 })
  .toFile('hero.webp');

// Generate thumbnails at multiple sizes
const sizes = [320, 640, 1280];
await Promise.all(
  sizes.map((w) =>
    sharp('hero.jpg')
      .resize(w)
      .webp({ quality: 80 })
      .toFile(\`hero-\${w}w.webp\`)
  )
);

const meta = await sharp('hero.webp').metadata();
console.log(\`\${meta.width}×\${meta.height}  \${meta.format}  \${meta.size} bytes\`);`,
      output: `1200×630  webp  41823 bytes   (-82% vs original JPEG)
Generated: hero-320w.webp, hero-640w.webp, hero-1280w.webp`,
    },
  ],

  ky: [
    {
      id: "hooks",
      title: "Hooks + retry",
      description: "Ky wraps fetch with hooks for auth, retry logic, and automatic JSON — under 3KB.",
      language: "typescript",
      code: `import ky from 'ky';

const api = ky.create({
  prefixUrl: 'https://api.example.com',
  retry: { limit: 3, methods: ['get'], statusCodes: [429, 503] },
  timeout: 8000,
  hooks: {
    beforeRequest: [(req) => {
      req.headers.set('Authorization', \`Bearer \${getToken()}\`);
    }],
    afterResponse: [(_req, _opts, res) => {
      if (!res.ok) console.error('Request failed:', res.status);
      return res;
    }],
  },
});

// .json() throws on non-2xx — no manual res.ok check
const user = await api.get('users/me').json<User>();
console.log(user.name);`,
      output: `Alice  (retried once after 429 Too Many Requests)`,
    },
  ],

  "react-query": [
    {
      id: "query",
      title: "Server state with cache",
      description: "React Query fetches, caches, and refetches server data — replacing useEffect+useState for data fetching.",
      language: "typescript",
      code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetch(\`/api/users/\${id}\`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });
}

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useUser(userId);
  const qc = useQueryClient();

  const update = useMutation({
    mutationFn: (patch: Partial<User>) =>
      fetch(\`/api/users/\${userId}\`, { method: 'PATCH', body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', userId] }),
  });

  if (isLoading) return <Spinner />;
  if (error)     return <Error />;
  return <div onClick={() => update.mutate({ name: 'Bob' })}>{data.name}</div>;
}`,
      output: `# Initial render: fetches /api/users/42 → cached
# 5 min later: stale → auto-refetch on window focus
# After mutation: cache invalidated → fresh fetch`,
    },
  ],

  "react-hook-form": [
    {
      id: "form",
      title: "Uncontrolled form",
      description: "react-hook-form uses refs instead of state — zero re-renders while typing, full validation on submit.",
      language: "typescript",
      code: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(8, 'Min 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => console.log('Submitted:', data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="email"    {...register('email')}    />
      {errors.email    && <p>{errors.email.message}</p>}
      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}
      <button type="submit">Log in</button>
    </form>
  );
}`,
      output: `# Zero re-renders while typing (uncontrolled)
# Validation fires on submit (or onBlur with mode: 'onBlur')
# Submitted: { email: 'alice@example.com', password: 'securepass' }`,
    },
  ],

  "date-fns": [
    {
      id: "operations",
      title: "Date operations",
      description: "date-fns exports pure functions — import only what you need, zero side effects.",
      language: "typescript",
      code: `import { format, addDays, differenceInDays,
         isWeekend, startOfMonth, endOfMonth,
         formatDistanceToNow } from 'date-fns';

const now   = new Date('2024-03-15');
const event = new Date('2024-04-20');

console.log(format(now,   'MMMM d, yyyy'));           // March 15, 2024
console.log(format(event, 'EEE, MMM d'));              // Sat, Apr 20

const daysUntil = differenceInDays(event, now);
console.log(\`Days until event: \${daysUntil}\`);        // 36

console.log(\`Is weekend: \${isWeekend(now)}\`);          // false (Friday)
console.log(format(startOfMonth(now), 'yyyy-MM-dd')); // 2024-03-01
console.log(format(addDays(now, 7),   'yyyy-MM-dd')); // 2024-03-22

// Relative (from real now):
console.log(formatDistanceToNow(event, { addSuffix: true }));`,
      output: `March 15, 2024
Sat, Apr 20
Days until event: 36
Is weekend: false (Friday)
2024-03-01
2024-03-22
about 1 year ago`,
    },
  ],

  lodash: [
    {
      id: "chain",
      title: "Collection utilities",
      description: "Lodash provides groupBy, chunk, debounce, and 200+ other utilities JavaScript is missing.",
      language: "typescript",
      code: `import groupBy  from 'lodash/groupBy';
import sortBy   from 'lodash/sortBy';
import chunk    from 'lodash/chunk';
import debounce from 'lodash/debounce';

const users = [
  { name: 'Alice', dept: 'Eng',  level: 3 },
  { name: 'Bob',   dept: 'HR',   level: 2 },
  { name: 'Carol', dept: 'Eng',  level: 2 },
  { name: 'Dave',  dept: 'HR',   level: 3 },
];

// Group by department
const byDept = groupBy(users, 'dept');
console.log(byDept);

// Sort, then batch into pages of 2
const sorted = sortBy(users, ['dept', 'level']);
const pages  = chunk(sorted, 2);
console.log(\`Page 1:\`, pages[0].map(u => u.name));

// Debounce — fires at most once per 300ms
const save = debounce(() => console.log('Saved!'), 300);`,
      output: `{
  Eng: [{ name: 'Alice', level: 3 }, { name: 'Carol', level: 2 }],
  HR:  [{ name: 'Bob',   level: 2 }, { name: 'Dave',  level: 3 }]
}
Page 1: ['Carol', 'Alice']  // sorted by dept then level`,
    },
  ],

  zustand: [
    {
      id: "store",
      title: "Global state store",
      description: "A Zustand store is a custom hook — no Provider, no reducers, no boilerplate.",
      language: "typescript",
      code: `import { create } from 'zustand';

interface CartState {
  items: { id: string; qty: number }[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  total: () => number;
}

const useCart = create<CartState>((set, get) => ({
  items: [],

  addItem: (id) => set((s) => {
    const existing = s.items.find((i) => i.id === id);
    if (existing) {
      return { items: s.items.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i) };
    }
    return { items: [...s.items, { id, qty: 1 }] };
  }),

  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  total: () => get().items.reduce((sum, i) => sum + i.qty, 0),
}));

// Any component — no Provider needed:
function CartIcon() {
  const total = useCart((s) => s.total());  // subscribes to total only
  return <span>{total} items</span>;
}`,
      output: `# Mount CartIcon → subscribes, shows "0 items"
# addItem('shirt') → CartIcon re-renders → "1 items"
# addItem('shirt') → CartIcon re-renders → "2 items"
# Components that don't use total() don't re-render`,
    },
  ],

  immer: [
    {
      id: "produce",
      title: "Immutable updates",
      description: "Write mutating code on a draft — Immer records the changes and returns a new immutable object.",
      language: "typescript",
      code: `import { produce } from 'immer';

const state = {
  user: { name: 'Alice', address: { city: 'Portland', zip: '97201' } },
  cart: [{ id: 'a', qty: 1 }, { id: 'b', qty: 2 }],
};

// Without Immer (painful spread hell):
const next = {
  ...state,
  user: { ...state.user, address: { ...state.user.address, city: 'Seattle' } },
  cart: state.cart.map((i) => i.id === 'a' ? { ...i, qty: i.qty + 1 } : i),
};

// With Immer (just mutate the draft):
const next2 = produce(state, (draft) => {
  draft.user.address.city = 'Seattle'; // ← reads like mutation
  draft.cart.find((i) => i.id === 'a')!.qty++;
});

console.log(state.user.address.city); // 'Portland' — original unchanged
console.log(next2.user.address.city); // 'Seattle'  — new object`,
      output: `Portland  ← original unchanged (structural sharing)
Seattle   ← new object produced by Immer`,
    },
  ],

  pretext: [
    {
      id: "measurement",
      title: "Text measurement",
      description: "pretext measures text with Canvas — no DOM reflow, no layout thrashing.",
      language: "typescript",
      code: `import { prepare, layout, layoutWithLines } from '@chenglou/pretext';

const text = 'The quick brown fox jumps over the lazy dog. ' +
             'Pack my box with five dozen liquor jugs.';

const font = '16px Inter';

// Phase 1: One-time measurement via Canvas (~0.1ms)
const prepared = prepare(text, font);

// Phase 2: Fast arithmetic — call at any width
const narrow = layout(prepared, 200, 24);
const wide   = layout(prepared, 600, 24);

console.log('200px wide:', narrow.lineCount, 'lines,', narrow.height, 'px');
console.log('600px wide:', wide.lineCount,   'lines,', wide.height,   'px');

// Per-line details for variable-width layouts
const { lines } = layoutWithLines(prepared, 300, 24);
lines.forEach((line, i) =>
  console.log(\`  Line \${i + 1}: "\${line.text}" — \${line.width.toFixed(0)}px\`)
);`,
      output: `200px wide: 7 lines, 168 px
600px wide: 2 lines,  48 px

  Line 1: "The quick brown fox jumps over the" — 291px
  Line 2: "lazy dog. Pack my box with five"    — 278px
  Line 3: "dozen liquor jugs."                 — 174px`,
    },
  ],
};
