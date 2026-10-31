#!/usr/bin/env python3
"""
Backseat Games sound set generator (v1.1, deterministic per sound).

100% self-synthesized (numpy/scipy): modal synthesis for marimba / glockenspiel /
celesta / bells / woodblock, Karplus-Strong for plucked strings, band-limited
additive sawtooth through filters for horns, filtered noise for shakers and sleigh
bells, and a synthetic noise-burst convolution reverb. No samples or soundfonts.

Usage (from the repo root):
  py scripts/sounds/make_sounds.py                        # all 20 -> assets/sounds (22050 Hz, 16-bit, mono)
  py scripts/sounds/make_sounds.py --only claim halloween/win
  py scripts/sounds/make_sounds.py --rate 44100 --out build/sounds-44k
  py scripts/sounds/make_sounds.py --set opening          # jingle candidates -> build/opening-variants

Everything renders internally at 44.1 kHz and is resampled to --rate.
Each sound is a function below; tweak notes/timbres and re-run.
"""
import argparse, os, zlib
from pathlib import Path
import numpy as np
from scipy import signal
import soundfile as sf
import pyloudnorm as pyln

SR = 44100
RNG = np.random.default_rng(20261031)  # fixed seed -> reproducible output


# --------------------------------------------------------------------------- utils
def n2f(note):
    """'C5' / 'Eb4' / 'F#3' -> Hz (A4 = 440)."""
    names = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    s = note[0].upper(); i = 1; semi = names[s]
    while i < len(note) and note[i] in '#b':
        semi += 1 if note[i] == '#' else -1; i += 1
    octv = int(note[i:])
    midi = 12 * (octv + 1) + semi
    return 440.0 * 2 ** ((midi - 69) / 12)


def buf(sec):
    return np.zeros(int(round(sec * SR)))


def mix(target, src, at, gain=1.0):
    s = int(round(at * SR))
    if s >= len(target):
        return target
    n = min(len(src), len(target) - s)
    target[s:s + n] += src[:n] * gain
    return target


def t_axis(sec):
    return np.arange(int(round(sec * SR))) / SR


