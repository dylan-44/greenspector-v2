# Greenspector V2

Structure statique initiale du site Greenspector V2.

## Périmètre

- Pages HTML statiques générées à partir du cahier des charges validé.
- Pages de contenu volontairement vierges pour intégration éditoriale ultérieure.
- Bootstrap 5 via CDN.
- CSS personnalisé centralisé dans `assets/css/styles.css`.
- JavaScript vanilla dans `assets/js/main.js`.
- SEO de base : titles, descriptions, canonicals, Open Graph, sitemap et robots.txt.

## Architecture de navigation

Le site ne duplique pas le menu dans chaque page HTML.

- La source unique de vérité des pages est `window.GS_PAGES` dans `assets/js/site-data.js`.
- Le header et le footer sont générés dynamiquement par `assets/js/main.js`.
- Chaque page expose son slug courant via l'attribut `data-page` sur le `<body>`.

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
