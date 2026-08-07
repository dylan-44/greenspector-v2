# Guide agents RAG — Greenspector V2

Document d’**entrée prioritaire** pour les agents IA qui éditent le contenu du site à la demande d’utilisateurs non-développeurs.

Voir aussi :

- [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md) — structure `content/`, templates
- [`RAG_TRANSLATION_RULES.md`](RAG_TRANSLATION_RULES.md) — traduction FR→EN
- [`../README.md`](../README.md) — hub développeur (build, déploiement)

---

## Règle d’or

```
✅ Éditer uniquement content/**/*.json (et éventuellement content/registry.json, slug-map, navigation, case-studies)
❌ Ne jamais éditer :
   - les HTML à la racine ou sous en/
   - assets/js/nav-data.js, site-data.js, case-studies-data.js
   - sitemap.xml (généré)
```

Ces fichiers sont **produits** par `npm run build`. Les modifier à la main crée une dérive irrécupérable au prochain build.

---

## Comment fonctionne le projet

Site marketing **statique** bilingue. Le contenu vit en JSON ; un build Node (dev ou CI) génère les pages HTML.

```
content/fr|en/pages/<path>.json
        │
        ▼
  npm run build   (humain ou CI — l’agent n’est pas obligé de le lancer)
        │
        ▼
  /<slug>/index.html          (FR)
  /en/<slug-en>/index.html    (EN)
  assets/js/nav-data.js
  sitemap.xml
```

**Pourquoi JSON ?** Pour cibler le contenu (`meta`, `hero`, `bodyHtml`) sans casser le layout, et pour garder un miroir FR/EN validable.

L’agent **commit les JSON** ; un développeur ou la CI rebuild.

---

## Où trouver / modifier une page

1. Ouvrir [`content/registry.json`](../content/registry.json).
2. Trouver la page par `id`, `slug` ou `path`.
3. Éditer :
   - FR : `content/fr/pages/<path>.json`
   - EN : `content/en/pages/<path>.json` (même `path`)

Exemple : `path: "a-propos/equipe-greenspector"`  
→ `content/fr/pages/a-propos/equipe-greenspector.json`  
→ `content/en/pages/a-propos/equipe-greenspector.json`

Champs typiques (template `html`) : `meta`, `nav`, `hero`, `bodyHtml`.  
Conservez les balises HTML, classes CSS, `href`, `src`, slugs. Traduisez seulement le texte visible.

Nouvelle page : ajouter une entrée dans `registry.json` (+ `slug-map.json` si slug EN différent), créer la paire FR/EN. Détail : CONTENT_GUIDE + RAG_TRANSLATION_RULES.

---

## Ce que l’agent peut faire

- Modifier le texte FR ou EN dans les JSON de pages
- Mettre à jour `meta` / `hero` / `bodyHtml` / cartes études de cas
- Corriger des liens **dans** `bodyHtml` (chemins absolus type `/contact/` : le build les relative)
- Suivre le glossaire et la checklist de [`RAG_TRANSLATION_RULES.md`](RAG_TRANSLATION_RULES.md)

## Ce que l’agent ne doit pas faire

- Éditer ou « corriger » les HTML générés
- Lancer `npm run build` / `ci` / scripts Node **sauf consigne explicite** de l’utilisateur (souvent pas d’environnement Node côté flotte)
- Modifier CSS/JS/layout sans demande explicite
- Traduire les slugs d’URL, les noms de classes, ou la marque `Greenspector Studio`
- Supprimer des scripts ou changer `package.json` sans demande
- Inventer des pages hors `registry.json`

---

## Catalogue des scripts

**Pour l’agent : ignorer par défaut.** Réservé aux développeurs / CI.

### npm (`package.json`)

| Commande | Script | Usage |
|----------|--------|--------|
| `npm run validate` | `scripts/validate-content.js` | Vérifie miroir FR/EN + registry |
| `npm run build` | `minify-css.js` + `build-site.js` | Génère HTML, nav-data, sitemap |
| `npm run ci` | validate + optimize-images + build | Pipeline complet |
| `npm run minify` | `scripts/minify-css.js` | CSS minifié |
| `npm run optimize-images` | `scripts/optimize-images.js` | WebP / largeurs |
| `npm run fonts` | `scripts/fetch-inter-fonts.js` | Polices Inter |
| `npm run case-study-logos` | `scripts/fetch-case-study-logos.js` | Logos case studies |
| `npm run generate-redirects` | `scripts/generate-blog-redirects.js` | Régénère `.htaccess` |
| `npm run audit-links` | `scripts/audit-internal-links.js` | Audit liens blog |
| `npm run audit-relative-links` | `scripts/audit-relative-links.js` | Liens relatifs blog |

### Autres fichiers `scripts/`

| Fichier | Rôle | Agent |
|---------|------|--------|
| `build-site.js` | Moteur de génération HTML | Ignorer |
| `lib/*` | Layout, renderers, slugs, images, icons… | Ignorer |
| `sync-external-images.js` | Télécharge / réécrit images externes | Ignorer |
| `redirects/*` | Fragments `.htaccess` + `page-redirects.json` | Ignorer |

---

## Fichiers à indexer en priorité (RAG)

1. `docs/AGENTS.md` (ce fichier)
2. `docs/CONTENT_GUIDE.md`
3. `docs/RAG_TRANSLATION_RULES.md`
4. `content/registry.json`
5. `content/schema/page-*.json`
6. `content/fr/navigation.json` + `content/en/navigation.json`
7. `content/fr/case-studies.json` + `content/en/case-studies.json`
8. `README.md` (contexte build / déploiement)
