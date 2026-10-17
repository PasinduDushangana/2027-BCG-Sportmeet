# BCG Sports Meet 2027

A responsive, multi-page sports meet score website for Bandaranayake College, Gampaha. The design uses a black palette with a neon accent driven by the current leading house: Parakrama yellow, Gemunu green, Thissa red, or Vijaya blue. It includes animated scores, scroll reveals, podium entrances, ambient hero effects, and interactive house cards. Motion respects the browser’s reduced-motion preference. The hero is generated sports imagery, not an official college photograph.

## Run locally

```bash
npm ci
npm run dev
```

Build with `npm run build`. The site uses React and Vite. The home, standings, events, and results pages share the same score data.

Push to `main` to trigger the GitHub Pages workflow. The site uses hash routes so page refreshes work on GitHub Pages. Pages must be enabled with **GitHub Actions** as the source in repository settings.

## Editor

Type `1234` in the header search box and submit to open the editor. Other searches open matching events. The editor can add, edit, and remove events and results; adjust house points; and import or export result rows as CSV.

CSV columns: `event,category,division,time,status,house,athlete,place,points`. House is one of `Parakrama`, `Gemunu`, `Thissa`, or `Vijaya`. A matching event and division is updated on import.

## Publish shared scores

The included scores and athlete names are **sample data** until an authorised editor publishes official results. Public pages read the shared `public/scores.json` file from this repository and refresh every 20 seconds while visible. If GitHub's raw feed is unavailable, the site falls back to the deployed file and then the last cached scoreboard. GitHub caching and deployment can delay updates.

1. Open the editor with `1234`, then edit events, results, or house points. Changes are private drafts saved only in your browser.
2. Select **Publish scores**.
3. Create a GitHub fine-grained personal access token for **PasinduDushangana/2027-BCG-Sportmeet**, granting **Contents: Read and write**. Your GitHub account must have write access to the repository; repository policies may require approval.
4. Enter that token in the website's password field and select **Publish for everyone**. The editor confirms when it reads the new public revision.

The token is sent only to GitHub, held in memory, and cleared on successful publication or closing the form. Never commit tokens or put them in score files. The `1234` shortcut only reveals the editor; GitHub authorises publication.

Publishing commits the score file to `main`, triggering the existing Pages workflow. Revision and file SHA checks prevent overwriting another editor's newer publication. If a conflict occurs, back up your draft, load published scores, and reapply your changes. Public pages always use published scores, including when viewed from the editor's browser.

All primary surfaces have rounded corners, with responsive layouts, house-colour neon accents, and reduced-motion support.

## Motion controls

The stadium presentation includes house-colour particles, orbital lights, title highlights, leader indicators, podium float, animated score bars, card hover effects, and route entrances. A floating Motion button saves the visitor’s pause preference. Reduced-motion settings disable decorative movement, and particles stop rendering while the tab is hidden.

## Championship layout

The supplied HouseScore reference screenshots inform the charcoal surfaces, wide typography, animated trophy hero, pride marquee, score highlights, quick links, spacious podium, and four-house result comparisons. House colours retain the college mapping (yellow, green, red, blue). Result cards aggregate each house’s points per event; athlete positions remain available in expandable details. All cards read the existing published scoreboard.

## Entrance and house spotlight

A starting-line loading screen appears on a full page load, uses the real scoreboard connection state, and offers an immediate Enter button or Escape shortcut. It exits when data is ready after a brief entrance, or after four seconds if the connection is slow; score fetching continues in the background. Reduced-motion visitors skip the animated entrance. Background controls are inert while the screen is visible, and scrolling is restored on exit.

The interactive house spotlight shows the selected house’s total points, first-place finishes in completed events, rank, and gap to the current leader. Choosing a house changes only that spotlight; the overall neon theme still follows the leading house.
