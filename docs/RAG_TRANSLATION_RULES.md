# Règles pour la flotte d'agents RAG — Greenspector V2

Document de référence pour les agents IA qui **traduisent** ou peaufinent le contenu EN du site (glossaire, checklist, erreurs à éviter).

**Fonctionnement du projet, sources de vérité, scripts :** commencer par [`AGENTS.md`](AGENTS.md).  
Structure éditoriale : [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md).  
Hub développeur : [`../README.md`](../README.md).

À indexer avec `AGENTS.md` dans la base RAG de la flotte.

---

## Règle d'or

```
✅ Éditer uniquement les fichiers JSON dans content/
❌ Ne jamais éditer index.html, en/**/*.html, assets/js/site-data.js
```

Ces HTML sont **générés** par `npm run build` (poste dev ou CI). Les modifier directement crée une dérive FR/EN irrécupérable.

---

## Architecture bilingue en une phrase

| Langue | Fichiers source | URL publiée |
|--------|-----------------|-------------|
| FR (source éditoriale) | `content/fr/pages/**/*.json` | `https://greenspector.com/<slug>/` |
| EN (traduction) | `content/en/pages/**/*.json` | `https://greenspector.com/en/<slug>/` |

**1 page = 1 paire de JSON** au même chemin relatif (`studio/banc-tests-mobiles.json`, etc.).

L'index global est `content/registry.json` : chaque entrée a un `id`, un `path`, un `slug`, un `template`.

---

## Workflow agent : traduire une page existante

### Étape 1 — Identifier la page

1. Ouvrir `content/registry.json`.
2. Trouver l'entrée par slug ou nom (`id`, ex. `case-ans`).
3. Noter : `path`, `template`, `slug`.

### Étape 2 — Lire le source FR

```
content/fr/pages/<path>.json
```

Exemple : `path: "ressources/etudes-de-cas/ans-ethique-numerique"`  
→ `content/fr/pages/ressources/etudes-de-cas/ans-ethique-numerique.json`

### Étape 3 — Produire ou mettre à jour le fichier EN

```
content/en/pages/<path>.json   ← même chemin que le FR
```

**Copier la structure JSON du FR à l'identique.** Traduire uniquement les valeurs textuelles (voir § « Que traduire »).

### Étape 4 — Vérifier les fichiers satellites (si applicable)

| Fichier | Quand |
|---------|-------|
| `content/en/case-studies.json` | Page listée dans la grille des études de cas |
| `content/en/navigation.json` | Libellés UI globaux (rare, déjà traduit) |
| `content/en/page-overrides.json` | Optionnel : surcharges par `id` (ex. `case-ans`) |

### Étape 5 — Validation (par un dev ou la CI)

```bash
npm run validate   # vérifie que chaque page FR a son miroir EN
npm run build      # régénère les HTML
```

L'agent RAG **ne lance pas obligatoirement** le build s'il n'a pas Node : il commit les JSON ; un humain ou la CI build.

---

## Workflow agent : créer une nouvelle page bilingue

1. Ajouter une entrée dans `content/registry.json` (`id`, `path`, `slug`, `template`, `status`).
2. Créer `content/fr/pages/<path>.json` (contenu FR complet).
3. Créer `content/en/pages/<path>.json` (traduction EN complète, même structure).
4. Si visible au menu : ajouter dans `content/nav-pages.json` (section, name, slug, primary, secondary).
5. Si étude de cas en grille : ajouter une carte dans `content/fr/case-studies.json` **et** `content/en/case-studies.json`.
6. Respecter le schéma JSON du template (`content/schema/page-*.json`).

---

## Que traduire / que ne pas traduire

### ✅ Traduire (valeurs textuelles)

| Zone JSON | Exemples |
|-----------|----------|
| `meta.title`, `meta.description`, `meta.keywords`, `meta.ogTitle`, `meta.ogDescription` | Titres SEO, descriptions |
| `nav.name`, `nav.primary`, `nav.secondary` | Libellés menu (EN uniquement dans le JSON EN) |
| `hero.label`, `hero.title`, `hero.subtitle`, `hero.slugNote` | Bandeau hero |
| `hero.actions[].label` | « Request a demo », « Discover Greenspector Studio » |
| `intro`, `results`, `successKeys`, `testimonial`, `cta` | Études de cas structurées |
| `bodyHtml` | **Texte visible uniquement** (voir § HTML) |
| `contentMeta[]` | Métadonnées éditoriales |
| `gridLabel` | Index études de cas |
| `logos[].alt`, `intro.image.alt`, `media[].alt`, `media[].caption` | Textes alternatifs et légendes |

### ❌ Ne pas traduire / ne pas modifier

