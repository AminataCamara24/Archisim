# ArchiSim : Guide Complet du Projet & Manuel d'Architecture

> **Document de référence pour tout développeur ou agent IA intégrant l'équipe.**  
> Ce document fournit une vision exhaustive du projet ArchiSim : contexte pédagogique, architecture logicielle, structures de données, règles invariantes, conventions Git et roadmap.

---

## 1. Contexte & Vision du Produit

* **Projet** : ArchiSim (SAÉ S3.A.01, BUT Informatique 2e année, IUT d'Aix-Marseille, site d'Arles).
* **Commanditaire & Enseignant référent** : M. Ricardo Uribe Lobello (cours d'Architecture des ordinateurs et d'Assembleur).
* **Échéance Sprint 1 (Revue 01)** : 23 octobre 2026.
* **Objectif** : Un simulateur visuel, interactif et pédagogique d'une machine de Von Neumann exécutant un sous-ensemble d'instructions assembleur x86-64 (syntaxe NASM du cours).

### Le cas d'usage utilisateur
Un enseignant (en cours/amphi) ou un étudiant (en TD/TP/révision) :
1. Saisit ou importe un fichier assembleur (`.asm`) avec les sections `section .data` et `section .text`.
2. Charge le programme en mémoire vive : les instructions vont à l'adresse `0`, les variables à l'adresse `256`.
3. Exécute l'application soit en **Pas à pas** (bouton « Suivant », décortiquant chaque micro-étape avec une phrase en français), soit en **Exécuter** (enchaînement continu avec pause et vitesse réglable).
4. Observe l'allumage synchronisé des composants : registres (RAX, RBX, RCX, RDX, RIP), Unité de Contrôle (UC), UAL, mémoire vive, et les 3 bus physiques (Adresses, Données, Contrôle).
5. Visualise toutes les valeurs simultanément en **décimal signé** et en **binaire 64 bits**.

### Règle d'or technologique
* **100 % Navigateur (Client-Side Only)** : Vue 3 + Vite + Vitest.
* **Zéro Backend, zéro base de données, zéro serveur**. La version de production (`npm run build`) est un simple dossier `dist/` de fichiers statiques hébergeable n'importe où grâce à `base: './'` dans `vite.config.js`.

---

## 2. Invariants Fondamentaux & Représentation des Données

Ces règles sont gravées dans l'architecture et ne doivent **jamais** être enfreintes :

### A. Représentation 64 bits exacte (`BigInt`)
* Toute valeur stockée dans la machine (registre ou case mémoire) est un **`BigInt` non signé sur 64 bits** ($0$ à $2^{64}-1$).
* Tout calcul arithmétique ou logique est immédiatement tronqué avec le masque 64 bits :  
  `valeur = resultat & MASQUE_64` (où `MASQUE_64 = (1n << 64n) - 1n`).
* **Nombres négatifs** : représentés en **complément à deux**.  
  Exemple : `-1` vaut en machine $2^{64}-1$ (`18446744073709551615n`). Seul le module d'affichage (`format.js`) restitue `-1`.

