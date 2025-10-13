# Migration Frontend vers Endpoints DRMNE

## 🎯 Objectif
Mettre à jour le frontend pour utiliser les nouveaux endpoints DRMNE/PMNE au lieu des anciens endpoints PNME.

## 📋 Endpoints à Migrer

### Anciens Endpoints (à remplacer)
- `/api/pnme/demandes` → `/api/drmne/demandes`
- `/api/pnme/demandes/:id` → `/api/drmne/demandes/:id`
- `/api/pnme/demandes/:id/valider` → `/api/drmne/demandes/:id/valider`
- `/api/pnme/demandes/:id/rejeter` → `/api/drmne/demandes/:id/rejeter`
- `/api/pnme/demandes/:id/complement` → `/api/drmne/demandes/:id/demander-complement`
- `/api/pnme/demandes/:id/historique` → `/api/drmne/demandes/:id/historique`
- `/api/pnme/stats` → Calculé à partir de `/api/drmne/demandes?statut=TOUTES`

### Nouveaux Endpoints DRMNE
- `GET /api/drmne/demandes` - Liste des demandes PMNE
- `GET /api/drmne/demandes/:id` - Détails d'une demande
- `POST /api/drmne/demandes/:id/demander-complement` - Demander des pièces
- `POST /api/drmne/demandes/:id/valider` - Valider une demande
- `POST /api/drmne/demandes/:id/rejeter` - Rejeter une demande
- `POST /api/drmne/demandes/:id/transmettre` - Transmettre vers MMI/DGI
- `GET /api/drmne/demandes/:id/historique` - Historique complet

## 🔧 Fichiers à Modifier

### 1. DashboardPNME.jsx
**Problème :** Utilise encore les anciens endpoints `/api/pnme/...`
**Solution :** Remplacer tous les endpoints par les nouveaux DRMNE

```javascript
// AVANT
const endpoints = {
  a_traiter: 'http://localhost:4000/api/pnme/demandes?statut=DEPOSEE,EN_COURS_PNME,COMPLEMENT_REQUIS_PNME',
  historique: 'http://localhost:4000/api/pnme/demandes?statut=VALIDEE_PNME,REJETEE,AUTORISATION_SIGNEE',
  stats: 'http://localhost:4000/api/pnme/stats'
};

// APRÈS
const endpoints = {
  a_traiter: 'http://localhost:4000/api/drmne/demandes?statut=DEPOSEE,EN_COURS_TRAITEMENT,PIECES_MANQUANTES',
  historique: 'http://localhost:4000/api/drmne/demandes?statut=EN_ATTENTE_SIGNATURE,REJETEE,AUTORISATION_SIGNEE',
  stats: 'http://localhost:4000/api/drmne/demandes?statut=TOUTES'
};
```

### 2. LoginPNME.jsx
**Problème :** Vérifie `role_id === 7` au lieu de `role_id === 11`
**Solution :** Mettre à jour la vérification du rôle

```javascript
// AVANT
if (response.ok && data.token && data.user && data.user.role_id === 7) {

// APRÈS
if (response.ok && data.token && data.user && data.user.role_id === 11) {
```

### 3. Nouveaux Composants Créés
- ✅ `LoginDRMNE.jsx` - Login spécifique DRMNE
- ✅ `DashboardDRMNE.jsx` - Dashboard avec nouveaux endpoints
- ✅ `DashboardDRMNE.css` - Styles pour le dashboard

### 4. App.js
**Ajouts :**
- Import des nouveaux composants
- Route `/login-drmne`
- Route `/dashboard-drmne`

### 5. HomePage.jsx
**Ajout :** Carte pour l'espace DRMNE/PMNE

## 🚀 Étapes de Migration

### Étape 1 : Vérifier la Base de Données
```sql
-- Vérifier que les utilisateurs DRMNE ont le bon role_id
SELECT id, email, nom, prenom, role_id FROM utilisateurs WHERE role_id = 11;
```

### Étape 2 : Tester les Nouveaux Endpoints
```bash
# Test de connexion DRMNE
curl -X POST http://localhost:4000/api/login/pnme \
  -H "Content-Type: application/json" \
  -d '{"email":"drmne@example.com","mot_de_passe":"password"}'

# Test de récupération des demandes
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/drmne/demandes
```

### Étape 3 : Mettre à Jour DashboardPNME
Remplacer tous les endpoints `/api/pnme/...` par `/api/drmne/...`

### Étape 4 : Tester la Connexion
1. Se connecter avec un compte DRMNE (role_id = 11)
2. Vérifier l'accès au dashboard
3. Tester toutes les fonctionnalités

## ⚠️ Points d'Attention

### 1. Gestion des Tokens
- Le composant DRMNE utilise `adminToken` et `token`
- Assurer la cohérence avec les autres composants

### 2. Statuts des Demandes
- Les nouveaux endpoints utilisent des statuts standardisés
- Adapter l'affichage des statuts dans l'interface

### 3. Gestion des Erreurs
- Vérifier que tous les endpoints retournent des erreurs cohérentes
- Adapter la gestion des erreurs côté frontend

### 4. Responsive Design
- Vérifier que le nouveau dashboard est responsive
- Tester sur mobile et tablette

## 🔍 Tests à Effectuer

### Tests Fonctionnels
- [ ] Connexion DRMNE
- [ ] Affichage des demandes
- [ ] Demande de complément
- [ ] Validation de demande
- [ ] Rejet de demande
- [ ] Transmission vers MMI/DGI
- [ ] Consultation de l'historique

### Tests d'Interface
- [ ] Affichage correct des statuts
- [ ] Responsive design
- [ ] Gestion des erreurs
- [ ] Messages de confirmation

### Tests de Sécurité
- [ ] Vérification des rôles
- [ ] Protection des routes
- [ ] Validation des tokens

## 📝 Notes de Développement

### Structure des Réponses API
```json
{
  "demandes": [...],
  "total": 42,
  "page": 1,
  "totalPages": 5
}
```

### Gestion des Statuts
- `DEPOSEE` : Demande déposée
- `EN_COURS_TRAITEMENT` : En cours d'instruction
- `PIECES_MANQUANTES` : Pièces complémentaires demandées
- `EN_ATTENTE_SIGNATURE` : En attente de signature
- `REJETEE` : Demande rejetée
- `TRANSMISE_AU_DGI` : Transmise vers DGI
- `TRANSMISE_AU_MINISTRE` : Transmise vers Ministère

### Fonctionnalités Avancées
- Ré-attribution de dossier
- Retour à l'étape précédente
- Relance automatique
- Clôture et archivage
- Avis multisectoriel

## ✅ Checklist de Migration

- [ ] Créer les nouveaux composants
- [ ] Mettre à jour App.js avec les nouvelles routes
- [ ] Mettre à jour HomePage.jsx
- [ ] Tester la connexion DRMNE
- [ ] Vérifier l'affichage des demandes
- [ ] Tester toutes les actions (validation, rejet, transmission)
- [ ] Vérifier la gestion des erreurs
- [ ] Tester le responsive design
- [ ] Documenter les changements

## 🎉 Résultat Attendu

Après la migration, le frontend devrait :
1. Avoir un espace DRMNE/PMNE fonctionnel
2. Utiliser les nouveaux endpoints DRMNE
3. Supporter tous les scénarios décrits dans les TDR
4. Maintenir la compatibilité avec les composants existants
5. Offrir une interface utilisateur cohérente et responsive




