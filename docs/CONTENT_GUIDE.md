# Guide éditorial — Greenspector V2

Ce site est généré à partir de fichiers JSON. **Ne modifiez pas directement les HTML** à la racine ni sous `/en/` : ils sont produits par le build (en local ou en CI).

## Important : pas de Node.js sur le serveur

Le build Node (`npm run build`) s'exécute **uniquement sur un poste de développement ou en CI** (GitHub Actions, etc.).

Le serveur de production reçoit des **fichiers HTML statiques déjà générés** — exactement comme le site actuel. Aucune installation Node, aucune commande à lancer sur l'hébergeur.

Si vous ne modifiez jamais le contenu vous-même, vous pouvez même ne déployer que les HTML/CSS/JS sans le dossier `content/`.

## Structure

```
content/
  registry.json           # Index des pages (id, slug, template, statut)
  nav-pages.json          # Entrées de navigation (FR)
  schema/                 # JSON Schema par type de page
  fr/
    navigation.json       # Libellés UI français
    case-studies.json     # Cartes de l'index études de cas
    pages/**/*.json       # Contenu FR (1 fichier = 1 page)
  en/
    navigation.json       # Libellés UI anglais
    case-studies.json     # Cartes EN
    page-overrides.json   # Surcharges EN (meta, hero, études de cas)
    pages/**/*.json       # Contenu EN (miroir strict de fr/pages/)
```

## Ajouter ou modifier une page

1. Repérez l'`id` dans `content/registry.json`.
2. Éditez `content/fr/pages/<chemin>.json` et `content/en/pages/<chemin>.json` (ou lancez `npm run seed-en` après modification FR).
3. Pour l'anglais, complétez `content/en/page-overrides.json` si une traduction automatique ne suffit pas.
4. Lancez `npm run build` (ou `npm run validate && npm run build` en CI).
5. Committez les **JSON sources** et les HTML générés.

## Types de templates

| Template | Usage |
|----------|--------|
| `home` | Page d'accueil (`bodyHtml` complet) |
| `html` | Page riche (hero + `bodyHtml`) |
| `default` | Stub ou contenu partiel (`contentMeta` + zone vide) |
| `case-study` | Étude de cas structurée (intro, résultats, clés, témoignage, CTA) |
| `case-studies-index` | Index grille alimentée par `case-studies.json` |

Schémas : `content/schema/page-base.json`, `page-home.json`, `page-default.json`, `page-case-study.json`.

## URLs

- FR : `https://greenspector.com/studio/banc-tests-mobiles/`
- EN : `https://greenspector.com/en/studio/mobile-device-testing/` (slugs anglais, voir `content/slug-map.json`)

Chaque page génère `hreflang`, canonical et `data-page` avec `locale`, `slugFr`, `slugEn`.

## Commandes

```bash
npm install
npm run extract    # Ré-extraire le FR depuis les HTML (migration ponctuelle)
npm run seed-en    # Regénérer les JSON EN depuis le FR
npm run validate   # Vérifier la présence FR/EN
npm run build      # Générer HTML + assets/js/site-data.js + sitemap.xml
```

## Pour les agents RAG

- **1 page = 1 JSON** : retrieval simple par chemin ou `id` du registry.
- **Éditez directement** `content/fr/pages/<chemin>.json` et `content/en/pages/<chemin>.json` — champs `meta`, `hero`, `bodyHtml` selon le template.
- **Ne lancez pas Node** dans votre environnement : le build (`npm run build`) est exécuté par la CI ou un développeur au moment du déploiement.
- **Ne modifiez pas** les fichiers HTML à la racine ni sous `/en/` : ils sont régénérés à partir des JSON.
- **Ignorez** les scripts `scripts/build-*-page.js` s'ils existent encore : ce sont des utilitaires ponctuels de migration, pas la source de vérité. La source de vérité est toujours le JSON dans `content/`.
- Les champs documentés dans les JSON Schema décrivent la structure attendue.
- Les études de cas complètes utilisent le template `case-study` (pas de HTML libre).
- Les pages stub ont `"template": "default"` sans `bodyHtml`.
- Le statut `"published"` dans le registry indique une page visible ; `"draft"` peut masquer le lien EN (évolution future).

### Exemple : modifier la page RSE

Fichier source FR : `content/fr/pages/a-propos/rse.json`

- `hero.title`, `hero.subtitle`, `hero.reassurance` → bandeau d'en-tête
- `bodyHtml` → corps de la page (HTML avec classes CSS existantes : `studio-section`, `studio-card`, etc.)
- Fichier miroir EN : `content/en/pages/a-propos/rse.json`

Après commit des JSON, la CI régénère `a-propos/rse/index.html` et `en/about/csr/index.html`.

**Règles de traduction FR→EN pour la flotte IA :** voir [`RAG_TRANSLATION_RULES.md`](RAG_TRANSLATION_RULES.md) (glossaire, checklist, prompt système, erreurs à éviter).
