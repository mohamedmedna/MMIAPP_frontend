# Dashboard Commission/Comité

## Vue d'ensemble

Le dashboard Commission/Comité est une interface dédiée aux membres des commissions et comités techniques pour examiner et donner leur avis sur les demandes d'autorisation industrielle.

## Fonctionnalités principales

### 1. Authentification
- **Route de connexion**: `/login/commission`
- **Rôles autorisés**: Commission (role_id: 7) et Comité (role_id: 8)
- **Protection des routes**: Toutes les routes du dashboard sont protégées

### 2. Tableau de bord
- **Statistiques en temps réel**:
  - Dossiers à examiner
  - Dossiers validés
  - Dossiers avec réserves
  - Dossiers rejetés
- **Graphique circulaire** pour visualiser la répartition
- **Interface responsive** adaptée à tous les écrans

### 3. Gestion des dossiers
- **Liste des dossiers à traiter** avec filtres et pagination
- **Détails complets** de chaque dossier
- **Historique des actions** pour chaque dossier
- **Actions disponibles**:
  - Avis favorable
  - Avis défavorable
  - Réserve avec observations

### 4. Notifications
- **Centre de notifications** en temps réel
- **Statut lu/non lu** pour chaque notification
- **Historique des notifications** reçues

### 5. Interface utilisateur
- **Design moderne** avec Ant Design
- **Support multilingue** (Français, Anglais, Arabe)
- **Thème cohérent** avec l'identité visuelle du ministère
- **Animations fluides** et transitions

## Structure des fichiers

```
src/
├── components/
│   ├── LoginCommission.jsx          # Page de connexion
│   └── ProtectedRouteCommission.jsx # Route protégée
├── pages/
│   └── DashboardCommission.jsx      # Dashboard principal
├── Styles/
│   └── DashboardCommission.css      # Styles spécifiques
└── locales/
    ├── fr/translation.json          # Traductions françaises
    ├── en/translation.json          # Traductions anglaises
    └── ar/translation.json          # Traductions arabes
```

## API Endpoints utilisés

### Authentification
- `POST /api/login/commission` - Connexion Commission/Comité

### Statistiques
- `GET /api/commission/stats` - Statistiques du dashboard

### Dossiers
- `GET /api/commission/dossiers` - Liste des dossiers à traiter
- `POST /api/commission/dossiers/:id/avis` - Enregistrer un avis
- `GET /api/commission/dossiers/:id/historique` - Historique d'un dossier

### Notifications
- `GET /api/commission/notifications` - Notifications de l'utilisateur

## États des dossiers

| État | Description | Couleur |
|------|-------------|---------|
| EN_ATTENTE_AVIS_COMMISSION | En attente d'avis commission | Or |
| EN_ATTENTE_AVIS_COMITE | En attente d'avis comité | Or |
| AVIS_FAVORABLE_COMMISSION | Avis favorable commission | Vert |
| AVIS_DEFAVORABLE_COMMISSION | Avis défavorable commission | Rouge |
| RESERVE_COMMISSION | Réserve commission | Orange |
| AJOURNE | Ajourné | Gris |

## Types d'avis

1. **FAVORABLE** - Avis favorable sur le dossier
2. **DEFAVORABLE** - Avis défavorable sur le dossier
3. **RESERVE** - Réserve avec observations

## Sécurité

- **Authentification JWT** obligatoire
- **Vérification des rôles** (Commission/Comité uniquement)
- **Protection des routes** avec redirection automatique
- **Gestion des tokens** avec expiration

## Responsive Design

Le dashboard est entièrement responsive avec :
- **Desktop** : Interface complète avec sidebar fixe
- **Tablet** : Sidebar adaptative
- **Mobile** : Menu hamburger et interface optimisée

## Internationalisation

Support complet de 3 langues :
- **Français** (par défaut)
- **Anglais**
- **Arabe** (RTL supporté)

## Installation et utilisation

1. **Installation des dépendances**:
```bash
npm install
```

2. **Démarrage du serveur de développement**:
```bash
npm start
```

3. **Accès au dashboard**:
- URL: `http://localhost:3000/login/commission`
- Identifiants requis: Email et mot de passe Commission/Comité

## Développement

### Ajout de nouvelles fonctionnalités

1. **Traductions**: Ajouter les clés dans les 3 fichiers de traduction
2. **Styles**: Utiliser les classes CSS existantes ou créer de nouvelles
3. **API**: Suivre la structure des endpoints existants
4. **Tests**: Tester sur différents appareils et navigateurs

### Structure des composants

```jsx
import { useTranslation } from 'react-i18next';

const MonComposant = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('maCle.traduction')}</h1>
    </div>
  );
};
```

## Support

Pour toute question ou problème :
- Vérifier la console du navigateur pour les erreurs
- Contrôler les logs du serveur backend
- Tester la connectivité API
- Vérifier les permissions utilisateur

## Maintenance

- **Mise à jour des dépendances** régulière
- **Tests de régression** après modifications
- **Backup des traductions** avant modifications
- **Documentation** des changements API 