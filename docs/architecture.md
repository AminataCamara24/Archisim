# Architecture technique

Application 100 % navigateur (Vue 3 + Vite), sans serveur. Décision validée par M. Uribe Lobello.

## Vue d'ensemble

```
Code source (texte)
   │  assembler()            src/core/assembler/parser.js     Aminata
   ▼
Programme { instructions, donnees, erreurs }
   │  charger()              src/core/memory/chargeur.js      Baillo
   ▼
État machine { registres, memoire, symboles, codeParAdresse }
   │  etapesSuivantes()      src/core/simulateur.js
   │  genererEtapes()        src/core/sequencer/sequenceur.js Alex
   │      └ calculer()       src/core/cpu/ual.js              Alex
   ▼
Étapes [ { phase, message, actifs, bus, changements } ]
   │  useSimulation()        src/composables/useSimulation.js Mariem
   ▼
Composants Vue               src/components/                  Djawad, Mariem, Baillo, Aminata
```

Règle d'or : **`src/core/` ne connaît pas Vue**. Tout y est testable avec `npm test`, sans navigateur.

## Choix techniques

| Choix | Raison |
|---|---|
| BigInt | Calcul exact sur 64 bits, y compris le résultat 128 bits de MUL. |
| Valeurs non signées en interne | Comme le processeur ; l'affichage signé (complément à deux) est fait par `format.js`. |
| Mémoire 512 octets, code à 0, données à 256 | Assez pour les exemples du cours, lisible à l'écran. |
| 1 instruction = 8 octets | Le cours n'aborde pas l'encodage machine ; RIP avance de 8. |
| Little-endian | Comme les processeurs Intel (cours d'assembleur, diapos 25 et 26). |
| Étapes produites à l'avance | Les modes Pas à pas et Exécuter partagent le même code. |
| `base: './'` dans Vite | Le dossier `dist/` fonctionne dans n'importe quel dossier d'un serveur. |

## Hors Sprint 1

Tableaux et adressage `[rbx]`, `[tableau + 8]` ; sous-registres EAX, AX, AL et `db`/`dw`/`dd` ; version 2 : JMP, CMP, FLAGS, DIV, flottants, disque.