| Champ | Raison |
|-------|--------|
| `id`, `slug`, `template` | Identifiants stables FR/EN |
| `hero.actions[].href`, `cta.buttonHref` | Slugs absolus (`/contact/`, `/studio/.../`) — identiques FR et EN |
| `logos[].src`, `intro.image.src`, `media[].src`, `testimonial.photo` | URLs d'images |
| `successKeys.items[].icon` | Nom Font Awesome (`graduation-cap`, `mobile-screen`, etc.) |
| `&nbsp;`, entités HTML dans le texte | Conserver si présentes dans le FR |
| Balises HTML dans `bodyHtml` | Structure intacte, seul le texte change |

### Marques et termes à conserver en anglais

- **Greenspector**, **Greenspector Studio** (marque)
- **Ecoscore**, **DevGreenOps**, **Smart'Use** (noms produits / labels clients)
- **CI/CD**, **SaaS**, **Green IT** (termes métier usuels en EN)
- Noms d'organismes officiels en EN quand il existe une forme consacrée (ex. « French Digital Health Agency » pour l'ANS)

### Slugs URL

Les slugs FR et EN sont **distincts** (SEO, pas de duplicate content sur le chemin) :

```
FR : /studio/banc-tests-mobiles/
EN : /en/studio/mobile-device-testing/
```

Mapping central : `content/slug-map.json` (par `id` registry).

- **JSON contenu** : chemins FR inchangés (`content/fr/pages/studio/banc-tests-mobiles.json`)
- **JSON EN** : même chemin logique (miroir FR), les `href` internes restent en slug FR — le build les convertit
- **Sortie HTML EN** : dossiers anglais (`en/studio/mobile-device-testing/`)
- **Cartes études de cas EN** : slugs anglais dans `content/en/case-studies.json`

---

## Traduction par template

Consulter le schéma : `content/schema/page-<template>.json`.

### `default` (pages stub)

Traduire : `meta`, `hero`, `nav`, `contentMeta`.  
Pas de `bodyHtml` → le message « contenu à venir » vient de `content/en/navigation.json` → `stubMessage` (déjà : *Editorial content to be completed in a future iteration*).

### `html` (pages riches)

Traduire : `meta`, `hero`, `nav`, et **tout le texte dans `bodyHtml`**.  
Conserver la structure HTML (classes CSS, balises, attributs `class`, `id`, `aria-*`).

### `home`

Traduire : `meta`, `nav`, et **tout le texte dans `bodyHtml`** (sections home-section, cartes, CTA).  
Ne pas retirer `class="home-page"` du build (géré par le template, pas dans le JSON).

### `case-study` (études de cas structurées)

Traduire **tous** les champs textuels listés dans `page-case-study.json`.  
Référence de qualité : `content/en/page-overrides.json` → entrée `case-ans`.

Structure minimale :

```json
{
  "meta": { "title": "...", "description": "...", "ogTitle": "...", "ogDescription": "..." },
  "nav": { "name": "...", "primary": "...", "secondary": "..." },
  "hero": { "label": "Case study", "title": "...", "subtitle": "...", "actions": [...] },
  "logos": [ { "src": "…inchangé…", "alt": "...EN..." } ],
  "intro": { "eyebrow": "Context", "title": "...", "paragraphs": ["..."], "list": ["..."], "image": { "src": "…", "alt": "..." } },
  "results": { "eyebrow": "Results", "title": "...", "items": ["..."] },
  "successKeys": { "eyebrow": "Keys to success", "title": "...", "items": [{ "icon": "…inchangé…", "title": "...", "text": "..." }] },
  "testimonial": { "eyebrow": "Testimonial", "title": "...", "quotes": ["..."], "author": "...", "role": "..." },
  "media": [{ "src": "…", "alt": "...", "caption": "..." }],
  "cta": { "eyebrow": "Your turn", "title": "...", "text": "...", "buttonLabel": "...", "buttonHref": "/contact/" }
}
```

### `case-studies-index`

Traduire : `meta`, `hero`, `gridLabel`.  
Les cartes viennent de `content/en/case-studies.json` (pas du JSON de page).

---

## Règles pour `bodyHtml`

Le champ `bodyHtml` contient du HTML partiel (sans `<html>`, `<head>`, `<body>`).

```
✅ Traduire le texte entre les balises
✅ Traduire les attributs alt="" et aria-label=""
✅ Conserver href="/contact/" (slugs absolus — le build recalcule les ../)
❌ Ne pas ajouter/supprimer de sections
❌ Ne pas changer les classes CSS (home-section, studio-card, btn-gs-primary, etc.)
❌ Ne pas traduire les URLs dans src="https://..."
```

Exemple :

```html
<!-- FR -->
<h2>Découvrez les problèmes de votre app avant vos utilisateurs</h2>

<!-- EN -->
<h2>Find your app issues before your users do</h2>
```

---

## Grille études de cas (`case-studies.json`)

Fichiers séparés :

- `content/fr/case-studies.json`
- `content/en/case-studies.json`

Chaque entrée :

```json
{
  "slug": "ans-ethique-numerique/",
  "title": "French Digital Health Agency",
  "description": "Ecoscore Portal to measure CO₂ impact…",
  "image": "/assets/img/…"
}
```

