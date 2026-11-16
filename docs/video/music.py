"""Banda sonora original para el video de ALTARIS (28,6 s), sintetizada con numpy: sin muestras ni música de terceros.
Sigue la dramaturgia del video:
  0.0-5.0   espacio: pad abierto que crece, subida suave hacia el título
  5.0       golpe grave al aparecer ALTARIS; empieza un arpegio constante (datos)
  10-18     exploración: la armonía se mueve; barrido descendente al arrastrar los años (13.3-16.8)
  18-23     «una señal débil no es un cambio confirmado»: acordes suspendidos (sin tercera), arpegio escaso
  23-25.4   pasaporte: la armonía se aclara
  25.4-28.6 cierre: re mayor con novena, campana, fundido final
Uso: python3 music.py  -> music.wav (estéreo, 48 kHz)"""
import numpy as np
from scipy.signal import fftconvolve

SR = 48000
DUR = 28.6
N = int(SR * DUR)
rng = np.random.default_rng(20261115)
t_all = np.arange(N) / SR
mix_dry = np.zeros((2, N)); mix_wet = np.zeros((2, N))

def hz(note):  # nota -> frecuencia (A4 = 440)
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    name, octave = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[name] + 12 * (octave - 4) - 9) / 12)

def env(n, a, r, curve=2.0):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** curve
    if nr: e[-nr:] = np.minimum(e[-nr:], np.linspace(1, 0, nr) ** curve)
    return e

def add(buf, sig_lr, t0):
    i = int(t0 * SR); j = min(N, i + sig_lr.shape[1])
    if i < N: buf[:, i:j] += sig_lr[:, :j - i]

def pad_note(f, t0, t1, amp, attack, release, wet=True):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR
    out = np.zeros((2, n))
    for ch, det in enumerate((-4, 4)):  # coro: ±4 cents por canal
        ff = f * 2 ** (det / 1200)
        vib = 1 + 0.0012 * np.sin(2 * np.pi * 4.7 * t + rng.uniform(0, 6.28))
        ph = 2 * np.pi * np.cumsum(ff * vib) / SR
        s = sum(np.sin(k * ph) / (k ** 1.6) for k in range(1, 9))  # armónicos que caen rápido: timbre suave
        out[ch] = s
    out *= amp * env(n, attack, release)
    add(mix_wet if wet else mix_dry, out, t0)

def pluck(f, t0, amp, pan=0.0, decay=1.1):
    n = int(2.6 * SR); t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t / decay) + 0.45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / (decay * 0.55))
         + 0.18 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / (decay * 0.3)))
    s *= np.minimum(1, t / 0.004) * amp
    out = np.stack([s * (1 - pan) / 2 + s * 0.5, s * (1 + pan) / 2 + s * 0.5]) / 1.0
    add(mix_wet, out * 0.9, t0); add(mix_dry, out * 0.25, t0)

def impact(t0, amp=0.36):
    n = int(2.6 * SR); t = np.arange(n) / SR
    f = 42 + 50 * np.exp(-t / 0.12)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    nz = rng.standard_normal(n) * np.exp(-t / 0.05) * 0.05
    out = np.stack([s + nz, s - nz]) * amp
    add(mix_dry, out, t0); add(mix_wet, out * 0.4, t0)

def riser(t0, t1, amp=0.10):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; u = t / (t1 - t0)
    f = 180 * (1100 / 180) ** (u ** 1.8)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (u ** 2.4) * amp
    add(mix_wet, np.stack([s, s * 0.9]), t0)

def sweep_down(t0, t1, f0, f1, amp=0.07):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; u = t / (t1 - t0)
    f = f0 * (f1 / f0) ** u
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.sin(np.pi * u) ** 1.5 * amp
    pan = np.cos(np.pi * u)  # se mueve de un lado al otro, como el deslizador
    add(mix_wet, np.stack([s * (0.6 + 0.4 * pan), s * (0.6 - 0.4 * pan)]), t0)

def bell(f, t0, amp=0.09):
    n = int(3.0 * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / d) for m, a, d in ((1, 1, 1.4), (2.76, 0.35, 0.8), (5.4, 0.12, 0.4)))
    s *= np.minimum(1, t / 0.003) * amp
    add(mix_wet, np.stack([s, s * 0.8]), t0)

def arp(notes, t0, t1, bpm, amp, pattern, accent=None):
    step = 60.0 / bpm / 2; k = 0; t = t0
    while t < t1 - 0.2:
        if pattern[k % len(pattern)] is not None:
            f = hz(notes[pattern[k % len(pattern)] % len(notes)])
            a = amp * (1.0 if accent is None else accent[k % len(accent)])
            pluck(f, t, a, pan=0.55 * np.sin(k * 0.9))
        k += 1; t += step

