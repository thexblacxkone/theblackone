# theblackone.dk

En helt statisk one-page portfolio bygget i plain HTML, CSS og JavaScript. Den kræver ingen build pipeline og er derfor oplagt til GitHub Pages.

## Filer

- `index.html` – indhold og struktur
- `styles.css` – alt design og responsive styles
- `script.js` – animationer, øjne, particles, menu, scroll reveal m.m.
- `favicon.ico` – behold din nuværende favicon-fil
- `assets/emma.jpg` – valgfrit portrætbillede
- `CNAME` – behold din nuværende fil med `theblackone.dk`

## Hurtigste vej til GitHub Pages

1. Download zip-filen og pak den ud.
2. Behold din eksisterende `CNAME` og `favicon.ico` i repoets rod.
3. Upload/erstat `index.html`, og upload `styles.css` + `script.js`.
4. Opret en mappe `assets` i repoet og læg eventuelt et billede ind som `assets/emma.jpg`.
5. Commit til `main`.
6. Gå på GitHub til **Settings → Pages**.
7. Under **Build and deployment** vælger du **Deploy from a branch**.
8. Vælg **main** og **/(root)** og tryk **Save**.
9. Da du allerede bruger et custom domain, bør din `CNAME` fortsat indeholde `theblackone.dk`.

## Ting du sandsynligvis vil ændre

I `index.html`:

- mailadressen i kontaktsektionen
- LinkedIn-link
- GitHub-link
- tekst i intro/about
- projekter og cases
- tidslinje

## Portrætbillede

Hvis du lægger et billede ind som:

`assets/emma.jpg`

... bliver placeholderen automatisk skjult. Et lodret billede omkring 4:5 fungerer bedst.

## Lokal test

Du kan dobbeltklikke på `index.html`, men pga. browser-cache er det ofte rarere at bruge fx VS Code + Live Server.
