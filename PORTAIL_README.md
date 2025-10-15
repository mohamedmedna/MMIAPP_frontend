# 🏭 Portail de l'Industrie - Guide Complet

## 📋 Vue d'ensemble

Ce portail industriel offre une plateforme complète pour:
- ✅ Consulter les actualités du secteur industriel
- ✅ Accéder aux documents juridiques
- ✅ Interface administrateur pour gérer le contenu
- ✅ **Upload d'images et de documents PDF**
- ✅ **Design aux couleurs nationales de Mauritanie** (vert et jaune)
- ✅ Design moderne et responsive

## 🚀 Installation et Démarrage

### 1. Installation du Frontend

```bash
# À la racine du projet
npm install
```

### 2. Installation du Backend

```bash
# Dans le dossier server
cd server
npm install
```

### 3. Démarrage de l'application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Le backend démarre sur `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
# À la racine du projet
npm start
```
Le frontend démarre sur `http://localhost:3000`

## 📱 Fonctionnalités

### 🌐 Portail Public (/)

**Sections disponibles:**
- **Hero Section** - Bannière d'accueil avec animation
- **Actualités** - Liste dynamique des actualités avec:
  - Image de couverture
  - Catégorie
  - Date de publication
  - Extrait
  - Lien vers les détails
- **Documents Juridiques** - Liste des documents avec:
  - Type de document (Loi, Décret, Arrêté, etc.)
  - Catégorie
  - Date de publication
  - Taille du fichier
  - Bouton de téléchargement
- **Accès Administration** - Lien vers l'interface admin

### 📰 Page Détails Actualité (/actualite/:id)

- Affichage complet de l'actualité
- Métadonnées (auteur, date, catégorie)
- Contenu HTML enrichi
- Boutons d'action (Retour, Imprimer)

### 🔧 Interface Administrateur (/admin-portail)

**Gestion des Actualités:**
- ➕ Ajouter une nouvelle actualité
- ✏️ Modifier une actualité existante
- 🗑️ Supprimer une actualité
- 📊 Vue tableau avec toutes les actualités

**Gestion des Documents:**
- ➕ Ajouter un nouveau document
- ✏️ Modifier un document existant
- 🗑️ Supprimer un document
- 📊 Vue tableau avec tous les documents

**Formulaires:**
- Validation des champs obligatoires
- Interface modale moderne
- Sauvegarde en temps réel

## 🎨 Design et UX

### Caractéristiques du Design

- **Gradient moderne** - Dégradés violets/bleus
- **Animations fluides** - Transitions et effets au survol
- **Cards élégantes** - Cartes avec ombres et effets 3D
- **Responsive** - Adapté mobile, tablette et desktop
- **Icônes Lucide** - Icônes modernes et cohérentes
- **Typographie claire** - Hiérarchie visuelle optimisée

### Palette de Couleurs (Mauritanie)

- **Primary:** `#006400` → `#228B22` (Vert - Gradient)
- **Secondary:** `#FFD700` (Jaune/Or)
- **Text:** `#2c3e50` (Titres), `#555` (Corps)
- **Background:** `#f5f7fa` → `#e8f5e9` (Gradient vert clair)
- **Navbar:** Gradient vert et jaune

## 🔄 Flux de Données

### Avec Backend (Recommandé)

```
Frontend → API (localhost:4000) → Backend Express → Données en mémoire
```

### Sans Backend (Fallback)

Si le backend n'est pas disponible, le frontend utilise automatiquement des **données de secours** pour garantir une expérience utilisateur fluide.

## 📂 Structure des Fichiers

```
src/
├── pages/
│   ├── PlateformeGestion.jsx      # Page principale du portail
│   ├── ActualiteDetail.jsx        # Page détails actualité
│   └── AdminPortail.jsx            # Interface administrateur
├── Styles/
│   ├── PlateformeGestion.css      # Styles portail
│   ├── ActualiteDetail.css        # Styles détails
│   └── AdminPortail.css           # Styles admin
└── App.js                          # Routes de l'application

server/
├── server.js                       # Backend Express
├── package.json                    # Dépendances backend
└── README.md                       # Documentation backend
```

## 🛠️ Technologies Utilisées

### Frontend
- **React** 18.3.1
- **React Router** 7.6.2
- **Lucide React** 0.525.0 (Icônes)
- **Axios** 1.10.0

### Backend
- **Express** 4.18.2
- **CORS** 2.8.5
- **Nodemon** 3.0.1 (dev)

## 📝 Utilisation de l'Interface Admin

### Ajouter une Actualité

1. Accéder à `/admin-portail`
2. Cliquer sur l'onglet "Actualités"
3. Cliquer sur "Ajouter"
4. Remplir le formulaire:
   - **Titre** (requis)
   - **Image** (requis) - **Uploader une image** (JPEG, PNG, GIF)
   - **Extrait** (requis)
   - **Contenu HTML** (requis)
   - **Catégorie** (requis)
   - **Auteur** (requis)
5. Cliquer sur "Ajouter"
6. L'image sera automatiquement uploadée et stockée sur le serveur

### Ajouter un Document

1. Accéder à `/admin-portail`
2. Cliquer sur l'onglet "Documents Juridiques"
3. Cliquer sur "Ajouter"
4. Remplir le formulaire:
   - **Titre** (requis)
   - **Description** (requis)
   - **Type** (Loi, Décret, Arrêté, etc.)
   - **Catégorie** (requis)
   - **Fichier PDF** (requis) - **Uploader un fichier PDF**
5. Cliquer sur "Ajouter"
6. Le fichier sera automatiquement uploadé et la taille calculée

## 🔐 Sécurité

**Note:** L'interface admin actuelle n'a pas d'authentification. Pour une utilisation en production:

1. Ajouter un système d'authentification
2. Protéger les routes admin
3. Valider les données côté serveur
4. Implémenter des permissions utilisateur

## 🌐 URLs Importantes

- **Portail:** `http://localhost:3000/`
- **Admin:** `http://localhost:3000/admin-portail`
- **API:** `http://localhost:4000/api/`
- **Health Check:** `http://localhost:4000/api/health`

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
cd server
rm -rf node_modules
npm install
npm run dev
```

### Les données ne s'affichent pas
1. Vérifier que le backend est démarré
2. Vérifier la console du navigateur
3. Les données de secours s'affichent automatiquement si le backend est indisponible

### Erreur CORS
Le proxy est configuré dans `package.json`:
```json
"proxy": "http://localhost:4000"
```

## 📈 Améliorations Futures

- [ ] Base de données persistante (MongoDB/PostgreSQL)
- [ ] Upload de fichiers (images, PDFs)
- [ ] Système d'authentification admin
- [ ] Recherche et filtres
- [ ] Pagination
- [ ] Éditeur WYSIWYG pour le contenu
- [ ] Notifications en temps réel
- [ ] Analytics et statistiques

## 📞 Support

Pour toute question ou problème, consultez:
- La documentation du code
- Les commentaires dans les fichiers
- Le README du backend (`server/README.md`)

---

**Développé avec ❤️ pour le Ministère de l'Industrie**
