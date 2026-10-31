# Sound generator

`make_sounds.py` renders all 20 Backseat Games sound effects into `assets/sounds/` as 22050 Hz, 16-bit mono WAV:
- **Base:** tap, claim, invalid, win, round-start, open-jingle, horn-car, horn-truck.
- **Themes:** `halloween/`, `thanksgiving/` and `christmas/` each get claim, win, horn-car and horn-truck.

Every sound is synthesized in Python (marimba, glockenspiel, celesta, bells, plucks, horns, sleigh bells, a road-trip opening). There are no samples or soundfonts. The script **replaces** the old `scripts/generate-sounds.mjs` and `scripts/generate-theme-sounds.mjs`. Don't run those anymore, because they would overwrite these files.

## Run (Windows, from the repo root)

```
py -m pip install -r scripts/sounds/requirements.txt
py scripts/sounds/make_sounds.py
```

Options:
- `--only claim halloween/win` renders just those sounds.
- `--rate 44100 --out build/sounds-44k` makes a higher-fidelity copy.
- `--set opening` renders the opening-jingle candidates (A, B, C and the first marimba jingle, v1) into `build/opening-variants/`. They are never part of the default run.

## Reproducibility

Each sound starts from its own frozen random state (`RNG_STATES` in the script). So a sound comes out the same whatever order you run them in and whatever you pass to `--only`. With the pinned versions above, the output matches the committed WAVs bit for bit.

Different numpy, scipy or OS math libraries can change the last bit of some samples. That difference is inaudible. A sound that isn't in `RNG_STATES` gets a stable seed from its name.

To change a sound, edit its `s_*` function, re-run, then listen before you commit.
