# BCG Sports Meet 2027

A responsive, multi-page sports meet score website for Bandaranayake College, Gampaha.

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

The included scores and athlete names are **sample data**. Editor changes are saved to this browser's local storage. The search code is a convenience gate, not secure authentication. Shared, official results require a backend with authentication and a database before publishing for live scoring.
