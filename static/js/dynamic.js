'use strict';

const SPECTRUM_TYPES = ['electromagnetic', 'sound', 'visual'];
const SPECTRUM_TITLES = {
  electromagnetic: 'Electromagnetic Spectrum',
  sound:           'Sound Spectrum',
  visual:          'Visual Spectrum',
};
const SPECTRUM_FORMULAS = {
  electromagnetic: 'Z = A · sin(f · (X + Y))',
  sound:           'Z = A · cos(f · (X + Y))',
  visual:          'Z = A · sin(f·X) · cos(f·Y)',
};

let currentType = 'electromagnetic';
let isLoading   = false;

// ── DOM refs ──
const freqSlider = document.getElementById('frequency');
const ampSlider  = document.getElementById('amplitude');
const resSlider  = document.getElementById('resolution');
const freqVal    = document.getElementById('freqVal');
const ampVal     = document.getElementById('ampVal');
const resVal     = document.getElementById('resVal');
const genBtn     = document.getElementById('generateBtn');
const waveImg    = document.getElementById('waveImg');
const waveLoader = document.getElementById('waveLoader');
const waveError  = document.getElementById('waveError');
const mainTitle  = document.getElementById('mainTitle');
const mainSub    = document.getElementById('mainSub');
const metaFormula= document.getElementById('metaFormula');
const metaTime   = document.getElementById('metaTime');

// ── Slider labels ──
freqSlider.addEventListener('input', () => { freqVal.textContent = parseFloat(freqSlider.value).toFixed(1); });
ampSlider.addEventListener('input',  () => { ampVal.textContent  = parseFloat(ampSlider.value).toFixed(1); });
resSlider.addEventListener('input',  () => { resVal.textContent  = resSlider.value; });

// ── Spectrum tabs ──
document.querySelectorAll('.spec-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    currentType = btn.dataset.type;
    document.querySelectorAll('.spec-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateHeader();
    generateWave();
  });
});

// ── Prev / Next arrows ──
document.getElementById('prevSpec').addEventListener('click', () => {
  const i = SPECTRUM_TYPES.indexOf(currentType);
  currentType = SPECTRUM_TYPES[(i + SPECTRUM_TYPES.length - 1) % SPECTRUM_TYPES.length];
  syncTabButtons();
  updateHeader();
  generateWave();
});
document.getElementById('nextSpec').addEventListener('click', () => {
  const i = SPECTRUM_TYPES.indexOf(currentType);
  currentType = SPECTRUM_TYPES[(i + 1) % SPECTRUM_TYPES.length];
  syncTabButtons();
  updateHeader();
  generateWave();
});

function syncTabButtons() {
  document.querySelectorAll('.spec-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.type === currentType);
  });
}

function updateHeader() {
  mainTitle.textContent = SPECTRUM_TITLES[currentType];
  mainSub.textContent   = SPECTRUM_FORMULAS[currentType];
  metaFormula.textContent = SPECTRUM_FORMULAS[currentType];
}

// ── Generate ──
genBtn.addEventListener('click', generateWave);

function generateWave() {
  if (isLoading) return;
  isLoading = true;
  genBtn.disabled = true;
  genBtn.textContent = 'Rendering…';

  waveImg.style.display   = 'none';
  waveError.style.display = 'none';
  waveLoader.style.display = 'flex';

  const payload = {
    spectrum:   currentType,
    frequency:  parseFloat(freqSlider.value),
    amplitude:  parseFloat(ampSlider.value),
    resolution: parseInt(resSlider.value),
  };

  const t0 = performance.now();

  fetch('/api/wave', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  .then(r => {
    if (!r.ok) throw new Error('Server error ' + r.status);
    return r.json();
  })
  .then(data => {
    const ms = Math.round(performance.now() - t0);
    waveImg.src = 'data:image/png;base64,' + data.image;
    waveImg.onload = () => {
      waveLoader.style.display = 'none';
      waveImg.style.display    = 'block';
      metaTime.textContent     = ms + ' ms';
    };
  })
  .catch(err => {
    console.error(err);
    waveLoader.style.display = 'none';
    waveError.style.display  = 'flex';
  })
  .finally(() => {
    isLoading = false;
    genBtn.disabled    = false;
    genBtn.textContent = 'Generate Wave';
  });
}

// ── Init ──
updateHeader();
generateWave();