Traduire : `title`, `description`.  
Ne pas modifier : `slug`, `image`.

Le `slug` doit correspondre au dossier de l'étude de cas (sans `ressources/etudes-de-cas/`).

---

## Libellés UI récurrents (glossaire EN)

Utiliser ces traductions de manière cohérente :

| FR | EN |
|----|-----|
| Étude de cas | Case study |
| Demander une démo | Request a demo |
| Essayer gratuitement | Try for free |
| Découvrir Greenspector Studio | Discover Greenspector Studio |
| Contexte | Context |
| Résultats | Results |
| Clés du succès | Keys to success |
| Témoignage | Testimonial |
| Témoignages | Testimonials |
| Visuels | Visuals |
| Le projet en images | The project in pictures |
| À vous de jouer | Your turn |
| Conseil | Consulting |
| Tarifs | Pricing |
| Ressources | Resources |
| À propos | About |
| Lire l'étude de cas | Read case study |
| Sobriété numérique | Digital sobriety |
| Écoconception logicielle | Software ecodesign |
| Mesure, écoconception logicielle et réduction d'impact numérique. | Measurement, software ecodesign and digital impact reduction. |

Sections menu (`nav.section` dans les JSON de page) : **garder la clé FR** (`Greenspector Studio`, `Conseil`, `Ressources`, `À propos`) — seuls les **labels affichés** viennent de `content/en/navigation.json`.

---

## `page-overrides.json` vs `content/en/pages/`

| Approche | Usage |
|----------|-------|
| **`content/en/pages/<path>.json`** (recommandé) | Fichier EN complet, miroir du FR. C'est la source lue par le build. |
| **`content/en/page-overrides.json`** | Surcharges par `id` registry. Utile pour corriger une page sans réécrire tout le fichier. |

---

## Checklist agent avant de terminer

- [ ] Fichier EN existe au **même `path`** que le FR
- [ ] `registry.json` : entrée présente avec `status: "published"`
- [ ] Tous les champs textuels traduits selon le `template`
- [ ] Aucun `href` / `src` / `icon` / `slug` modifié par erreur
- [ ] `meta.ogTitle` et `meta.ogDescription` traduits (pas seulement `title` / `description`)
- [ ] Étude de cas : carte EN dans `content/en/case-studies.json` si applicable
- [ ] Aucun HTML statique (`*.html` hors `content/`) modifié
- [ ] Ton professionnel B2B, tutoiement absent, phrases courtes SEO-friendly

---

## Prompt système suggéré (copier pour la flotte RAG)

```
Tu es un agent éditorial Greenspector. Tu modifies UNIQUEMENT les fichiers JSON sous content/.

Pour traduire FR→EN :
1. Lis content/registry.json pour identifier id, path et template.
2. Lis content/fr/pages/<path>.json (source).
3. Écris content/en/pages/<path>.json avec la MÊME structure JSON.
4. Traduis toutes les valeurs textuelles en anglais professionnel B2B.
5. Ne modifie jamais : slug, href, src, icon, template, id.
6. Pour bodyHtml : traduis le texte, conserve toutes les balises et classes HTML.
7. Pour case-study : traduis intro, results, successKeys, testimonial, media.caption, cta.
8. Mets à jour content/en/case-studies.json si la page est une carte d'étude de cas.
9. Ne touche jamais aux fichiers .html ni à assets/js/site-data.js.

Référence qualité ANS : content/en/page-overrides.json → "case-ans".
Schémas : content/schema/page-*.json.
Glossaire : docs/RAG_TRANSLATION_RULES.md § Glossaire EN.
```

---

## Erreurs fréquentes à éviter

| Erreur | Conséquence |
|--------|-------------|
| Éditer `en/studio/foo/index.html` | Perdu au prochain build |
| Traduire les slugs URL | Liens FR/EN cassés |
| Oublier `content/en/pages/` | `npm run validate` échoue |
| Traduire `Greenspector Studio` | Incohérence de marque |
| Supprimer `&nbsp;` ou guillemets typographiques `« »` | Régression typographique |
| Paraphraser les chiffres (−36 %, 70+ éditeurs) | Garder les mêmes valeurs |

---

## Fichiers index RAG (priorité d'indexation)

1. `docs/AGENTS.md` (fonctionnement projet, do/don't, scripts)
2. `docs/CONTENT_GUIDE.md`
3. `docs/RAG_TRANSLATION_RULES.md` (ce fichier — traduction)
4. `content/registry.json`
5. `content/schema/page-base.json`, `page-case-study.json`, `page-home.json`, `page-default.json`
6. `content/en/page-overrides.json` (exemple ANS)
7. `content/fr/navigation.json` + `content/en/navigation.json`
8. `content/fr/case-studies.json` + `content/en/case-studies.json`
9. `README.md` (build / déploiement)
