# Greenspector V2

Structure statique initiale du site Greenspector V2.

## Périmètre

- Pages HTML statiques générées à partir du cahier des charges validé.
- Pages de contenu volontairement vierges pour intégration éditoriale ultérieure.
- Bootstrap 5 via CDN.
- CSS personnalisé centralisé dans `assets/css/styles.css`.
- JavaScript vanilla dans `assets/js/main.js`.
- SEO de base : titles, descriptions, canonicals, Open Graph, sitemap et robots.txt.

## Build i18n (FR + EN)

Le contenu éditorial est stocké en JSON sous `content/`. Un script Node **en local ou en CI** génère les HTML FR (racine) et EN (`/en/`).

### Déploiement : 100 % statique, zéro Node sur le serveur

**Le serveur de production n'a besoin d'aucun Node.js, npm, ni étape de build.**

| Où | Node.js ? | Rôle |
|----|-----------|------|
| **Serveur / hébergeur** | Non | Sert uniquement des fichiers : `.html`, `.css`, `.js`, images |
| **Poste dev ou CI** (optionnel) | Oui | Régénère les HTML quand le contenu JSON change |

Ce qui est uploadé sur l'hébergeur, c'est exactement comme avant :

```
index.html
studio/.../index.html
en/index.html
en/studio/.../index.html
assets/css/styles.css
assets/js/main.js
assets/js/site-data.js
sitemap.xml
```

Aucun runtime serveur. Pas de PHP, pas de Node, pas de build à lancer côté hébergeur.

**Workflow recommandé :** vous (ou la CI) lancez `npm run build` en local → vous uploadez le dossier tel quel (FTP, S3, Netlify static, etc.). Les JSON dans `content/` peuvent rester dans le dépôt Git pour les éditeurs/agents, mais **ne sont pas requis sur le serveur**.

```bash
npm install          # uniquement sur poste dev / CI
npm run build        # génère les HTML ; pas sur le serveur
```

Guide éditorial : [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md).  
Règles traduction agents RAG : [`docs/RAG_TRANSLATION_RULES.md`](docs/RAG_TRANSLATION_RULES.md).

## Architecture de navigation

Le site ne duplique pas le menu dans chaque page HTML.

- La source unique de vérité des pages est `content/nav-pages.json` (généré dans `assets/js/site-data.js` au build).
- Les libellés i18n (menu, footer, switcher FR|EN) sont dans `content/{fr,en}/navigation.json` → `window.GS_I18N`.
- Le header et le footer sont générés dynamiquement par `assets/js/main.js`.
- Chaque page expose `slug`, `locale`, `slugFr`, `slugEn` via `data-page` sur le `<body>`.

Ordre de chargement JS (dans les pages) :

1. `site-data.js` charge les données de navigation (`window.GS_PAGES`).
2. `main.js` lit ces données et injecte le header/footer.

## Fonctionnement des menus

Dans `assets/js/main.js` :

- Les sections affichées dans la navigation principale sont : `Greenspector Studio`, `Conseil`, `Tarifs`, `Ressources`, `À propos`.
- Pour chaque section :
	- si une seule page existe, la section devient un lien direct ;
	- si plusieurs pages existent, la section devient un dropdown.
- Le footer reprend un menu simplifié (première page trouvée par section + lien Contact).
- Le lien vers la page active reçoit `aria-current="page"`.

Important :

- Une entrée avec section `Home` existe dans `site-data.js` mais n'est pas incluse dans les groupes du menu principal (retour accueil géré par la marque/logo).

## Slugs et chemins relatifs

Le slug courant est lu dans `body[data-page]`, par exemple :

```html
<body data-page="{&quot;slug&quot;:&quot;/studio/banc-tests-mobiles/&quot;}">
```

`main.js` calcule ensuite la profondeur pour générer des liens relatifs valides depuis n'importe quel niveau de dossier.

- `/` => profondeur `0` => base `./`
- `/studio/banc-tests-mobiles/` => profondeur `2` => base `../../`

Fonctions clés :

- `toRelative(slug)` : convertit un slug absolu (`/studio/.../`) en chemin relatif de dossier, sans exposer `index.html`.
- `toAsset(path)` : convertit un chemin d'asset absolu (`/assets/...`) en chemin relatif depuis la page courante.

## Structure d'une entrée GS_PAGES

Chaque objet dans `assets/js/site-data.js` suit cette structure :

```js
{
	section: 'Greenspector Studio',
	name: 'Les points clés',
	slug: '/studio/banc-tests-mobiles/',
	primary: 'banc tests mobiles',
	secondary: 'device lab, tests smartphones réels',
	generated: false
}
```

Rôle des champs :

- `section` : groupe de navigation.
- `name` : libellé du lien dans les menus.
- `slug` : chemin canonique logique de la page.
- `primary` / `secondary` : métadonnées éditoriales/SEO.
- `generated` : indicateur d'origine (utile pour suivi interne).

## Ajouter ou modifier une page

Procédure recommandée :

1. Créer le fichier HTML à l'emplacement final (`.../index.html`).
2. Définir le bon slug dans `body[data-page]`.
3. Ajouter (ou mettre à jour) l'entrée correspondante dans `assets/js/site-data.js`.
4. Vérifier que le slug et la profondeur du dossier correspondent.
5. Vérifier que les liens ajoutés manuellement dans la page utilisent le bon nombre de `../` et se terminent par un slug de dossier, pas par `index.html`.
6. Recharger la page et contrôler :
	 - présence dans le menu,
	 - bon lien actif,
	 - absence de 404.

## Points d'attention

- Si une page est supprimée du disque, supprimer aussi son entrée dans `site-data.js`.
- Si un slug change, mettre à jour à la fois :
	- `site-data.js`,
	- `data-page` de la page HTML.
- Conserver les slugs avec slash final (`/.../`) pour rester cohérent avec la logique actuelle.
- Les liens "hardcodés" dans le contenu des pages (CTA, liens internes) ne sont pas auto-corrigés : ils doivent être adaptés à la profondeur réelle.

## Slugs provisoires

Voir `SLUGS_PROVISOIRES.md`.

Ce fichier sert de registre des slugs temporaires créés pendant la phase de structuration. A chaque validation de slug définitif, mettre à jour :

1. l'entrée dans `assets/js/site-data.js` ;
2. le `data-page` du fichier HTML concerné ;
3. les éventuels liens internes qui pointent vers ce slug.

## Images externes : automatisation

Pour éviter les 404 si des images pointent vers des sources externes, un script de synchronisation est disponible :

- Script : `scripts/sync-external-images.js`

Commandes :

1. Télécharger toutes les images externes trouvées dans les balises `<img src="...">` des HTML :

	`node scripts/sync-external-images.js`

2. Télécharger puis réécrire automatiquement les `src` HTML vers les fichiers locaux :

	`node scripts/sync-external-images.js --rewrite`

Sorties du script :

- `assets/img/external/url-map.json` : mapping URL source -> fichier local.
- `assets/img/external/download-failures.json` : URLs non récupérées (404, timeout, etc.).

Usage recommandé : relancer le script après chaque ajout de contenu éditorial pour couvrir les futures pages.
