# Documentation du Projet : CygneGestion

## 1. Ce que l'application fait
**CygneGestion** est une application SaaS full-stack conçue pour la gestion professionnelle des **bons d'entrée**. Pensée particulièrement pour le marché africain (avec gestion de la devise CFA/XOF, unités de mesures locales comme les "Bottes" ou "Tonnes"), l'application permet de :
- Créer, éditer et suivre le cycle de vie de bons d'entrée.
- Gérer un catalogue d'articles et une base de données de clients/fournisseurs.
- Générer des documents PDF professionnels prêts à être imprimés ou envoyés.
- Gérer les paramètres de l'entreprise et les accès utilisateurs (Rôles & Permissions).

## 2. Fonctionnalités Implémentées
À ce stade du développement, l'interface utilisateur (UI) et l'expérience utilisateur (UX) sont entièrement fonctionnelles avec des données simulées (mock) :
- **Dashboard (Tableau de bord)** : Vue d'ensemble avec statistiques clés et liste des derniers bons d'entrée.
- **Gestion des Bons d'Entrée** : 
  - Liste paginée avec statuts colorés (Brouillon, Validé, Annulé).
  - Création d'un nouveau bon (`/bons/new`) avec ajout dynamique de lignes d'articles, calcul automatique des totaux (quantité et montant).
  - Détails d'un bon (`/bons/[id]`) incluant un mode Édition avec **Live Preview** sur le rendu PDF.
- **Système de Recherche par Modals** : Lors de la création ou l'édition d'un bon, la sélection du client ou d'un article ouvre un modal de recherche filtrable (déclenché par la touche Entrée ou un clic sur la loupe). La sélection remplit automatiquement les unités et prix.
- **Génération PDF** : Exportation et impression du bon d'entrée en utilisant `html2pdf.js`, avec des classes CSS spécifiques (`print:hidden`) pour masquer l'interface lors de l'impression.
- **Pages Annexes** : Interfaces de gestion des Clients, des Articles, des Utilisateurs, et des Paramètres Globaux (profil entreprise, sécurité, rôles).

## 3. Structure des Fichiers
Le projet utilise le routeur `App Router` de Next.js.
```
CygneGEstion/
├── app/
│   ├── articles/          # Gestion du catalogue d'articles
│   ├── bons/              # Vues des bons d'entrée (détails: [id], création: new)
│   ├── customers/         # Gestion des clients
│   ├── login/             # Page de connexion
│   ├── settings/          # Paramètres de l'entreprise et sécurité
│   ├── users/             # Gestion des accès et rôles utilisateurs
│   ├── vouchers/          # Liste complète des bons d'entrée
│   ├── globals.css        # Styles globaux et variables Tailwind
│   └── layout.jsx / page.jsx # Layout principal et Dashboard
├── components/
│   ├── ClientLayout.jsx   # Layout englobant (Sidebar + Header)
│   ├── Sidebar.jsx        # Navigation latérale
│   ├── Header.jsx         # Barre de navigation supérieure
│   └── AdminAuthModal.jsx # Modal de sécurité
├── package.json
└── tailwind.config.js     # Configuration du thème (couleur primaire, etc.)
```

## 4. Technologies Utilisées
- **Framework Core** : Next.js 14.2.3 (React)
- **Styling** : Tailwind CSS (avec `tailwindcss-animate` pour les micro-animations)
- **Icônes** : Lucide-react
- **Export PDF** : html2pdf.js (via CDN local ou injection)
- **Déploiement cible** : Vercel
- **Base de données cible** : Supabase (PostgreSQL) - *En cours d'intégration*

## 5. Décisions de Design
- **Esthétique Premium** : Utilisation d'un design moderne, épuré, avec des ombres légères, des bordures subtiles (`ring-inset`), et des micro-animations (transitions au survol, fade-in au chargement des pages).
- **Architecture de l'État** : Utilisation de Hooks React locaux (`useState`) pour simuler la base de données. Cela a permis de valider entièrement le parcours utilisateur avant de brancher le vrai backend.
- **Live Preview** : Le mode d'édition de la page des détails d'un bon sépare l'écran en deux : à gauche le formulaire, à droite la prévisualisation temps-réel du document PDF final.

## 6. Instructions pour un Futur Modèle IA
Pour toute IA qui reprendrait ce projet :
1. **État Actuel** : Le Front-end est terminé à 95%. Les données sont actuellement stockées dans des tableaux statiques (ex: `mockArticlesDatabase`, `mockClientsDatabase` dans les fichiers `page.jsx`).
2. **Prochaine Étape (Backend)** : 
   - L'utilisateur s'apprête à créer un projet Supabase.
   - Un plan d'implémentation (`implementation_plan.md`) a été généré, contenant le schéma SQL (tables: `articles`, `clients`, `vouchers`, `voucher_items`).
   - Il faudra installer `@supabase/supabase-js`, créer un fichier `lib/supabase.js`, configurer les variables d'environnement (`.env.local`), puis remplacer chaque opération locale (`useState`, `mockDatabase`) par des appels asynchrones à Supabase (`supabase.from('...').select()`, `.insert()`, etc.).
3. **Important** : Ne touchez pas à l'interface visuelle ni aux fonctionnalités de calcul existantes lors de l'intégration du backend. Contentez-vous de remplacer l'origine de la donnée. Maintenez tous les commentaires en français.
