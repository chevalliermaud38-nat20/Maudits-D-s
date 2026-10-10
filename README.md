# Maudits Dés

Application web pour gérer les combats de Donjons & Dragons 5.5. Créez et gérez vos sorts, monstres, personnages et campagnes, puis jouez vos rencontres sur tablette ou PC.

## Fonctionnalités

### 📚 Sorts
- Consulter la liste des sorts avec toutes les informations D&D 5.5
- Rechercher et filtrer par école et niveau
- Créer, modifier et copier des sorts
- Informations : nom, niveau, école, temps d'incantation, portée, durée, composantes (VSM), concentration, rituel, descriptif, classes

### 👹 Monstres
- Répertoire complet des monstres
- Rechercher et filtrer par type
- Créer, modifier et copier des monstres
- Informations complètes : nom, CA, PV, vitesse, caractéristiques, compétences, sens, langues, FD, traits, actions, sorts préparés, slots, actions légendaires, réactions

### 🧙 Personnages (PJ)
- Gestion des personnages joueurs
- Rechercher et filtrer par classe
- Créer, modifier et copier des personnages
- Fiche complète : nom, classe, niveau, race, background, alignement, CA, PV, vitesse, caractéristiques, compétences, sauvegardes, équipement, traits, sorts connus, slots de sorts

### ⚔️ Campagnes et Combats
- Créer des campagnes et y ajouter des personnages
- Organiser les rencontres par catégories
- Ajouter des monstres aux rencontres
- **Mode combat** :
  - Lancer automatiquement l'initiative des monstres (règles D&D 5.5)
  - Ordre d'initiative affiché à gauche
  - Gérer les PV de chaque combattant (+/-)
  - Cocher/décocher les slots de sorts utilisés
  - Ajouter des commentaires aux monstres (ex: couleur de figurine)
  - Voir les fiches détaillées en cliquant sur les combattants
  - Liens vers les sorts avec popup de détails

### ☁️ Synchronisation GitHub
- Sauvegarder vos données sur GitHub
- Charger vos données depuis GitHub
- Synchronisation automatique entre PC et tablette
- Stockage sécurisé via token d'accès personnel

## Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- Un compte GitHub

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/VOTRE_USERNAME/maudits-des.git
   cd maudits-des
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer l'application en développement**
   ```bash
   npm run dev
   ```

   L'application sera accessible sur `http://localhost:3000`

4. **Configuration GitHub**
   - Cliquez sur le bouton "Configuration GitHub" en haut à droite
   - Créez un token d'accès personnel sur GitHub :
     - Allez sur GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
     - Cliquez sur "Generate new token (classic)"
     - Cochez les permissions `repo` (full control)
     - Générez et copiez le token
   - Remplissez les champs :
     - **Token** : le token que vous venez de créer
     - **Owner** : votre nom d'utilisateur GitHub
     - **Repository** : le nom du repo (ex: maudits-des)
     - **Filename** : nom du fichier de données (ex: maudits-des-data.json)
   - Cliquez sur "Sauvegarder sur GitHub" pour sauvegarder votre configuration

## Utilisation

### Sur PC (création des données)
1. Créez vos sorts dans l'onglet "Sorts"
2. Créez vos monstres dans l'onglet "Monstres"
3. Créez vos personnages dans l'onglet "Personnages"
4. Créez une campagne dans l'onglet "Campagne"
5. Ajoutez des personnages à la campagne
6. Créez des rencontres et ajoutez des monstres
7. Sauvegardez sur GitHub avec le bouton "Configuration GitHub" > "Sauvegarder sur GitHub"

### Sur tablette (pendant les sessions)
1. Ouvrez l'application (déployée sur GitHub Pages)
2. Configurez GitHub avec les mêmes identifiants
3. Chargez les données avec "Configuration GitHub" > "Charger depuis GitHub"
4. Sélectionnez votre campagne et lancez le combat
5. Gérez l'initiative, les PV et les slots de sorts en temps réel

## Déploiement sur GitHub Pages

1. **Build de l'application**
   ```bash
   npm run build
   ```

2. **Activer GitHub Pages**
   - Allez sur votre repository GitHub
   - Settings > Pages
   - Source : Deploy from a branch
   - Branch : main / (root)
   - Cliquez sur Save

3. **Votre application sera accessible** à l'URL : `https://VOTRE_USERNAME.github.io/maudits-des`

## Structure du projet

```
maudits-des/
├── src/
│   ├── components/
│   │   ├── ui/          # Composants UI réutilisables
│   │   ├── Sorts.jsx    # Module de gestion des sorts
│   │   ├── Monstres.jsx # Module de gestion des monstres
│   │   ├── Personnages.jsx # Module de gestion des personnages
│   │   ├── Campagne.jsx    # Module de gestion des campagnes et combats
│   │   └── GitHubConfig.jsx # Configuration de la synchronisation
│   ├── lib/
│   │   ├── data.js      # Modèles de données et constantes D&D
│   │   ├── githubSync.js # Fonctions de synchronisation GitHub
│   │   └── utils.js     # Utilitaires
│   ├── App.jsx          # Composant principal
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles globaux
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Technologies utilisées

- **React 18** - Framework JavaScript
- **Vite** - Build tool et dev server
- **TailwindCSS** - Framework CSS
- **Lucide React** - Icônes
- **GitHub API** - Synchronisation des données

## Licence

Ce projet est libre d'utilisation pour vos sessions de JDR.

## Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur le repository GitHub.
