# 30-second demo video (English)

Produced on 15 November 2026 by Joshua with assistance from Claude. **Duration: 28.6 s**, 1920×1080, 30 fps, H.264 + AAC (silent audio track in the silent version). The file `altaris_demo.mp4` is not in the repository (16 MB): it is delivered separately and uploaded to a public platform.

## What is shown (all in English, all real)
| Time | Image | Caption |
|---|---|---|
| 0:00–0:02.5 | Globe seen from space | NASA Space Apps Challenge 2026 · Team ALTARIS |
| 0:02.5–0:05 | Flight to Central America | The challenge: Be An Earth System Trend Detective! |
| 0:05–0:10 | The 4,332 cells light up | ALTARIS · How much confidence does a rainfall trend deserve? · NASA GPM IMERG V07 · 4,332 places · 7 countries · 2001–2024 |
| 0:10–0:13 | Honduras case (real interface) | Open any place: 24 years of NASA satellite rainfall, one square at a time. |
| 0:13–0:18 | The slider moves from 2001–2024 to 2001–2010; the slope changes from −48.3 to +381.9 mm per decade | Change the years. The same place tells a different story. |
| 0:18–0:23 | Table with the verdict "Limited evidence" and its reasons | Read the evidence: A weak signal is not a confirmed change. |
| 0:23–0:25 | Evidence passport | Audit it: Every result ships with an evidence passport. |
| 0:25–0:28.6 | Closing card with the address, the team and credits | Turn any rainfall line into a question you can test. Next: more places, more variables, and every student a data detective. |

## How it was made (production statement)
- The images are **real screen captures of the application** using the observed data of the 7-country JSON (`pipeline_commit` 7e93e46), built from `main` (`bb8ee96`). There are no AI-generated images or video and no external photographs. The silent version has no audio; the music version carries an original soundtrack generated with code (see below).
- The capture is deterministic: a Playwright script computes the globe camera, the slider and the scroll at every instant and takes one image per frame (`capture.cjs`); `encode.py` blends the two scenes and encodes with ffmpeg. The captions are an HTML layer over the same page.
- The globe uses NASA Blue Marble, NASA GIBS clouds (VIIRS NOAA-20) and stars from the Hipparcos/Yale catalogue. Fonts: Inter and Space Grotesk.
- **AI assistance:** the capture and montage scripts and the application code were written with AI assistance (Claude); content decisions and the script are the team's. This is declared in the form ("Use of AI").
- The capture copy of the application has one added line in `RegionMap.tsx` (`window.__map = map`) so the camera can be moved; that line is **not** in the published code.

## Music version (optional)
There are two files: `altaris_demo.mp4` (silent) and `altaris_demo_music.mp4` (with background music). The message is carried by the captions in both.
- **The music is original and generated with code** (`music.py`, numpy synthesis; no samples, no third-party music), composed with AI assistance (Claude). It follows the video: an open pad while the globe crosses space, a soft low hit when the title appears, a steady arpeggio while exploring, a descending sweep in sync with the year slider (13.3–16.8 s), suspended chords (no third) over "a weak signal is not a confirmed change", and a bright resolution at the close.
- **Measured:** −18.9 LUFS integrated, peak −4.8 dBFS, no clipping, 28.6 s. It **could not be listened to** during production: it must be heard before use, with headphones and on a phone.
- **Mandatory disclosure when used:** generated audio requires disclosure in the descriptive text and in the metadata. In "Use of AI" of the form: *"The background music of the demo video is an original score synthesised with code (no samples or third-party music) and composed with AI assistance (Claude); it is AI-generated audio."* If the silent version is delivered, this is not needed.

## Challenge requirements and status
| Requirement | Status |
|---|---|
| 30 seconds at most | **Met**: 28.6 s (`ffprobe`) |
| Introduce yourself: name and team | **Met** (0:00–0:02.5) |
| The challenge addressed | **Met** (0:02.5–0:05) |
| Project name and tagline | **Met** (0:05–0:10) |
| How it works, with images and use of open NASA data | **Met**: real interface; IMERG V07, GIBS and Blue Marble cited |
| Look to the future | **Met**, briefly (closing card) |
| Readable without prior context | Captions of 46–64 px at 1080p; interface enlarged 1.25×. Still to check: someone outside the team watching without sound on a phone |
| No one under 18, no personal data | **Met**: only the team's first names appear |
| Public link, no password or registration | Done when uploading; test it in a private window |
| The closing address opens the published version | Check `altaris.altaris-panel-rol5.workers.dev` |

## Regenerate
Requires the application built with the capture line, `vite` on port 5300 and Playwright with ffmpeg.
```bash
node capture.cjs            # 858 frames in frames/ (about 15 min)
python3 encode.py           # altaris_demo.mp4 and altaris_demo.en.srt
```
The texts are at the top of `capture.cjs` (caption layer) and in the `cues` list of `encode.py` (subtitles).
