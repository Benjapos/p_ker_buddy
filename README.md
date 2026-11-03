# P_Ker Buddy

Live site: https://benjapos.github.io/p_ker_buddy

Three things in one static site (no backend):

- **Leaderboard and blind timer** (`public/results.html`) – rankings, game history and a tournament clock for our poker nights.
- **Equity calculator** – real Monte Carlo simulation (20,000 hands) of your hand against a preset or custom opponent range.
- **Hand advisor** – preflop advice from position-based GTO opening ranges, plus postflop hand strength and an equity estimate simulated against random opponents.

## Updating the leaderboard

The Google Sheet is the single source of truth. Edit the sheet; the page reloads the published CSV every time it is opened, so nothing needs to be committed or deployed.

Columns: `date` (DD/MM/YYYY), `winners` (comma separated), `split` (TRUE/FALSE), `notes`, `player1`…`player8`, `host`.

The sheet's CSV link is `GOOGLE_SHEETS_CSV_URL` in `public/results.html`. It must stay published via *File → Share → Publish to web → CSV*.

## Development

```bash
npm install
npm start          # dev server on http://localhost:3000
npm test           # unit tests (equity engine, poker logic, components)
```

## Deploying

GitHub Pages serves the `docs/` folder on `main`.

```bash
npm run build      # builds, then copies the output into docs/
```

Commit the updated `docs/` folder and push.

## Layout

| Path | What it is |
| --- | --- |
| `src/utils/equity.js` | Hand evaluator and Monte Carlo equity engine |
| `src/utils/pokerLogic.js` | GTO ranges, pot odds, hand strength |
| `src/mockBackend.js` | Offline analysis used by the advisor (no server involved) |
| `src/components/` | React UI |
| `public/results.html` | Standalone leaderboard and timer |
| `trainer-buddy/` | Separate Vite + TypeScript trainer prototype (not part of the live site) |