### B. Organisation de la Mémoire Vive (512 octets)
* **Taille** : 512 octets adressés à l'octet (`Uint8Array(512)`).
* **Format Little-Endian** : l'octet de poids faible est stocké à l'adresse la plus basse (cours d'assembleur).
  * `lire64(adresse)` : recompose un `BigInt` 64 bits depuis 8 octets consécutifs.
  * `ecrire64(adresse, valeur)` : découpe un `BigInt` 64 bits en 8 octets consécutifs.
* **Zone Programme (Code)** : démarre à l'adresse `0` (`ADRESSE_CODE = 0`).
  * Chaque instruction occupe un bloc fixe de **8 octets** (`TAILLE_INSTRUCTION = 8`).
  * Le 1er octet contient l'opcode (`OPCODES[op]`), les 7 autres restent à 0 au Sprint 1.
  * Le compteur ordinal **`RIP` avance toujours de 8 en 8**.
* **Zone Données** : démarre à l'adresse `256` (`ADRESSE_DONNEES = 256`).
  * Chaque variable déclarée avec `dq` (quadword) occupe **8 octets** (`TAILLE_DQ = 8`), rangée en little-endian.

---

## 3. Architecture Logicielle & Flux de Données

Le projet applique une séparation stricte des responsabilités : **Le moteur (`src/core/`) ne connaît pas Vue**.

```
Code source .asm (texte brut)
      │
      ▼  assembler() [src/core/assembler/parser.js]
Programme { instructions, donnees, erreurs }
      │
      ▼  charger() [src/core/memory/chargeur.js]
État machine initial { registres, memoire, symboles, codeParAdresse, termine }
      │
      ├─────────────────────── BOUCLE D'EXÉCUTION ───────────────────────┐
      │                                                                   │
      ▼  etapesSuivantes(etat) [src/core/simulateur.js]                  │
  genererEtapes(etat, instruction, RIP) [src/core/sequencer/sequenceur.js]│
         └─ calculer(op, a, b) [src/core/cpu/ual.js]                      │
      │                                                                   │
      ▼                                                                   │
Liste d'Étapes [ { phase, message, actifs, bus, changements, ligne } ]   │
      │                                                                   │
      ▼  appliquerEtape(etat, etape) [src/core/sequencer/sequenceur.js]   │
NOUVEL État machine (immutabilité garantie)                               │
      │                                                                   │
      └───────────────────────────────────────────────────────────────────┘
      │
      ▼  useSimulation() [src/composables/useSimulation.js]
Composants Vue 3 (App, CodeEditor, Controls, ArchitectureView, CpuView, BusView, MemoryView)
```

---

## 4. Le Contrat des Étapes (Cycle de Von Neumann)

Une instruction x86-64 exécutée par ArchiSim est décomposée en un cycle de micro-étapes (cours A, diapo 48) :

| # | Phase | Déclenchement | Éléments actifs (`actifs`) | Rôle sur les Bus |
|---|---|---|---|---|
| 1 | `recherche` | Toujours | `RIP`, `BUS_ADRESSE`, `BUS_CONTROLE`, `RAM`, `BUS_DONNEES` | Adresse = RIP, Contrôle = `LECTURE`, Données = texte instruction |
| 2 | `decodage` | Toujours | `UC` (Unité de contrôle) | Aucun bus actif |
| 3 | `compteur` | Toujours | `RIP` | RIP passe à RIP + 8 |
| 4 | `lecture` | Si un opérande `[variable]` doit être lu | `BUS_ADRESSE`, `BUS_CONTROLE`, `RAM`, `BUS_DONNEES` | Adresse = variable, Contrôle = `LECTURE`, Données = valeur lue |
| 5 | `calcul` | ADD, SUB, INC, DEC, MUL (sauf MOV) | `UAL`, registres sources | L'UAL effectue le calcul 64 bits |
| 6 | `ecriture` | Toujours | Registre destination, ou Bus + RAM si mémoire | Si destination mémoire : Contrôle = `ECRITURE` |
| 7 | `fin` | Fin du programme | Aucun | Indique l'arrêt de la machine |

### Structure canonique d'une Étape (`Etape`)
```js
{
  phase: 'lecture',                       // 'recherche'|'decodage'|'compteur'|'lecture'|'calcul'|'ecriture'|'fin'
  message: "Je lis la variable valeur à l'adresse 256.",
  actifs: ['BUS_ADRESSE', 'BUS_CONTROLE', 'BUS_DONNEES', 'RAM'],
  bus: {
    adresse: 256,                         // number ou null
    donnees: 10n,                         // BigInt, string ou null
    controle: 'LECTURE'                   // 'LECTURE' | 'ECRITURE' | null
  },
  changements: {
    registres: { RAX: 15n },              // Registres modifiés après l'étape
    memoire: [{ adresse: 256, valeur: 15n }] // Écritures 64 bits en mémoire
  },
  ligne: 6                                // Numéro de ligne dans le code source
}
```

---

## 5. Cartographie des Fichiers du Dépôt

```
sujet-03/
├── index.html                   Point d'entrée HTML
├── vite.config.js               Config Vite (base: './', environnement vitest)
├── package.json                 Dépendances : vue 3, vite 7, vitest 3.2
├── WORKFLOW.md                  Suivi du Sprint 1 complet par US
├── docs/
│   ├── architecture.md          Principes techniques et choix de conception
│   ├── contrat-etapes.md        Spécification du contrat d'étape moteur/UI
│   ├── deploiement.md           Guide de déploiement à destination du non-informaticien
│   └── PROJECT_GUIDE.md         Ce présent document maître
├── exemples/
│   └── demo.asm                 Programme test complet de démonstration
├── tests/                       Spécifications exécutables Vitest (100 % vert)
│   ├── ual.test.js              Tests des opérations UAL (Alex)
│   ├── memoire.test.js          Tests de la RAM little-endian et chargeur (Baillo)
│   ├── sequenceur.test.js       Tests des étapes du cycle et du contrat (Alex)
│   ├── parser.test.js           Tests de la syntaxe NASM et gestion d'erreurs (Aminata)
│   └── format.test.js           Tests du formatage décimal signé et binaire (Djawad)
└── src/
    ├── main.js                  Montage de l'application Vue
    ├── App.vue                  Assemblage global (Éditeur à gauche, Machine à droite)
    ├── styles/
    │   └── base.css             Variables CSS globales (--bus-adresse, --actif, etc.)
    ├── composables/
    │   └── useSimulation.js     Contrôleur de la simulation (Pas à pas, Exécuter, Pause)
    ├── components/
    │   ├── CodeEditor.vue       Éditeur assembleur, numéros de ligne, surlignage active/erreur
    │   ├── Controls.vue         Boutons Suivant, Exécuter, Pause, Réinitialiser, Vitesse
    │   ├── MessagePanel.vue     Affichage de la phase et phrase explicative
    │   ├── ArchitectureView.vue Schéma d'ensemble (CPU + Bus + Mémoire)
    │   ├── CpuView.vue          Processeur : UC, UAL et registres
    │   ├── BusView.vue          Les 3 bus avec couleurs et valeurs qui transitent
    │   ├── MemoryView.vue       Table mémoire, adresses, hexa, noms variables et RIP
    │   └── ValueDisplay.vue     Affichage décimal + binaire 64 bits sans coupure
    └── core/                    MOTEUR PUR JAVASCRIPT (Aucune dépendance Vue)
        ├── constants.js         Constantes matérielles, opcodes, masques, identifiants
        ├── types.js             Types JSDoc partagés (Instruction, Programme, etc.)
        ├── format.js            enDecimalSigne() et enBinaire()
        ├── simulateur.js        Point d'entrée : preparer() et etapesSuivantes()
        ├── assembler/
        │   └── parser.js        Assembleur NASM : source -> Programme
        ├── memory/
        │   ├── memoire.js       Classe Memoire (octets, lire64, ecrire64)
        │   └── chargeur.js      Placement code (0) et données (256)
        ├── cpu/
        │   ├── registres.js     Initialisation des registres (RIP à 0)
        │   └── ual.js           calculer(op, a, b) avec gestion MUL 128 bits
        └── sequencer/
            ├── etapes.js        creerEtape() (contrat d'étape avec assertions)
            └── sequenceur.js    genererEtapes() et appliquerEtape()
```

---

## 6. Règles de Contribution & Conventions pour Développeurs et IA

Si vous écrivez du code sur ce projet, vous devez appliquer scrupuleusement ces règles :

1. **Règle Git absolue** : **Ne jamais commiter directement sur `main`**.
   * Créer une branche par User Story : `git checkout -b US-XX-description`.
   * Commits atomiques et préfixés : `US-XX : description du changement`.
   * Avant de pousser : `npm test` et `npm run build` doivent être strictement au vert.
   * Fusionner exclusivement via *Merge Request* relue.
2. **Ne jamais modifier les fichiers de spécification `tests/*.test.js`** pour faire passer un code défaillant. Le test est la loi. Si un test semble erroné, en discuter avec l'équipe.
3. **Le moteur `src/core/` doit rester pur** : pas d'import de Vue, pas d'accès au `document` ou à `window`.
4. **Langue** : Commentaires, messages d'erreurs et messages d'étapes toujours rédigés en **français**, compréhensibles par un étudiant débutant.
5. **Gestion des erreurs du parseur** : `assembler()` ne lève **jamais d'exception**. Toutes les erreurs sont interceptées et retournées dans le tableau `erreurs: [{ ligne, message }]`.

---

## 7. Périmètre du Sprint 1 vs Roadmap Future

### Pris en charge au Sprint 1 (Actuel)
* Registres : `RAX`, `RBX`, `RCX`, `RDX` et `RIP` (64 bits).
* Instructions : `MOV`, `ADD`, `SUB`, `INC`, `DEC`, `MUL`.
* Directives : `section .data`, `section .text`, déclarations `nom dq valeur`.
* Formats numériques : décimal (`10`, `10d`), hexadécimal (`0x0A`, `0Ah`), binaire (`1010b`), négatifs (`-5`).
* Adressage mémoire : direct par étiquette `[nom_variable]`.
* Multiplication : `MUL` 64 bits non signée produisant un résultat 128 bits partagé entre `RAX` (poids faible) et `RDX` (poids fort).

### Hors Sprint 1 (Prévu pour Sprints 2 & 3)
* Instructions de saut et comparaison : `JMP`, `CMP`, `JE`, `JNE`, `JG`, `JL`, `JGE`, `JLE`.
* Registre des indicateurs (`RFLAGS` : `ZF`, `CF`, `SF`, `OF`).
* Division : `DIV`, `IDIV`.
* Sous-registres : `EAX`, `AX`, `AL`, `AH`, etc.
* Tailles de données partielles : `db` (byte), `dw` (word), `dd` (double word).
* Adressage indirect ou indexé : `[rbx]`, `[tableau + rbx*8]`.
* Pile : `RSP`, `RBP`, `PUSH`, `POP`, `CALL`, `RET`.
* Nombres flottants et disque dur / périphériques d'E/S.

---

## 8. Guide de Démarrage Rapide (Commandes)

```bash
# 1. Installation des dépendances (Node >= 20.19 requis)
npm install

# 2. Lancement du serveur de développement (ouvre http://localhost:5173)
npm run dev

# 3. Lancement des tests unitaires en mode one-shot
npm test

# 4. Lancement des tests unitaires en mode watch interactif
npm run test:watch

# 5. Compilation de production (vérifie les types et le bundle dist/)
npm run build

# 6. Prévisualisation locale du bundle de production
npm run preview
```