def chord(notes, t0, t1, amp, attack=1.2, release=1.4):
    for nt in notes: pad_note(hz(nt), t0, t1, amp, attack, release)

# ---------------- partitura ----------------
# 0-5: espacio (Dsus2, abierto, crece)
chord(['D2', 'A2', 'D3', 'E3', 'A3'], 0.0, 6.2, 0.050, attack=3.6, release=1.4)
pad_note(hz('E4'), 2.0, 6.2, 0.018, 2.4, 1.2); pad_note(hz('A4'), 3.0, 6.2, 0.012, 1.8, 1.2)
riser(2.6, 5.0, 0.10)
impact(5.0)
# 5-10: título y datos (Bm9)
chord(['B1', 'F#2', 'A2', 'D3', 'C#4'], 5.0, 10.8, 0.052, attack=0.6, release=1.4)
arp(['B3', 'D4', 'F#4', 'A4', 'C#5', 'F#4'], 5.3, 10.6, 100, 0.105, [0, 2, 3, 4, 3, 2, 1, 2])
# 10-14: exploración (Gmaj7)
chord(['G2', 'D3', 'B3', 'F#4'], 10.0, 14.4, 0.050, attack=1.0, release=1.2)
arp(['G3', 'B3', 'D4', 'F#4', 'B4', 'D5'], 10.4, 14.2, 100, 0.10, [0, 2, 3, 5, 3, 2, 4, 2])
# 14-18: los años cambian (Em9); barrido en sincronía con el deslizador (13.3-16.8)
chord(['E2', 'B2', 'D3', 'G3', 'F#4'], 14.0, 18.6, 0.050, attack=1.0, release=1.2)
arp(['E3', 'G3', 'B3', 'D4', 'F#4', 'B4'], 14.2, 18.4, 100, 0.10, [0, 2, 3, 4, 5, 4, 3, 2])
sweep_down(13.3, 16.8, 1050, 330, 0.075)
# 18-23: «una señal débil no es un cambio confirmado»: Asus4 sin tercera, arpegio escaso y suspendido
chord(['A1', 'E2', 'A2', 'D3', 'E3'], 18.2, 23.4, 0.052, attack=1.2, release=1.4)
pad_note(hz('D4'), 18.6, 23.4, 0.020, 1.6, 1.4)
arp(['A3', 'D4', 'E4', 'A4'], 18.6, 23.0, 100, 0.075, [0, None, 2, None, 1, None, 3, None], accent=[1.0, 0.6])
# 23-25.4: pasaporte, la armonía se aclara (Dmaj9)
chord(['D2', 'A2', 'F#3', 'C#4', 'E4'], 22.2, 26.0, 0.054, attack=1.3, release=1.2)
arp(['D4', 'F#4', 'A4', 'C#5', 'E5', 'A4'], 23.2, 25.4, 100, 0.09, [0, 1, 2, 3, 4, 3, 2, 1])
# 25.4-28.6: cierre (D5 con novena), campana al aparecer el cierre, fundido
chord(['D2', 'A2', 'D3', 'F#3', 'A3', 'E4'], 25.4, 28.6, 0.060, attack=0.9, release=1.0)
pad_note(hz('D5'), 25.6, 28.6, 0.020, 0.8, 1.0)
bell(hz('D6'), 25.5, 0.085); bell(hz('A5'), 26.15, 0.060); bell(hz('F#5'), 26.8, 0.050)

# ---------------- reverb y mezcla ----------------
ir_n = int(2.3 * SR); ti = np.arange(ir_n) / SR
ir = np.stack([rng.standard_normal(ir_n) * np.exp(-ti / 0.62), rng.standard_normal(ir_n) * np.exp(-ti / 0.62)])
ir[:, :int(0.018 * SR)] = 0  # pre-retardo
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.stack([fftconvolve(mix_wet[c], ir[c])[:N] for c in range(2)])
out = mix_dry + 0.78 * wet + 0.22 * mix_wet
# filtro paso alto suave (quita DC y rumor < 28 Hz) y limitador suave
from scipy.signal import butter, sosfilt
sos = butter(2, 28, 'highpass', fs=SR, output='sos'); out = sosfilt(sos, out, axis=1)
out = np.tanh(out * 1.25) / 1.25
out *= 0.92 / np.max(np.abs(out))
import wave
pcm = (np.clip(out.T, -1, 1) * 32767).astype('<i2')
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('listo: music.wav', round(DUR, 1), 's, pico', round(float(np.max(np.abs(out))), 3))
