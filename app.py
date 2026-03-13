"""
3D Wave Generator - Flask Backend
Generates 3D wave surface plots as base64 PNG images.
"""

import io
import base64
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend — required for Flask
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ── Wave generation ──────────────────────────────────────────────────────────

SPECTRUM_CONFIG = {
    'electromagnetic': {
        'cmap': 'plasma',
        'title': 'Electromagnetic Spectrum',
        'formula': 'Z = A · sin(f · (X + Y))',
        'default_freq': 1.5,
    },
    'sound': {
        'cmap': 'viridis',
        'title': 'Sound Spectrum',
        'formula': 'Z = A · cos(f · (X + Y))',
        'default_freq': 2.0,
    },
    'visual': {
        'cmap': 'inferno',
        'title': 'Visual Spectrum',
        'formula': 'Z = A · sin(f·X) · cos(f·Y)',
        'default_freq': 2.5,
    },
}


def generate_wave_image(spectrum_type, frequency, amplitude, resolution=60):
    """Render a 3D surface wave and return it as a base64 PNG string."""
    config = SPECTRUM_CONFIG.get(spectrum_type, SPECTRUM_CONFIG['electromagnetic'])

    x = np.linspace(-np.pi * 2, np.pi * 2, resolution)
    y = np.linspace(-np.pi * 2, np.pi * 2, resolution)
    X, Y = np.meshgrid(x, y)

    if spectrum_type == 'electromagnetic':
        Z = amplitude * np.sin(frequency * (X + Y))
    elif spectrum_type == 'sound':
        Z = amplitude * np.cos(frequency * (X + Y))
    elif spectrum_type == 'visual':
        Z = amplitude * np.sin(frequency * X) * np.cos(frequency * Y)
    else:
        Z = amplitude * np.sin(frequency * (X + Y))

    fig = plt.figure(figsize=(9, 6), facecolor='#0d0f1a')
    ax = fig.add_subplot(111, projection='3d', facecolor='#0d0f1a')

    surf = ax.plot_surface(X, Y, Z, cmap=config['cmap'],
                           linewidth=0, antialiased=True, alpha=0.92)

    # Style axes
    for pane in [ax.xaxis.pane, ax.yaxis.pane, ax.zaxis.pane]:
        pane.fill = False
        pane.set_edgecolor('#ffffff11')

    ax.tick_params(colors='#6b7090', labelsize=7)
    ax.set_xlabel('X', color='#6b7090', fontsize=9, labelpad=6)
    ax.set_ylabel('Y', color='#6b7090', fontsize=9, labelpad=6)
    ax.set_zlabel('Z', color='#6b7090', fontsize=9, labelpad=6)
    ax.grid(True, color='#ffffff08', linewidth=0.4)
    ax.set_title(config['title'], color='#e8eaf0', fontsize=13,
                 fontweight='bold', pad=14)

    cbar = fig.colorbar(surf, ax=ax, shrink=0.45, aspect=12, pad=0.08)
    cbar.ax.tick_params(colors='#6b7090', labelsize=7)

    fig.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=130, bbox_inches='tight',
                facecolor='#0d0f1a', edgecolor='none')
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    plt.close(fig)

    return encoded


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/dynamic')
def dynamic():
    return render_template('dynamic.html')


@app.route('/static-spectrums')
def static_spectrums():
    return render_template('static.html')


@app.route('/api/wave', methods=['POST'])
def api_wave():
    """
    POST /api/wave
    Body (JSON): { spectrum, frequency, amplitude, resolution }
    Returns:     { image: "<base64 PNG>", formula, title }
    """
    data          = request.get_json(force=True) or {}
    spectrum_type = data.get('spectrum', 'electromagnetic')
    frequency     = float(data.get('frequency', 1.5))
    amplitude     = float(data.get('amplitude', 1.0))
    resolution    = int(data.get('resolution', 60))

    # Clamp inputs to safe ranges
    frequency  = max(0.1, min(frequency, 10.0))
    amplitude  = max(0.1, min(amplitude, 5.0))
    resolution = max(20,  min(resolution, 120))

    if spectrum_type not in SPECTRUM_CONFIG:
        return jsonify({'error': 'Unknown spectrum type'}), 400

    image   = generate_wave_image(spectrum_type, frequency, amplitude, resolution)
    config  = SPECTRUM_CONFIG[spectrum_type]

    return jsonify({
        'image':   image,
        'formula': config['formula'],
        'title':   config['title'],
    })


@app.route('/api/static-waves', methods=['GET'])
def api_static_waves():
    """
    temporary values for each 
    """
    PLANET_FREQUENCIES = {
        'Mercury': {'em': 5.0, 'sound': 4.0, 'visual': 6.0},
        'Venus':   {'em': 3.5, 'sound': 2.5, 'visual': 4.0},
        'Earth':   {'em': 2.0, 'sound': 1.5, 'visual': 2.5},
        'Mars':    {'em': 1.5, 'sound': 1.0, 'visual': 2.0},
        'Jupiter': {'em': 7.0, 'sound': 6.0, 'visual': 8.0},
        'Saturn':  {'em': 4.5, 'sound': 3.5, 'visual': 5.0},
        'Uranus':  {'em': 3.0, 'sound': 2.0, 'visual': 3.5},
        'Neptune': {'em': 2.5, 'sound': 2.0, 'visual': 3.0},
    }

    planet = request.args.get('planet', 'Earth')
    freqs  = PLANET_FREQUENCIES.get(planet, PLANET_FREQUENCIES['Earth'])

    images = {
        'electromagnetic': generate_wave_image('electromagnetic', freqs['em'], 1.0, 50),
        'sound':           generate_wave_image('sound',           freqs['sound'], 1.0, 50),
        'visual':          generate_wave_image('visual',          freqs['visual'], 1.0, 50),
    }

    return jsonify({'planet': planet, 'images': images})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
