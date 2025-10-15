# 🚀 Instructions de Démarrage Rapide

## ✅ Ce qui a été modifié

### 1. **Couleurs Nationales de Mauritanie** 🇲🇷
- ✅ Vert (`#006400` → `#228B22`) pour les éléments principaux
- ✅ Jaune/Or (`#FFD700`) pour les accents
- ✅ Navbar avec gradient vert et jaune
- ✅ Tous les boutons et éléments interactifs aux couleurs nationales

### 2. **Hero Section Améliorée**
- ✅ Overlay vert semi-transparent sur l'image de fond
- ✅ Texte visible avec effet backdrop-blur
- ✅ Titre et sous-titre bien lisibles sur l'image

### 3. **Upload de Fichiers** 📤
- ✅ Upload d'images pour les actualités (JPEG, PNG, GIF)
- ✅ Upload de documents PDF
- ✅ Taille automatiquement calculée
- ✅ Prévisualisation du nom et taille du fichier
- ✅ Stockage dans `/server/uploads/`

### 4. **Interface Admin Complète**
- ✅ Plus besoin d'entrer des URLs manuellement
- ✅ Bouton "Choisir un fichier" pour images et PDFs
- ✅ Indicateur de progression pendant l'upload
- ✅ Affichage du fichier actuel lors de la modification

## 📦 Installation

### Étape 1: Installer les dépendances du Backend

```bash
cd server
npm install
```

**Dépendances installées:**
- `express` - Framework web
- `cors` - Gestion CORS
- `multer` - Upload de fichiers
- `nodemon` - Auto-reload (dev)

### Étape 2: Démarrer le Backend

```bash
# Dans le dossier server/
npm run dev
```

✅ Le serveur démarre sur `http://localhost:4000`
✅ Les dossiers d'upload sont créés automatiquement

### Étape 3: Démarrer le Frontend

```bash
# À la racine du projet
npm start
```

✅ L'application démarre sur `http://localhost:3000`

## 🎯 Tester l'Application

### 1. Voir le Portail
- Ouvrir `http://localhost:3000/`
- Vérifier les couleurs vertes et jaunes
- Vérifier que le texte est visible sur l'image hero

### 2. Tester l'Admin
- Aller sur `http://localhost:3000/admin-portail`
- Cliquer sur "Ajouter" dans Actualités
- Uploader une image
- Remplir le formulaire
- Sauvegarder

### 3. Vérifier l'Upload
- Les fichiers sont dans `server/uploads/news/` (images)
- Les fichiers sont dans `server/uploads/documents/` (PDFs)
- Les actualités affichent les images uploadées

## 📁 Structure des Fichiers Uploadés

```
server/
├── uploads/
│   ├── news/              # Images des actualités
│   │   └── 1234567890-123456789.jpg
│   └── documents/         # Documents PDF
│       └── 1234567890-987654321.pdf
```

## 🎨 Couleurs Utilisées

| Élément | Couleur |
|---------|---------|
| Navbar | Gradient vert-jaune |
| Boutons principaux | Vert `#006400` |
| Boutons hover | Vert clair `#228B22` |
| Badges catégories | Vert gradient |
| Bouton admin | Jaune `#FFD700` |
| Background | Vert très clair `#e8f5e9` |

## 🔧 Fonctionnalités Clés

### Upload d'Images
- ✅ Formats acceptés: JPEG, PNG, GIF
- ✅ Taille max: 10 MB
- ✅ Nom unique généré automatiquement
- ✅ URL retournée: `/uploads/news/filename.jpg`

### Upload de Documents
- ✅ Format accepté: PDF uniquement
- ✅ Taille max: 10 MB
- ✅ Taille calculée automatiquement
- ✅ URL retournée: `/uploads/documents/filename.pdf`

## ⚠️ Points Importants

1. **Backend doit être démarré en premier**
   - Sans backend, les données de secours s'affichent
   - L'upload ne fonctionnera pas sans backend

2. **Dossier uploads**
   - Créé automatiquement au démarrage du serveur
   - Ne pas supprimer ce dossier
   - Sauvegarder ce dossier en production

3. **Données en mémoire**
   - Les actualités/documents sont stockés en mémoire
   - Redémarrer le serveur = perte des données
   - Les fichiers uploadés restent sur le disque

## 🐛 Résolution de Problèmes

### Les actualités ne s'affichent pas
```bash
# Vérifier que le backend est démarré
cd server
npm run dev
```

### Erreur lors de l'upload
```bash
# Vérifier les permissions du dossier
ls -la server/uploads/

# Recréer les dossiers si nécessaire
mkdir -p server/uploads/news
mkdir -p server/uploads/documents
```

### Les couleurs ne sont pas vertes
- Vider le cache du navigateur (Ctrl + Shift + R)
- Vérifier que les fichiers CSS sont bien sauvegardés

## 📞 URLs Importantes

| Page | URL |
|------|-----|
| Portail | http://localhost:3000/ |
| Admin | http://localhost:3000/admin-portail |
| Détails actualité | http://localhost:3000/actualite/1 |
| API actualités | http://localhost:4000/api/actualites |
| API documents | http://localhost:4000/api/documents |
| Health check | http://localhost:4000/api/health |

## ✨ Prochaines Étapes

Pour améliorer l'application:
1. Ajouter une base de données (MongoDB/PostgreSQL)
2. Ajouter l'authentification admin
3. Ajouter la compression d'images
4. Ajouter la prévisualisation des images avant upload
5. Ajouter un éditeur WYSIWYG pour le contenu

---

**Bon développement ! 🚀**
