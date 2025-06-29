# Suivi de Projet : Analyse du Projet

**Description/Mission :** Analyser l'architecture générale du projet, identifier les erreurs potentielles et restructurer l'application pour un système d'appel vidéo entre deux utilisateurs, en mettant l'accent sur la sécurité, la fiabilité et une interface utilisateur simplifiée.

**Objectifs Clés :**

*   Comprendre l'architecture générale du projet.
*   Identifier les erreurs potentielles dans le code.

**Approche/Méthodologie :**

1.  Examiner les fichiers clés du projet.
2.  Analyser l'architecture générale du projet.
3.  Identifier les erreurs potentielles dans le code.

**Plan d'Action / Étapes :**

*   [ ] Analyser l'architecture générale du projet. (50%)
*   [ ] Identifier les erreurs potentielles dans le code.
*   [ ] Rédiger un rapport d'analyse. (100%)

**Progression Globale :** 0%

**Fichiers et Composants Clés :**

*   `package.json` : Application React (react, react-dom, react-router-dom, tailwindcss).
*   `Signaling-server/package.json` : Serveur de signalisation (ws).
*   `tailwind.config.js` : Configuration Tailwind CSS.
*   `src/index.css` : Styles CSS.
*   `public/index.html` : Page HTML principale.
*   `src/index.js` : Point d'entrée de l'application React.
*   `src/context/WebRTCContext.js` : Contexte WebRTC.
*   `src/components/Layout.js` : Composant de mise en page.
*   `src/pages/HomePage.js` : Page d'accueil.
*   `src/pages/CallPage.js` : Page d'appel.
*   `src/App.js` : Composant principal de l'application (gère les routes).
*   `Signaling-server/server.js` : Serveur de signalisation (WebSocket).

**Points Bloquants / Défis :**

*   Aucun pour le moment.

**Ce qui Reste à Faire :**

*   Analyser l'architecture générale du projet.
*   Identifier les erreurs potentielles dans le code.
*   Rédiger un rapport d'analyse.

**Architecture Générale :**

L'application est une application React de visioconférence qui utilise un serveur de signalisation WebSocket pour établir les connexions WebRTC.

*   **Frontend (React) :**
    *   Composants :
        *   `App.js` : Composant principal de l'application. Gère les routes vers les pages `HomePage` et `CallPage`.
        *   `HomePage.js` : Page d'accueil.
        *   `CallPage.js` : Page d'appel. Gère les flux vidéo, la communication WebRTC et les contrôles de l'interface utilisateur.
        *   `Layout.js` : Composant de mise en page.
        *   `VideoCallUI.js`: Composant de l'interface utilisateur de l'appel vidéo.
    *   Contexte :
        *   `WebRTCContext.js` : Fournit le contexte WebRTC pour l'application. Gère la connexion WebSocket au serveur de signalisation et fournit des fonctions pour envoyer des messages. Il génère également un ID unique pour chaque client.
    *   Dépendances :
        *   `react`
        *   `react-dom`
        *   `react-router-dom`
        *   `tailwindcss`
        *   `firebase`
*   **Backend (Node.js) :**
    *   `Signaling-server/server.js` : Serveur de signalisation WebSocket. Gère les connexions des clients, les messages et les salles. Il utilise une `Map` pour stocker les salles et les clients qui s'y trouvent.
    *   Dépendances :
        *   `ws` (WebSockets)

**Flux de l'application :**

1.  L'utilisateur accède à l'application via le navigateur.
2.  L'application React se charge et affiche la page d'accueil (`HomePage.js`).
3.  L'utilisateur crée ou rejoint un appel.
4.  L'application React utilise `react-router-dom` pour naviguer vers la page d'appel (`CallPage.js`).
5.  `CallPage.js` utilise le contexte `WebRTCContext` pour se connecter au serveur de signalisation WebSocket (`Signaling-server/server.js`).
6.  Le serveur de signalisation WebSocket gère la communication entre les clients pour établir les connexions WebRTC.
7.  Les flux vidéo sont gérés par `CallPage.js` et affichés à l'utilisateur.

**Notes / Décisions :**

*   Le fichier de suivi est créé dans le dossier du projet.

**Problèmes et Améliorations Requises :**

