# Lirija · Salon venčanica, Beograd

Sajt salona venčanica **Lirija**: kolekcije Selestia Paris, Albina Dyla i Vladiyan, privatne probe i zakazivanje.

Statičan sajt (HTML, CSS i JavaScript) koji ne zahteva build, server ni bazu podataka, pa radi direktno na GitHub Pages.

## Struktura

```
index.html            cela stranica
assets/css/           stilovi (lirija.css)
assets/js/            animacije i skrol (lirija.js, lenis.min.js)
assets/img/           fotografije kolekcija i galerije
assets/frames/        255 frejmova haljine koja se okreće pri skrolovanju (WebP, iz originalnog videa)
.nojekyll             isključuje Jekyll obradu na GitHub Pages
lovable-izvor/        originalni Lovable projekat (TanStack Start), čuva se samo kao referenca
```

## Objavljivanje na GitHub Pages

Sajt je objavljen na adresi **https://5ar27.github.io/lirija/** i GitHub Pages ga služi sa grane **`gh-pages`**.

Posle svake izmene na `main` grani pošaljite iste izmene i na `gh-pages` (`git push origin main:gh-pages`), inače sajt ostaje na staroj verziji. Ako želite da Pages radi direktno sa `main`, u **Settings → Pages** izaberite branch **main**, folder **/ (root)** i kliknite **Save**.

Sve putanje u sajtu su relativne, pa radi i na sopstvenom domenu (npr. `lirija.rs`) bez izmena.

## Izmene

- Tekstovi i raspored: `index.html`
- Fotografije: zamenite fajl u `assets/img/` istim imenom, ili promenite putanju u `index.html`
- Formular za zakazivanje je trenutno demo i ne šalje podatke

Dizajn i izrada: [Vektor Code](https://www.instagram.com/vektor.code/)
