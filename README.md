# Greenspector V2

Site marketing **statique** bilingue (FR + EN) pour Greenspector. Aucun runtime serveur : le déploiement sert des fichiers HTML/CSS/JS déjà générés.

## Comment ça marche

```
content/**/*.json  →  npm run build  →  index.html, en/**/index.html, assets/js/nav-data.js, sitemap.xml
```

| Couche | Rôle |
|--------|------|
| **`content/`** | Source de vérité éditoriale (JSON FR/EN, registry, navigation) |
| **`scripts/build-site.js`** | Génère les pages HTML + données de nav |
| **HTML à la racine et sous `/en/`** | Artefacts de build — ne pas les éditer à la main |
| **`assets/`** | CSS, JS client, images, polices |

### Pourquoi du JSON plutôt que du HTML seul ?

- **Cible le contenu** (`meta`, `hero`, `bodyHtml`) sans toucher au layout (header/footer/hreflang).
- **Miroir FR/EN** strict (`validate`) pour limiter les dérives bilingues.
- **Build unique** : menu, footer et SEO sont régénérés de façon cohérente.

Les agents / éditeurs modifient les JSON ; un développeur ou la CI lance le build.

## Documentation

| Doc | Audience |
|-----|----------|
| [`docs/AGENTS.md`](docs/AGENTS.md) | Flotte d’agents RAG (règles opérationnelles, scripts) |
| [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) | Structure `content/`, templates, workflow éditorial |
| [`docs/RAG_TRANSLATION_RULES.md`](docs/RAG_TRANSLATION_RULES.md) | Traduction FR→EN (glossaire, checklist) |

## Arborescence utile

```
content/
  registry.json          # Index des pages (id, path, slug, template)
  slug-map.json          # Correspondance slugs FR ↔ EN
  fr|en/pages/**/*.json  # 1 fichier = 1 page
  fr|en/navigation.json
  schema/                # JSON Schema des templates
scripts/                 # Build, validate, utilitaires (voir docs/AGENTS.md)
assets/css|js|img|fonts
docs/
*.html / en/**           # Générés — ne pas éditer
```

## Commandes

```bash
npm install
npm run validate   # Cohérence FR/EN + registry
npm run build      # Minify CSS + HTML + nav-data.js + sitemap
npm run ci         # validate + optimize-images + build
```

| Commande | Rôle |
|----------|------|
| `npm run validate` | Vérifie chaque page FR a son miroir EN |
| `npm run build` | `minify-css` + `build-site` |
| `npm run ci` | Pipeline local = CI |
| `npm run optimize-images` | Variantes WebP / largeurs |
| `npm run minify` | CSS minifié seul |
| `npm run fonts` | Télécharge les polices Inter |
| `npm run case-study-logos` | Récupère les logos études de cas |
| `npm run generate-redirects` | Régénère `.htaccess` (marketing + blog) |
| `npm run audit-links` | Audit des liens internes (blog WP) |
| `npm run audit-relative-links` | Liste les liens relatifs dans le blog |

Utilitaire hors npm : `node scripts/sync-external-images.js` (option `--rewrite`) pour localiser les images externes.

## Déploiement

**Le serveur de production n’a besoin d’aucun Node.js.**

| Où | Node ? | Rôle |
|----|--------|------|
| Serveur / hébergeur | Non | Sert HTML, CSS, JS, images |
| Poste dev ou CI | Oui | `npm run build` quand le contenu change |

Workflow : `npm run build` (ou CI) → uploader le site tel quel (FTP, S3, etc.). Le dossier `content/` peut rester dans Git pour les éditeurs/agents, mais **n’est pas requis** sur le serveur.

## Navigation (résumé)

Le menu n’est pas dupliqué dans chaque HTML. Au build, les pages et libellés i18n alimentent `assets/js/nav-data.js`. Au runtime, `main.js` injecte header/footer à partir de `body[data-page]` (slug, locale, slugs FR/EN).

Détail éditorial : [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md).

## CI

Fichiers : `.github/workflows/main.yml`, `.gitlab-ci.yml`.

Pipeline typique : `validate` → `optimize-images` → `build` → commit éventuel des artefacts sur `master`.
