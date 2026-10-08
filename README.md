# The Unseen Game

A visual account of the first UK Celebrity Traitors series (2025). Full series spoilers.

**Live site:** https://niksargent.github.io/traitors-celeb-01/

## Experience

- Five narrated stories about voting partners, mistaken suspicion and the final result.
- Six illustrated player cards with their key moments and supporting sources.
- A moving network of voting groups, with round selection and animated departures.
- Three episode cliffhangers that reveal what happened after the break.
- Player comparisons and the complete voting record.
- Persistent navigation, shareable story links and downloadable posters.

## Run locally

Requires Node.js 22 or later. No dependencies or API keys are required.

```sh
npm start
npm test
npm run build
```

The local site runs at http://localhost:4173/. The build writes the public site to `dist/`.

## Publish

GitHub Pages deploys through `.github/workflows/pages.yml` after a push to `main`. You can also run **Publish GitHub Pages** from the repository's Actions tab. The workflow runs tests before deployment.

Asset paths are relative, so the site works within the repository's Pages subpath. Local conversations, auditions and research notes are excluded from this repository.

## Data and media

The voting ledger contains 103 ballots across nine ordinary rounds and one restricted revote. Sources are linked within the site and in `src/data.js`. Interpretations draw on the votes and published accounts; a shared target does not establish friendship.

Tarot artwork is original generated symbolic art. Narration uses the selected Zane voice from ElevenLabs. All media required by the site is included; the published site makes no speech-generation requests.

This is an independent project, not an official BBC or Studio Lambert website.
