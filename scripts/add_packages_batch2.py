"""
Batch 2: 20 new packages for pkgdocs
Python: matplotlib, seaborn, scikit-learn, openai, loguru, tenacity, pymongo, arrow, structlog, hypothesis
npm: three, d3, framer-motion, swr, next-auth, recharts, mongoose, chart.js, gsap, rxjs
"""

import json, os, pathlib

OUT = pathlib.Path(__file__).parent.parent / "public" / "data" / "packages"
OUT.mkdir(parents=True, exist_ok=True)

PACKAGES = [
  # ── Python ──────────────────────────────────────────────────────────────
  {
    "id": "matplotlib",
    "ecosystem": "pypi",
    "name": "matplotlib",
    "summary": "The go-to plotting library for Python — create static, animated, and interactive visualizations with a MATLAB-like API.",
    "tags": ["visualization", "plotting", "data-science", "charts", "graphs"],
    "difficulty": 2,
    "story": {
      "problem": "You have data — arrays, dataframes, model outputs — and you need to see it. Whether it's a quick line chart to check a trend or a publication-quality figure with subplots, you need a library that can do both without switching tools.",
      "mental_model": "Think of matplotlib as a canvas + paintbrush system. The Figure is the canvas, Axes are individual plot areas, and everything (lines, labels, ticks, colors) is an Artist you can configure. The pyplot interface is a shortcut for common operations, but the object-oriented API gives you full control.",
      "when_to_use": "Scientific plots, publication figures, embedding charts in reports, quick data exploration, custom visualizations that seaborn can't express, or when you need pixel-level control over a chart.",
      "when_not_to_use": "Interactive web dashboards (use Plotly or Bokeh), real-time streaming charts, or when you just want something beautiful fast (try seaborn first).",
      "alternatives": [
        {"name": "seaborn", "reason": "Higher-level statistical plots with better defaults, built on top of matplotlib"},
        {"name": "plotly", "reason": "Interactive web-first charts, great for dashboards"},
        {"name": "altair", "reason": "Declarative grammar-of-graphics approach, clean API"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "matplotlib", "type": "module", "label": "matplotlib", "summary": "Top-level package", "difficulty": 1, "tags": ["core"]},
        {"id": "pyplot", "type": "module", "label": "matplotlib.pyplot", "summary": "MATLAB-like state-machine interface for quick plots", "difficulty": 1, "tags": ["plotting"]},
        {"id": "figure", "type": "class", "label": "Figure", "summary": "Top-level container for all plot elements", "difficulty": 2, "tags": ["container"]},
        {"id": "axes", "type": "class", "label": "Axes", "summary": "The actual plot area — most drawing happens here", "difficulty": 2, "tags": ["plotting"]},
        {"id": "plot", "type": "function", "label": "ax.plot()", "summary": "Draw lines or markers", "signature": "plot(x, y, fmt='', **kwargs)", "difficulty": 1, "tags": ["line"]},
        {"id": "scatter", "type": "function", "label": "ax.scatter()", "summary": "Scatter plot with optional color/size mapping", "signature": "scatter(x, y, c=None, s=None)", "difficulty": 1, "tags": ["scatter"]},
        {"id": "subplots", "type": "function", "label": "plt.subplots()", "summary": "Create a figure with one or more subplots", "signature": "subplots(nrows=1, ncols=1, **kwargs)", "difficulty": 2, "tags": ["layout"]},
        {"id": "savefig", "type": "function", "label": "fig.savefig()", "summary": "Save figure to file (PNG, PDF, SVG…)", "signature": "savefig(fname, dpi=None, format=None)", "difficulty": 1, "tags": ["output"]},
        {"id": "colormap", "type": "concept", "label": "Colormap", "summary": "Map scalar values to colors (viridis, plasma, etc.)", "difficulty": 2, "tags": ["color"]},
        {"id": "artist", "type": "concept", "label": "Artist", "summary": "Base class for everything drawn on a figure", "difficulty": 3, "tags": ["internals"]}
      ],
      "edges": [
        {"id": "e1", "from": "matplotlib", "to": "pyplot", "label": "contains"},
        {"id": "e2", "from": "pyplot", "to": "figure", "label": "returns"},
        {"id": "e3", "from": "figure", "to": "axes", "label": "contains"},
        {"id": "e4", "from": "axes", "to": "plot", "label": "contains"},
        {"id": "e5", "from": "axes", "to": "scatter", "label": "contains"},
        {"id": "e6", "from": "pyplot", "to": "subplots", "label": "contains"},
        {"id": "e7", "from": "subplots", "to": "figure", "label": "returns"},
        {"id": "e8", "from": "figure", "to": "savefig", "label": "contains"},
        {"id": "e9", "from": "colormap", "to": "scatter", "label": "uses"},
        {"id": "e10", "from": "artist", "to": "axes", "label": "contains"}
      ]
    },
    "tasks": [
      {
        "id": "line-chart",
        "title": "Plot a line chart",
        "difficulty": "beginner",
        "steps": [
          {"label": "Import and create data", "code": "import matplotlib.pyplot as plt\nimport numpy as np\n\nx = np.linspace(0, 10, 100)\ny = np.sin(x)"},
          {"label": "Plot and show", "code": "fig, ax = plt.subplots(figsize=(8, 4))\nax.plot(x, y, color='steelblue', linewidth=2, label='sin(x)')\nax.set_xlabel('x')\nax.set_ylabel('y')\nax.set_title('Sine Wave')\nax.legend()\nax.grid(alpha=0.3)\nplt.tight_layout()\nplt.show()", "explanation": "Always use the object-oriented ax.plot() style rather than plt.plot() for production code — it's clearer when you have multiple subplots."}
        ]
      },
      {
        "id": "subplots",
        "title": "Create a multi-panel figure",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Create subplot grid", "code": "fig, axes = plt.subplots(2, 2, figsize=(10, 8))\naxes = axes.flatten()  # easier indexing"},
          {"label": "Plot in each panel", "code": "for i, ax in enumerate(axes):\n    x = np.random.randn(100)\n    ax.hist(x, bins=20, color=f'C{i}', alpha=0.7)\n    ax.set_title(f'Panel {i+1}')\n\nfig.suptitle('Four Histograms', fontsize=14)\nplt.tight_layout()\nplt.savefig('figure.png', dpi=150, bbox_inches='tight')"}
        ]
      },
      {
        "id": "heatmap",
        "title": "Plot a heatmap / 2D matrix",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Create and show heatmap", "code": "data = np.random.rand(8, 8)\nfig, ax = plt.subplots(figsize=(6, 5))\nim = ax.imshow(data, cmap='viridis', aspect='auto')\nplt.colorbar(im, ax=ax, label='Value')\nax.set_title('Random Heatmap')\nplt.tight_layout()\nplt.show()"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 25000000, "version": "3.9.2", "repo_url": "https://github.com/matplotlib/matplotlib", "docs_url": "https://matplotlib.org/stable/", "pypi_url": "https://pypi.org/project/matplotlib/"}
  },

  {
    "id": "seaborn",
    "ecosystem": "pypi",
    "name": "seaborn",
    "summary": "Statistical data visualization built on matplotlib — beautiful charts with sensible defaults and one-line syntax.",
    "tags": ["visualization", "statistics", "data-science", "plotting"],
    "difficulty": 1,
    "story": {
      "problem": "matplotlib gives you full power but requires a lot of code for common statistical plots like distributions, correlations, and categorical comparisons. Styling it to look good takes even more effort.",
      "mental_model": "seaborn is a high-level wrapper around matplotlib. Think of it as matplotlib with pre-built chart types for statistics, better color palettes by default, and tight pandas integration. It still returns matplotlib Figure/Axes objects, so you can drop down to matplotlib for fine-tuning.",
      "when_to_use": "Exploratory data analysis, correlation matrices, distribution comparisons, categorical plots, regression plots, or any time you want a beautiful statistical chart in a few lines.",
      "when_not_to_use": "Custom non-statistical visualizations, interactive web charts, or when you need pixel-perfect control over layout.",
      "alternatives": [
        {"name": "matplotlib", "reason": "More control, lower-level, no statistical defaults"},
        {"name": "plotly", "reason": "Interactive and web-first"},
        {"name": "altair", "reason": "Grammar-of-graphics declarative approach"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "seaborn", "type": "module", "label": "seaborn", "summary": "Top-level module — most functions live here", "difficulty": 1, "tags": ["core"]},
        {"id": "scatterplot", "type": "function", "label": "sns.scatterplot()", "summary": "Scatter plot with hue/size/style mappings", "signature": "scatterplot(data, x, y, hue=None)", "difficulty": 1, "tags": ["scatter"]},
        {"id": "histplot", "type": "function", "label": "sns.histplot()", "summary": "Histogram with optional KDE overlay", "signature": "histplot(data, x=None, kde=False)", "difficulty": 1, "tags": ["distribution"]},
        {"id": "heatmap", "type": "function", "label": "sns.heatmap()", "summary": "Color-encoded matrix, great for correlation tables", "signature": "heatmap(data, annot=False, cmap=None)", "difficulty": 1, "tags": ["matrix"]},
        {"id": "pairplot", "type": "function", "label": "sns.pairplot()", "summary": "All pairwise relationships in a dataset at once", "signature": "pairplot(data, hue=None)", "difficulty": 1, "tags": ["eda"]},
        {"id": "boxplot", "type": "function", "label": "sns.boxplot()", "summary": "Quartiles and outliers per category", "signature": "boxplot(data, x=None, y=None, hue=None)", "difficulty": 1, "tags": ["categorical"]},
        {"id": "lmplot", "type": "function", "label": "sns.lmplot()", "summary": "Scatter plot + linear regression line + confidence interval", "signature": "lmplot(data, x, y, hue=None)", "difficulty": 2, "tags": ["regression"]},
        {"id": "set_theme", "type": "function", "label": "sns.set_theme()", "summary": "Set global style, palette, and font scale", "signature": "set_theme(style='darkgrid', palette='deep')", "difficulty": 1, "tags": ["styling"]}
      ],
      "edges": [
        {"id": "e1", "from": "seaborn", "to": "scatterplot", "label": "contains"},
        {"id": "e2", "from": "seaborn", "to": "histplot", "label": "contains"},
        {"id": "e3", "from": "seaborn", "to": "heatmap", "label": "contains"},
        {"id": "e4", "from": "seaborn", "to": "pairplot", "label": "contains"},
        {"id": "e5", "from": "seaborn", "to": "boxplot", "label": "contains"},
        {"id": "e6", "from": "seaborn", "to": "lmplot", "label": "contains"},
        {"id": "e7", "from": "seaborn", "to": "set_theme", "label": "contains"},
        {"id": "e8", "from": "pairplot", "to": "scatterplot", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "correlation-heatmap",
        "title": "Correlation matrix heatmap",
        "difficulty": "beginner",
        "steps": [
          {"label": "Import and compute correlation", "code": "import seaborn as sns\nimport pandas as pd\n\ndf = sns.load_dataset('iris')  # or your own DataFrame\ncorr = df.select_dtypes('number').corr()"},
          {"label": "Plot heatmap", "code": "sns.set_theme(style='white')\nfig = sns.heatmap(\n    corr,\n    annot=True,    # show numbers\n    fmt='.2f',\n    cmap='coolwarm',\n    center=0,\n    square=True,\n    linewidths=0.5\n).figure\nfig.suptitle('Feature Correlations')\nfig.tight_layout()"}
        ]
      },
      {
        "id": "distribution",
        "title": "Compare distributions across groups",
        "difficulty": "beginner",
        "steps": [
          {"label": "Violin + strip plot combo", "code": "import seaborn as sns\nimport matplotlib.pyplot as plt\n\ntips = sns.load_dataset('tips')\nfig, ax = plt.subplots(figsize=(8, 5))\nsns.violinplot(data=tips, x='day', y='total_bill', hue='sex', split=True, ax=ax)\nsns.stripplot(data=tips, x='day', y='total_bill', hue='sex', dodge=True, size=3, alpha=0.4, ax=ax)\nax.set_title('Bill distribution by day and gender')\nplt.tight_layout()\nplt.show()"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 8000000, "version": "0.13.2", "repo_url": "https://github.com/mwaskom/seaborn", "docs_url": "https://seaborn.pydata.org/", "pypi_url": "https://pypi.org/project/seaborn/"}
  },

  {
    "id": "scikit-learn",
    "ecosystem": "pypi",
    "name": "scikit-learn",
    "summary": "The standard machine learning library for Python — clean API for classification, regression, clustering, and preprocessing.",
    "tags": ["machine-learning", "data-science", "classification", "regression", "clustering"],
    "difficulty": 2,
    "story": {
      "problem": "You have labeled data and want to build a predictive model. Or unlabeled data you want to cluster. Or features you need to preprocess. scikit-learn gives you consistent, well-tested implementations of hundreds of ML algorithms without having to implement them from scratch.",
      "mental_model": "Everything follows the same pattern: create an estimator (model), call .fit(X, y) to train, call .predict(X) to infer. Transformers additionally have .transform() and .fit_transform(). Pipelines chain these steps so preprocessing + model become one object.",
      "when_to_use": "Classical ML (not deep learning): tabular data, structured features, interpretable models, baseline modeling, feature engineering, cross-validation, and hyperparameter tuning.",
      "when_not_to_use": "Deep learning / neural networks (use PyTorch or TensorFlow), unstructured data like images or text at scale, real-time inference at very high throughput.",
      "alternatives": [
        {"name": "xgboost", "reason": "Faster gradient boosting, often wins Kaggle competitions"},
        {"name": "lightgbm", "reason": "Memory-efficient boosting for large datasets"},
        {"name": "pytorch", "reason": "Deep learning, neural networks"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "sklearn", "type": "module", "label": "sklearn", "summary": "Root package with submodules per ML category", "difficulty": 1, "tags": ["core"]},
        {"id": "estimator", "type": "concept", "label": "Estimator protocol", "summary": "Any object with fit() — the core sklearn contract", "difficulty": 1, "tags": ["api"]},
        {"id": "pipeline", "type": "class", "label": "Pipeline", "summary": "Chain transformers + final estimator into one object", "difficulty": 2, "tags": ["workflow"]},
        {"id": "randomforest", "type": "class", "label": "RandomForestClassifier", "summary": "Ensemble of decision trees — robust baseline", "difficulty": 2, "tags": ["classification"]},
        {"id": "cross_val", "type": "function", "label": "cross_val_score()", "summary": "K-fold cross-validation in one line", "signature": "cross_val_score(estimator, X, y, cv=5)", "difficulty": 2, "tags": ["evaluation"]},
        {"id": "scaler", "type": "class", "label": "StandardScaler", "summary": "Standardize features to zero mean, unit variance", "difficulty": 1, "tags": ["preprocessing"]},
        {"id": "train_test", "type": "function", "label": "train_test_split()", "summary": "Split arrays into train and test sets", "signature": "train_test_split(X, y, test_size=0.2)", "difficulty": 1, "tags": ["data"]},
        {"id": "gridsearch", "type": "class", "label": "GridSearchCV", "summary": "Exhaustive hyperparameter search with cross-validation", "difficulty": 3, "tags": ["tuning"]},
        {"id": "metrics", "type": "module", "label": "sklearn.metrics", "summary": "Accuracy, F1, confusion matrix, ROC-AUC, etc.", "difficulty": 2, "tags": ["evaluation"]}
      ],
      "edges": [
        {"id": "e1", "from": "sklearn", "to": "estimator", "label": "contains"},
        {"id": "e2", "from": "estimator", "to": "pipeline", "label": "uses"},
        {"id": "e3", "from": "pipeline", "to": "scaler", "label": "contains"},
        {"id": "e4", "from": "pipeline", "to": "randomforest", "label": "contains"},
        {"id": "e5", "from": "train_test", "to": "cross_val", "label": "uses"},
        {"id": "e6", "from": "cross_val", "to": "metrics", "label": "uses"},
        {"id": "e7", "from": "gridsearch", "to": "pipeline", "label": "uses"},
        {"id": "e8", "from": "sklearn", "to": "train_test", "label": "contains"},
        {"id": "e9", "from": "sklearn", "to": "metrics", "label": "contains"}
      ]
    },
    "tasks": [
      {
        "id": "classify",
        "title": "Train a classifier with a pipeline",
        "difficulty": "beginner",
        "steps": [
          {"label": "Build pipeline", "code": "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import classification_report\nimport numpy as np\n\n# Load your data\nX, y = np.random.randn(500, 10), np.random.randint(0, 2, 500)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)"},
          {"label": "Fit and evaluate", "code": "pipe = Pipeline([\n    ('scaler', StandardScaler()),\n    ('clf', RandomForestClassifier(n_estimators=100, random_state=42))\n])\n\npipe.fit(X_train, y_train)\ny_pred = pipe.predict(X_test)\nprint(classification_report(y_test, y_pred))"}
        ]
      },
      {
        "id": "crossval",
        "title": "Cross-validate and tune hyperparameters",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Grid search with CV", "code": "from sklearn.model_selection import GridSearchCV\n\nparam_grid = {\n    'clf__n_estimators': [50, 100, 200],\n    'clf__max_depth': [None, 5, 10],\n}\ngs = GridSearchCV(pipe, param_grid, cv=5, scoring='f1', n_jobs=-1)\ngs.fit(X_train, y_train)\nprint('Best params:', gs.best_params_)\nprint('Best CV F1:', gs.best_score_.round(3))"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 12000000, "version": "1.5.2", "repo_url": "https://github.com/scikit-learn/scikit-learn", "docs_url": "https://scikit-learn.org/stable/", "pypi_url": "https://pypi.org/project/scikit-learn/"}
  },

  {
    "id": "openai",
    "ecosystem": "pypi",
    "name": "openai",
    "summary": "Official Python SDK for the OpenAI API — call GPT-4, DALL-E, Whisper, and Embeddings with a clean async-first interface.",
    "tags": ["ai", "llm", "gpt", "api-client", "async"],
    "difficulty": 1,
    "story": {
      "problem": "You want to add AI capabilities — text generation, image creation, speech recognition, or embeddings — to your Python application without managing HTTP requests and response parsing yourself.",
      "mental_model": "The SDK wraps REST endpoints in typed Python objects. Create an OpenAI client, then call client.chat.completions.create() with a list of message dicts. The response is a structured object with .choices[0].message.content. Everything has an async equivalent.",
      "when_to_use": "Integrating GPT-4/3.5 into apps, generating embeddings for semantic search, transcribing audio with Whisper, generating images with DALL-E, or building agentic workflows with tool calling.",
      "when_not_to_use": "When you need to run models locally (use ollama or transformers), when cost is a hard constraint for high-volume tasks, or when you need a specific open-source model.",
      "alternatives": [
        {"name": "anthropic", "reason": "Claude models — often better for long documents and coding"},
        {"name": "litellm", "reason": "Unified interface to 100+ LLM providers"},
        {"name": "langchain", "reason": "Orchestration framework for complex LLM pipelines"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "openai", "type": "module", "label": "openai", "summary": "Top-level package", "difficulty": 1, "tags": ["core"]},
        {"id": "client", "type": "class", "label": "OpenAI", "summary": "Sync client — instantiate once, reuse everywhere", "difficulty": 1, "tags": ["client"]},
        {"id": "asyncclient", "type": "class", "label": "AsyncOpenAI", "summary": "Async version for FastAPI, asyncio apps", "difficulty": 2, "tags": ["async"]},
        {"id": "chat", "type": "function", "label": "chat.completions.create()", "summary": "Send messages, get back a completion", "signature": "create(model, messages, temperature=1.0)", "difficulty": 1, "tags": ["text"]},
        {"id": "embeddings", "type": "function", "label": "embeddings.create()", "summary": "Convert text to vector representation", "signature": "create(model, input)", "difficulty": 2, "tags": ["embeddings"]},
        {"id": "images", "type": "function", "label": "images.generate()", "summary": "Generate images with DALL-E", "signature": "generate(prompt, model='dall-e-3', size='1024x1024')", "difficulty": 1, "tags": ["images"]},
        {"id": "audio", "type": "function", "label": "audio.transcriptions.create()", "summary": "Transcribe audio with Whisper", "signature": "create(model='whisper-1', file=audio_file)", "difficulty": 2, "tags": ["audio"]},
        {"id": "streaming", "type": "concept", "label": "Streaming", "summary": "Stream tokens as they're generated with stream=True", "difficulty": 2, "tags": ["streaming"]}
      ],
      "edges": [
        {"id": "e1", "from": "openai", "to": "client", "label": "contains"},
        {"id": "e2", "from": "openai", "to": "asyncclient", "label": "contains"},
        {"id": "e3", "from": "client", "to": "chat", "label": "contains"},
        {"id": "e4", "from": "client", "to": "embeddings", "label": "contains"},
        {"id": "e5", "from": "client", "to": "images", "label": "contains"},
        {"id": "e6", "from": "client", "to": "audio", "label": "contains"},
        {"id": "e7", "from": "chat", "to": "streaming", "label": "uses"},
        {"id": "e8", "from": "asyncclient", "to": "chat", "label": "contains"}
      ]
    },
    "tasks": [
      {
        "id": "chat-completion",
        "title": "Send a chat message and get a response",
        "difficulty": "beginner",
        "steps": [
          {"label": "Basic chat completion", "code": "from openai import OpenAI\n\nclient = OpenAI()  # reads OPENAI_API_KEY from env\n\nresponse = client.chat.completions.create(\n    model='gpt-4o',\n    messages=[\n        {'role': 'system', 'content': 'You are a helpful assistant.'},\n        {'role': 'user', 'content': 'Explain async/await in Python in one paragraph.'}\n    ]\n)\nprint(response.choices[0].message.content)"}
        ]
      },
      {
        "id": "streaming",
        "title": "Stream tokens as they arrive",
        "difficulty": "beginner",
        "steps": [
          {"label": "Stream response tokens", "code": "with client.chat.completions.stream(\n    model='gpt-4o',\n    messages=[{'role': 'user', 'content': 'Write a haiku about Python.'}]\n) as stream:\n    for text in stream.text_stream:\n        print(text, end='', flush=True)\nprint()  # newline at end"}
        ]
      },
      {
        "id": "embeddings",
        "title": "Generate embeddings for semantic search",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Create embeddings", "code": "import numpy as np\n\ntexts = ['Python is great', 'I love async programming', 'Coffee is essential']\nresponse = client.embeddings.create(model='text-embedding-3-small', input=texts)\nvectors = [r.embedding for r in response.data]  # list of 1536-dim float lists"},
          {"label": "Find most similar", "code": "query = client.embeddings.create(\n    model='text-embedding-3-small',\n    input='What language should I learn?'\n).data[0].embedding\n\n# Cosine similarity\ndef cosine(a, b):\n    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))\n\nscores = [(texts[i], cosine(query, v)) for i, v in enumerate(vectors)]\nprint(sorted(scores, key=lambda x: -x[1])[0])"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 9000000, "version": "1.54.0", "repo_url": "https://github.com/openai/openai-python", "docs_url": "https://platform.openai.com/docs", "pypi_url": "https://pypi.org/project/openai/"}
  },

  {
    "id": "loguru",
    "ecosystem": "pypi",
    "name": "loguru",
    "summary": "Python logging that doesn't make you want to cry — structured, colorful, zero-config, with automatic exception tracebacks.",
    "tags": ["logging", "debugging", "devtools", "async"],
    "difficulty": 1,
    "story": {
      "problem": "Python's built-in logging module requires boilerplate setup (handlers, formatters, loggers) just to print a colored timestamp. It's powerful but the API is from 2003 and shows its age.",
      "mental_model": "Loguru has a single pre-configured logger object. You import it and call logger.info(). Under the hood it handles formatting, colors, log rotation, JSON output, and exception capture. Add sinks (files, services) with logger.add().",
      "when_to_use": "Any Python application that needs logging — scripts, APIs, workers. Especially good for: colorized console output during development, structured JSON logs for production, automatic exception tracing.",
      "when_not_to_use": "If your team's infrastructure is already built around stdlib logging and you can't change it easily — loguru can interop but it adds complexity.",
      "alternatives": [
        {"name": "structlog", "reason": "Structured logging with stdlib compatibility, better for large teams"},
        {"name": "logging", "reason": "stdlib, no dependency, required by some frameworks"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "loguru", "type": "module", "label": "loguru", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "logger", "type": "class", "label": "logger", "summary": "Pre-configured singleton — just import and use", "difficulty": 1, "tags": ["core"]},
        {"id": "add", "type": "function", "label": "logger.add()", "summary": "Add a sink (file, stderr, function, service)", "signature": "add(sink, level='DEBUG', format=None, rotation=None)", "difficulty": 2, "tags": ["config"]},
        {"id": "catch", "type": "function", "label": "logger.catch()", "summary": "Decorator/context manager that captures exceptions with full traceback", "signature": "@logger.catch", "difficulty": 1, "tags": ["exceptions"]},
        {"id": "bind", "type": "function", "label": "logger.bind()", "summary": "Add structured context to all subsequent log calls", "signature": "bind(**kwargs) -> Logger", "difficulty": 2, "tags": ["structured"]},
        {"id": "serialize", "type": "concept", "label": "serialize=True", "summary": "Output logs as JSON — great for production log aggregators", "difficulty": 2, "tags": ["production"]},
        {"id": "rotation", "type": "concept", "label": "Log rotation", "summary": "Auto-rotate log files by size, time, or count", "difficulty": 2, "tags": ["files"]}
      ],
      "edges": [
        {"id": "e1", "from": "loguru", "to": "logger", "label": "contains"},
        {"id": "e2", "from": "logger", "to": "add", "label": "contains"},
        {"id": "e3", "from": "logger", "to": "catch", "label": "contains"},
        {"id": "e4", "from": "logger", "to": "bind", "label": "contains"},
        {"id": "e5", "from": "add", "to": "serialize", "label": "uses"},
        {"id": "e6", "from": "add", "to": "rotation", "label": "uses"},
        {"id": "e7", "from": "bind", "to": "logger", "label": "returns"}
      ]
    },
    "tasks": [
      {
        "id": "basic-setup",
        "title": "Replace print statements with proper logging",
        "difficulty": "beginner",
        "steps": [
          {"label": "Zero-config usage", "code": "from loguru import logger\n\nlogger.debug('Debugging value: {}', some_var)\nlogger.info('Server started on port {}', 8000)\nlogger.warning('Cache miss — fetching from DB')\nlogger.error('Failed to connect: {}', exc)\nlogger.success('All 42 records processed')"},
          {"label": "Add file sink with rotation", "code": "logger.add(\n    'logs/app.log',\n    level='INFO',\n    rotation='10 MB',   # new file when this size is hit\n    retention='7 days', # delete old files\n    compression='zip',  # compress rotated files\n)"}
        ]
      },
      {
        "id": "structured",
        "title": "Structured JSON logging for production",
        "difficulty": "intermediate",
        "steps": [
          {"label": "JSON sink for log aggregators", "code": "import sys\nfrom loguru import logger\n\nlogger.remove()  # remove default stderr handler\nlogger.add(sys.stderr, serialize=True, level='INFO')  # JSON output\nlogger.add('logs/app.json', serialize=True, rotation='1 day')\n\n# Bind request context\nreq_logger = logger.bind(request_id='abc-123', user_id=42)\nreq_logger.info('Processing payment', amount=99.99)"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 4000000, "version": "0.7.2", "repo_url": "https://github.com/Delgan/loguru", "docs_url": "https://loguru.readthedocs.io/", "pypi_url": "https://pypi.org/project/loguru/"}
  },

  {
    "id": "tenacity",
    "ecosystem": "pypi",
    "name": "tenacity",
    "summary": "Retry any Python function with exponential backoff, jitter, and custom stop conditions — three decorator lines replace 30 lines of retry logic.",
    "tags": ["retry", "resilience", "async", "networking", "devtools"],
    "difficulty": 1,
    "story": {
      "problem": "External APIs fail. Network calls time out. Databases hiccup. Without retry logic, your application crashes on the first transient failure. Writing retry loops by hand is repetitive, error-prone, and hard to configure correctly.",
      "mental_model": "tenacity decorates your function with retry behavior. You declare when to stop (max attempts, timeout), how to wait between attempts (fixed, exponential, random), and what to retry on (exception types, return values). The decorator handles the loop, logging, and re-raising.",
      "when_to_use": "Any I/O that can fail transiently: HTTP calls, database queries, queue operations, cloud API calls, file system operations on network drives.",
      "when_not_to_use": "Don't retry non-idempotent operations (POST that creates resources) without careful thought. Don't retry errors that won't resolve with time (auth failures, 400 Bad Request).",
      "alternatives": [
        {"name": "backoff", "reason": "Similar purpose, slightly simpler API"},
        {"name": "stamina", "reason": "Newer, opinionated, includes instrumentation"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "tenacity", "type": "module", "label": "tenacity", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "retry", "type": "function", "label": "@retry", "summary": "Main decorator — wraps a function with retry logic", "difficulty": 1, "tags": ["core"]},
        {"id": "stop_after_attempt", "type": "function", "label": "stop_after_attempt()", "summary": "Stop after N failures", "difficulty": 1, "tags": ["stop"]},
        {"id": "wait_exponential", "type": "function", "label": "wait_exponential()", "summary": "Exponential backoff — doubles wait each attempt", "signature": "wait_exponential(multiplier=1, min=1, max=10)", "difficulty": 1, "tags": ["wait"]},
        {"id": "retry_if_exception", "type": "function", "label": "retry_if_exception_type()", "summary": "Only retry on specific exception types", "difficulty": 2, "tags": ["condition"]},
        {"id": "wait_random", "type": "function", "label": "wait_random()", "summary": "Random jitter — prevents thundering herd", "signature": "wait_random(min=0, max=2)", "difficulty": 2, "tags": ["wait"]},
        {"id": "before_sleep", "type": "concept", "label": "before_sleep callback", "summary": "Hook called before each sleep — good for logging", "difficulty": 2, "tags": ["observability"]}
      ],
      "edges": [
        {"id": "e1", "from": "tenacity", "to": "retry", "label": "contains"},
        {"id": "e2", "from": "retry", "to": "stop_after_attempt", "label": "uses"},
        {"id": "e3", "from": "retry", "to": "wait_exponential", "label": "uses"},
        {"id": "e4", "from": "retry", "to": "retry_if_exception", "label": "uses"},
        {"id": "e5", "from": "wait_exponential", "to": "wait_random", "label": "uses"},
        {"id": "e6", "from": "retry", "to": "before_sleep", "label": "uses"},
        {"id": "e7", "from": "retry", "to": "wait_random", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "basic-retry",
        "title": "Retry an API call with exponential backoff",
        "difficulty": "beginner",
        "steps": [
          {"label": "Basic retry decorator", "code": "from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type\nimport httpx\n\n@retry(\n    stop=stop_after_attempt(3),\n    wait=wait_exponential(multiplier=1, min=1, max=10),\n    retry=retry_if_exception_type(httpx.HTTPError),\n)\ndef fetch_data(url: str) -> dict:\n    response = httpx.get(url, timeout=5)\n    response.raise_for_status()\n    return response.json()\n\n# Will retry up to 3 times with 1s, 2s, 4s delays\ndata = fetch_data('https://api.example.com/data')"}
        ]
      },
      {
        "id": "async-retry",
        "title": "Retry an async function",
        "difficulty": "beginner",
        "steps": [
          {"label": "Async retry", "code": "from tenacity import retry, stop_after_attempt, wait_random_exponential, before_sleep_log\nimport logging\nimport asyncio\nimport httpx\n\nlogger = logging.getLogger(__name__)\n\n@retry(\n    stop=stop_after_attempt(5),\n    wait=wait_random_exponential(min=1, max=30),  # jitter prevents thundering herd\n    before_sleep=before_sleep_log(logger, logging.WARNING),\n)\nasync def fetch_async(url: str) -> dict:\n    async with httpx.AsyncClient() as client:\n        r = await client.get(url, timeout=10)\n        r.raise_for_status()\n        return r.json()"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 5000000, "version": "8.5.0", "repo_url": "https://github.com/jd/tenacity", "docs_url": "https://tenacity.readthedocs.io/", "pypi_url": "https://pypi.org/project/tenacity/"}
  },

  {
    "id": "pymongo",
    "ecosystem": "pypi",
    "name": "pymongo",
    "summary": "Official MongoDB driver for Python — insert, query, update, and aggregate documents with a Pythonic API.",
    "tags": ["database", "mongodb", "nosql", "async"],
    "difficulty": 2,
    "story": {
      "problem": "You're using MongoDB and need to interact with it from Python. Whether it's inserting documents, running complex aggregation pipelines, or managing indexes, you need a driver that maps naturally to Python dicts.",
      "mental_model": "MongoDB documents are JSON objects. pymongo maps them to Python dicts. A MongoClient connects to the cluster, you select a database and collection like attribute access (client.mydb.users), then call methods like .insert_one(), .find(), .update_many(). Aggregation pipelines are just lists of stage dicts.",
      "when_to_use": "Applications already using MongoDB, document-oriented data (nested objects, variable schemas), rapid prototyping where schema flexibility matters, storing unstructured data like logs or events.",
      "when_not_to_use": "When you need strong ACID transactions across many documents (use PostgreSQL), when your data is highly relational, or when you want an ORM-style interface (use Motor + Beanie for async).",
      "alternatives": [
        {"name": "motor", "reason": "Async MongoDB driver built on pymongo, for FastAPI/asyncio apps"},
        {"name": "mongoengine", "reason": "ODM (ORM-like) layer on top of pymongo"},
        {"name": "beanie", "reason": "Async ODM built on Motor, Pydantic integration"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "pymongo", "type": "module", "label": "pymongo", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "mongoclient", "type": "class", "label": "MongoClient", "summary": "Connection to MongoDB server or cluster", "difficulty": 1, "tags": ["connection"]},
        {"id": "database", "type": "class", "label": "Database", "summary": "Accessed via client.dbname", "difficulty": 1, "tags": ["schema"]},
        {"id": "collection", "type": "class", "label": "Collection", "summary": "A set of documents — accessed via db.collname", "difficulty": 1, "tags": ["schema"]},
        {"id": "insert", "type": "function", "label": "insert_one/many()", "summary": "Insert one or multiple documents", "difficulty": 1, "tags": ["write"]},
        {"id": "find", "type": "function", "label": "find() / find_one()", "summary": "Query documents with filter dict", "difficulty": 1, "tags": ["read"]},
        {"id": "update", "type": "function", "label": "update_one/many()", "summary": "Update documents matching a filter", "difficulty": 2, "tags": ["write"]},
        {"id": "aggregate", "type": "function", "label": "aggregate()", "summary": "Run aggregation pipeline — group, sort, join, etc.", "difficulty": 3, "tags": ["aggregation"]}
      ],
      "edges": [
        {"id": "e1", "from": "pymongo", "to": "mongoclient", "label": "contains"},
        {"id": "e2", "from": "mongoclient", "to": "database", "label": "returns"},
        {"id": "e3", "from": "database", "to": "collection", "label": "returns"},
        {"id": "e4", "from": "collection", "to": "insert", "label": "contains"},
        {"id": "e5", "from": "collection", "to": "find", "label": "contains"},
        {"id": "e6", "from": "collection", "to": "update", "label": "contains"},
        {"id": "e7", "from": "collection", "to": "aggregate", "label": "contains"},
        {"id": "e8", "from": "aggregate", "to": "find", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "crud",
        "title": "Basic CRUD operations",
        "difficulty": "beginner",
        "steps": [
          {"label": "Connect and insert", "code": "from pymongo import MongoClient\n\nclient = MongoClient('mongodb://localhost:27017/')\ndb = client.myapp\nusers = db.users\n\n# Insert\nresult = users.insert_one({'name': 'Alice', 'email': 'alice@example.com', 'age': 30})\nprint(result.inserted_id)"},
          {"label": "Query and update", "code": "# Find one\nuser = users.find_one({'email': 'alice@example.com'})\nprint(user['name'])\n\n# Find many\nfor u in users.find({'age': {'$gte': 18}}).sort('name').limit(10):\n    print(u['name'])\n\n# Update\nusers.update_one(\n    {'email': 'alice@example.com'},\n    {'$set': {'age': 31}, '$push': {'logins': '2024-01-15'}}\n)"}
        ]
      },
      {
        "id": "aggregation",
        "title": "Aggregation pipeline",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Group and count", "code": "pipeline = [\n    {'$match': {'status': 'active'}},\n    {'$group': {\n        '_id': '$country',\n        'count': {'$sum': 1},\n        'avg_age': {'$avg': '$age'}\n    }},\n    {'$sort': {'count': -1}},\n    {'$limit': 10}\n]\n\nfor result in users.aggregate(pipeline):\n    print(f\"{result['_id']}: {result['count']} users, avg age {result['avg_age']:.1f}\")"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 3500000, "version": "4.10.1", "repo_url": "https://github.com/mongodb/mongo-python-driver", "docs_url": "https://pymongo.readthedocs.io/", "pypi_url": "https://pypi.org/project/pymongo/"}
  },

  {
    "id": "arrow",
    "ecosystem": "pypi",
    "name": "arrow",
    "summary": "Better dates and times in Python — timezone-aware by default, human-friendly API, and natural language parsing.",
    "tags": ["datetime", "timezone", "parsing", "utilities"],
    "difficulty": 1,
    "story": {
      "problem": "Python's datetime module is powerful but verbose and error-prone — especially with timezones, parsing, and humanizing. Getting 'now in UTC' requires three lines; parsing 'next Monday' is not built-in at all.",
      "mental_model": "Arrow wraps Python datetime into a single object that's always timezone-aware. You use arrow.now() instead of datetime.now(timezone.utc). Shifting time uses .shift(hours=+3). Converting to string is .format() or .humanize() ('3 hours ago').",
      "when_to_use": "Any application dealing with dates across timezones, relative time displays ('posted 2 days ago'), date parsing from strings, date range iteration, or when you want less boilerplate than stdlib datetime.",
      "when_not_to_use": "High-frequency numerical date computations (use numpy datetime64 or pandas Timestamp which are faster). Arrow adds overhead per operation.",
      "alternatives": [
        {"name": "pendulum", "reason": "Similar API but stricter, better DST handling"},
        {"name": "dateutil", "reason": "Powerful parsing and relative dates, stdlib-compatible"},
        {"name": "datetime", "reason": "Zero dependency, fine for simple UTC-only work"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "arrow_mod", "type": "module", "label": "arrow", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "arrowtype", "type": "class", "label": "Arrow", "summary": "The main datetime object — timezone-aware always", "difficulty": 1, "tags": ["core"]},
        {"id": "now", "type": "function", "label": "arrow.now()", "summary": "Current time in any timezone", "signature": "now(tz='local')", "difficulty": 1, "tags": ["creation"]},
        {"id": "get", "type": "function", "label": "arrow.get()", "summary": "Parse from string, timestamp, datetime, etc.", "signature": "get(*args, **kwargs)", "difficulty": 1, "tags": ["parsing"]},
        {"id": "shift", "type": "function", "label": ".shift()", "summary": "Add or subtract time units", "signature": "shift(years=0, months=0, days=0, hours=0)", "difficulty": 1, "tags": ["arithmetic"]},
        {"id": "humanize", "type": "function", "label": ".humanize()", "summary": "Convert to human-readable relative string", "signature": "humanize(other=None, locale='en')", "difficulty": 1, "tags": ["formatting"]},
        {"id": "convert", "type": "function", "label": ".to()", "summary": "Convert to another timezone", "signature": "to(tz)", "difficulty": 1, "tags": ["timezone"]}
      ],
      "edges": [
        {"id": "e1", "from": "arrow_mod", "to": "arrowtype", "label": "contains"},
        {"id": "e2", "from": "arrow_mod", "to": "now", "label": "contains"},
        {"id": "e3", "from": "arrow_mod", "to": "get", "label": "contains"},
        {"id": "e4", "from": "now", "to": "arrowtype", "label": "returns"},
        {"id": "e5", "from": "get", "to": "arrowtype", "label": "returns"},
        {"id": "e6", "from": "arrowtype", "to": "shift", "label": "contains"},
        {"id": "e7", "from": "arrowtype", "to": "humanize", "label": "contains"},
        {"id": "e8", "from": "arrowtype", "to": "convert", "label": "contains"}
      ]
    },
    "tasks": [
      {
        "id": "basic",
        "title": "Common date operations",
        "difficulty": "beginner",
        "steps": [
          {"label": "Create and manipulate dates", "code": "import arrow\n\nnow = arrow.now('UTC')           # 2024-01-15T10:30:00+00:00\nnow_local = arrow.now('US/Eastern')  # auto timezone-aware\n\npast = now.shift(days=-7)        # one week ago\nfuture = now.shift(months=+2, days=+3)\n\nprint(now.format('YYYY-MM-DD HH:mm:ss ZZ'))\nprint(past.humanize())           # 'a week ago'\nprint(future.humanize())         # 'in 2 months'"},
          {"label": "Parse from string", "code": "dt = arrow.get('2024-01-15 10:30', 'YYYY-MM-DD HH:mm')\nutc = dt.to('UTC')\nnew_york = dt.to('America/New_York')\ntokyo = dt.to('Asia/Tokyo')\nprint(new_york.format(), '→', tokyo.format())"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 2500000, "version": "1.3.0", "repo_url": "https://github.com/arrow-py/arrow", "docs_url": "https://arrow.readthedocs.io/", "pypi_url": "https://pypi.org/project/arrow/"}
  },

  {
    "id": "httpx",
    "ecosystem": "pypi",
    "name": "httpx",
    "summary": "A modern HTTP client for Python with async support, HTTP/2, type hints, and a requests-compatible API.",
    "tags": ["http", "async", "api-client", "networking"],
    "difficulty": 1,
    "story": {
      "problem": "requests is great for sync HTTP but has no async support. aiohttp is async-first but has a different API. You want one library that does both, supports HTTP/2, has type hints, and feels familiar.",
      "mental_model": "httpx mirrors requests's API: httpx.get(url), response.json(), response.raise_for_status(). But it also has an AsyncClient for use with asyncio. The Client object (sync) or AsyncClient (async) should be reused — they maintain connection pools. Use them as context managers.",
      "when_to_use": "Modern Python APIs, FastAPI testing (httpx powers TestClient), async web scraping, any code that might need to switch between sync and async, or where you want HTTP/2 support.",
      "when_not_to_use": "Simple scripts where requests works fine — httpx has more dependencies. Or when you need advanced websocket support.",
      "alternatives": [
        {"name": "requests", "reason": "Simpler, sync-only, huge ecosystem of extensions"},
        {"name": "aiohttp", "reason": "Async-first, better for high-concurrency async scraping"},
        {"name": "ky", "reason": "npm equivalent — fetch-based with retries"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "httpx_mod", "type": "module", "label": "httpx", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "client", "type": "class", "label": "Client", "summary": "Sync HTTP client — reuse for connection pooling", "difficulty": 1, "tags": ["sync"]},
        {"id": "asyncclient", "type": "class", "label": "AsyncClient", "summary": "Async HTTP client for use with asyncio", "difficulty": 2, "tags": ["async"]},
        {"id": "get", "type": "function", "label": "client.get()", "summary": "HTTP GET request", "signature": "get(url, params=None, headers=None, timeout=None)", "difficulty": 1, "tags": ["requests"]},
        {"id": "post", "type": "function", "label": "client.post()", "summary": "HTTP POST with JSON, form, or file data", "signature": "post(url, json=None, data=None, files=None)", "difficulty": 1, "tags": ["requests"]},
        {"id": "response", "type": "class", "label": "Response", "summary": "HTTP response with .json(), .text, .status_code", "difficulty": 1, "tags": ["response"]},
        {"id": "transport", "type": "concept", "label": "Transport / HTTP2", "summary": "Enable HTTP/2 via httpx.AsyncHTTPTransport(http2=True)", "difficulty": 3, "tags": ["advanced"]}
      ],
      "edges": [
        {"id": "e1", "from": "httpx_mod", "to": "client", "label": "contains"},
        {"id": "e2", "from": "httpx_mod", "to": "asyncclient", "label": "contains"},
        {"id": "e3", "from": "client", "to": "get", "label": "contains"},
        {"id": "e4", "from": "client", "to": "post", "label": "contains"},
        {"id": "e5", "from": "get", "to": "response", "label": "returns"},
        {"id": "e6", "from": "post", "to": "response", "label": "returns"},
        {"id": "e7", "from": "asyncclient", "to": "transport", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "basic-requests",
        "title": "Make HTTP requests (sync)",
        "difficulty": "beginner",
        "steps": [
          {"label": "GET and POST", "code": "import httpx\n\n# Quick one-off (creates+destroys client each time)\nresponse = httpx.get('https://api.github.com/repos/encode/httpx')\nprint(response.status_code, response.json()['stargazers_count'])\n\n# Reusable client (better — shares connection pool)\nwith httpx.Client(base_url='https://api.github.com', timeout=10) as client:\n    r = client.get('/repos/encode/httpx')\n    r.raise_for_status()\n    data = r.json()"}
        ]
      },
      {
        "id": "async",
        "title": "Fetch multiple URLs concurrently",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Concurrent async requests", "code": "import asyncio\nimport httpx\n\nurls = [\n    'https://api.github.com/repos/encode/httpx',\n    'https://api.github.com/repos/tiangolo/fastapi',\n    'https://api.github.com/repos/pydantic/pydantic',\n]\n\nasync def fetch_all(urls):\n    async with httpx.AsyncClient(timeout=15) as client:\n        tasks = [client.get(url) for url in urls]\n        responses = await asyncio.gather(*tasks)\n        return [r.json()['stargazers_count'] for r in responses]\n\nstars = asyncio.run(fetch_all(urls))\nprint(stars)"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 20000000, "version": "0.28.0", "repo_url": "https://github.com/encode/httpx", "docs_url": "https://www.python-httpx.org/", "pypi_url": "https://pypi.org/project/httpx/"}
  },

  {
    "id": "pendulum",
    "ecosystem": "pypi",
    "name": "pendulum",
    "summary": "Drop-in datetime replacement with first-class timezone support, DST awareness, and intuitive arithmetic.",
    "tags": ["datetime", "timezone", "utilities", "parsing"],
    "difficulty": 1,
    "story": {
      "problem": "Timezone handling in Python is notoriously tricky — DST transitions, ambiguous local times, and converting between zones are error-prone with stdlib. You want a datetime object that just does the right thing.",
      "mental_model": "pendulum.DateTime is a subclass of Python's datetime — so it works anywhere datetime does. pendulum.now() always returns a timezone-aware object. Arithmetic respects DST. You get .diff() for precise durations and .in_timezone() for safe conversions.",
      "when_to_use": "Scheduling apps, calendar features, time-series data across timezones, any app where DST bugs would be costly.",
      "when_not_to_use": "Simple UTC-only timestamps where datetime.now(timezone.utc) is sufficient. pendulum is heavier than stdlib.",
      "alternatives": [
        {"name": "arrow", "reason": "More humanize features, slightly simpler API"},
        {"name": "dateutil", "reason": "Stdlib-compatible, great for parsing"},
        {"name": "datetime", "reason": "Zero dep for simple cases"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "pendulum_mod", "type": "module", "label": "pendulum", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "datetime_cls", "type": "class", "label": "DateTime", "summary": "Enhanced datetime subclass — always timezone-aware", "difficulty": 1, "tags": ["core"]},
        {"id": "now", "type": "function", "label": "pendulum.now()", "summary": "Current time, always timezone-aware", "difficulty": 1, "tags": ["creation"]},
        {"id": "parse", "type": "function", "label": "pendulum.parse()", "summary": "Parse ISO 8601 strings strictly", "difficulty": 1, "tags": ["parsing"]},
        {"id": "in_timezone", "type": "function", "label": ".in_timezone()", "summary": "Convert to another timezone safely", "difficulty": 1, "tags": ["timezone"]},
        {"id": "diff", "type": "function", "label": ".diff()", "summary": "Precise difference as a Duration object", "difficulty": 2, "tags": ["arithmetic"]},
        {"id": "period", "type": "class", "label": "Period", "summary": "Represents a span between two datetimes, iterable by unit", "difficulty": 2, "tags": ["range"]}
      ],
      "edges": [
        {"id": "e1", "from": "pendulum_mod", "to": "datetime_cls", "label": "contains"},
        {"id": "e2", "from": "pendulum_mod", "to": "now", "label": "contains"},
        {"id": "e3", "from": "pendulum_mod", "to": "parse", "label": "contains"},
        {"id": "e4", "from": "now", "to": "datetime_cls", "label": "returns"},
        {"id": "e5", "from": "parse", "to": "datetime_cls", "label": "returns"},
        {"id": "e6", "from": "datetime_cls", "to": "in_timezone", "label": "contains"},
        {"id": "e7", "from": "datetime_cls", "to": "diff", "label": "contains"},
        {"id": "e8", "from": "diff", "to": "period", "label": "returns"}
      ]
    },
    "tasks": [
      {
        "id": "timezone",
        "title": "Work with timezones safely",
        "difficulty": "beginner",
        "steps": [
          {"label": "Create and convert", "code": "import pendulum\n\nnow_utc = pendulum.now('UTC')\nnow_nyc = now_utc.in_timezone('America/New_York')\nnow_tok = now_utc.in_timezone('Asia/Tokyo')\n\nprint(now_utc.to_iso8601_string())\nprint(now_nyc.format('ddd MMM D, h:mm A zz'))\n\n# Arithmetic respects DST\nmeetingtime = pendulum.datetime(2024, 3, 10, 12, 0, 0, tz='America/New_York')\nday_later = meetingtime.add(days=1)  # correctly crosses DST boundary"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 2000000, "version": "3.0.0", "repo_url": "https://github.com/sdispater/pendulum", "docs_url": "https://pendulum.eustace.io/docs/", "pypi_url": "https://pypi.org/project/pendulum/"}
  },

  # ── npm ──────────────────────────────────────────────────────────────────
  {
    "id": "three",
    "ecosystem": "npm",
    "name": "three",
    "summary": "3D graphics in the browser — WebGL-powered scenes, lights, cameras, and geometries with a beginner-friendly JavaScript API.",
    "tags": ["3d", "webgl", "graphics", "animation", "canvas"],
    "difficulty": 3,
    "story": {
      "problem": "WebGL is powerful but requires hundreds of lines of raw GLSL/JS just to render a triangle. You want to build 3D scenes — rotating objects, lighting, cameras, particle systems — without managing GPU state machines directly.",
      "mental_model": "Think of three.js as a scene graph. You create a Scene, add Meshes (geometry + material), position a Camera, and render with WebGLRenderer. The animation loop calls renderer.render(scene, camera) on every frame. Everything is a mathematical object: Vector3, Quaternion, Matrix4.",
      "when_to_use": "3D product viewers, data visualizations in 3D, games, interactive art, generative design, architecture visualization, any WebGL experience.",
      "when_not_to_use": "2D graphics (use canvas API or SVG), simple CSS animations, when you need a full game engine (use Babylon.js or Unity WebGL).",
      "alternatives": [
        {"name": "react-three-fiber", "reason": "React bindings for three.js — declarative scene graph"},
        {"name": "babylon.js", "reason": "Full game engine, more batteries included"},
        {"name": "p5.js", "reason": "Creative coding, 2D/simple 3D, easier for beginners"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "three_mod", "type": "module", "label": "three", "summary": "Package root, exports all core classes", "difficulty": 1, "tags": ["core"]},
        {"id": "scene", "type": "class", "label": "Scene", "summary": "Container for all 3D objects", "difficulty": 1, "tags": ["core"]},
        {"id": "camera", "type": "class", "label": "PerspectiveCamera", "summary": "Camera with field-of-view — most common type", "difficulty": 1, "tags": ["core"]},
        {"id": "renderer", "type": "class", "label": "WebGLRenderer", "summary": "Renders scene to a canvas element", "difficulty": 1, "tags": ["rendering"]},
        {"id": "mesh", "type": "class", "label": "Mesh", "summary": "Geometry + Material = visible 3D object", "difficulty": 1, "tags": ["objects"]},
        {"id": "geometry", "type": "class", "label": "BoxGeometry / SphereGeometry", "summary": "Define the shape of a mesh", "difficulty": 1, "tags": ["geometry"]},
        {"id": "material", "type": "class", "label": "MeshStandardMaterial", "summary": "PBR material that responds to lights", "difficulty": 2, "tags": ["materials"]},
        {"id": "light", "type": "class", "label": "DirectionalLight / AmbientLight", "summary": "Light sources that illuminate materials", "difficulty": 2, "tags": ["lighting"]},
        {"id": "animloop", "type": "concept", "label": "Animation Loop", "summary": "requestAnimationFrame loop calling renderer.render() each frame", "difficulty": 1, "tags": ["animation"]}
      ],
      "edges": [
        {"id": "e1", "from": "three_mod", "to": "scene", "label": "contains"},
        {"id": "e2", "from": "three_mod", "to": "camera", "label": "contains"},
        {"id": "e3", "from": "three_mod", "to": "renderer", "label": "contains"},
        {"id": "e4", "from": "scene", "to": "mesh", "label": "contains"},
        {"id": "e5", "from": "mesh", "to": "geometry", "label": "uses"},
        {"id": "e6", "from": "mesh", "to": "material", "label": "uses"},
        {"id": "e7", "from": "scene", "to": "light", "label": "contains"},
        {"id": "e8", "from": "material", "to": "light", "label": "uses"},
        {"id": "e9", "from": "renderer", "to": "animloop", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "spinning-cube",
        "title": "Render a spinning cube",
        "difficulty": "beginner",
        "steps": [
          {"label": "Set up scene, camera, renderer", "code": "import * as THREE from 'three';\n\nconst scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);\ncamera.position.z = 5;\n\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(window.innerWidth, window.innerHeight);\nrenderer.setPixelRatio(window.devicePixelRatio);\ndocument.body.appendChild(renderer.domElement);"},
          {"label": "Add a lit cube and animate", "code": "const geometry = new THREE.BoxGeometry(1, 1, 1);\nconst material = new THREE.MeshStandardMaterial({ color: 0x6366f1 });\nconst cube = new THREE.Mesh(geometry, material);\nscene.add(cube);\n\nscene.add(new THREE.AmbientLight(0xffffff, 0.5));\nconst dirLight = new THREE.DirectionalLight(0xffffff, 1);\ndirLight.position.set(5, 5, 5);\nscene.add(dirLight);\n\nfunction animate() {\n  requestAnimationFrame(animate);\n  cube.rotation.x += 0.01;\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n}\nanimate();"}
        ]
      },
      {
        "id": "gltf-model",
        "title": "Load and display a 3D model (GLTF)",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Use GLTFLoader", "code": "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';\n\nconst loader = new GLTFLoader();\nloader.load(\n  '/models/scene.gltf',\n  (gltf) => {\n    scene.add(gltf.scene);\n    gltf.scene.scale.set(0.5, 0.5, 0.5);\n    animate();\n  },\n  (progress) => console.log((progress.loaded / progress.total * 100) + '% loaded'),\n  (error) => console.error('Load error:', error)\n);"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 3000000, "version": "0.170.0", "repo_url": "https://github.com/mrdoob/three.js", "docs_url": "https://threejs.org/docs/", "npm_url": "https://www.npmjs.com/package/three"}
  },

  {
    "id": "d3",
    "ecosystem": "npm",
    "name": "d3",
    "summary": "The most powerful data visualization library for the web — bind data to SVG/Canvas elements and transform them with scales, axes, and layouts.",
    "tags": ["visualization", "svg", "charts", "data-science", "animation"],
    "difficulty": 3,
    "story": {
      "problem": "You need a chart that no charting library supports, or you want complete control over every pixel of your visualization. Libraries like Chart.js or Recharts are constrained — d3 gives you the raw building blocks.",
      "mental_model": "d3 is not a charting library — it's a DOM manipulation + data transformation toolkit. The core pattern: select elements, bind data (.data()), then enter/update/exit the joined selection. Built-in: scales (map data domain → visual range), axes, shape generators, and force/tree/hierarchy layouts.",
      "when_to_use": "Custom visualizations that no library supports, journalism/scrollytelling data stories, network graphs, geo maps, animated transitions between data states, or when you need to own every detail.",
      "when_not_to_use": "Standard bar/line/pie charts in a product (use Recharts or Chart.js — they're 10x faster to implement). d3's learning curve is steep.",
      "alternatives": [
        {"name": "recharts", "reason": "React chart library built on d3, much easier for standard charts"},
        {"name": "chart.js", "reason": "Canvas-based, easy to use, standard chart types"},
        {"name": "observable-plot", "reason": "From d3 creator, high-level grammar-of-graphics API"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "d3_mod", "type": "module", "label": "d3", "summary": "Umbrella package re-exporting all d3 submodules", "difficulty": 1, "tags": ["core"]},
        {"id": "select", "type": "function", "label": "d3.select() / selectAll()", "summary": "Select DOM elements, returns d3 selection", "difficulty": 1, "tags": ["dom"]},
        {"id": "data_join", "type": "concept", "label": "Data Join", "summary": ".data() binds array to selection, .enter()/.exit() handle add/remove", "difficulty": 3, "tags": ["core"]},
        {"id": "scale", "type": "function", "label": "d3.scaleLinear() etc.", "summary": "Map data domain to visual range (px, color, etc.)", "difficulty": 2, "tags": ["scales"]},
        {"id": "axis", "type": "function", "label": "d3.axisBottom() etc.", "summary": "Generate SVG axis from a scale", "difficulty": 2, "tags": ["axes"]},
        {"id": "line_gen", "type": "function", "label": "d3.line()", "summary": "Generate SVG path d attribute from data array", "difficulty": 2, "tags": ["shapes"]},
        {"id": "transition", "type": "function", "label": ".transition()", "summary": "Animate changes smoothly with easing functions", "difficulty": 2, "tags": ["animation"]},
        {"id": "force", "type": "function", "label": "d3.forceSimulation()", "summary": "Physics-based force layout for network graphs", "difficulty": 3, "tags": ["layout"]}
      ],
      "edges": [
        {"id": "e1", "from": "d3_mod", "to": "select", "label": "contains"},
        {"id": "e2", "from": "select", "to": "data_join", "label": "uses"},
        {"id": "e3", "from": "d3_mod", "to": "scale", "label": "contains"},
        {"id": "e4", "from": "d3_mod", "to": "axis", "label": "contains"},
        {"id": "e5", "from": "axis", "to": "scale", "label": "uses"},
        {"id": "e6", "from": "d3_mod", "to": "line_gen", "label": "contains"},
        {"id": "e7", "from": "line_gen", "to": "scale", "label": "uses"},
        {"id": "e8", "from": "select", "to": "transition", "label": "contains"},
        {"id": "e9", "from": "d3_mod", "to": "force", "label": "contains"}
      ]
    },
    "tasks": [
      {
        "id": "bar-chart",
        "title": "Build a bar chart from data",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Set up SVG and scales", "code": "import * as d3 from 'd3';\n\nconst data = [30, 80, 45, 60, 20, 90, 55];\nconst width = 400, height = 200, margin = { top: 10, right: 10, bottom: 20, left: 30 };\n\nconst svg = d3.select('#chart').append('svg')\n  .attr('width', width).attr('height', height);\n\nconst x = d3.scaleBand().domain(d3.range(data.length)).range([margin.left, width - margin.right]).padding(0.1);\nconst y = d3.scaleLinear().domain([0, d3.max(data)]).range([height - margin.bottom, margin.top]);"},
          {"label": "Draw bars and axes", "code": "// Bars\nsvg.selectAll('rect')\n  .data(data)\n  .join('rect')\n    .attr('x', (d, i) => x(i))\n    .attr('y', d => y(d))\n    .attr('width', x.bandwidth())\n    .attr('height', d => y(0) - y(d))\n    .attr('fill', 'steelblue');\n\n// Axes\nsvg.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x));\nsvg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y));"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 5000000, "version": "7.9.0", "repo_url": "https://github.com/d3/d3", "docs_url": "https://d3js.org/", "npm_url": "https://www.npmjs.com/package/d3"}
  },

  {
    "id": "framer-motion",
    "ecosystem": "npm",
    "name": "framer-motion",
    "summary": "Production-ready animations and gestures for React — declarative, physics-based, with layout animations and exit transitions.",
    "tags": ["animation", "react", "gestures", "ui", "motion"],
    "difficulty": 2,
    "story": {
      "problem": "CSS animations are hard to coordinate with React state. You want animations that respond to data changes, animate elements in/out, drag gestures, shared element transitions, and scroll-linked effects — all without managing timelines manually.",
      "mental_model": "Replace any HTML element with its motion equivalent: <motion.div>. Add animate={{ opacity: 1, x: 0 }} and initial={{ opacity: 0, x: -20 }} and framer-motion handles the tween. AnimatePresence wraps conditionally rendered children to give them exit animations. layoutId enables shared element transitions.",
      "when_to_use": "React apps needing UI animations: page transitions, list reordering, drag-and-drop, hover effects, scroll-triggered reveals, and exit animations.",
      "when_not_to_use": "Non-React projects, performance-critical animations running at 120fps with many particles (use CSS or WebGL), or very simple opacity/transform transitions where CSS is sufficient.",
      "alternatives": [
        {"name": "motion", "reason": "The newer, framework-agnostic version of framer-motion (same team)"},
        {"name": "react-spring", "reason": "Physics-based, no keyframes — different mental model"},
        {"name": "gsap", "reason": "Framework-agnostic, more control, better for complex timelines"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "fm_mod", "type": "module", "label": "framer-motion", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "motion", "type": "function", "label": "motion.*", "summary": "Motion-enhanced HTML/SVG elements", "difficulty": 1, "tags": ["core"]},
        {"id": "animate_presence", "type": "class", "label": "AnimatePresence", "summary": "Enable exit animations for conditionally rendered children", "difficulty": 2, "tags": ["mounting"]},
        {"id": "use_animation", "type": "function", "label": "useAnimation()", "summary": "Programmatically control animations via a controls object", "difficulty": 2, "tags": ["control"]},
        {"id": "use_scroll", "type": "function", "label": "useScroll()", "summary": "Track scroll position as a MotionValue", "difficulty": 2, "tags": ["scroll"]},
        {"id": "layout_id", "type": "concept", "label": "layoutId", "summary": "Shared element transition between route/state changes", "difficulty": 3, "tags": ["layout"]},
        {"id": "drag", "type": "concept", "label": "drag prop", "summary": "Make any element draggable with constraints", "difficulty": 2, "tags": ["gestures"]},
        {"id": "variants", "type": "concept", "label": "Variants", "summary": "Named animation states that cascade to children", "difficulty": 2, "tags": ["orchestration"]}
      ],
      "edges": [
        {"id": "e1", "from": "fm_mod", "to": "motion", "label": "contains"},
        {"id": "e2", "from": "fm_mod", "to": "animate_presence", "label": "contains"},
        {"id": "e3", "from": "motion", "to": "variants", "label": "uses"},
        {"id": "e4", "from": "motion", "to": "drag", "label": "uses"},
        {"id": "e5", "from": "motion", "to": "layout_id", "label": "uses"},
        {"id": "e6", "from": "animate_presence", "to": "motion", "label": "contains"},
        {"id": "e7", "from": "use_scroll", "to": "motion", "label": "uses"},
        {"id": "e8", "from": "use_animation", "to": "motion", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "fade-slide",
        "title": "Fade and slide in on mount",
        "difficulty": "beginner",
        "steps": [
          {"label": "Basic motion element", "code": "import { motion } from 'framer-motion';\n\nexport function Card({ title, content }) {\n  return (\n    <motion.div\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      transition={{ duration: 0.4, ease: 'easeOut' }}\n      className=\"bg-white rounded-xl p-6 shadow\"\n    >\n      <h2>{title}</h2>\n      <p>{content}</p>\n    </motion.div>\n  );\n}"}
        ]
      },
      {
        "id": "list-animation",
        "title": "Stagger-animate a list of items",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Variants with stagger", "code": "import { motion, AnimatePresence } from 'framer-motion';\n\nconst container = {\n  hidden: {},\n  show: { transition: { staggerChildren: 0.08 } }\n};\nconst item = {\n  hidden: { opacity: 0, x: -16 },\n  show:   { opacity: 1, x: 0 }\n};\n\nexport function List({ items }) {\n  return (\n    <motion.ul variants={container} initial='hidden' animate='show'>\n      <AnimatePresence>\n        {items.map(i => (\n          <motion.li key={i.id} variants={item} exit={{ opacity: 0, x: 16 }}>\n            {i.label}\n          </motion.li>\n        ))}\n      </AnimatePresence>\n    </motion.ul>\n  );\n}"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 7000000, "version": "12.6.2", "repo_url": "https://github.com/framer/motion", "docs_url": "https://motion.dev/docs", "npm_url": "https://www.npmjs.com/package/framer-motion"}
  },

  {
    "id": "swr",
    "ecosystem": "npm",
    "name": "swr",
    "summary": "React data fetching with stale-while-revalidate caching — one hook for all your remote data needs with automatic revalidation.",
    "tags": ["react", "data-fetching", "caching", "hooks", "async"],
    "difficulty": 1,
    "story": {
      "problem": "Fetching data in React requires useEffect + useState + loading/error states — repeated in every component. You also need caching, deduplication (don't fetch the same key twice), automatic refetch on focus, and cache invalidation after mutations.",
      "mental_model": "SWR's core idea: const { data, error, isLoading } = useSWR(key, fetcher). The key is a unique string (usually the URL). The fetcher is your async function. SWR caches by key — the same key anywhere in your app shares data instantly. On focus or network reconnect, it silently revalidates in the background.",
      "when_to_use": "Read-heavy React apps: dashboards, profiles, lists. When you want simple cache-first data with background refresh. When components far apart need to share server data without prop drilling.",
      "when_not_to_use": "Complex mutation workflows with optimistic updates and rollbacks (react-query/TanStack Query is more powerful for this). Server-side rendering where you need full control over data fetching timing.",
      "alternatives": [
        {"name": "react-query", "reason": "More powerful: built-in mutations, infinite queries, devtools, offline support"},
        {"name": "RTK Query", "reason": "If you're already using Redux Toolkit"},
        {"name": "Apollo Client", "reason": "If your API is GraphQL"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "swr_mod", "type": "module", "label": "swr", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "useSWR", "type": "function", "label": "useSWR()", "summary": "Main hook — key + fetcher → { data, error, isLoading }", "difficulty": 1, "tags": ["core"]},
        {"id": "mutate", "type": "function", "label": "mutate()", "summary": "Trigger revalidation or optimistic update for a key", "difficulty": 2, "tags": ["mutations"]},
        {"id": "swrconfig", "type": "class", "label": "SWRConfig", "summary": "Provider for global fetcher, cache, and options", "difficulty": 2, "tags": ["config"]},
        {"id": "useSWRInfinite", "type": "function", "label": "useSWRInfinite()", "summary": "Paginated/infinite scroll data fetching", "difficulty": 2, "tags": ["pagination"]},
        {"id": "revalidation", "type": "concept", "label": "Revalidation", "summary": "Auto-refetch on focus, network recovery, or interval", "difficulty": 1, "tags": ["caching"]},
        {"id": "deduplication", "type": "concept", "label": "Deduplication", "summary": "Same key across 100 components = 1 network request", "difficulty": 1, "tags": ["caching"]}
      ],
      "edges": [
        {"id": "e1", "from": "swr_mod", "to": "useSWR", "label": "contains"},
        {"id": "e2", "from": "swr_mod", "to": "swrconfig", "label": "contains"},
        {"id": "e3", "from": "swr_mod", "to": "useSWRInfinite", "label": "contains"},
        {"id": "e4", "from": "useSWR", "to": "mutate", "label": "returns"},
        {"id": "e5", "from": "useSWR", "to": "revalidation", "label": "uses"},
        {"id": "e6", "from": "useSWR", "to": "deduplication", "label": "uses"},
        {"id": "e7", "from": "swrconfig", "to": "useSWR", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "basic-fetch",
        "title": "Fetch and display data with loading state",
        "difficulty": "beginner",
        "steps": [
          {"label": "Basic useSWR", "code": "import useSWR from 'swr';\n\nconst fetcher = (url: string) => fetch(url).then(r => r.json());\n\nexport function UserProfile({ userId }: { userId: string }) {\n  const { data: user, error, isLoading } = useSWR(\n    `/api/users/${userId}`,\n    fetcher,\n    { revalidateOnFocus: true }\n  );\n\n  if (isLoading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error.message}</div>;\n  return <div>{user.name} — {user.email}</div>;\n}"}
        ]
      },
      {
        "id": "mutation",
        "title": "Mutate cache after an update",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Optimistic update", "code": "import useSWR, { mutate } from 'swr';\n\nasync function updateUser(id: string, data: Partial<User>) {\n  // Optimistic update — update cache immediately\n  mutate(`/api/users/${id}`, { ...currentUser, ...data }, false);\n\n  // Persist to server\n  await fetch(`/api/users/${id}`, {\n    method: 'PATCH',\n    body: JSON.stringify(data)\n  });\n\n  // Revalidate to get server truth\n  mutate(`/api/users/${id}`);\n}"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 3500000, "version": "2.3.3", "repo_url": "https://github.com/vercel/swr", "docs_url": "https://swr.vercel.app/", "npm_url": "https://www.npmjs.com/package/swr"}
  },

  {
    "id": "recharts",
    "ecosystem": "npm",
    "name": "recharts",
    "summary": "Composable charting components for React — build line, bar, pie, and area charts from SVG with a declarative JSX API.",
    "tags": ["charts", "visualization", "react", "svg", "data"],
    "difficulty": 1,
    "story": {
      "problem": "You need standard charts (line, bar, pie) in a React app. d3 is too complex. Chart.js requires imperative setup and doesn't integrate with React state naturally. You want JSX components that accept your data arrays directly.",
      "mental_model": "Recharts uses React's composability. A chart is a container (LineChart, BarChart) that accepts component children: <Line>, <Bar>, <XAxis>, <YAxis>, <Tooltip>, <Legend>. Pass your data array to the container, and specify which data key each series maps to. React handles re-renders.",
      "when_to_use": "Dashboards, analytics pages, standard business charts in React apps, any time you want good-looking charts without a steep learning curve.",
      "when_not_to_use": "Custom/unusual visualizations (use d3), non-React projects (use Chart.js), performance-critical charts with 100k+ data points (Canvas-based charts are faster).",
      "alternatives": [
        {"name": "chart.js", "reason": "Canvas-based, framework-agnostic, fast with large datasets"},
        {"name": "victory", "reason": "Also React-first, more customizable but more complex"},
        {"name": "d3", "reason": "Full control over every pixel, steeper learning curve"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "recharts_mod", "type": "module", "label": "recharts", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "linechart", "type": "class", "label": "LineChart", "summary": "Container for line/area chart composition", "difficulty": 1, "tags": ["charts"]},
        {"id": "barchart", "type": "class", "label": "BarChart", "summary": "Container for bar chart composition", "difficulty": 1, "tags": ["charts"]},
        {"id": "piechart", "type": "class", "label": "PieChart", "summary": "Container for pie/donut chart composition", "difficulty": 1, "tags": ["charts"]},
        {"id": "line", "type": "class", "label": "Line / Area", "summary": "Individual line or filled area series", "difficulty": 1, "tags": ["series"]},
        {"id": "axes", "type": "class", "label": "XAxis / YAxis", "summary": "Configurable chart axes with tick formatting", "difficulty": 1, "tags": ["axes"]},
        {"id": "tooltip", "type": "class", "label": "Tooltip", "summary": "Hover tooltip with customizable content renderer", "difficulty": 1, "tags": ["interaction"]},
        {"id": "responsive", "type": "class", "label": "ResponsiveContainer", "summary": "Wrapper that makes charts fill their parent", "difficulty": 1, "tags": ["layout"]}
      ],
      "edges": [
        {"id": "e1", "from": "recharts_mod", "to": "linechart", "label": "contains"},
        {"id": "e2", "from": "recharts_mod", "to": "barchart", "label": "contains"},
        {"id": "e3", "from": "recharts_mod", "to": "piechart", "label": "contains"},
        {"id": "e4", "from": "linechart", "to": "line", "label": "contains"},
        {"id": "e5", "from": "linechart", "to": "axes", "label": "contains"},
        {"id": "e6", "from": "linechart", "to": "tooltip", "label": "contains"},
        {"id": "e7", "from": "responsive", "to": "linechart", "label": "contains"},
        {"id": "e8", "from": "responsive", "to": "barchart", "label": "contains"}
      ]
    },
    "tasks": [
      {
        "id": "line-chart",
        "title": "Responsive line chart with tooltip",
        "difficulty": "beginner",
        "steps": [
          {"label": "Basic line chart", "code": "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';\n\nconst data = [\n  { month: 'Jan', revenue: 4200 },\n  { month: 'Feb', revenue: 5800 },\n  { month: 'Mar', revenue: 4900 },\n  { month: 'Apr', revenue: 7200 },\n];\n\nexport function RevenueChart() {\n  return (\n    <ResponsiveContainer width='100%' height={300}>\n      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>\n        <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />\n        <XAxis dataKey='month' />\n        <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />\n        <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />\n        <Line type='monotone' dataKey='revenue' stroke='#6366f1' strokeWidth={2} dot={false} />\n      </LineChart>\n    </ResponsiveContainer>\n  );\n}"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 3200000, "version": "2.15.0", "repo_url": "https://github.com/recharts/recharts", "docs_url": "https://recharts.org/en-US/api", "npm_url": "https://www.npmjs.com/package/recharts"}
  },

  {
    "id": "mongoose",
    "ecosystem": "npm",
    "name": "mongoose",
    "summary": "Elegant MongoDB object modeling for Node.js — schemas, validation, middleware, and type-safe queries.",
    "tags": ["database", "mongodb", "nosql", "orm", "schema"],
    "difficulty": 2,
    "story": {
      "problem": "MongoDB is schemaless, but your application needs structure — consistent field types, required fields, default values, and relationships. Writing raw MongoDB driver code for every query is repetitive and error-prone.",
      "mental_model": "Mongoose adds a schema layer on top of MongoDB. Define a Schema (field types, validation, defaults), create a Model from it, and query with Model.find(), Model.create(). Middleware (pre/post hooks) run before/after operations. Virtuals compute fields without storing them.",
      "when_to_use": "Node.js apps using MongoDB that need schema validation, relationships (populate), timestamps, virtuals, or reusable query helpers.",
      "when_not_to_use": "Schema-free documents where flexibility is intentional, TypeScript-first projects (consider Prisma + MongoDB or Typegoose), high-performance scenarios where the ODM overhead matters.",
      "alternatives": [
        {"name": "prisma", "reason": "Type-safe ORM with MongoDB adapter, excellent TypeScript support"},
        {"name": "typegoose", "reason": "TypeScript decorator-based mongoose schemas"},
        {"name": "pymongo", "reason": "Python equivalent — direct MongoDB driver"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "mongoose_mod", "type": "module", "label": "mongoose", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "connect", "type": "function", "label": "mongoose.connect()", "summary": "Connect to MongoDB", "difficulty": 1, "tags": ["connection"]},
        {"id": "schema", "type": "class", "label": "Schema", "summary": "Define document structure, types, and validation", "difficulty": 1, "tags": ["schema"]},
        {"id": "model", "type": "class", "label": "Model", "summary": "Compiled schema — the interface for CRUD operations", "difficulty": 1, "tags": ["model"]},
        {"id": "query", "type": "class", "label": "Query", "summary": "Chainable query builder: .where().sort().limit().exec()", "difficulty": 2, "tags": ["querying"]},
        {"id": "populate", "type": "function", "label": ".populate()", "summary": "Join referenced documents (like SQL JOIN)", "difficulty": 2, "tags": ["relations"]},
        {"id": "middleware", "type": "concept", "label": "Middleware (hooks)", "summary": "pre/post hooks on save, find, delete operations", "difficulty": 3, "tags": ["hooks"]},
        {"id": "virtual", "type": "concept", "label": "Virtuals", "summary": "Computed properties not stored in MongoDB", "difficulty": 2, "tags": ["computed"]}
      ],
      "edges": [
        {"id": "e1", "from": "mongoose_mod", "to": "connect", "label": "contains"},
        {"id": "e2", "from": "mongoose_mod", "to": "schema", "label": "contains"},
        {"id": "e3", "from": "schema", "to": "model", "label": "returns"},
        {"id": "e4", "from": "model", "to": "query", "label": "returns"},
        {"id": "e5", "from": "query", "to": "populate", "label": "contains"},
        {"id": "e6", "from": "schema", "to": "middleware", "label": "contains"},
        {"id": "e7", "from": "schema", "to": "virtual", "label": "contains"},
        {"id": "e8", "from": "model", "to": "middleware", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "define-model",
        "title": "Define a schema and model",
        "difficulty": "beginner",
        "steps": [
          {"label": "Schema definition", "code": "import mongoose, { Schema, Document } from 'mongoose';\n\ninterface IUser extends Document {\n  name: string;\n  email: string;\n  createdAt: Date;\n}\n\nconst UserSchema = new Schema<IUser>({\n  name:  { type: String, required: true, trim: true },\n  email: { type: String, required: true, unique: true, lowercase: true },\n}, { timestamps: true });\n\nexport const User = mongoose.model<IUser>('User', UserSchema);"},
          {"label": "CRUD operations", "code": "await mongoose.connect(process.env.MONGODB_URI!);\n\n// Create\nconst alice = await User.create({ name: 'Alice', email: 'alice@example.com' });\n\n// Query\nconst users = await User.find({ name: /alice/i }).sort('-createdAt').limit(10);\n\n// Update\nawait User.updateOne({ _id: alice._id }, { $set: { name: 'Alice B.' } });\n\n// Delete\nawait User.deleteOne({ _id: alice._id });"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 2500000, "version": "8.9.0", "repo_url": "https://github.com/Automattic/mongoose", "docs_url": "https://mongoosejs.com/docs/", "npm_url": "https://www.npmjs.com/package/mongoose"}
  },

  {
    "id": "gsap",
    "ecosystem": "npm",
    "name": "gsap",
    "summary": "The professional-grade JavaScript animation library — animate anything (DOM, CSS, SVG, Canvas, WebGL) with a timeline-based API.",
    "tags": ["animation", "timeline", "svg", "ui", "performance"],
    "difficulty": 2,
    "story": {
      "problem": "CSS animations struggle with complex sequences, can't animate JavaScript values or WebGL uniforms, and have no scroll synchronization. framer-motion is React-specific. You need animations that work everywhere with precise timing control.",
      "mental_model": "GSAP's core primitive is a tween: gsap.to(target, { duration, properties }). Timelines sequence tweens: const tl = gsap.timeline(); tl.to(...).to(...). ScrollTrigger pins elements and scrubs timelines to scroll position. GSAP tweens anything with a numeric property — DOM, three.js objects, plain objects.",
      "when_to_use": "Marketing landing pages, scroll-driven storytelling, complex animation sequences, SVG/logo animations, parallax effects, or any animation that needs to be framework-agnostic.",
      "when_not_to_use": "Simple React UI micro-interactions where framer-motion or CSS is simpler. GSAP's free tier doesn't include ScrollSmoother and some plugins commercially.",
      "alternatives": [
        {"name": "framer-motion", "reason": "Better React integration, declarative"},
        {"name": "motion", "reason": "Framework-agnostic successor to framer-motion"},
        {"name": "anime.js", "reason": "Lightweight free alternative for simpler cases"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "gsap_mod", "type": "module", "label": "gsap", "summary": "Core package — tween engine", "difficulty": 1, "tags": ["core"]},
        {"id": "to", "type": "function", "label": "gsap.to()", "summary": "Tween from current state to target values", "signature": "to(targets, vars)", "difficulty": 1, "tags": ["tween"]},
        {"id": "from", "type": "function", "label": "gsap.from()", "summary": "Tween from specified values to current state", "difficulty": 1, "tags": ["tween"]},
        {"id": "timeline", "type": "class", "label": "gsap.timeline()", "summary": "Sequence multiple tweens with relative timing", "difficulty": 2, "tags": ["timeline"]},
        {"id": "stagger", "type": "concept", "label": "stagger", "summary": "Delay each target in a group by an offset", "difficulty": 2, "tags": ["orchestration"]},
        {"id": "scrolltrigger", "type": "class", "label": "ScrollTrigger", "summary": "Link animations to scroll position — plugin", "difficulty": 3, "tags": ["scroll"]},
        {"id": "ease", "type": "concept", "label": "Easing", "summary": "Built-in easing: power1-4, back, elastic, bounce, custom", "difficulty": 2, "tags": ["timing"]}
      ],
      "edges": [
        {"id": "e1", "from": "gsap_mod", "to": "to", "label": "contains"},
        {"id": "e2", "from": "gsap_mod", "to": "from", "label": "contains"},
        {"id": "e3", "from": "gsap_mod", "to": "timeline", "label": "contains"},
        {"id": "e4", "from": "timeline", "to": "to", "label": "contains"},
        {"id": "e5", "from": "to", "to": "stagger", "label": "uses"},
        {"id": "e6", "from": "to", "to": "ease", "label": "uses"},
        {"id": "e7", "from": "scrolltrigger", "to": "timeline", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "sequence",
        "title": "Animate a sequence of elements",
        "difficulty": "beginner",
        "steps": [
          {"label": "Timeline sequence", "code": "import gsap from 'gsap';\n\nconst tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } });\n\ntl\n  .from('.hero-title', { opacity: 0, y: 40 })\n  .from('.hero-subtitle', { opacity: 0, y: 30 }, '-=0.3')  // overlap by 0.3s\n  .from('.hero-cta', { opacity: 0, scale: 0.9 }, '-=0.2')\n  .from('.hero-card', { opacity: 0, y: 20, stagger: 0.1 }, '-=0.2');"}
        ]
      },
      {
        "id": "scroll-trigger",
        "title": "Trigger animation on scroll",
        "difficulty": "intermediate",
        "steps": [
          {"label": "ScrollTrigger setup", "code": "import gsap from 'gsap';\nimport { ScrollTrigger } from 'gsap/ScrollTrigger';\ngsap.registerPlugin(ScrollTrigger);\n\ngsap.from('.feature-card', {\n  opacity: 0,\n  y: 50,\n  stagger: 0.15,\n  duration: 0.6,\n  ease: 'power2.out',\n  scrollTrigger: {\n    trigger: '.features-section',\n    start: 'top 80%',   // when top of section hits 80% of viewport\n    end: 'bottom 20%',\n    toggleActions: 'play none none reverse'\n  }\n});"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 2000000, "version": "3.12.7", "repo_url": "https://github.com/greensock/GSAP", "docs_url": "https://gsap.com/docs/v3/", "npm_url": "https://www.npmjs.com/package/gsap"}
  },

  {
    "id": "rxjs",
    "ecosystem": "npm",
    "name": "rxjs",
    "summary": "Reactive programming for JavaScript — compose async event streams with a rich set of operators for transforming, filtering, and combining data over time.",
    "tags": ["reactive", "async", "streams", "observables", "angular"],
    "difficulty": 3,
    "story": {
      "problem": "Promises handle one async value. Arrays handle multiple sync values. But multiple async values over time — WebSocket messages, mouse events, polling — don't fit either model. Managing subscriptions, cancellation, and complex event coordination with callbacks leads to spaghetti.",
      "mental_model": "Observable is the core primitive: a lazy push collection. Subscribe to it to receive values. Operators (map, filter, mergeMap, debounceTime) transform streams in a functional pipeline style. Think of it as array methods (.map, .filter) but for values that arrive over time. Subject is both Observable and Observer — useful for multicasting.",
      "when_to_use": "Angular apps (where it's built-in), complex event handling (drag-and-drop, real-time updates), WebSocket streams, coordinating multiple async operations, auto-completing search inputs with cancellation.",
      "when_not_to_use": "Simple one-off async operations (use async/await), React apps where hooks + SWR/react-query are more idiomatic, or when the team isn't familiar with reactive programming (steep learning curve).",
      "alternatives": [
        {"name": "xstate", "reason": "State machines for complex stateful async — more explicit"},
        {"name": "most.js", "reason": "Faster, lighter reactive library"},
        {"name": "Promise/async-await", "reason": "Simpler for one-shot async operations"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "rxjs_mod", "type": "module", "label": "rxjs", "summary": "Package root — Observable, Subject, operators", "difficulty": 1, "tags": ["core"]},
        {"id": "observable", "type": "class", "label": "Observable", "summary": "Lazy push data source — subscribe to receive values", "difficulty": 2, "tags": ["core"]},
        {"id": "subject", "type": "class", "label": "Subject", "summary": "Observable + Observer — push values to multiple subscribers", "difficulty": 2, "tags": ["multicasting"]},
        {"id": "operators", "type": "module", "label": "rxjs/operators", "summary": "map, filter, mergeMap, debounceTime, switchMap, etc.", "difficulty": 2, "tags": ["operators"]},
        {"id": "pipe", "type": "function", "label": ".pipe()", "summary": "Chain operators: obs.pipe(op1, op2, op3)", "difficulty": 1, "tags": ["composition"]},
        {"id": "switchmap", "type": "function", "label": "switchMap()", "summary": "Cancel previous inner observable on each new outer value", "difficulty": 3, "tags": ["flattening"]},
        {"id": "subscription", "type": "class", "label": "Subscription", "summary": "Handle returned by .subscribe() — call .unsubscribe() to clean up", "difficulty": 2, "tags": ["lifecycle"]}
      ],
      "edges": [
        {"id": "e1", "from": "rxjs_mod", "to": "observable", "label": "contains"},
        {"id": "e2", "from": "rxjs_mod", "to": "subject", "label": "contains"},
        {"id": "e3", "from": "rxjs_mod", "to": "operators", "label": "contains"},
        {"id": "e4", "from": "observable", "to": "pipe", "label": "contains"},
        {"id": "e5", "from": "pipe", "to": "operators", "label": "uses"},
        {"id": "e6", "from": "operators", "to": "switchmap", "label": "contains"},
        {"id": "e7", "from": "observable", "to": "subscription", "label": "returns"},
        {"id": "e8", "from": "subject", "to": "observable", "label": "inherits"}
      ]
    },
    "tasks": [
      {
        "id": "debounce-search",
        "title": "Debounced search with cancellation",
        "difficulty": "intermediate",
        "steps": [
          {"label": "Debounce input and cancel old requests", "code": "import { fromEvent, Subject } from 'rxjs';\nimport { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';\n\nconst searchInput = document.getElementById('search') as HTMLInputElement;\n\nconst search$ = fromEvent(searchInput, 'input').pipe(\n  map(e => (e.target as HTMLInputElement).value.trim()),\n  debounceTime(300),           // wait 300ms after last keystroke\n  distinctUntilChanged(),      // ignore if same value\n  switchMap(query =>           // cancel previous request on new input\n    fetch(`/api/search?q=${query}`).then(r => r.json())\n  )\n);\n\nconst sub = search$.subscribe(results => renderResults(results));\n// Later: sub.unsubscribe() to clean up"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 45000000, "version": "7.8.2", "repo_url": "https://github.com/ReactiveX/rxjs", "docs_url": "https://rxjs.dev/", "npm_url": "https://www.npmjs.com/package/rxjs"}
  },

  {
    "id": "next-auth",
    "ecosystem": "npm",
    "name": "next-auth",
    "summary": "Complete authentication for Next.js — OAuth providers (Google, GitHub, etc.), email magic links, JWT sessions, and database adapters in one package.",
    "tags": ["authentication", "oauth", "nextjs", "jwt", "security"],
    "difficulty": 2,
    "story": {
      "problem": "Auth is complex to get right: OAuth flows, CSRF protection, session management, refresh tokens, secure cookies. Rolling your own is weeks of work and a security minefield.",
      "mental_model": "NextAuth exposes a catch-all API route (/api/auth/[...nextauth]) that handles all OAuth callbacks and session endpoints. Configure providers (Google, GitHub, credentials) and an adapter (database). Use useSession() in client components or getServerSession() in server components to access the authenticated user.",
      "when_to_use": "Any Next.js app needing auth — social login, email magic links, or username/password. It's the standard choice for Next.js auth.",
      "when_not_to_use": "Non-Next.js projects, when you need very complex RBAC that next-auth doesn't support natively, or when your team owns an existing auth service.",
      "alternatives": [
        {"name": "clerk", "reason": "Managed auth service — zero backend code, beautiful UI components"},
        {"name": "lucia", "reason": "Lightweight, framework-agnostic, you own the database"},
        {"name": "supabase auth", "reason": "If already using Supabase — built-in auth with row-level security"}
      ]
    },
    "graph": {
      "nodes": [
        {"id": "nextauth_mod", "type": "module", "label": "next-auth", "summary": "Package root", "difficulty": 1, "tags": ["core"]},
        {"id": "nextauth_handler", "type": "function", "label": "NextAuth()", "summary": "Creates the API route handler — configure providers, callbacks, adapter", "difficulty": 1, "tags": ["setup"]},
        {"id": "providers", "type": "concept", "label": "Providers", "summary": "GoogleProvider, GitHubProvider, CredentialsProvider, EmailProvider", "difficulty": 1, "tags": ["oauth"]},
        {"id": "use_session", "type": "function", "label": "useSession()", "summary": "Client-side hook — returns { data: session, status }", "difficulty": 1, "tags": ["client"]},
        {"id": "get_session", "type": "function", "label": "getServerSession()", "summary": "Server-side session access — use in server components, API routes", "difficulty": 2, "tags": ["server"]},
        {"id": "adapter", "type": "concept", "label": "Database Adapter", "summary": "Persist users/sessions to DB — Prisma, Drizzle, Supabase adapters available", "difficulty": 2, "tags": ["database"]},
        {"id": "callbacks", "type": "concept", "label": "Callbacks", "summary": "jwt(), session(), signIn() — customize token/session shape and access control", "difficulty": 3, "tags": ["customization"]}
      ],
      "edges": [
        {"id": "e1", "from": "nextauth_mod", "to": "nextauth_handler", "label": "contains"},
        {"id": "e2", "from": "nextauth_handler", "to": "providers", "label": "uses"},
        {"id": "e3", "from": "nextauth_handler", "to": "adapter", "label": "uses"},
        {"id": "e4", "from": "nextauth_handler", "to": "callbacks", "label": "uses"},
        {"id": "e5", "from": "nextauth_mod", "to": "use_session", "label": "contains"},
        {"id": "e6", "from": "nextauth_mod", "to": "get_session", "label": "contains"},
        {"id": "e7", "from": "callbacks", "to": "use_session", "label": "uses"},
        {"id": "e8", "from": "callbacks", "to": "get_session", "label": "uses"}
      ]
    },
    "tasks": [
      {
        "id": "setup",
        "title": "Add Google + GitHub login to Next.js",
        "difficulty": "beginner",
        "steps": [
          {"label": "Create auth route", "code": "// src/app/api/auth/[...nextauth]/route.ts\nimport NextAuth from 'next-auth';\nimport Google from 'next-auth/providers/google';\nimport GitHub from 'next-auth/providers/github';\n\nconst handler = NextAuth({\n  providers: [\n    Google({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! }),\n    GitHub({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),\n  ],\n  pages: { signIn: '/login' },\n});\n\nexport { handler as GET, handler as POST };"},
          {"label": "Protect a server component", "code": "// Any server component\nimport { getServerSession } from 'next-auth';\nimport { redirect } from 'next/navigation';\n\nexport default async function DashboardPage() {\n  const session = await getServerSession();\n  if (!session) redirect('/login');\n\n  return <div>Welcome, {session.user?.name}</div>;\n}"}
        ]
      }
    ],
    "meta": {"weekly_downloads": 1500000, "version": "4.24.11", "repo_url": "https://github.com/nextauthjs/next-auth", "docs_url": "https://next-auth.js.org/", "npm_url": "https://www.npmjs.com/package/next-auth"}
  },
]

def write_package(pkg: dict):
    dest = OUT / f"{pkg['id']}.json"
    if dest.exists():
        print(f"  SKIP: {pkg['id']} (already exists)")
        return
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(pkg, f, indent=2, ensure_ascii=False)
    nodes = len(pkg["graph"]["nodes"])
    edges = len(pkg["graph"]["edges"])
    tasks = len(pkg["tasks"])
    print(f"  OK: {pkg['id']} ({pkg['ecosystem']}) — {nodes} nodes, {edges} edges, {tasks} tasks")

if __name__ == "__main__":
    print(f"Writing {len(PACKAGES)} new packages...")
    for pkg in PACKAGES:
        write_package(pkg)
    print("Done.")
