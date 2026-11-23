# Ordre de développement du Sprint 2 (date de fin à confirmer par le commanditaire)

Ce fichier dit qui attend qui, pour éviter les blocages et les conflits Git.
Le suivi détaillé (statut, heures) est sur Trello.

Statuts : **[À FAIRE]**, **[EN COURS]**, **[TERMINÉ]** (fusionné sur `main`).

## Répartition

| Qui | User stories | Fichiers | Tests |
|---|---|---|---|
| Baillo | US-13 : tableaux en mémoire (`[rbx]`, `[tableau + 8]`) | `src/core/assembler/parser.js`, `src/core/memory/chargeur.js`, `src/core/sequencer/sequenceur.js`, `src/core/types.js`, `src/components/MemoryView.vue` | `tests/tableaux.test.js` (nouveau) |
| Aminata | US-14 : sous-registres EAX, AX, AL et déclarations db, dw, dd | `src/core/assembler/parser.js`, `src/core/constants.js`, `src/core/cpu/ual.js`, `src/core/memory/memoire.js`, `src/core/memory/chargeur.js`, `src/core/sequencer/sequenceur.js`, `src/core/types.js` | `tests/sous-registres.test.js` (nouveau) |
| Djawad | US-15 : guide de déploiement pas à pas | `docs/deploiement.md` | relecture par un autre membre |
| Mariem | US-16 : guide d'utilisation en anglais | `docs/user-guide.md` (nouveau), lien dans `README.md` | relecture par un autre membre |

Les tests du Sprint 1 (`tests/*.test.js`) ne changent pas et doivent rester verts.
Chaque nouvelle fonctionnalité a son propre fichier de test.

**Attention** : US-13 et US-14 touchent toutes les deux le parseur (`parser.js`) et le moteur
(`chargeur.js`, `sequenceur.js`, `types.js`). Baillo et Aminata se mettent d'accord sur qui modifie quoi
avant de coder, pour éviter les conflits Git. Si le contrat des étapes (`docs/contrat-etapes.md`) doit
changer, on en parle en équipe d'abord.

## Suivi du Sprint 2

Chacun ne modifie QUE sa ligne, dans le dernier commit de sa branche.
[EN COURS] = branche poussée (visible avec `git branch -r`) et carte Trello dans « Doing ».

* **[À FAIRE] US-13 Baillo** : tableaux en mémoire

* **[À FAIRE] US-14 Aminata** : sous-registres et déclarations db, dw, dd

* **[À FAIRE] US-15 Djawad** : guide de déploiement pas à pas

* **[À FAIRE] US-16 Mariem** : guide d'utilisation en anglais

## Leçons de la revue 01

Pour la prochaine revue :

* Un diaporama unique, sur un seul PC.
* On décide à l'avance qui parle sur quelle diapositive.
* Le besoin du client est présenté au début.
* On fait une répétition chronométrée avant la revue.
* La démo est à la fin.

# Sprint 1 (8 au 23 octobre 2026) : terminé

Ce fichier dit qui attend qui, pour éviter les blocages et les conflits Git.
Le suivi détaillé (statut, heures) est sur Trello.

Statuts : **[À FAIRE]**, **[EN COURS]**, **[TERMINÉ]** (fusionné sur `main`).

## Phase 0 : socle commun (avant le 10/10)

* **[TERMINÉ] Alex** : mettre ce squelette sur `main` et vérifier que `npm run dev` marche chez tout le monde.
* **[TERMINÉ] Équipe** : relire et valider `docs/contrat-etapes.md`. Après validation, on n'y touche plus sans en parler.

## Phase 1 : modules en parallèle (11 au 17/10)

Personne n'attend personne : chacun code son module et fait passer ses tests.

| Qui | User stories | Fichiers | Tests |
|---|---|---|---|
| Aminata | US-03, US-04 puis US-01, US-02 | `src/core/assembler/parser.js`, `src/components/CodeEditor.vue` | `tests/parser.test.js` |
| Baillo | US-05, US-11 | `src/core/memory/*`, `src/components/MemoryView.vue` | `tests/memoire.test.js` |
| Alex | US-06, US-07 | `src/core/cpu/*`, `src/core/sequencer/sequenceur.js` | `tests/ual.test.js`, `tests/sequenceur.test.js` |
| Djawad | US-12, US-10 | `src/components/ArchitectureView.vue`, `CpuView.vue`, `ValueDisplay.vue`, `src/core/format.js` | `tests/format.test.js` |
| Mariem | US-08, US-09 | `src/composables/useSimulation.js`, `Controls.vue`, `BusView.vue`, `MessagePanel.vue` | à l'écran |

Astuce : l'interface peut avancer avant le moteur en créant des étapes de test à la main avec `creerEtape()`.

### Suivi de la Phase 1

Chacun ne modifie QUE sa ligne, dans le dernier commit de sa branche.
[EN COURS] = branche poussée (visible avec `git branch -r`) et carte Trello dans « Doing ».

* **[TERMINÉ] US-03 Aminata** : syntaxe NASM du cours (parser.js)

* **[TERMINÉ] US-04 Aminata** : messages d'erreur avec la ligne

* **[TERMINÉ] US-01 Aminata** : éditeur de code

* **[TERMINÉ] US-02 Aminata** : import d'un fichier .asm

* **[TERMINÉ] US-05 Baillo** : mémoire vive et chargement (memoire.js, chargeur.js, MemoryView.vue)

* **[TERMINÉ] US-11 Baillo** : RIP désigne la prochaine instruction

* **[TERMINÉ] US-06 Alex** : UAL (ual.js)

* **[TERMINÉ] US-07 Alex** : séquenceur, étapes du cycle (genererEtapes)

* **[TERMINÉ] US-12 Djawad** : schéma de l'architecture

* **[TERMINÉ] US-10 Djawad** : affichage décimal et binaire (format.js, ValueDisplay.vue)

* **[TERMINÉ] US-08 Mariem** : mode Exécuter, Pause, vitesse

* **[TERMINÉ] US-09 Mariem** : bus et unité de contrôle animés

## Phase 2 : intégration (18 au 20/10)

* **[TERMINÉ] Équipe** : `exemples/demo.asm` s'exécute de bout en bout, en Pas à pas et en Exécuter.
* Dépendances : toutes les branches de la phase 1 fusionnées et `npm test` vert.

## Phase 3 : finitions (21 et 22/10)

* **[TERMINÉ] Équipe** : tests sur Firefox et Chrome, corrections, répétition de la démo.
* **[TERMINÉ] Baillo** : README à jour (lancement en local).