*   **Sécurité :**
    *   Le serveur de signalisation WebSocket n'est pas sécurisé. Il utilise `ws://` au lieu de `wss://`.
    *   L'application n'utilise pas d'authentification.
*   **Fiabilité :**
    *   Le serveur de signalisation WebSocket n'est pas robuste.
    *   L'application ne gère pas les erreurs de connexion WebRTC.
*   **Scalabilité :**
    *   Le serveur de signalisation WebSocket n'est pas scalable.
*   **Code :**
    *   Dans `Signaling-server/server.js`, la logique pour limiter le nombre d'utilisateurs dans une salle est implémentée, mais elle ne fonctionne que pour les appels de groupe et doit être adaptée pour les appels à deux.
   *   Dans `src/context/WebRTCContext.js`, l'URL du serveur WebSocket est codée en dur (`ws://localhost:8080`) et doit être externalisée via une variable d'environnement ou un fichier de configuration.
   *   L'application ne gère pas correctement les erreurs de connexion WebRTC, ce qui peut entraîner une mauvaise expérience utilisateur.
   *   L'application ne dispose pas d'une gestion robuste des erreurs côté serveur, ce qui peut entraîner des problèmes de stabilité.

**Plan d'Action Revisé :**

*   [ ] **Sécurité :**
   *   [ ] Configurer le serveur de signalisation WebSocket pour utiliser `wss://` au lieu de `ws://`.
   *   [ ] Implémenter un système d'authentification pour les utilisateurs.
*   [ ] **Fiabilité :**
   *   [ ] Améliorer la gestion des erreurs de connexion WebRTC.
   *   [ ] Rendre le serveur de signalisation WebSocket plus robuste.
*   [ ] **Scalabilité :**
   *   [ ] Optimiser le serveur de signalisation WebSocket pour les appels à deux utilisateurs.
*   [ ] **Code :**
   *   [ ] Corriger la logique pour limiter le nombre d'utilisateurs dans une salle dans `Signaling-server/server.js` pour les appels à deux.
   *   [ ] Externaliser l'URL du serveur WebSocket dans `src/context/WebRTCContext.js`.
*   [ ] **UI/UX :**
   *   [ ] Simplifier l'interface utilisateur de l'application en s'inspirant de Zoom et Google Meet.
   *   [ ] Ajouter un message "en attente de membres" dans l'onglet initiateur jusqu'à ce que quelqu'un rejoigne l'appel.
   *   [ ] Afficher uniquement les options "rejoindre" ou "ignorer" dans les autres onglets lorsqu'un utilisateur initie un appel dans un onglet.
   *   [ ] Ajouter un bouton pour quitter l'appel.
*   [ ] **Tests :**
   *   [ ] Écrire des tests unitaires et d'intégration pour valider les modifications.

**Ce qui Reste à Faire :**

*   Mettre en œuvre le plan d'action révisé.
*   Rédiger un rapport d'analyse mis à jour.

**Historique des Mises à Jour :**

*   28/06/2025 10:57 AM : Création du fichier de suivi.
*   28/06/2025 11:01 AM : Modification de l'URL du serveur WebSocket dans `src/context/WebRTCContext.js`.
*   28/06/2025 11:22 AM : Ajout du composant AuthForm.js à la page d'accueil (src/pages/HomePage.js).
*   28/06/2025 11:27 AM : Ajustement du plan en ajoutant d'autres tâches qui vont permettre de passer les appels vidéo tout en simplifiant l'appli et en m'inspirant de Zoom et Google Meet.
*   28/06/2025 11:28 AM : Simplification de l'interface utilisateur du composant VideoCallUI.js.
*   28/06/2025 11:29 AM : Ajout d'une fonctionnalité pour afficher un message "en attente de membres" dans l'onglet initiateur jusqu'à ce que quelqu'un rejoigne l'appel.
*   28/06/2025 11:30 AM : Modification du composant CallPage.js pour afficher un message "en attente de membres".
*   28/06/2025 11:31 AM : Modification du composant CallPage.js pour afficher uniquement les options "rejoindre" ou "ignorer" dans les autres onglets lorsqu'un utilisateur initie un appel dans un onglet.
*   28/06/2025 11:33 AM : Ajout d'un bouton pour quitter l'appel dans le composant VideoCallUI.js.
*   28/06/2025 11:33 AM : Ajout d'un bouton pour quitter l'appel dans le composant VideoCallUI.js.