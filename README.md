# Randos Lorraine — PWA

Application web installable pour consulter des randonnées en Lorraine.  
Aucun Node.js, aucun droit administrateur requis.

## Contenu

- Liste de 6 randonnées exemple en Lorraine
- Recherche et filtre par difficulté
- Géolocalisation (tri par proximité)
- Fiche détail + lien itinéraire Google Maps
- Mode hors ligne (service worker)
- Installable sur iPhone et Android

## Tester sur vos téléphones

La PWA doit être servie en **HTTPS** ou en **HTTP sur le réseau local** (pas en ouvrant `index.html` directement depuis les fichiers).

### Option A — GitHub Pages (recommandé, gratuit)

1. Créez un dépôt GitHub et poussez ce dossier
2. Paramètres → Pages → source : branche `main`, dossier `/ (root)`
3. Ouvrez l’URL fournie (ex. `https://votre-compte.github.io/randos-lorraine/`) sur iPhone et Wiko

### Option B — Réseau local (si Python est disponible)

Dans ce dossier, lancez :

```powershell
python -m http.server 8080
```

Puis sur le téléphone (même Wi-Fi), ouvrez `http://ADRESSE-IP-DU-PC:8080`

Pour connaître l’IP du PC : `ipconfig` → adresse IPv4.

### Option C — Cursor / Live Preview

Utilisez l’aperçu intégré de Cursor si disponible, puis testez via l’IP locale comme ci-dessus.

## Installer sur l’écran d’accueil

| Appareil | Procédure |
|---|---|
| **iPhone 12** | Safari → bouton Partager → « Sur l’écran d’accueil » |
| **Wiko Tommy 3** | Chrome → menu ⋮ → « Installer l’application » ou « Ajouter à l’écran d’accueil » |

## Structure

```
index.html          Page principale
manifest.webmanifest Métadonnées PWA
sw.js               Cache hors ligne
css/styles.css      Styles
js/app.js           Logique
data/randos.json    Données des randonnées
icons/icon.svg      Icône
```

## Personnaliser

Éditez `data/randos.json` pour ajouter vos propres parcours. Chaque entrée :

```json
{
  "id": "identifiant-unique",
  "name": "Nom de la randonnée",
  "region": "Département",
  "distance_km": 10,
  "duration_h": 3,
  "difficulty": "facile",
  "elevation_m": 150,
  "description": "Texte descriptif",
  "highlights": ["Point 1", "Point 2"],
  "lat": 48.69,
  "lng": 6.18
}
```

Valeurs `difficulty` : `facile`, `modere`, `difficile`.

Après modification de `sw.js` ou des assets, incrémentez `CACHE_NAME` dans `sw.js` pour forcer le rafraîchissement du cache.
