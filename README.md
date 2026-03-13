# 3D Wave Generator

A full-stack Flask web application that visualizes **electromagnetic, sound, and visual wave spectrums** as interactive 3D surface plots — powered by NumPy and Matplotlib.

![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3+-black?style=flat-square&logo=flask)
![NumPy](https://img.shields.io/badge/NumPy-1.24+-blue?style=flat-square&logo=numpy)
![Matplotlib](https://img.shields.io/badge/Matplotlib-3.7+-orange?style=flat-square)

---

## Features

- **Dynamic Mode** — Set frequency, amplitude, and resolution. The server renders a fresh 3D surface plot on every request via the REST API.
- **Static Mode** — Browse 8 planets (Mercury → Neptune), each with unique wave frequencies across all three spectrum types.
- **REST API** — `POST /api/wave` and `GET /api/static-waves` are fully accessible.
- **Dark-themed UI** — Space Mono + Syne typefaces, responsive layout, smooth interactions.

## Wave Equations

| Spectrum       | Equation                          | Colormap |
|----------------|-----------------------------------|----------|
| Electromagnetic| `Z = A · sin(f · (X + Y))`        | Plasma   |
| Sound          | `Z = A · cos(f · (X + Y))`        | Viridis  |
| Visual         | `Z = A · sin(f·X) · cos(f·Y)`     | Inferno  |

---

## Project Structure

```
3d-wave-generator/
├── app.py                  # Flask backend + wave generation
├── requirements.txt
├── templates/
│   ├── base.html           # Shared Jinja2 layout
│   ├── index.html          # Home page
│   ├── dynamic.html        # Interactive wave generator
│   └── static.html         # Planetary spectrums
└── static/
    ├── css/
    │   └── main.css
    └── js/
        ├── main.js         # Navbar 
        ├── dynamic.js      # Dynamic page 
        └── static.js       # Static page 
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/3d-wave-generator.git
cd 3d-wave-generator
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the app

```bash
python app.py
```

Open **http://localhost:5000** in your browser.

---

## API Reference

### `POST /api/wave`

Render a 3D wave surface and return it as a base64 PNG.

**Request body (JSON):**

```json
{
  "spectrum":   "electromagnetic",
  "frequency":  2.0,
  "amplitude":  1.0,
  "resolution": 60
}
```

| Field       | Type   | Range     | Default          |
|-------------|--------|-----------|------------------|
| spectrum    | string | em/sound/visual | electromagnetic |
| frequency   | float  | 0.1 – 10  | 1.5              |
| amplitude   | float  | 0.1 – 5   | 1.0              |
| resolution  | int    | 20 – 120  | 60               |

**Response (JSON):**

```json
{
  "image":   "<base64 PNG string>",
  "formula": "Z = A · sin(f · (X + Y))",
  "title":   "Electromagnetic Spectrum"
}
```

---

### `GET /api/static-waves?planet=Earth`

Returns pre-rendered wave plots for all three spectrum types at planet-specific frequencies.

**Available planets:** Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune

**Response:**

```json
{
  "planet": "Earth",
  "images": {
    "electromagnetic": "<base64 PNG>",
    "sound":           "<base64 PNG>",
    "visual":          "<base64 PNG>"
  }
}
```

---

## Deployment

For production, use **Gunicorn**:

```bash
pip install gunicorn
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

Or deploy to **Railway**, **Render**, or **Fly.io** — all support Python/Flask out of the box.

---

## License

MIT
