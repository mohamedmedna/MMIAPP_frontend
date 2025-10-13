# 📦 Guide d'Utilisation - Archive des Demandes d'Autorisation

## 🎯 Vue d'Ensemble

Le composant **Archive des Demandes** permet aux utilisateurs de consulter et gérer toutes les demandes d'autorisation qui ont été traitées et archivées.

## ✨ Fonctionnalités Principales

### 📊 **Statistiques en Temps Réel**
- **Total des demandes archivées**
- **Répartition par type** (Eau Minérale, Boulangerie, Usine, Autres)
- **Mise à jour automatique** des compteurs

### 🔍 **Recherche et Filtres**
- **Recherche textuelle** : Référence, nom du responsable, type de demande
- **Filtre par type** : Sélection spécifique du type de demande
- **Filtre par date** : Plage de dates d'archivage
- **Actualisation** des données en temps réel

### 📋 **Tableau des Demandes Archivées**
- **Référence** : Identifiant unique de la demande
- **Type** : Catégorie de la demande
- **Responsable** : Nom et prénom du demandeur
- **Statut** : État final de la demande
- **Date d'archivage** : Quand la demande a été archivée
- **Actions** : Voir détails et télécharger l'autorisation

### 📄 **Gestion des Documents**
- **Consultation des détails** : Toutes les informations de la demande
- **Téléchargement d'autorisation** : PDF officiel signé
- **Visualisation des données** : Contenu JSON formaté

## 🚀 Comment Utiliser

### 1. **Accès à l'Archive**
```
Dashboard Demandeur → Navigation latérale → "Archive"
OU
Dashboard Demandeur → Actions rapides → Bouton "Archive"
```

### 2. **Navigation dans l'Archive**
- **URL directe** : `/archive-demandes`
- **Accès sécurisé** : Authentification requise
- **Rôle requis** : Demandeur (role_id: 6)

### 3. **Recherche et Filtrage**
```
1. Barre de recherche : Tapez référence, nom ou type
2. Filtre type : Sélectionnez un type spécifique
3. Filtre date : Choisissez une plage de dates
4. Cliquez "Actualiser" pour appliquer les filtres
```

### 4. **Consultation des Détails**
```
1. Cliquez sur "Détails" dans la colonne Actions
2. Modal s'ouvre avec toutes les informations
3. Consultez les données de la demande
4. Téléchargez l'autorisation si disponible
```

## 🎨 Interface Utilisateur

### **Design Responsive**
- **Desktop** : Affichage complet avec toutes les colonnes
- **Tablet** : Adaptation automatique de la mise en page
- **Mobile** : Interface optimisée pour petits écrans

### **Thème Visuel**
- **Couleurs** : Bleu (#1890ff) et Vert (#52c41a)
- **Icônes** : Font Awesome et Ant Design
- **Animations** : Transitions fluides et effets hover

### **Accessibilité**
- **Contraste** : Couleurs optimisées pour la lisibilité
- **Navigation** : Clavier et souris supportés
- **Messages** : Notifications claires et informatives

## 🔧 Configuration Technique

### **Dépendances Requises**
```json
{
  "antd": "^5.x.x",
  "react": "^18.x.x",
  "react-router-dom": "^6.x.x"
}
```

### **API Endpoints Utilisés**
- `GET /api/archive/demandes` : Récupération des données d'archive
- `GET /api/demandeur/autorisation/:id` : Téléchargement de l'autorisation

### **État Local**
```javascript
const [archiveData, setArchiveData] = useState([]);
const [loading, setLoading] = useState(false);
const [searchText, setSearchText] = useState('');
const [selectedType, setSelectedType] = useState('');
const [dateRange, setDateRange] = useState(null);
const [stats, setStats] = useState({...});
```

## 📱 Responsive Design

### **Breakpoints**
- **Desktop** : ≥1200px - Affichage complet
- **Tablet** : 768px - 1199px - Adaptation des colonnes
- **Mobile** : <768px - Interface empilée

### **Adaptations Mobile**
- **Navigation** : Menu hamburger et sidebar
- **Tableau** : Défilement horizontal et colonnes adaptées
- **Filtres** : Disposition verticale et boutons pleine largeur

## 🎯 Cas d'Usage

### **Pour le Demandeur**
- ✅ **Consulter l'historique** de toutes ses demandes
- ✅ **Télécharger les autorisations** signées
- ✅ **Suivre l'évolution** du traitement
- ✅ **Archiver les documents** importants

### **Pour l'Administration**
- ✅ **Audit des demandes** traitées
- ✅ **Statistiques** de performance
- ✅ **Gestion des archives** centralisée
- ✅ **Traçabilité** complète des processus

## 🚨 Gestion des Erreurs

### **Erreurs de Connexion**
- **Message** : "Erreur de connexion"
- **Action** : Vérifier la connectivité réseau
- **Solution** : Actualiser la page

### **Erreurs d'API**
- **Message** : "Erreur lors de la récupération des données"
- **Action** : Vérifier les permissions utilisateur
- **Solution** : Contacter l'administrateur

### **Erreurs de Téléchargement**
- **Message** : "Erreur lors du téléchargement"
- **Action** : Vérifier la disponibilité du fichier
- **Solution** : Réessayer ou contacter le support

## 🔒 Sécurité

### **Authentification**
- **Token JWT** requis pour toutes les opérations
- **Vérification des rôles** côté client et serveur
- **Session sécurisée** avec expiration automatique

### **Autorisations**
- **Lecture seule** : Consultation des archives
- **Téléchargement** : Uniquement des autorisations personnelles
- **Pas de modification** : Les données sont en lecture seule

## 📈 Évolutions Futures

### **Fonctionnalités Planifiées**
- 🔄 **Export Excel/CSV** des données d'archive
- 📊 **Graphiques avancés** et analyses détaillées
- 🔔 **Notifications** de nouvelles archives
- 📱 **Application mobile** dédiée

### **Améliorations Techniques**
- ⚡ **Cache intelligent** pour les performances
- 🔍 **Recherche full-text** avancée
- 📋 **Filtres personnalisables** par utilisateur
- 🌐 **Support multilingue** complet

## 💡 Conseils d'Utilisation

### **Optimisation des Recherches**
1. **Utilisez les filtres** pour réduire le nombre de résultats
2. **Combinez les critères** pour des recherches précises
3. **Actualisez régulièrement** pour les données à jour

### **Gestion des Documents**
1. **Téléchargez immédiatement** les autorisations importantes
2. **Organisez vos archives** par type et date
3. **Sauvegardez** les documents critiques

### **Support et Maintenance**
1. **Signalez les problèmes** via le système de support
2. **Consultez les logs** en cas d'erreur
3. **Mettez à jour** régulièrement votre navigateur

---

**📞 Support Technique** : Contactez l'équipe technique pour toute question ou problème
**🔧 Maintenance** : L'archive est mise à jour automatiquement toutes les heures
**📚 Documentation** : Consultez la documentation complète pour plus de détails



