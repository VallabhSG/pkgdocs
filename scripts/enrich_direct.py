#!/usr/bin/env python3
"""Direct enrichment — writes curated story content into all package JSONs."""
import json
import os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "public" / "data" / "packages"

STORIES = {
    # ── Python ──────────────────────────────────────────────────────────────
    "requests": {
        "story": {
            "problem": "Python's built-in urllib is painfully verbose — you need dozens of lines just to make a POST request with headers and parse the response. Before requests, every team wrote their own wrapper or copied boilerplate. Kenneth Reitz published requests in 2011 and the community never looked back.",
            "mental_model": "Think of requests as a polished envelope system for HTTP: you stuff your data in, address it with a URL and headers, send it, and get a clean Response object back. The library handles encoding, redirects, cookies, and keep-alive connections so you don't have to.",
            "when_to_use": "Use requests for any synchronous HTTP work: calling REST APIs, scraping web pages, downloading files, or integrating with webhooks. It's the right default for scripts, CLI tools, and Django/Flask backends that don't need async.",
            "when_not_to_use": "Avoid requests when you're writing async code — it will block your event loop. Switch to httpx (drop-in async API) or aiohttp for FastAPI backends, async scrapers, or anything running inside asyncio.",
            "alternatives": [
                {"name": "httpx", "reason": "Drop-in async-compatible replacement; supports HTTP/2 and is the natural upgrade path"},
                {"name": "aiohttp", "reason": "Mature async HTTP client/server built specifically for asyncio workloads"},
                {"name": "urllib3", "reason": "Lower-level library that requests itself uses; reach for it only when you need fine-grained connection control"},
            ],
        },
        "tags": ["http", "requests", "python", "api-client", "rest"],
    },
    "httpx": {
        "story": {
            "problem": "When Python's async ecosystem matured around FastAPI and asyncio, developers needed an HTTP client that could keep up. The requests library is synchronous-only — calling it inside an async function blocks the entire event loop. httpx was built to be the modern, async-capable successor.",
            "mental_model": "httpx has two modes: a synchronous Client that works exactly like requests, and an AsyncClient you use inside async with. Both share the same API, so you can switch between them or gradually migrate without rewriting business logic.",
            "when_to_use": "Use httpx when building FastAPI or asyncio applications that call external APIs. Also reach for it when you need HTTP/2 support, a requests-compatible API with async support, or a single library that works in both sync and async contexts.",
            "when_not_to_use": "For simple synchronous scripts where you already use requests, there's little reason to switch — requests has a larger ecosystem of auth libraries and middleware. For high-volume async scraping at scale, aiohttp's lower-level control may be more efficient.",
            "alternatives": [
                {"name": "requests", "reason": "Simpler, more mature, larger ecosystem — use it when async isn't needed"},
                {"name": "aiohttp", "reason": "More battle-tested for high-concurrency async use cases; more control over the connection pool"},
            ],
        },
        "tags": ["http", "async", "asyncio", "http2", "api-client"],
    },
    "click": {
        "story": {
            "problem": "Python's argparse requires registering each argument imperatively, writing help text separately, and handling subcommands through awkward nesting. For anything beyond a trivial script, you're fighting the framework. Click's insight was that CLI structure should mirror code structure.",
            "mental_model": "Click uses decorators to turn ordinary Python functions into CLI commands. Add @click.command() and @click.option() to a function, and it instantly becomes a command with argument parsing, --help generation, type validation, and shell completion — all derived from the decorator chain.",
            "when_to_use": "Use Click for any CLI tool you're distributing or that has more than 2-3 arguments. It's the standard choice for Python CLIs, especially when you need subcommands (like git-style interfaces), prompts, progress bars, or colored output.",
            "when_not_to_use": "For extremely simple one-argument scripts, argparse or even sys.argv is fine. If you want type hints to drive the CLI automatically, look at Typer (which wraps Click under the hood).",
            "alternatives": [
                {"name": "typer", "reason": "Built on Click; derives CLI arguments from type annotations — less boilerplate if you already use type hints"},
                {"name": "argparse", "reason": "Standard library, no dependencies — good for simple scripts you don't want to install"},
                {"name": "fire", "reason": "Google's library that auto-generates CLIs from any Python object; good for quick scripting"},
            ],
        },
        "tags": ["cli", "command-line", "argparse", "python", "terminal"],
    },
    "numpy": {
        "story": {
            "problem": "Python lists are general-purpose and slow for numerical work — each element is a Python object with overhead, and there's no vectorised math. Before NumPy, scientific computing in Python meant writing slow loops or reaching for C extensions manually. NumPy solved this by providing a typed, contiguous array backed by optimised C and Fortran code.",
            "mental_model": "Think of a NumPy ndarray as a typed, multi-dimensional grid of numbers stored contiguously in memory. Operations on the array run in compiled C — adding two arrays of a million numbers is a single C loop, not a million Python function calls. The key insight is 'vectorise your thinking': replace loops with operations on whole arrays.",
            "when_to_use": "Use NumPy any time you're doing numerical computation: matrix math, statistics, signal processing, image data as pixel arrays, or feeding data into ML libraries. It's the foundation most scientific Python libraries (pandas, scipy, PyTorch) are built on.",
            "when_not_to_use": "NumPy is not for general-purpose data manipulation with mixed types or strings — use pandas DataFrames there. For very large datasets that don't fit in RAM, look at Dask or CuPy (GPU arrays).",
            "alternatives": [
                {"name": "pandas", "reason": "Built on NumPy; adds labelled columns, mixed types, and data wrangling — better for tabular data"},
                {"name": "polars", "reason": "Faster DataFrame library written in Rust; good when you need speed but don't need NumPy's raw array API"},
                {"name": "torch", "reason": "PyTorch tensors mirror NumPy's API but run on GPU — the natural upgrade for ML workloads"},
            ],
        },
        "tags": ["numpy", "array", "linear-algebra", "scientific", "matrix"],
    },
    "pandas": {
        "story": {
            "problem": "Analysing tabular data in Python before pandas meant juggling lists of dicts, writing CSV parsers by hand, and implementing your own groupby logic. Wes McKinney built pandas while working at a hedge fund because no existing tool gave Python the data manipulation power that R had with data frames.",
            "mental_model": "A pandas DataFrame is a spreadsheet you program. Rows and columns have labels; you filter with boolean masks, transform with .apply(), aggregate with .groupby(), and join with .merge() — all without writing loops. The mental shift is to describe the shape of the data you want, not the steps to get there.",
            "when_to_use": "Use pandas for data cleaning, exploration, and transformation: reading CSV/Excel/JSON files, computing statistics, reshaping data before feeding it to a model, or generating reports. It's the standard tool for the 'data wrangling' phase of any data science or analytics project.",
            "when_not_to_use": "Pandas struggles with datasets larger than a few GB in RAM. For big data, use Polars (faster, lower memory) or Dask (distributed pandas). For pure numerical math without labels, NumPy is more appropriate.",
            "alternatives": [
                {"name": "polars", "reason": "10-50x faster than pandas on typical workloads; better memory efficiency; recommended for new projects"},
                {"name": "dask", "reason": "Distributed pandas — same API but works on datasets larger than RAM"},
                {"name": "numpy", "reason": "Lower-level but faster when you only need numerical arrays without labelled columns"},
            ],
        },
        "tags": ["dataframe", "data-analysis", "csv", "pandas", "tabular"],
    },
    "fastapi": {
        "story": {
            "problem": "Building Python APIs with Flask meant adding separate libraries for validation, serialization, and auto-generated docs — and none of them talked to each other. Django REST Framework was powerful but heavy. FastAPI was designed around the insight that Python type hints contain everything needed to handle all three automatically.",
            "mental_model": "In FastAPI, your function signatures are the API contract. Annotate a parameter as int and FastAPI validates the incoming value, rejects bad requests, and documents the type in the OpenAPI spec — all from the same annotation. Pydantic models define request/response shapes and handle serialization. The result is an API where the code and the docs are always in sync.",
            "when_to_use": "Use FastAPI when building REST or GraphQL APIs in Python, especially when you need async support, automatic OpenAPI/Swagger docs, request validation, or are building microservices. It's the best choice for new Python API projects.",
            "when_not_to_use": "FastAPI is API-only — it has no templating, admin interface, or ORM. For full-stack web apps with server-rendered HTML, Django is better. For tiny internal tools, Flask's smaller learning curve might be preferable.",
            "alternatives": [
                {"name": "django", "reason": "Full-featured framework with built-in ORM, admin, auth — better for full-stack apps"},
                {"name": "flask", "reason": "Simpler and more flexible; good for small APIs or when you want to choose every component yourself"},
                {"name": "litestar", "reason": "Similar philosophy to FastAPI but with different design choices; worth evaluating for new projects"},
            ],
        },
        "tags": ["api", "async", "openapi", "pydantic", "web-framework"],
    },
    "flask": {
        "story": {
            "problem": "Django's 'batteries included' approach is a blessing for large apps but a burden for small ones — you get an ORM, admin panel, and template engine whether you want them or not. Armin Ronacher built Flask as a microframework: give developers the essentials (routing, request/response) and let them pick everything else.",
            "mental_model": "Flask is a WSGI application at its core. You register routes with @app.route() decorators, and each route is just a Python function that returns a response. There's no magic — what you see is what runs. Extensions (SQLAlchemy, Flask-Login, etc.) slot in cleanly when you need them.",
            "when_to_use": "Use Flask for small-to-medium web apps and APIs where you want to control the stack, for prototypes where you need something running fast, or when teaching web development concepts without the complexity of Django.",
            "when_not_to_use": "Flask becomes painful as an app grows — you end up assembling Django yourself from extensions. For async APIs, FastAPI is a better starting point. For anything needing built-in auth, admin, or ORM, Django pays off faster.",
            "alternatives": [
                {"name": "fastapi", "reason": "Better for pure APIs — adds async support, automatic validation, and OpenAPI docs"},
                {"name": "django", "reason": "Choose Django when you need an ORM, admin panel, or auth out of the box"},
                {"name": "starlette", "reason": "ASGI-native microframework; Flask's spiritual successor for async applications"},
            ],
        },
        "tags": ["web-framework", "wsgi", "routing", "microframework", "python"],
    },
    "pydantic": {
        "story": {
            "problem": "Python dicts from JSON APIs or config files are untyped — you access fields by string keys, get None for missing values, and discover type mismatches at runtime rather than at the point of data entry. Pydantic was built to bring Python's type hint system to runtime data validation.",
            "mental_model": "Define a Pydantic model the same way you'd define a dataclass, but with type annotations. When you instantiate it, Pydantic validates every field against its type, coerces compatible values (a string '42' becomes int 42), and raises a detailed ValidationError listing every problem at once — not just the first one.",
            "when_to_use": "Use Pydantic for parsing API responses, validating config files, defining request/response schemas in FastAPI, or any time you receive data from an external source and want guarantees about its shape and types.",
            "when_not_to_use": "Pydantic adds overhead on every model instantiation — not ideal for tight inner loops parsing millions of small objects. For pure config files with no user-facing validation, dataclasses or simple TypedDicts may be lighter.",
            "alternatives": [
                {"name": "attrs", "reason": "More control over class behaviour; lighter weight than Pydantic for pure data classes"},
                {"name": "marshmallow", "reason": "Older serialization/validation library; more explicit but more verbose than Pydantic"},
                {"name": "msgspec", "reason": "Significantly faster than Pydantic for high-throughput serialization scenarios"},
            ],
        },
        "tags": ["validation", "serialization", "type-hints", "json-schema", "data-parsing"],
    },
    "pytest": {
        "story": {
            "problem": "Python's built-in unittest framework requires tests to be methods inside classes that inherit from TestCase, and setup/teardown uses a rigid inheritance model. Writing even simple tests means boilerplate, and sharing state between tests is awkward. pytest took the view that tests should just be functions.",
            "mental_model": "In pytest, a test is any function whose name starts with test_. Assertions use plain Python assert statements — pytest rewrites them to show a detailed diff on failure. Fixtures are dependency-injected via function arguments: declare you need a database connection by adding db as a parameter, and pytest finds and provides the fixture automatically.",
            "when_to_use": "Use pytest for any Python project with tests. It's the de facto standard — most libraries, frameworks, and CI pipelines assume pytest. Its plugin ecosystem covers everything from coverage (pytest-cov) to async tests (pytest-asyncio) to parameterisation.",
            "when_not_to_use": "For extremely simple one-off scripts where adding a dependency feels heavy, unittest is built into Python. For property-based testing, add Hypothesis on top of pytest rather than replacing it.",
            "alternatives": [
                {"name": "unittest", "reason": "Built into Python's standard library — no install needed, good for minimal projects"},
                {"name": "hypothesis", "reason": "Property-based testing that generates inputs automatically; used alongside pytest"},
                {"name": "ward", "reason": "Modern test framework with a focus on output readability; worth evaluating for new projects"},
            ],
        },
        "tags": ["testing", "unit-tests", "fixtures", "tdd", "python"],
    },
    "rich": {
        "story": {
            "problem": "Terminal output in Python is stuck in the 1970s by default — monochrome text, manual string formatting for tables, and no way to show progress without writing your own ANSI escape sequences. Rich changed the expectation of what a well-crafted CLI tool should look like.",
            "mental_model": "Rich is a markup-over-print-statements system. Use rich.print() instead of print() and add [bold red]text[/bold red] markup in your strings. For structured output, create Table or Panel objects and pass them to a Console. Under the hood, Rich auto-detects whether the terminal supports colour and gracefully degrades.",
            "when_to_use": "Use Rich in any CLI tool or long-running script where you want readable output: progress bars for downloads or processing loops, syntax-highlighted code, formatted tables, structured log output, or pretty-printed Python objects for debugging.",
            "when_not_to_use": "Rich adds 1-2MB to your package size and a startup cost. For library code that should be output-agnostic, stick to logging. For applications deployed purely as web services with no terminal interaction, Rich adds nothing.",
            "alternatives": [
                {"name": "colorama", "reason": "Lighter weight cross-platform colour support; less feature-rich but smaller footprint"},
                {"name": "tqdm", "reason": "Focused purely on progress bars — simpler to use for that single use case"},
                {"name": "textual", "reason": "Full TUI framework built on Rich — use it when you need interactive terminal apps, not just output"},
            ],
        },
        "tags": ["cli", "terminal", "colors", "progress-bar", "tables"],
    },
    "typer": {
        "story": {
            "problem": "Click is powerful but verbose — every option needs both a decorator and a parameter. If you're already using Python type hints, you're duplicating information: once in the function signature and once in the Click decorators. Typer, built by the FastAPI author, makes type hints the single source of truth for CLI interfaces.",
            "mental_model": "Typer reads your function's type annotations to build the CLI automatically. def main(name: str, count: int = 1) becomes a command with a required --name string argument and an optional --count integer with a default. The same annotations that your IDE uses for autocomplete become the CLI's argument definitions.",
            "when_to_use": "Use Typer when you're already writing typed Python code and want to expose it as a CLI with minimal boilerplate. It's especially good for tools used internally or distributed as packages where IDE support matters.",
            "when_not_to_use": "Typer's magic can be surprising — if you need precise control over how arguments are parsed, displayed, or composed, drop down to Click directly. For simple one-file scripts, Click or even argparse may be clearer.",
            "alternatives": [
                {"name": "click", "reason": "More explicit, more mature; Typer is built on top of it — use Click directly when you need fine-grained control"},
                {"name": "argparse", "reason": "Zero dependencies, part of the standard library — fine for simple tools you don't distribute"},
                {"name": "fire", "reason": "Zero-config CLI generation from any Python object; even less boilerplate but less control over the interface"},
            ],
        },
        "tags": ["cli", "type-hints", "argparse", "command-line", "python"],
    },
    "polars": {
        "story": {
            "problem": "Pandas was designed when datasets fit comfortably in a few GB and multi-core CPUs were a novelty. Today, pandas is slow on large datasets, uses more memory than necessary, and runs single-threaded by default. Polars was rebuilt from scratch in Rust with a query optimiser and multi-threaded execution engine.",
            "mental_model": "Polars uses a lazy evaluation model: instead of running operations immediately, it builds a query plan. When you call .collect(), the optimiser rewrites the plan to eliminate redundant work, push filters down, and parallelise across all CPU cores. Think of it like SQL — the engine decides how to execute, not you.",
            "when_to_use": "Use Polars for data transformation on datasets over 500MB, in production data pipelines where speed matters, or anywhere you're hitting pandas memory limits. It's also a good choice for new projects even on small data — the API is cleaner and the performance headroom is free.",
            "when_not_to_use": "The ML ecosystem (scikit-learn, PyTorch, statsmodels) speaks NumPy arrays and pandas DataFrames. You'll need to call .to_pandas() or .to_numpy() at the handoff point, which adds friction. For quick exploratory work in a Jupyter notebook, pandas' ecosystem and familiarity often wins.",
            "alternatives": [
                {"name": "pandas", "reason": "Larger ecosystem, better ML library integration, more Stack Overflow answers — still the default for data science"},
                {"name": "dask", "reason": "Distributed pandas for datasets larger than RAM; better when you're already on a pandas codebase"},
                {"name": "cudf", "reason": "GPU-accelerated DataFrames from NVIDIA; use when you have a GPU and need maximum throughput"},
            ],
        },
        "tags": ["dataframe", "rust", "fast", "data-engineering", "lazy-evaluation"],
    },
    "sqlalchemy": {
        "story": {
            "problem": "Writing raw SQL strings in Python means string concatenation (and SQL injection risks), database-specific syntax that breaks when you switch engines, and no way to express relationships between tables as Python objects. SQLAlchemy solved this by offering both a high-level ORM and a Pythonic SQL expression layer.",
            "mental_model": "SQLAlchemy has two layers you use together. The Core layer gives you a SQL expression API — table.select().where(table.c.id == 5) generates correct SQL for any database. The ORM layer maps Python classes to tables, so you work with User objects and SQLAlchemy handles the INSERT/SELECT/JOIN. You can mix both layers freely.",
            "when_to_use": "Use SQLAlchemy in any Python application that talks to a relational database — web apps, data pipelines, ETL scripts. It supports PostgreSQL, MySQL, SQLite, and Oracle, so the same code runs everywhere. It's the standard ORM in the Python ecosystem, with integrations for Flask, FastAPI, and most web frameworks.",
            "when_not_to_use": "SQLAlchemy's full ORM is overkill for simple read-only queries or scripts that just need to run a few SQL statements. For those cases, use the database's driver directly (psycopg2, sqlite3) or a lightweight query builder like databases.",
            "alternatives": [
                {"name": "tortoise-orm", "reason": "Async-native ORM modelled after Django ORM; better for pure asyncio applications"},
                {"name": "peewee", "reason": "Smaller, simpler ORM for straightforward CRUD applications without complex relationships"},
                {"name": "databases", "reason": "Async SQL query library without ORM overhead; good when you want to write SQL directly but asynchronously"},
            ],
        },
        "tags": ["orm", "sql", "database", "postgresql", "mysql"],
    },
    "aiohttp": {
        "story": {
            "problem": "When Python's asyncio became stable, the synchronous requests library became a liability in async applications — every HTTP call blocked the event loop, defeating the point of async. aiohttp was one of the first libraries to provide both an async HTTP client and a full async HTTP server built on asyncio.",
            "mental_model": "aiohttp runs entirely on asyncio's event loop. The client uses async with session.get(url) as response to make requests that yield control back to the loop while waiting for the network. The server side uses a similar pattern — request handlers are coroutines that the server dispatches concurrently without threads.",
            "when_to_use": "Use aiohttp when you need a battle-tested async HTTP client or server, especially in applications that make many concurrent HTTP calls (scrapers, API aggregators) or build lightweight async web services. It has a mature ecosystem and is widely used in production.",
            "when_not_to_use": "For new async API projects, FastAPI (built on Starlette/uvicorn) has better developer ergonomics, automatic validation, and docs. For synchronous scripts, requests is simpler. httpx offers a compatible API with both sync and async modes if you want flexibility.",
            "alternatives": [
                {"name": "httpx", "reason": "Supports both sync and async; requests-compatible API; easier migration path from synchronous code"},
                {"name": "fastapi", "reason": "Better choice for building async HTTP servers — more ergonomic with automatic OpenAPI docs"},
                {"name": "trio", "reason": "Alternative async runtime that some find more intuitive; aiohttp doesn't support trio natively"},
            ],
        },
        "tags": ["async", "asyncio", "http-client", "http-server", "web"],
    },
    "django": {
        "story": {
            "problem": "Building a web application involves solving the same problems every time: connecting to a database, managing user authentication, handling form validation, generating HTML, and building an admin interface. Django was designed so you'd never have to solve those problems again — it comes with everything pre-integrated.",
            "mental_model": "Django follows the MTV pattern (Model, Template, View). Models are Python classes that map to database tables via a built-in ORM. Views are functions or classes that receive a request and return a response. Templates are HTML files with a simple tag syntax. Django wires them together with a URL dispatcher. The 'opinionated' structure means every Django project looks the same.",
            "when_to_use": "Use Django for full-stack web applications that need user accounts, an admin interface for content management, forms with validation, or an ORM for complex data relationships. It's the right choice when you want a complete, production-ready framework with a well-trodden path for common features.",
            "when_not_to_use": "Django is heavy for pure REST APIs — the ORM, templates, and admin panel add weight you don't use. FastAPI is a better starting point for API-only projects. Django's synchronous-by-default nature (though async support has improved) can also be a constraint for highly concurrent applications.",
            "alternatives": [
                {"name": "fastapi", "reason": "Purpose-built for async REST APIs with automatic validation and docs — much lighter than Django REST Framework"},
                {"name": "flask", "reason": "Microframework — start here if you want to assemble your own stack piece by piece"},
                {"name": "wagtail", "reason": "CMS built on Django — use it when you need Django's power with a polished content editing interface"},
            ],
        },
        "tags": ["web-framework", "orm", "full-stack", "python", "batteries-included"],
    },
    "anyio": {
        "story": {
            "problem": "Python has two competing async runtimes: asyncio (built-in) and trio (third-party). Libraries that hardcode asyncio can't be used in trio applications and vice versa. Framework authors had to pick one and exclude the other. anyio provides a compatibility layer so library authors can write async code once and have it work on both backends.",
            "mental_model": "anyio is an abstraction over async primitives — task groups, cancellation, sockets, file I/O, locks. When you import from anyio, you get APIs that run correctly whether the underlying runtime is asyncio or trio. Applications choose the backend at startup; libraries built on anyio just work on either.",
            "when_to_use": "Use anyio when writing an async library or framework that you want to be runtime-agnostic. It's also useful in applications that want trio's structured concurrency model but need to interop with asyncio-based libraries like FastAPI or aiohttp.",
            "when_not_to_use": "For application code that commits to asyncio (e.g. a FastAPI app), using asyncio directly is simpler — there's no need for the compatibility layer. anyio shines at the library level, not the application level.",
            "alternatives": [
                {"name": "asyncio", "reason": "Python's built-in async runtime — sufficient for applications that don't need trio compatibility"},
                {"name": "trio", "reason": "Alternative async runtime with a cleaner structured concurrency model; use anyio on top of it to maintain compatibility"},
                {"name": "curio", "reason": "Experimental async library from the asyncio author; mostly superseded by trio and asyncio improvements"},
            ],
        },
        "tags": ["async", "asyncio", "trio", "concurrency", "compatibility"],
    },

    # ── npm ──────────────────────────────────────────────────────────────────
    "axios": {
        "story": {
            "problem": "The native fetch API is verbose for the patterns every app uses: you need to manually check response.ok, call response.json(), set Content-Type headers on every POST, and handle errors yourself. Axios wraps fetch with sensible defaults and adds features like request/response interceptors that are hard to implement cleanly with fetch.",
            "mental_model": "Axios is a promise-based HTTP client that treats requests as a pipeline: request interceptors run before the request is sent, the request goes out, then response interceptors run on the way back. This makes cross-cutting concerns like auth tokens and error logging trivially easy to add in one place.",
            "when_to_use": "Use axios when you need request/response interceptors (auth headers, logging, retry logic), want automatic JSON serialisation/deserialisation, need to cancel in-flight requests, or want consistent behaviour between browser and Node.js environments.",
            "when_not_to_use": "For simple requests in modern apps, fetch is built-in and perfectly adequate. For lightweight browser-only code, ky is a smaller alternative. React Query or SWR abstract data fetching further — prefer those when you also need caching and state management.",
            "alternatives": [
                {"name": "ky", "reason": "Tiny fetch wrapper for browser-only use — same idea as axios but ~2KB instead of ~13KB"},
                {"name": "fetch", "reason": "Built into browsers and Node 18+ — no install needed for simple use cases"},
                {"name": "react-query", "reason": "Combines data fetching with caching and state — the right abstraction for React apps that need server state"},
            ],
        },
        "tags": ["http", "api-client", "interceptors", "promise", "isomorphic"],
    },
    "zod": {
        "story": {
            "problem": "TypeScript types exist only at compile time — they're completely erased at runtime. When you receive JSON from an API, there's no guarantee it matches your TypeScript interface. You could get a null where you expect a string and TypeScript can't catch it. Zod bridges the gap by providing runtime validation that produces TypeScript types.",
            "mental_model": "A Zod schema is both a validator and a type: z.object({ name: z.string(), age: z.number() }) defines a schema you can call .parse() on at runtime AND extracts a TypeScript type from it with z.infer<typeof schema>. One definition, both compile-time and runtime safety.",
            "when_to_use": "Use Zod at every trust boundary: parsing API responses, validating form inputs, reading environment variables, or loading config files. Any time external data enters your application, a Zod schema is the right gatekeeper.",
            "when_not_to_use": "Zod adds bundle size (around 12KB gzipped). For purely server-side validation where bundle size doesn't matter but performance does, Typebox or Ajv (JSON Schema) are faster. If you're already using Pydantic on the Python side, you may want to generate Zod schemas from it rather than maintain both.",
            "alternatives": [
                {"name": "valibot", "reason": "Similar API to Zod but tree-shakable — much smaller bundle for browser apps that only use a subset"},
                {"name": "yup", "reason": "Older schema validation library; less TypeScript-native but battle-tested in form libraries"},
                {"name": "typebox", "reason": "JSON Schema-based; generates both TypeScript types and JSON Schema from one definition — useful for OpenAPI"},
            ],
        },
        "tags": ["validation", "typescript", "schema", "runtime-types", "parsing"],
    },
    "lodash": {
        "story": {
            "problem": "JavaScript's standard library is famously sparse. There's no built-in groupBy, chunk, debounce, cloneDeep, or flatten. Every project either wrote these utilities from scratch or copy-pasted snippets. Lodash became the de facto standard library for JavaScript by providing over 200 well-tested utility functions.",
            "mental_model": "Think of lodash as the standard library JavaScript should have had. It follows functional programming conventions: functions take data as their first argument, are composable, and never mutate inputs. The _(collection).chain().map().filter().value() syntax lets you build data transformation pipelines clearly.",
            "when_to_use": "Use lodash for array manipulation (chunk, flatten, groupBy, uniq), object utilities (cloneDeep, merge, pick, omit), function helpers (debounce, throttle, memoize), and collection operations. Import only the functions you need (import groupBy from 'lodash/groupBy') to keep bundle size down.",
            "when_not_to_use": "Modern JavaScript (ES2020+) has absorbed many lodash features natively: Array.flat(), Object.fromEntries(), optional chaining, nullish coalescing. Audit what you actually need before adding lodash — you may already have it in the language.",
            "alternatives": [
                {"name": "radash", "reason": "Modern lodash alternative written in TypeScript with better tree-shaking and async utilities"},
                {"name": "remeda", "reason": "Type-safe utility library with data-first and data-last variants for better inference"},
                {"name": "es-toolkit", "reason": "Drop-in lodash replacement with smaller bundle size and modern TypeScript types"},
            ],
        },
        "tags": ["utility", "functional", "collections", "javascript", "stdlib"],
    },
    "dayjs": {
        "story": {
            "problem": "JavaScript's built-in Date object is notoriously broken — it's mutable (methods modify the object in place), months are zero-indexed, timezone handling is inconsistent, and there's no formatting built in. Moment.js solved this but grew to 67KB and became mutable. Day.js was created to offer the same ergonomics as moment.js in 2KB.",
            "mental_model": "Day.js objects are immutable — every operation returns a new instance, so you never accidentally mutate a date you're sharing. The API mirrors moment.js intentionally, making migration trivial: dayjs('2024-01-15').add(1, 'month').format('YYYY-MM-DD') reads exactly like human intent.",
            "when_to_use": "Use Day.js when you need date parsing, formatting, arithmetic (add/subtract days/months), or comparisons in browser code where bundle size matters. Its plugin system covers timezones, relative time ('3 hours ago'), duration, and ISO weeks.",
            "when_not_to_use": "For complex timezone-aware calendar applications, consider Temporal (the upcoming TC39 proposal) or date-fns with explicit timezone handling. Day.js's plugin system can grow large if you need many features.",
            "alternatives": [
                {"name": "date-fns", "reason": "Function-based instead of object-based; better tree-shaking since you import only the functions you use"},
                {"name": "luxon", "reason": "More robust timezone support built on the Intl API; larger bundle but better for international apps"},
                {"name": "Temporal", "reason": "Upcoming TC39 built-in that will make date libraries unnecessary — already available via polyfill"},
            ],
        },
        "tags": ["date", "time", "immutable", "moment", "formatting"],
    },
    "uuid": {
        "story": {
            "problem": "Generating unique identifiers that are truly unique across distributed systems, time, and machines without a centralised coordinator is a solved problem — but solving it correctly requires understanding RFC 4122 and avoiding common pitfalls like using Math.random() which has insufficient entropy.",
            "mental_model": "UUID v4 generates a 128-bit random identifier with enough entropy that collisions are astronomically unlikely. UUID v1 encodes a timestamp and MAC address to guarantee uniqueness across time. The uuid library implements all RFC variants correctly and outputs them in the standard hyphenated string format.",
            "when_to_use": "Use uuid whenever you need a unique ID that doesn't require a database sequence: primary keys in distributed systems, idempotency keys for API calls, session tokens, file names, or correlation IDs for logging.",
            "when_not_to_use": "For database primary keys where you control the DB, auto-incrementing integers are smaller and faster to index. For sortable unique IDs (e.g. for pagination), consider ULID or UUIDv7, which encode a timestamp prefix.",
            "alternatives": [
                {"name": "nanoid", "reason": "Generates shorter URL-safe IDs with comparable entropy — better when you need compact IDs in URLs"},
                {"name": "cuid2", "reason": "Collision-resistant, sortable, URL-safe IDs designed for databases — better than UUID for primary keys"},
                {"name": "crypto.randomUUID", "reason": "Built into Node 14.17+ and modern browsers — no package needed for basic v4 UUIDs"},
            ],
        },
        "tags": ["uuid", "unique-id", "guid", "rfc4122", "identity"],
    },
    "react-query": {
        "story": {
            "problem": "React components that fetch data end up managing an explosion of state: loading, error, data, refetching, stale, and more — all in useEffect hooks that leak, fire twice in StrictMode, and don't deduplicate identical requests. TanStack Query (formerly React Query) treats server data as a separate concern from UI state.",
            "mental_model": "React Query maintains a client-side cache keyed by query keys. When two components request the same key, they share one fetch. Data is considered 'stale' after a configurable time and refetched automatically on window focus or remount. You describe what data you need with a query key and an async function; React Query handles when and how to fetch it.",
            "when_to_use": "Use React Query for any React app that fetches server data: REST APIs, GraphQL, or any async function. It replaces 95% of the useEffect+useState patterns for data fetching and adds caching, background refetching, and optimistic updates for free.",
            "when_not_to_use": "React Query is for server state (data that lives on a server). For UI state (modals, form values, local toggles), use useState or Zustand. If you're already using a full data layer like Apollo Client for GraphQL, React Query is redundant.",
            "alternatives": [
                {"name": "swr", "reason": "Vercel's data fetching library with a similar model — slightly simpler API, slightly less features"},
                {"name": "apollo-client", "reason": "Purpose-built for GraphQL — normalised cache and automatic type generation make it worth the complexity"},
                {"name": "rtk-query", "reason": "Redux Toolkit's data fetching — good if you're already using Redux and want everything in one place"},
            ],
        },
        "tags": ["react", "data-fetching", "caching", "server-state", "async"],
    },
    "zustand": {
        "story": {
            "problem": "Redux solves state management but brings enormous complexity: actions, reducers, selectors, middleware, and a steep learning curve for what is often a shared variable. Context API re-renders the entire subtree on every update. Zustand was built to provide global state with the simplicity of useState and the power of Redux.",
            "mental_model": "A Zustand store is a custom hook. You define state and actions together in one object, and any component calls useStore(state => state.count) to subscribe to exactly the slice it needs. Only components that subscribed to changed state re-render. No providers, no reducers, no boilerplate.",
            "when_to_use": "Use Zustand for global UI state that multiple components need to read and write: auth status, theme preferences, shopping cart, modal state, or any data too complex for prop drilling but not complex enough to justify Redux.",
            "when_not_to_use": "Zustand is not designed for server state — use React Query for that. For very large applications with complex state machines or time-travel debugging requirements, Redux Toolkit's tooling is more mature.",
            "alternatives": [
                {"name": "jotai", "reason": "Atomic state model — each atom is independent, avoiding the single-store pattern; better for derived state"},
                {"name": "valtio", "reason": "Proxy-based state that feels like mutating plain objects — very natural if you dislike the selector pattern"},
                {"name": "redux-toolkit", "reason": "More opinionated but better DevTools, time-travel debugging, and team conventions for large apps"},
            ],
        },
        "tags": ["react", "state-management", "global-state", "hooks", "lightweight"],
    },
    "immer": {
        "story": {
            "problem": "React and Redux require immutable state updates — you must return a new object instead of modifying the existing one. For deeply nested state, this means writing spread-heavy code like { ...state, user: { ...state.user, address: { ...state.user.address, city: 'New York' } } } just to change one field. Immer makes this readable again.",
            "mental_model": "Immer gives you a draft — a mutable proxy of your current state. You write code as if you're mutating it directly: draft.user.address.city = 'New York'. Behind the scenes, Immer records every change and produces a new immutable object with only those changes applied. Mutations on the draft never touch the original.",
            "when_to_use": "Use Immer whenever you have deeply nested state updates that are painful to write immutably: Redux reducers, Zustand's set function, or React useState with complex objects. It's built into Redux Toolkit's createSlice, so you're probably already using it.",
            "when_not_to_use": "For flat, simple state (a counter, a boolean toggle), immer's overhead isn't worth it — just spread the object. Immer also has edge cases with classes, Maps, and Sets that require using enableMapSet() and enableAllPlugins().",
            "alternatives": [
                {"name": "structuredClone", "reason": "Built-in deep clone — sufficient when you just need a copy to mutate, without structural sharing"},
                {"name": "immutable.js", "reason": "Persistent immutable data structures with structural sharing — more rigorous but heavier and less ergonomic"},
            ],
        },
        "tags": ["immutable", "state", "redux", "react", "mutations"],
    },
    "react-hook-form": {
        "story": {
            "problem": "Controlled forms in React — where every input is tied to state with onChange — cause a re-render on every keystroke. A form with 10 fields re-renders 10 times per character typed. For complex forms with validation, this tanks performance. React Hook Form uses uncontrolled inputs and the ref model to avoid re-renders.",
            "mental_model": "Instead of storing form values in React state, React Hook Form stores them in a ref (outside React's render cycle). You register each input with a register() function, which attaches the ref. Validation runs on submit or blur, not on every keystroke. Re-renders only happen when validation errors change or the form is submitted.",
            "when_to_use": "Use React Hook Form for any form with more than 3-4 fields, especially if they have validation logic. It integrates well with Zod (via @hookform/resolvers/zod) for schema-based validation, giving you type-safe forms with runtime validation in a few lines.",
            "when_not_to_use": "For very simple single-field forms (a search box, a newsletter signup), useState is less code. For highly dynamic forms where fields are added/removed programmatically, the useFieldArray API works but adds complexity — evaluate Formik for that use case.",
            "alternatives": [
                {"name": "formik", "reason": "Older, more opinionated form library; controlled by default but has a larger ecosystem of examples"},
                {"name": "tanstack-form", "reason": "Framework-agnostic form library from the React Query author — newer but with strong TypeScript support"},
            ],
        },
        "tags": ["react", "forms", "validation", "performance", "uncontrolled"],
    },
    "express": {
        "story": {
            "problem": "Node.js's built-in http module gives you raw access to requests and responses but nothing else — no routing, no middleware, no cookie parsing, no static file serving. Every web app needed to solve these problems from scratch. Express defined the Node.js web server model that most frameworks still follow today.",
            "mental_model": "Express is a middleware pipeline. Every incoming request travels through a chain of middleware functions in order. Each middleware calls next() to pass the request forward, sends a response to end the chain, or both. app.get('/users', middleware1, middleware2, handler) is just a named slot in that chain.",
            "when_to_use": "Use Express for REST APIs and web servers in Node.js, especially when you value a minimal core with full control over what you add. It's the most documented Node.js framework with the largest ecosystem of compatible middleware.",
            "when_not_to_use": "Express is synchronous by default and has poor built-in TypeScript support. For TypeScript-first APIs, try Fastify or Hono. For full-stack apps with server-side rendering, use Next.js. For edge/serverless, Hono's smaller footprint is better.",
            "alternatives": [
                {"name": "fastify", "reason": "2-3x faster than Express, TypeScript-first, built-in JSON schema validation — the modern Express replacement"},
                {"name": "hono", "reason": "Tiny and runs everywhere: Node, Cloudflare Workers, Deno, Bun — best for edge deployments"},
                {"name": "koa", "reason": "From the Express team; async-first and more minimal — a cleaner version of Express's ideas"},
            ],
        },
        "tags": ["node", "web-framework", "middleware", "rest-api", "http-server"],
    },
    "typescript": {
        "story": {
            "problem": "JavaScript is dynamically typed — typos in property names, passing the wrong type to a function, and refactoring without knowing all callers are all silent runtime errors. In large codebases, these become expensive bugs. TypeScript adds a static type system that catches them at compile time without changing how the code runs.",
            "mental_model": "TypeScript is a strict superset of JavaScript: all valid JavaScript is valid TypeScript. You add type annotations where they help and TypeScript infers the rest. The compiler strips all types before running, so the output is plain JavaScript. Think of types as documentation that the computer checks.",
            "when_to_use": "Use TypeScript for any JavaScript project that will grow beyond a few hundred lines or be worked on by more than one person. The upfront cost of adding types pays back quickly in editor autocomplete, safe refactoring, and catching bugs before runtime.",
            "when_not_to_use": "TypeScript adds a compilation step and a learning curve. For tiny scripts, config files, or throwaway code, plain JavaScript is faster to write. TypeScript's type system also has limits — it can't track runtime behaviour, only the shape of values at compile time.",
            "alternatives": [
                {"name": "jsdoc", "reason": "Type comments in JavaScript without a build step — TypeScript can even check these; good for small projects"},
                {"name": "flow", "reason": "Meta's type checker; similar to TypeScript but smaller ecosystem and community"},
            ],
        },
        "tags": ["typescript", "types", "static-analysis", "javascript", "compiler"],
    },
    "vite": {
        "story": {
            "problem": "Webpack bundles your entire application before the dev server starts — for large apps this takes 30-60 seconds on cold start, and HMR updates take 5-10 seconds. Evan You built Vite on the insight that modern browsers can load ES modules natively, eliminating the need to bundle at all during development.",
            "mental_model": "In dev mode, Vite serves your source files directly as native ES modules — no bundling. The browser requests a file, Vite transforms it (TypeScript, JSX, CSS) on demand and sends it back in milliseconds. HMR works at the module level: change a component, only that module updates. For production, Vite uses Rollup to create an optimised bundle.",
            "when_to_use": "Use Vite for any modern frontend project: React, Vue, Svelte, or vanilla JavaScript. It's the current standard for new projects, replacing Create React App. Also use it as the build tool underlying frameworks like Astro and SvelteKit.",
            "when_not_to_use": "For server-rendered apps (Next.js, Remix, Nuxt), the framework handles the build tool. For very old browsers that don't support ES modules, you'll need additional configuration. Large monorepos may need Turborepo or Nx on top of Vite to manage builds across packages.",
            "alternatives": [
                {"name": "webpack", "reason": "Older but extremely configurable — still necessary for complex legacy setups or when you need fine-grained chunk splitting"},
                {"name": "esbuild", "reason": "The fastest bundler; Vite uses it internally for transforms but lacks esbuild's raw speed for full bundles"},
                {"name": "turbopack", "reason": "Vercel's Webpack replacement built in Rust — deeply integrated with Next.js, may replace Vite for that ecosystem"},
            ],
        },
        "tags": ["build-tool", "hmr", "esmodules", "frontend", "bundler"],
    },
    "vitest": {
        "story": {
            "problem": "Jest works well but has a major friction point in Vite projects: Vite uses native ES modules and Vite-specific transforms (e.g. CSS modules, SVG imports), while Jest uses CommonJS and its own transform pipeline. Getting them to agree requires complex configuration. Vitest runs inside Vite's pipeline so your test environment matches your app environment exactly.",
            "mental_model": "Vitest is Jest's API running inside Vite. If you know Jest (describe, it, expect, vi.mock), you know Vitest. The key difference is that Vitest uses Vite's config and transforms — the same aliases, plugins, and module resolution in your tests as in your app. No separate babel or jest.config to maintain.",
            "when_to_use": "Use Vitest for any Vite-based project (React, Vue, Svelte) that needs unit or integration tests. It's also a good Jest replacement in non-Vite Node projects that want faster test execution and native ES module support.",
            "when_not_to_use": "For Next.js projects, Jest is still the recommended and better-documented choice. Vitest's browser mode (for running tests in a real browser) is still maturing — for end-to-end browser tests, use Playwright or Cypress.",
            "alternatives": [
                {"name": "jest", "reason": "More mature, larger ecosystem, recommended by React and Next.js — use it for non-Vite projects"},
                {"name": "playwright", "reason": "End-to-end browser testing — tests run in real browsers, not jsdom; complementary to Vitest not a replacement"},
                {"name": "mocha", "reason": "Older, more minimal test runner with no built-in assertions — combine with chai; less common in modern projects"},
            ],
        },
        "tags": ["testing", "vite", "jest-compatible", "unit-tests", "typescript"],
    },
    "socket.io": {
        "story": {
            "problem": "Raw WebSockets require you to handle reconnection, event multiplexing, room management, binary data, and fallback for environments that don't support WebSockets. Socket.IO was built to make real-time bidirectional communication reliable across browsers, mobile clients, and servers without managing any of that yourself.",
            "mental_model": "Socket.IO is an event emitter over the network. On the server: io.on('connection', socket => socket.on('message', data => io.emit('message', data))). On the client: socket.on('message', data => ...) and socket.emit('message', data). Both sides emit and listen to named events. Rooms let you broadcast to subsets of clients.",
            "when_to_use": "Use Socket.IO for chat applications, live collaboration, real-time dashboards, multiplayer games, or any feature where the server needs to push updates to clients. The automatic reconnection and room system make it production-ready out of the box.",
            "when_not_to_use": "Socket.IO's abstraction layer adds overhead — if you're communicating between services where you control both ends, raw WebSockets or Server-Sent Events (for one-way) are lighter. For very high throughput (millions of concurrent connections), the overhead of Socket.IO's protocol becomes meaningful.",
            "alternatives": [
                {"name": "ws", "reason": "Raw WebSocket library — faster and lighter; use it when you control both client and server and don't need rooms/namespaces"},
                {"name": "partykit", "reason": "Managed WebSocket infrastructure — abstracts servers entirely; good for collaborative features without ops"},
                {"name": "ably", "reason": "Managed real-time messaging platform — offloads infra entirely at the cost of vendor lock-in"},
            ],
        },
        "tags": ["websocket", "realtime", "events", "chat", "multiplayer"],
    },
    "sharp": {
        "story": {
            "problem": "Node.js image processing was historically slow and memory-hungry — libraries used ImageMagick via child processes, paying the cost of spawning a new process for every image. Sharp wraps libvips, a C library that processes images in a streaming pipeline, using far less memory and running much faster.",
            "mental_model": "Sharp is a transformation pipeline for images. You chain operations: sharp(input).resize(800, 600).webp({ quality: 80 }).toFile(output). The pipeline is lazy — nothing runs until you call a finaliser like .toFile() or .toBuffer(). libvips processes the image in a streaming pass rather than loading it fully into memory.",
            "when_to_use": "Use Sharp for image resizing, format conversion (JPEG to WebP/AVIF), thumbnail generation, watermarking, and metadata extraction in Node.js. It's the standard choice for image processing in server-side Next.js, image CDN backends, and upload pipelines.",
            "when_not_to_use": "Sharp is a native module — it requires native binaries and can complicate deployment in serverless environments. For Cloudflare Workers or edge functions, use the Cloudflare Images API or Vercel's built-in image optimisation instead.",
            "alternatives": [
                {"name": "jimp", "reason": "Pure JavaScript image processing — no native binaries, easier to deploy, but 10-20x slower than Sharp"},
                {"name": "canvas", "reason": "Node Canvas API for arbitrary 2D drawing — better when you need to compose images with text and shapes"},
                {"name": "imagemagick", "reason": "Broader format support and filters via CLI — use it for edge cases Sharp doesn't cover"},
            ],
        },
        "tags": ["image-processing", "resize", "webp", "avif", "libvips"],
    },
    "ky": {
        "story": {
            "problem": "The fetch API is great but verbose for common patterns: checking response.ok manually, parsing JSON, setting timeouts, and adding retry logic each require boilerplate. Axios solves this but adds 13KB and XMLHttpRequest for a browser-only app that already has fetch. Ky wraps fetch with the ergonomics you actually want in under 2KB.",
            "mental_model": "Ky is fetch with sensible defaults: it throws on non-2xx responses, parses JSON automatically with .json(), and accepts an options object that extends the RequestInit interface. Hooks replace axios interceptors — beforeRequest, afterResponse, and beforeRetry give you the same insertion points.",
            "when_to_use": "Use Ky in browser-only or Deno applications where bundle size matters and you don't need Node.js compatibility. It's a direct replacement for axios in these contexts with a fraction of the footprint.",
            "when_not_to_use": "Ky doesn't support Node.js's older http module (though it works in Node 18+ with native fetch). For isomorphic code (same HTTP client in browser and Node), use axios or got. For React apps that need caching and state, React Query provides the better abstraction.",
            "alternatives": [
                {"name": "axios", "reason": "Works in both browser and Node.js with XMLHttpRequest fallback — use when you need isomorphic support"},
                {"name": "got", "reason": "Node.js-first HTTP client with streams, pagination, and retry — the right choice for server-side Node code"},
                {"name": "fetch", "reason": "Built-in and zero-KB — sufficient for simple requests without retry or hooks"},
            ],
        },
        "tags": ["http", "fetch", "browser", "lightweight", "api-client"],
    },
    "date-fns": {
        "story": {
            "problem": "Moment.js normalised date handling in JavaScript but became monolithic — even importing one function loads the entire 67KB library. Immutability was bolted on, timezone support required a separate plugin, and the maintainers officially marked it as legacy. date-fns was designed from the start as a collection of pure functions, one file per function.",
            "mental_model": "Every date-fns function is a standalone export: import { format, addDays, differenceInCalendarDays } from 'date-fns'. Each function takes a plain Date and returns a new Date or a primitive — no classes, no mutation, no chaining. Your bundler tree-shakes everything you don't import, so you pay only for what you use.",
            "when_to_use": "Use date-fns for formatting, parsing, arithmetic (add/subtract days, months, years), comparison, and locale-aware output in any JavaScript environment. Import only what you need and the bundle impact is minimal.",
            "when_not_to_use": "date-fns v2 has limited first-party timezone support — for complex timezone-aware applications use Luxon or the Temporal polyfill. The function-heavy API can feel verbose for simple one-liners; Day.js's method chaining is more readable in those cases.",
            "alternatives": [
                {"name": "dayjs", "reason": "2KB with a fluent chaining API — better for simple formatting and arithmetic without needing tree-shaking"},
                {"name": "luxon", "reason": "Best-in-class timezone support via the Intl API — worth the larger bundle for international applications"},
                {"name": "Temporal", "reason": "TC39 built-in for dates and times — available via polyfill, will eventually replace all date libraries"},
            ],
        },
        "tags": ["date", "time", "formatting", "immutable", "tree-shakable"],
    },
}


def update_package(name: str, data: dict) -> dict:
    enrichment = STORIES.get(name)
    if not enrichment:
        return data

    story = enrichment.get("story", {})
    new_tags = enrichment.get("tags", [])

    # Update story fields
    for field in ["problem", "mental_model", "when_to_use", "when_not_to_use"]:
        if story.get(field):
            data["story"][field] = story[field]

    if story.get("alternatives"):
        data["story"]["alternatives"] = story["alternatives"]

    # Merge tags (curated tags first, then keep original ones not already present)
    existing = data.get("tags", [])
    merged = list(dict.fromkeys(new_tags + [t for t in existing if t not in new_tags]))[:10]
    data["tags"] = merged

    return data


def main():
    updated = 0
    skipped = 0
    for path in sorted(DATA_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        name = data["id"]
        if name in STORIES:
            data = update_package(name, data)
            path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"OK  {name}")
            updated += 1
        else:
            print(f"--  {name} (no enrichment data)")
            skipped += 1

    print(f"\nDone: {updated} updated, {skipped} skipped")


if __name__ == "__main__":
    main()