def sos_filter(x, kind, freq, order=2):
    sos = signal.butter(order, freq, btype=kind, fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def peaking(x, f0, gain_db, q=1.0):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; alpha = np.sin(w) / (2 * q)
    b = [1 + alpha * A, -2 * np.cos(w), 1 - alpha * A]
    a = [1 + alpha / A, -2 * np.cos(w), 1 - alpha / A]
    return signal.lfilter(b, a, x)


def adsr(n, a=0.005, r=0.05, sustain_sec=None):
    e = np.ones(n)
    na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr < n:
        e[-nr:] *= np.cos(np.linspace(0, np.pi / 2, nr)) ** 2
    return e


# ---------------------------------------------------------------- instruments
def modal(f, partials, sec, click=0.0, click_lp=6000, attack=0.0015):
    """Generic struck bar: partials = [(ratio, amp, decay_tau_sec), ...]."""
    t = t_axis(sec); y = np.zeros_like(t)
    for ratio, amp, tau in partials:
        fr = f * ratio
        if fr >= 20000:
            continue
        ph = RNG.uniform(0, 0.2)
        y += amp * np.sin(2 * np.pi * fr * t + ph) * np.exp(-t / tau)
    na = max(2, int(attack * SR)); y[:na] *= np.linspace(0, 1, na)
    if click > 0:
        nc = int(0.004 * SR)
        c = RNG.standard_normal(nc) * np.exp(-np.arange(nc) / (0.0008 * SR))
        c = sos_filter(c, 'lowpass', click_lp)
        y[:nc] += click * c
    return y


def marimba(note, sec=0.6, bright=1.0, muted=1.0):
    f = n2f(note) if isinstance(note, str) else note
    base_tau = 0.45 * (523 / f) ** 0.5 * muted
    return modal(f, [(1, 1.0, base_tau), (3.93, 0.22 * bright, base_tau * 0.25),
                     (9.2, 0.06 * bright, base_tau * 0.1)], sec, click=0.25 * bright, click_lp=4000)


def glock(note, sec=1.2, amp_hi=1.0):
    f = n2f(note) if isinstance(note, str) else note
    return modal(f, [(1, 1.0, 0.9), (2.76, 0.30 * amp_hi, 0.35), (5.40, 0.12 * amp_hi, 0.15),
                     (8.93, 0.05 * amp_hi, 0.08)], sec, click=0.12, click_lp=9000)


def celesta(note, sec=1.0):
    f = n2f(note) if isinstance(note, str) else note
    # soft hammer on a steel plate over a wooden resonator: near-harmonic, gentle
    y = modal(f, [(1, 1.0, 0.65), (2.0, 0.18, 0.30), (3.0, 0.08, 0.18), (4.07, 0.06, 0.10)],
              sec, click=0.05, click_lp=5000, attack=0.003)
    t = t_axis(sec)
    return y * (1 + 0.05 * np.sin(2 * np.pi * 5.5 * t))  # tiny shimmer


def bell(note, sec=2.0, bright=1.0):
    """Tuned hand/tubular bell with classic hum/prime/tierce/quint/nominal partials."""
    f = n2f(note) if isinstance(note, str) else note
    p = [(0.5, 0.35, 1.6), (1.0, 1.0, 1.2), (1.19, 0.45 * bright, 0.8), (1.5, 0.30 * bright, 0.7),
         (2.0, 0.55 * bright, 0.6), (2.5, 0.20 * bright, 0.35), (3.0, 0.15 * bright, 0.25),
         (4.2, 0.08 * bright, 0.15)]
    y = modal(f, p, sec, click=0.08, click_lp=10000)
    # slight beating for realism
    t = t_axis(sec)
    return y * (1 + 0.04 * np.sin(2 * np.pi * 3.1 * t))


def woodblock(f=900, sec=0.12, amt=1.0):
    return modal(f, [(1, 1.0, 0.025), (2.47, 0.45, 0.012), (4.1, 0.15, 0.006)], sec,
                 click=0.6 * amt, click_lp=7000, attack=0.0005)


def pluck(note, sec=1.0, bright=0.5, body=True):
    """Karplus-Strong nylon/acoustic pluck, run as an IIR comb at 4x rate for accurate tuning."""
    f = n2f(note) if isinstance(note, str) else note
    R = SR * 4; n = int(sec * R)
    s = 0.5 - 0.15 * bright                 # loop lowpass blend (adds s samples of delay)
    N = int(round(R / f - s))
    damp = 0.9985 if f < 300 else 0.998     # per-period loss
    exc = RNG.uniform(-1, 1, N)
    exc = signal.sosfilt(signal.butter(2, 1500 + 6000 * bright, fs=R, output='sos'),
                         np.concatenate([exc, np.zeros(N)]))[:N]
    x = np.zeros(n); x[:N] = exc
    a = np.zeros(N + 2); a[0] = 1; a[N] = -damp * (1 - s); a[N + 1] = -damp * s
    y = signal.lfilter([1.0], a, x)
    d = max(1, int(N * 0.18)); y = y - 0.5 * np.concatenate([np.zeros(d), y[:-d]])  # pick position
    out = signal.resample_poly(y, 1, 4)
    if body:
        out = peaking(out, 220, 5, 1.2); out = peaking(out, 2800, 3, 1.5)
    out = sos_filter(out, 'highpass', 70)
    t = np.arange(len(out)) / SR
    out *= np.exp(-t / (0.35 * (440 / f) ** 0.3 + 0.15))   # natural-ish string decay
    na = int(0.001 * SR); out[:na] *= np.linspace(0, 1, na)
    return out / (np.max(np.abs(out)) + 1e-9)


def soft_bass(note, sec=0.8, decay=0.5):
    f = n2f(note) if isinstance(note, str) else note
    t = t_axis(sec)
    y = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * np.exp(-t / decay)
    return y * adsr(len(t), a=0.008, r=0.05)


def saw_additive(freq_track, max_hz=9000):
    """Band-limited saw from an instantaneous-frequency array."""
    phase = 2 * np.pi * np.cumsum(freq_track) / SR
    fmax = np.max(freq_track); K = max(1, int(max_hz / fmax))
    y = np.zeros_like(phase)
    for k in range(1, K + 1):
        y += np.sin(k * phase) / k
    return y


def horn_voice(freqs, sec, scoop=0.03, vib=0.0, vib_rate=6.0, lp=2600, formant=1100,
               bend_end=0.0, wobble=0.0, wobble_rate=0.0):
    """Toy-ish brassy horn: stacked detuned saws, scoop-up attack, formant + lowpass."""
    t = t_axis(sec); y = np.zeros_like(t)
    for j, f0 in enumerate(freqs):
        track = f0 * (1 - scoop * np.exp(-t / 0.025))
        if vib: track *= 1 + vib * np.sin(2 * np.pi * vib_rate * t + j)
        if bend_end: track *= 1 + bend_end * np.clip((t - sec * 0.6) / (sec * 0.4), 0, 1) ** 2
        if wobble: track *= 1 + wobble * np.sin(2 * np.pi * wobble_rate * t) * np.clip((t - sec * 0.45) / 0.05, 0, 1)
        for det in (-0.004, 0.004):
            y += saw_additive(track * (1 + det))
    y = peaking(y, formant, 9, 1.4); y = peaking(y, formant * 2.3, 4, 2.0)
    y = sos_filter(y, 'lowpass', lp, order=4); y = sos_filter(y, 'highpass', 90)
    y *= adsr(len(t), a=0.012, r=0.045)
    return y / (np.max(np.abs(y)) + 1e-9)


def shaker(sec, amp=1.0, hp=5000):
    t = t_axis(sec); y = RNG.standard_normal(len(t))
    y = sos_filter(y, 'highpass', hp, 4) * np.exp(-t / (sec * 0.35))
    return amp * y * adsr(len(t), a=0.004, r=0.01)


def sleigh_shake(sec=0.5, density=90, amp=1.0, strokes=2):
    """Many tiny pellet bells: inharmonic high partials w/ very fast decay, grouped in strokes."""
    out = buf(sec + 0.15)
    stroke_times = np.linspace(0, sec * 0.7, strokes)
    for st in stroke_times:
        k = int(density * sec / strokes)
        for _ in range(k):
            at = st + abs(RNG.normal(0, 0.035))
            f = RNG.uniform(3300, 7500)
            jt = t_axis(0.07)
            j = np.zeros_like(jt)
            for r, a in ((1, 1), (1.47, 0.6), (2.09, 0.35)):
                if f * r < 10500:
                    j += a * np.sin(2 * np.pi * f * r * jt + RNG.uniform(0, 6.28))
            j *= np.exp(-jt / RNG.uniform(0.012, 0.03))
            mix(out, j, at, RNG.uniform(0.2, 1.0))
    out += 0.15 * shaker(len(out) / SR, hp=6000)
    return amp * out / (np.max(np.abs(out)) + 1e-9)


def ghost_ooo(f0, sec, glide=1.3, vib=0.025):
    """Soft theremin-like 'ooo': sine with vibrato and a glide, cute not scary."""
    t = t_axis(sec)
    track = f0 * (1 + (glide - 1) * np.sin(np.pi * t / sec)) * (1 + vib * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(track) / SR
    y = np.sin(ph) + 0.12 * np.sin(2 * ph)
    return y * adsr(len(t), a=sec * 0.25, r=sec * 0.4)


def whoosh(sec, f_from=400, f_to=4000, amp=1.0):
    t = t_axis(sec); n = RNG.standard_normal(len(t)); y = np.zeros_like(n)
    # time-varying bandpass by block processing
    blk = 256
    for i in range(0, len(n), blk):
        u = i / len(n); fc = f_from * (f_to / f_from) ** u
        sos = signal.butter(2, [fc * 0.7, min(fc * 1.4, 20000)], btype='band', fs=SR, output='sos')
        y[i:i + blk] = signal.sosfilt(sos, n[max(0, i - 2048):i + blk])[-len(n[i:i + blk]):]
    env = np.sin(np.pi * np.linspace(0, 1, len(t))) ** 2
    return amp * y * env / (np.max(np.abs(y * env)) + 1e-9)


# --------------------------------------------------------------------- reverb
def make_ir(rt=0.6, bright=6000, predelay=0.008):
    n = int(rt * 1.2 * SR); t = np.arange(n) / SR
    ir = RNG.standard_normal(n) * np.exp(-6.91 * t / rt)
    ir = sos_filter(ir, 'lowpass', bright)
    ir = np.concatenate([np.zeros(int(predelay * SR)), ir])
    return ir / np.sqrt(np.sum(ir ** 2))


IRS = {
    'room': make_ir(0.5, 6000), 'hall': make_ir(1.1, 7000),
    'spooky': make_ir(1.3, 4500, 0.02), 'wood': make_ir(0.35, 4000),
}


def reverb(x, kind='room', wet=0.18, tail=0.6):
    x = np.concatenate([x, np.zeros(int(tail * SR))])
    w = signal.fftconvolve(x, IRS[kind])[:len(x)]
    return (1 - wet * 0.5) * x + wet * w


# ------------------------------------------------------------------- finishing
def limit(x, rate, ceiling_db=-1.5, release=0.06):
    """Gentle peak limiter (2 ms look-ahead) so loud sounds reach target without clipping."""
    c = 10 ** (ceiling_db / 20); la = max(1, int(0.002 * rate))
    pk = np.abs(x)
    pk = np.maximum.reduce([np.concatenate([pk[i:], np.zeros(i)]) for i in range(0, la, max(1, la // 8))])
    g = np.minimum(1.0, c / (pk + 1e-12))
    a = np.exp(-1 / (release * rate)); out = np.empty_like(g); cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    return x * out


def finish(x, rate, target, max_len=None, floor_db=-50, fade=0.025, ceiling_db=-1.0):
    x = sos_filter(x, 'highpass', 35)
    # resample with proper anti-aliasing
    if rate != SR:
        g = np.gcd(rate, SR); x = signal.resample_poly(x, rate // g, SR // g)
    # trim trailing silence relative to peak
    win = max(1, int(rate * 0.01))
    env = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode='same'))
    thr = env.max() * 10 ** (floor_db / 20)
    last = np.nonzero(env > thr)[0][-1] + int(rate * 0.01)
    x = x[:min(len(x), last)]
    if max_len and len(x) > int(max_len * rate):
        x = x[:int(max_len * rate)]
        fade = 0.012 if max_len < 0.1 else min(0.15, max_len * 0.25)
    nf = min(int(fade * rate), len(x) // 3)
    x[-nf:] *= np.cos(np.linspace(0, np.pi / 2, nf)) ** 2
    ni = int(0.0008 * rate); x[:ni] *= np.linspace(0, 1, ni)
    x[-1] = 0.0
    # loudness normalize (K-weighted, active region; see tools/analyze.py)
    for _ in range(3):  # normalize, limit, re-measure
        x = x * 10 ** ((target - active_lufs(x, rate)) / 20)
        x = limit(x, rate)
    tp = true_peak_db(x, rate)
    if tp > ceiling_db:
        x *= 10 ** ((ceiling_db - tp) / 20)
    return x


def active_lufs(x, rate):
    m = pyln.Meter(rate); y = x.astype(np.float64)
    for f in m._filters.values():
        y = f.apply_filter(y)
    win = max(1, int(rate * 0.01))
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode='same') + 1e-20)
    act = rms > rms.max() * 10 ** (-40 / 20)
    return -0.691 + 10 * np.log10(np.mean(y[act] ** 2) + 1e-20)


def true_peak_db(x, rate):
    return 20 * np.log10(np.max(np.abs(signal.resample_poly(x, 4, 1))) + 1e-12)


# ========================================================================= SOUNDS
# Shared motif: the open jingle's C-E-G-C rise. Claims are a 2-note rise (G->C),
# wins a fast arpeggio into a held chord. Themes re-voice the same gestures.

def s_tap():
    y = buf(0.07)
    mix(y, modal(1760, [(1, 1.0, 0.012), (2.9, 0.35, 0.006)], 0.07, click=0.35, click_lp=8000, attack=0.0004), 0)
    return y


def s_claim():
    y = buf(0.6)
    mix(y, marimba('G5', 0.6), 0.0, 0.8)
    mix(y, marimba('C6', 0.6), 0.065, 1.0)
    mix(y, glock('C7', 0.6, 0.5), 0.065, 0.18)
    return reverb(y, 'room', 0.16, 0.3)


def s_invalid():
    # gentle "uh-oh": two soft, muted low marimba notes falling a minor third, no buzz
    y = buf(0.45)
    mix(y, marimba('A4', 0.4, bright=0.35, muted=0.6), 0.0, 0.9)
    mix(y, marimba('F#4', 0.4, bright=0.35, muted=0.6), 0.11, 0.8)
    y = sos_filter(y, 'lowpass', 2500)
    return reverb(y, 'room', 0.12, 0.25)


def s_round_start():
    y = buf(0.9)
    mix(y, marimba('G4', 0.4), 0.00, 0.7)
    mix(y, marimba('C5', 0.4), 0.11, 0.75)
    for n, g in (('E5', 0.8), ('G5', 0.7), ('C6', 0.9)):
        mix(y, marimba(n, 0.7), 0.22, g)
    mix(y, glock('C7', 0.8), 0.22, 0.25)
    mix(y, soft_bass('C3', 0.6, 0.3), 0.22, 0.45)
    mix(y, whoosh(0.25, 600, 5000), 0.0, 0.05)
    return reverb(y, 'room', 0.2, 0.4)


def s_open_jingle():
    beat = 0.125
    mel = [('C5', 0), ('E5', 1), ('G5', 2), ('A5', 3.5), ('G5', 4), ('E5', 5), ('G5', 6), ('C6', 7)]
    y = buf(2.0)
    for n, b in mel:
        mix(y, marimba(n, 0.8), b * beat, 0.8)
    for n, b in (('G6', 6), ('C7', 7)):  # glock doubles the last two notes an octave up
        mix(y, glock(n, 1.0), b * beat, 0.2)
    for n in ('C5', 'E5', 'G5'):  # final chord bloom
        mix(y, marimba(n, 1.0, bright=0.6), 7 * beat + 0.02, 0.35)
    mix(y, bell('C6', 1.4, 0.6), 7 * beat, 0.18)
    for n, b in (('C3', 0), ('G2', 3.5), ('C3', 7)):
        mix(y, soft_bass(n, 0.7, 0.35), b * beat, 0.5)
    mix(y, shaker(0.08, hp=7000), 3.5 * beat, 0.05); mix(y, shaker(0.08, hp=7000), 6 * beat, 0.05)
    return reverb(y, 'room', 0.22, 0.6)


def s_win():
    y = buf(1.6)
    arp = ['C5', 'E5', 'G5', 'C6', 'E6']
    for i, n in enumerate(arp):
        mix(y, marimba(n, 0.7), i * 0.045, 0.75)
    at = len(arp) * 0.045 + 0.03
    for n in ('C6', 'E6', 'G6'):
        mix(y, glock(n, 1.3), at, 0.28)
    mix(y, bell('C6', 1.5, 0.7), at, 0.22)
    for n in ('C5', 'E5', 'G5'):
        mix(y, marimba(n, 1.0, bright=0.5), at, 0.35)
    mix(y, soft_bass('C3', 0.9, 0.5), at, 0.55)
    for i, n in enumerate(['G6', 'C7', 'E7', 'G7']):  # sparkle run
        mix(y, glock(n, 0.6, 0.4), at + 0.12 + i * 0.05, 0.08)
    mix(y, shaker(0.3, hp=6000), at, 0.06)
    return reverb(y, 'room', 0.22, 0.7)


def car_horn(f_lo='F#4', f_hi='A#4', beeps=(0.0, 0.17), dur=0.13, **kw):
    y = buf(beeps[-1] + dur + 0.05)
    for b in beeps:
        mix(y, horn_voice([n2f(f_lo), n2f(f_hi)], dur, scoop=0.04, **kw), b, 1.0)
    return y


def truck_horn(notes=('Bb2', 'D3', 'F3'), dur=0.62, **kw):
    y = horn_voice([n2f(n) for n in notes] + [n2f(notes[0]) * 2], dur, scoop=0.06,
                   lp=kw.pop('lp', 1800), formant=kw.pop('formant', 650), **kw)
    sub = soft_bass(notes[0], dur, 5.0)
    sub = sub * adsr(len(sub), 0.03, 0.06)
    n = min(len(y), len(sub))
    return y[:n] + 0.35 * sub[:n]


def s_horn_car():
    return reverb(car_horn(), 'room', 0.1, 0.2)


def s_horn_truck():
    return reverb(truck_horn(), 'room', 0.12, 0.3)


# ---- Halloween: spooky-cute. C minor, celesta, theremin "ooo", a bit more reverb.
def s_hw_claim():
    y = buf(0.8)
    mix(y, celesta('G5', 0.8), 0.0, 0.8)
    mix(y, celesta('C6', 0.8), 0.07, 1.0)
    mix(y, celesta('Eb6', 0.8), 0.14, 0.45)
    mix(y, ghost_ooo(n2f('G4'), 0.35, 1.06), 0.06, 0.08)
    return reverb(y, 'spooky', 0.28, 0.5)


def s_hw_win():
    y = buf(2.0)
    arp = ['C5', 'Eb5', 'G5', 'C6', 'Eb6']
    for i, n in enumerate(arp):
        mix(y, celesta(n, 0.9), i * 0.07, 0.75)
    at = len(arp) * 0.07
    # playful creepy turn: B5 - C6 - D6 ... landing on a cute minor(add9) chord
    for i, n in enumerate(['D6', 'B5', 'C6']):
        mix(y, celesta(n, 0.9), at + i * 0.09, 0.7)
    at2 = at + 0.3
    for n in ('C5', 'Eb5', 'G5', 'D6'):
        mix(y, celesta(n, 1.4), at2, 0.38)
    mix(y, glock('G6', 1.2, 0.5), at2, 0.15)
    mix(y, soft_bass('C3', 1.0, 0.6), at2, 0.5)
    mix(y, ghost_ooo(n2f('G5'), 0.9, 1.12), at2 - 0.05, 0.12)  # friendly "ooo-OOO"
    return reverb(y, 'spooky', 0.3, 0.9)


def s_hw_horn_car():
    # same beep-beep, minor third and a wobbly ghosty vibrato, plus a celesta "boo" tinkle
    y = car_horn('G4', 'Bb4', vib=0.018, vib_rate=7, lp=2300)
    out = buf(len(y) / SR + 0.35); mix(out, y, 0)
    mix(out, celesta('Eb6', 0.5), 0.33, 0.25); mix(out, celesta('B5', 0.5), 0.40, 0.2)
    return reverb(out, 'spooky', 0.22, 0.5)


def s_hw_horn_truck():
    y = truck_horn(('C3', 'Eb3', 'G3'), 0.75, vib=0.012, vib_rate=4.5, bend_end=-0.06)
    out = buf(1.0); mix(out, y, 0)
    mix(out, ghost_ooo(n2f('C5'), 0.6, 1.15), 0.25, 0.10)
    return reverb(out, 'spooky', 0.25, 0.6)


# ---- Thanksgiving: warm & rustic. Acoustic plucks, woodblock, pentatonic, dry wood room.
def s_tg_claim():
    y = buf(0.7)
    mix(y, woodblock(1050), 0.0, 0.35)
    mix(y, pluck('G4', 0.7, 0.55), 0.01, 0.7)
    mix(y, pluck('C5', 0.7, 0.6), 0.075, 0.85)
    mix(y, woodblock(1400), 0.075, 0.2)
    return reverb(y, 'wood', 0.14, 0.3)


def s_tg_win():
    y = buf(2.0)
    roll = ['C4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5']   # banjo-style pentatonic roll
    for i, n in enumerate(roll):
        mix(y, pluck(n, 0.9, 0.6), i * 0.055, 0.6)
    at = len(roll) * 0.055 + 0.04
    for i, n in enumerate(['C3', 'G3', 'C4', 'E4', 'G4', 'C5']):  # final strum
        mix(y, pluck(n, 1.4, 0.45), at + i * 0.014, 0.45)
    mix(y, marimba('G5', 1.0, bright=0.4), at, 0.25); mix(y, marimba('C6', 1.0, bright=0.4), at, 0.25)
    for i, f in enumerate([900, 1200, 900, 1200]):  # clip-clop woodblock
        mix(y, woodblock(f), i * 0.11, 0.25)
    mix(y, woodblock(1200), at, 0.3)
    mix(y, soft_bass('C3', 1.0, 0.5), at, 0.4)
    return reverb(y, 'wood', 0.18, 0.6)


def s_tg_horn_car():
    # warmer, rounder beep-beep doubled by a guitar pluck, woodblock pickup
    y = car_horn(lp=1700, formant=900)
    out = buf(len(y) / SR + 0.3); mix(out, woodblock(1300), 0, 0.15); mix(out, y, 0.03)
    for b in (0.03, 0.20):
        mix(out, pluck('A#4', 0.5, 0.5), b, 0.25); mix(out, pluck('F#4', 0.5, 0.5), b, 0.2)
    return reverb(out, 'wood', 0.12, 0.3)


def s_tg_horn_truck():
    # warm tuba-ish truck horn that ends in a little turkey "gobble" wobble
    y = truck_horn(('C3', 'E3', 'G3'), 0.8, lp=1400, formant=550, wobble=0.05, wobble_rate=17)
    out = buf(1.1); mix(out, y, 0)
    mix(out, woodblock(950), 0.0, 0.2)
    mix(out, pluck('C4', 0.8, 0.5), 0.0, 0.25)
    return reverb(out, 'wood', 0.14, 0.4)


# ---- Christmas: sleigh bells, glockenspiel & hand bells, bright hall.
def s_xm_claim():
    y = buf(0.9)
    mix(y, bell('G5', 0.9, 0.8), 0.0, 0.6)
    mix(y, bell('C6', 0.9, 0.8), 0.07, 0.75)
    mix(y, glock('C7', 0.8, 0.6), 0.07, 0.3)
    mix(y, sleigh_shake(0.25, 120, strokes=1), 0.0, 0.22)
    return reverb(y, 'hall', 0.22, 0.6)


def s_xm_win():
    # "Jingle Bells" (public domain) opening hook on glockenspiel with sleigh bells
    b = 0.115
    mel = [('E6', 0), ('E6', 1), ('E6', 2), ('E6', 4), ('E6', 5), ('E6', 6),
           ('E6', 8), ('G6', 9), ('C6', 10), ('D6', 10.75), ('E6', 11.5)]
    y = buf(2.4)
    for n, k in mel:
        mix(y, glock(n, 1.0), k * b, 0.55)
    end = 11.5 * b
    for n in ('C6', 'E6', 'G6'):
        mix(y, bell(n, 1.5, 0.6), end, 0.22)
    for k in (0, 2, 4, 6, 8, 10):
        mix(y, sleigh_shake(0.12, 140, strokes=1), k * b, 0.16)
    mix(y, sleigh_shake(0.45, 160, strokes=3), end, 0.22)
    for n, k in (('C4', 0), ('G3', 4), ('C4', 8), ('C4', 11.5)):
        mix(y, soft_bass(n, 0.5, 0.3), k * b, 0.35)
    return reverb(y, 'hall', 0.24, 0.8)


def s_xm_horn_car():
    y = car_horn(lp=2600)
    out = buf(len(y) / SR + 0.3); mix(out, y, 0)
    mix(out, sleigh_shake(0.45, 170, strokes=3), 0.0, 0.15)
    mix(out, glock('C7', 0.5), 0.33, 0.15)
    return reverb(out, 'hall', 0.15, 0.5)


def s_xm_horn_truck():
    y = truck_horn(('C3', 'E3', 'G3'), 0.7)
    out = buf(1.4); mix(out, y, 0)
    mix(out, bell('C5', 1.4, 0.7), 0.0, 0.35); mix(out, bell('G5', 1.2, 0.7), 0.05, 0.2)
    mix(out, sleigh_shake(0.6, 150, strokes=3), 0.0, 0.2)
    return reverb(out, 'hall', 0.2, 0.8)


# name -> (render fn, loudness target LUFS (active-region, K-weighted))
# UI sounds quieter; claims mid; horns/round-start a bit louder; win/jingle loudest.
SOUNDS = {
    'tap':                    (s_tap, -26),
    'claim':                  (s_claim, -20),
    'invalid':                (s_invalid, -23),
    'win':                    (s_win, -16),
    'round-start':            (s_round_start, -18),
    'open-jingle':            (s_open_jingle, -16),
    'horn-car':               (s_horn_car, -18),
    'horn-truck':             (s_horn_truck, -18),
    'halloween/claim':        (s_hw_claim, -20),
    'halloween/win':          (s_hw_win, -16),
    'halloween/horn-car':     (s_hw_horn_car, -18),
    'halloween/horn-truck':   (s_hw_horn_truck, -18),
    'thanksgiving/claim':     (s_tg_claim, -20),
    'thanksgiving/win':       (s_tg_win, -16),
    'thanksgiving/horn-car':  (s_tg_horn_car, -18),
    'thanksgiving/horn-truck': (s_tg_horn_truck, -18),
    'christmas/claim':        (s_xm_claim, -20),
    'christmas/win':          (s_xm_win, -16),
    'christmas/horn-car':     (s_xm_horn_car, -18),
    'christmas/horn-truck':   (s_xm_horn_truck, -18),
}
# hard caps (with a longer fade) so frequently-fired sounds don't ring on
MAX_LEN = {'tap': 0.075, 'claim': 0.6, 'invalid': 0.4, 'round-start': 1.0,
           'halloween/claim': 0.8, 'thanksgiving/claim': 0.6, 'christmas/claim': 0.8,
           'halloween/win': 2.2, 'christmas/win': 2.4, 'christmas/horn-truck': 1.5,
           'halloween/horn-truck': 1.3, 'halloween/horn-car': 1.0, 'christmas/horn-car': 0.95}


# ============================================================ OPENING ("road trip")
# Tiny road-trip launch stingers: door thunk, seatbelt click, engine start, then the
# C-E-G-C jingle lands as the car pulls away, ending on the car-horn beep-beep
# (same horn voice as horn-car, transposed to C/E so it resolves the tune).
# Render with:  python make_sounds.py --set opening --out ../opening [--rate 44100]

def door_thunk():
    """Car door closing: low body thud + muffled slam + latch click."""
    sec = 0.3; t = t_axis(sec)
    f = 105 * (1 + 0.6 * np.exp(-t / 0.015))                   # pitch drops as panel settles
    ph = 2 * np.pi * np.cumsum(f) / SR
    # 2nd/3rd partials keep the thunk audible on phone speakers (little below ~150 Hz)
    body = (np.sin(ph) + 0.6 * np.sin(2.03 * ph) * np.exp(-t / 0.03) + 0.3 * np.sin(3.1 * ph) * np.exp(-t / 0.02)) * np.exp(-t / 0.05)
    slam = sos_filter(RNG.standard_normal(len(t)), 'lowpass', 1000, 4) * np.exp(-t / 0.025)
    slam = slam / (np.max(np.abs(slam)) + 1e-9)
    latch = buf(sec)
    mix(latch, modal(2300, [(1, 1, 0.006), (1.7, 0.6, 0.004)], 0.03, click=0.4, attack=0.0003), 0.012)
    y = 1.0 * body + 0.55 * slam + 0.18 * latch
    return sos_filter(y, 'lowpass', 3500) / (np.max(np.abs(y)) + 1e-9)


def seatbelt_click():
    """Two-part metal buckle 'clk-chk'."""
    y = buf(0.12)
    mix(y, modal(3100, [(1, 1, 0.006), (1.53, 0.7, 0.004), (2.4, 0.3, 0.003)], 0.04, click=0.6, attack=0.0002), 0.0, 0.7)
    mix(y, modal(4300, [(1, 1, 0.008), (1.38, 0.6, 0.005), (2.2, 0.3, 0.003)], 0.05, click=0.8, attack=0.0002), 0.035, 1.0)
    return y / (np.max(np.abs(y)) + 1e-9)


def _pulse_engine(rate_track, amp_track, body_hz=130):
    """Engine as a train of combustion pulses; firing rate follows rate_track (Hz)."""
    n = len(rate_track); phase = np.cumsum(rate_track) / SR
    idx = np.nonzero(np.diff(np.floor(phase)) > 0)[0] + 1
    imp = np.zeros(n); imp[idx] = amp_track[idx] * RNG.uniform(0.75, 1.0, len(idx))
    kt = t_axis(0.06)
    kern = (np.sin(2 * np.pi * body_hz * kt) + 0.6 * np.sin(2 * np.pi * body_hz * 2.1 * kt)
            + 0.3 * np.sin(2 * np.pi * body_hz * 3.3 * kt)) * np.exp(-kt / 0.012)
    kern += 0.45 * sos_filter(RNG.standard_normal(len(kt)), 'lowpass', 1800) * np.exp(-kt / 0.006)
    y = signal.fftconvolve(imp, kern)[:n]
    tone = np.sin(2 * np.pi * phase) * amp_track * 0.25          # the "vroom" pitch
    y = sos_filter(y + tone, 'lowpass', 1800, 4)
    return y


def engine_start(crank=0.38, catch_rev=0.35, idle=0.5, peak_rate=55, idle_rate=26):
    """Starter 'rrr-rrr-rrr', then the engine catches with a friendly rev and settles."""
    total = crank + catch_rev + idle; t = t_axis(total); n = len(t); y = np.zeros(n)
    # starter motor: whine + noisy chug at ~7 compressions/s
    nc = int(crank * SR); tc = t[:nc]
    whine = np.sin(2 * np.pi * np.cumsum(180 + 40 * tc / crank) / SR)
    chug = signal.sosfilt(signal.butter(2, [200, 1400], btype='band', fs=SR, output='sos'), RNG.standard_normal(nc))
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 7.5 * tc - np.pi / 2) ** 2
    st = (0.35 * whine + 0.6 * chug / (np.max(np.abs(chug)) + 1e-9)) * am * adsr(nc, 0.02, 0.04)
    y[:nc] += 1.3 * st
    # combustion firing rate: slow during crank, rises to a rev peak, eases down to idle
    u = np.clip((t - crank) / catch_rev, 0, 1)
    rise = 10 + (peak_rate - 10) * (np.minimum(u, 0.55) / 0.55) ** 0.7
    fall = peak_rate - (peak_rate - idle_rate) * np.clip((u - 0.55) / 0.45, 0, 1)
    rate = np.where(t < crank, 8.0, np.where(u < 0.55, rise, fall))
    amp = np.where(t < crank - 0.05, 0.0, 1.0)
    amp = amp * (0.6 + 0.4 * np.clip(rate / peak_rate, 0, 1))
    amp *= adsr(n, 0.01, 0.12)
    y += _pulse_engine(rate, amp)
    return y / (np.max(np.abs(y)) + 1e-9)


def engine_rev(sec=1.2, base=22, peak=50, at=0.25):
    """Running engine with one smooth rev (for weaving under music)."""
    t = t_axis(sec); u = np.clip((t - at * sec) / (0.5 * sec), 0, 1)
    rate = base + (peak - base) * np.sin(np.pi * u) ** 1.5
    amp = (0.6 + 0.4 * (rate - base) / (peak - base)) * adsr(len(t), 0.05, sec * 0.3)
    y = _pulse_engine(rate, amp)
    return y / (np.max(np.abs(y)) + 1e-9)


def road_hum(sec, swell=True):
    """Tyre/road rumble: low filtered noise + faint 55 Hz tone, fades in and out."""
    t = t_axis(sec)
    n = sos_filter(RNG.standard_normal(len(t)), 'lowpass', 260, 4)
    n = sos_filter(n, 'highpass', 40); n /= np.max(np.abs(n)) + 1e-9
    y = n + 0.25 * np.sin(2 * np.pi * 55 * t)
    env = np.sin(np.pi * np.linspace(0, 1, len(t))) ** (1.2 if swell else 0.3)
    return y * env


def jingle_beeps(at, y, beat=0.16, gain=1.0, chord=True):
    """Final beep-beep: horn-car voice transposed to C5/E5 with a soft C chord under beep 2."""
    for k in range(2):
        mix(y, horn_voice([n2f('C5'), n2f('E5')], 0.12, scoop=0.04, lp=2300, formant=1100), at + k * beat, gain)
    if chord:
        b2 = at + beat
        for n in ('C5', 'E5', 'G5'):
            mix(y, marimba(n, 1.0, bright=0.5), b2, 0.22)
        mix(y, glock('C7', 1.0, 0.5), b2, 0.12)
        mix(y, soft_bass('C3', 0.8, 0.4), b2, 0.4)
    return y


def jingle_tune(y, at, beat=0.11, gain=1.0, glock_double=True, bass=True):
    """C-E-G | A-G-E | G  (the final C is answered by the beep-beep)."""
    mel = [('C5', 0), ('E5', 1), ('G5', 2), ('A5', 3.5), ('G5', 4), ('E5', 5), ('G5', 6)]
    for n, b in mel:
        mix(y, marimba(n, 0.7), at + b * beat, 0.8 * gain)
    if glock_double:
        for n, b in (('C7', 0), ('G6', 2), ('G6', 6)):
            mix(y, glock(n, 0.8, 0.5), at + b * beat, 0.14 * gain)
    if bass:
        for n, b in (('C3', 0), ('G2', 3.5)):
            mix(y, soft_bass(n, 0.5, 0.3), at + b * beat, 0.45 * gain)
    return at + 7 * beat   # time where the beeps should land


def s_open_A():
    """Full story: door, seatbelt, engine start, tune as the car pulls away, beep-beep."""
    y = buf(3.2)
    mix(y, door_thunk(), 0.0, 1.6)
    mix(y, seatbelt_click(), 0.30, 0.9)
    eng = engine_start(crank=0.34, catch_rev=0.32, idle=0.9)
    mix(y, eng, 0.48, 1.3)
    t0 = 1.12                                          # tune lands as the rev peaks
    music = buf(3.2)
    end = jingle_tune(music, t0, beat=0.105)
    mix(y, road_hum(1.6), t0 - 0.05, 0.10)
    mix(y, whoosh(0.7, 300, 2500), t0 + 0.2, 0.05)
    jingle_beeps(end + 0.02, music, beat=0.15)
    y += reverb(music, 'room', 0.2, 0.0)[:len(y)]
    return reverb(y, 'room', 0.08, 0.5)


def s_open_B():
    """Quicker: engine start + tune + beep-beep (~2 s)."""
    y = buf(2.4)
    eng = engine_start(crank=0.2, catch_rev=0.25, idle=0.6, peak_rate=50)
    mix(y, eng, 0.0, 1.3)
    t0 = 0.38
    music = buf(2.4)
    end = jingle_tune(music, t0, beat=0.095)
    mix(y, road_hum(1.1), t0, 0.08)
    jingle_beeps(end + 0.02, music, beat=0.14)
    y += reverb(music, 'room', 0.2, 0.0)[:len(y)]
    return reverb(y, 'room', 0.08, 0.45)


def s_open_C():
    """Music-forward: the tune leads; an engine rev and road whoosh are woven underneath."""
    y = buf(2.9)
    music = buf(2.9)
    t0 = 0.05
    end = jingle_tune(music, t0, beat=0.12)
    # extra musical layer: shaker on the off-beats, a pluck doubling
    for k in (1, 3, 5):
        mix(music, shaker(0.07, hp=7000), t0 + k * 0.12, 0.05)
    for n, b in (('C4', 0), ('E4', 3.5)):
        mix(music, pluck(n, 0.6, 0.5), t0 + b * 0.12, 0.22)
    mix(y, engine_rev(1.4, base=20, peak=48, at=0.15), 0.0, 0.32)
    mix(y, road_hum(1.6), 0.1, 0.09)
    mix(y, whoosh(0.6, 250, 3500), 0.45, 0.10)          # a car swooshes by mid-tune
    jingle_beeps(end + 0.02, music, beat=0.15)
    y += reverb(music, 'room', 0.22, 0.0)[:len(y)]
    return reverb(y, 'room', 0.08, 0.5)


OPENING = {
    'open-jingle-A': (s_open_A, -16),
    'open-jingle-B': (s_open_B, -16),
    'open-jingle-C': (s_open_C, -16),
}
OPENING_MAX = {'open-jingle-A': 3.0, 'open-jingle-B': 2.1, 'open-jingle-C': 2.7}

# Shipped opening (1.5.1): Mike picked road-trip variant C.
SOUNDS['open-jingle'] = (s_open_C, -16)
MAX_LEN['open-jingle'] = 2.7
CEILING = {'open-jingle': -1.6}
# Opening candidates are not part of the default run (use --set opening).
OPENING['open-jingle-v1'] = (s_open_jingle, -16)   # the first marimba-only jingle
OPENING_CEILING = {'open-jingle-A': -1.6, 'open-jingle-B': -1.6, 'open-jingle-C': -1.6}


# ------------------------------------------------------------- determinism
# Every sound starts from its own frozen RNG state, so each file is reproducible on
# its own, independent of run order, --only filters, or which sounds come before it.
# (v1 used one shared RNG for the whole run, so adding/reordering/swapping a sound -
# e.g. open-jingle -> variant C - shifted the random draws of every later sound.)
# These are the exact PCG64 states each shipped file was rendered with. New sounds
# not in this table get a stable seed derived from their name.
_PCG_INC = 199615241851165080180789096962496371581
RNG_STATES = {
    'tap': 157161227340458728438677729832828379716,
    'claim': 5681056374118824677626040808942428733,
    'invalid': 179343522171599026254240261791533471824,
    'win': 301297294361504185826990538886053893797,
    'round-start': 179984198952885461736405405291823683407,
    'open-jingle': 164522940746280031616294353771395915287,
    'horn-car': 23119947376501306436281682873517382772,
    'horn-truck': 23119947376501306436281682873517382772,
    'halloween/claim': 23119947376501306436281682873517382772,
    'halloween/win': 168660629503618887763921046277382260962,
    'halloween/horn-car': 25770474914713504462141157146806826066,
    'halloween/horn-truck': 87921460171497735238244218454204682151,
    'thanksgiving/claim': 87921460171497735238244218454204682151,
    'thanksgiving/win': 49709526098016888442535193914324942631,
    'thanksgiving/horn-car': 102965788615158869134107247026754161347,
    'thanksgiving/horn-truck': 119933791224566599647350967748922908716,
    'christmas/claim': 313320975455593894661554252828706830851,
    'christmas/win': 223574518564434760890852048739388319707,
    'christmas/horn-car': 71925926319790627018417064878392422125,
    'christmas/horn-truck': 166308102228374175309125216447924805355,
    'open-jingle-v1': 128041878783931419170712267850451866095,
    'open-jingle-A': 157161227340458728438677729832828379716,
    'open-jingle-B': 214107350461133291012071178148286667108,
    'open-jingle-C': 164522940746280031616294353771395915287,
}


def reset_rng(name):
    if name in RNG_STATES:
        RNG.bit_generator.state = {'bit_generator': 'PCG64', 'has_uint32': 0, 'uinteger': 0,
                                    'state': {'state': RNG_STATES[name], 'inc': _PCG_INC}}
    else:
        RNG.bit_generator.state = np.random.PCG64(zlib.crc32(name.encode()) ^ 20261031).state


def main():
    repo_root = Path(__file__).resolve().parents[2]      # scripts/sounds/make_sounds.py -> repo
    ap = argparse.ArgumentParser(description='Render Backseat Games sound effects.')
    ap.add_argument('--out', help='output folder (default: <repo>/assets/sounds, or '
                    '<repo>/build/opening-variants with --set opening)')
    ap.add_argument('--rate', type=int, default=22050, help='sample rate (default 22050)')
    ap.add_argument('--only', nargs='*', help='names to render, e.g. claim halloween/win')
    ap.add_argument('--set', choices=['main', 'opening'], default='main',
                    help='main = the 20 shipped sounds; opening = jingle candidates A/B/C/v1')
    a = ap.parse_args()
    if a.set == 'main':
        table, caps, ceil = SOUNDS, MAX_LEN, CEILING
        out = Path(a.out) if a.out else repo_root / 'assets' / 'sounds'
    else:
        table, caps, ceil = OPENING, OPENING_MAX, OPENING_CEILING
        out = Path(a.out) if a.out else repo_root / 'build' / 'opening-variants'
    for name, (fn, target) in table.items():
        if a.only and name not in a.only:
            continue
        reset_rng(name)
        kw = {'ceiling_db': ceil[name]} if name in ceil else {}
        x = finish(fn(), a.rate, target, caps.get(name), **kw)
        path = out / (name + '.wav')
        path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(str(path), x, a.rate, subtype='PCM_16')
        print(f'{path}  {len(x)/a.rate:.3f}s  tp {true_peak_db(x, a.rate):.1f} dBTP  lufs {active_lufs(x, a.rate):.1f} (target {target})')


if __name__ == '__main__':
    main()
