"""Monta el video: mezcla la escena del mapa con la de la interfaz, codifica H.264 y escribe los subtítulos.
Uso: python3 encode.py   (lee frames/, escribe altaris_demo.mp4 y altaris_demo.en.srt)"""
import glob, os, shutil, subprocess, sys
from PIL import Image

FPS = 30
SRC, DST = 'frames', 'frames_blend'
MAP_FRAMES = 300          # 10 s de mapa (escena A); el resto es la interfaz (escena B)
BLEND = 15                # 0,5 s de mezcla entre ambas

files = sorted(glob.glob(f'{SRC}/f_*.png'))
n = len(files)
print('cuadros:', n, '=', round(n / FPS, 2), 's')
if os.path.exists(DST): shutil.rmtree(DST)
os.makedirs(DST)
for f in files:
    os.link(f, f'{DST}/{os.path.basename(f)}')

b0 = Image.open(f'{SRC}/f_{MAP_FRAMES:05d}.png').convert('RGB')
for k in range(BLEND):
    i = MAP_FRAMES - BLEND + k
    a = (k + 1) / BLEND
    a = a * a * (3 - 2 * a)
    out = Image.blend(Image.open(f'{SRC}/f_{i:05d}.png').convert('RGB'), b0, a)
    os.remove(f'{DST}/f_{i:05d}.png')
    out.save(f'{DST}/f_{i:05d}.png')

dur = n / FPS
cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{DST}/f_%05d.png',
       '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', f'{dur:.3f}',
       '-vf', f'fade=t=in:st=0:d=0.4,fade=t=out:st={dur - 0.5:.3f}:d=0.5,format=yuv420p',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-profile:v', 'high', '-r', str(FPS),
       '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', 'altaris_demo.mp4']
subprocess.run(cmd, check=True)

def ts(t):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}'
cues = [
    (0.0, 2.5, 'NASA Space Apps Challenge 2026\nTeam ALTARIS'),
    (2.5, 5.0, 'The challenge:\nBe An Earth System Trend Detective!'),
    (5.0, 10.0, 'ALTARIS: how much confidence does a rainfall trend deserve?\nNASA GPM IMERG V07 · 4,332 places · 7 countries · 2001–2024'),
    (10.2, 13.2, 'Open any place:\n24 years of NASA satellite rainfall, one square at a time.'),
    (13.2, 18.0, 'Change the years.\nThe same place tells a different story.'),
    (18.3, 23.0, 'Read the evidence:\nA weak signal is not a confirmed change.'),
    (23.0, 25.4, 'Audit it:\nEvery result ships with an evidence passport.'),
    (25.4, dur, 'Turn any rainfall line into a question you can test.\nNext: more places, more variables, and every student a data detective.\naltaris.altaris-panel-rol5.workers.dev'),
]
with open('altaris_demo.en.srt', 'w', encoding='utf-8') as f:
    for i, (a, b, t) in enumerate(cues, 1):
        f.write(f'{i}\n{ts(a)} --> {ts(min(b, dur))}\n{t}\n\n')
print('listo: altaris_demo.mp4,', round(dur, 2), 's')
