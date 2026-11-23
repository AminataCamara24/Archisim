# ArchiSim : simulateur partiel d'ordinateur bas niveau

Outil pédagogique visuel et interactif développé pour la SAÉ S3.A.01 (BUT Informatique, IUT d'Aix-Marseille, site d'Arles). Il montre comment un programme assembleur x86-64 (syntaxe NASM, celle du cours) est exécuté par une machine de Von Neumann : CPU, mémoire vive et bus d'adresses, de données et de contrôle.

* **Commanditaire** : M. Ricardo Uribe Lobello
* **Sprint 1 (revue 01 le 23/10/2026)** : registres RAX, RBX, RCX, RDX et RIP (64 bits) ; instructions MOV, ADD, SUB, INC, DEC, MUL ; modes Pas à pas et Exécuter ; animation des bus ; affichage décimal et binaire.
* **Sprint 2 (en cours)** : tableaux en mémoire, sous-registres et db/dw/dd, guide de déploiement, guide en anglais.

## Lancer le projet en local

Prérequis : [Node.js](https://nodejs.org/) 20.19 ou plus récent.

```bash
npm install        # une seule fois
npm run dev        # puis ouvrir l'adresse affichée (http://localhost:5173)
npm test           # tests du moteur
npm run build      # version de production dans dist/
```

Un programme d'exemple se trouve dans `exemples/demo.asm`.

## Structure du dépôt

```
src/
  core/                 Moteur de simulation, JavaScript pur, sans Vue
    assembler/          Lecture du code NASM (Aminata)
    memory/             Mémoire little-endian et chargement du programme (Baillo)
    cpu/                Registres et UAL (Alex)
    sequencer/          Découpage des instructions en étapes (Alex)
    format.js           Affichage décimal / binaire (Djawad)
    simulateur.js       Point d'entrée du moteur
  composables/          Pilotage Pas à pas / Exécuter (Mariem)
  components/           Composants Vue de l'interface
tests/                  Tests Vitest du moteur
docs/                   Architecture, contrat des étapes, guide de déploiement
exemples/               Programmes assembleur de démonstration
```

Détails : [docs/architecture.md](docs/architecture.md) et [docs/contrat-etapes.md](docs/contrat-etapes.md).

## Règles de contribution (Git)

**Personne ne commite directement sur `main`.** `main` ne contient que du code testé qui fonctionne.

1. Partir de `main` à jour : `git checkout main && git pull`
2. Créer une branche par user story : `git checkout -b US-03-parseur`
3. Commits courts et clairs : `US-03 : lecture des nombres hexadécimaux`
4. Avant de pousser : `npm test` et `npm run build` doivent passer
5. Pousser : `git push origin US-03-parseur`
6. Ouvrir une *Merge Request* vers `main` sur EtuLab. L'auteur peut la fusionner lui-même si `npm test` (tests de son module) et `npm run build` passent chez lui. Une relecture par un autre membre reste bienvenue mais n'est pas obligatoire.

*L'équipe s'est mise d'accord sur cette règle : chacun avance sur son module à son rythme, et la relecture systématique bloquait les fusions.*

Les tests de `tests/` décrivent le comportement attendu de chaque module : ils échouent tant que le module n'est pas codé, puis doivent tous passer.

## Gestion de projet

Méthode Scrum. Les user stories, les responsables et l'avancement sont sur le [Trello du projet](https://trello.com/w/archisimsaes3a01). Les heures sont saisies dans la checklist « Heures passées » de chaque carte.

## L'équipe

* **Mamadou Baillo BARRY** : Product Owner, développeur
* **Aldo Alex NGANJI** : Scrum Master, développeur
* **Aminata Sita CAMARA** : développeuse
* **Djawad TOURE ISSAHOU** : développeur
* **Mariem ABDELKERIM** : développeuse

## Stack

* **Vue 3** : interface réactive ; quand un registre change, l'affichage suit sans code supplémentaire.
* **Vite** : serveur de développement et construction de la version finale.
* **Vitest** : tests du moteur.
* **JavaScript (BigInt)** : calcul exact sur 64 bits.

Aucun serveur n'est nécessaire : la version finale est un dossier de fichiers statiques.
