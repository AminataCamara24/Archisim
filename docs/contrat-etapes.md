# Contrat des étapes (moteur ↔ interface)

C'est le seul point de contact entre le moteur (`src/core/`) et l'interface (`src/components/`).
Toute modification se décide en équipe, puis on met à jour ce fichier, `src/core/sequencer/etapes.js` et `tests/sequenceur.test.js`.

## Principe

Une instruction est découpée en étapes. Le séquenceur produit la liste des étapes de l'instruction pointée par RIP. L'interface les joue une par une :

- **Pas à pas** : une étape par clic sur « Suivant » ;
- **Exécuter** : une étape toutes les `vitesse` millisecondes.

## Format d'une étape

```js
{
  phase: 'lecture',                       // recherche | decodage | compteur | lecture | calcul | ecriture | fin
  message: "Je lis la variable valeur à l'adresse 256.",
  actifs: ['BUS_ADRESSE', 'BUS_CONTROLE', 'BUS_DONNEES', 'RAM'],
  bus: {
    adresse: 256,                         // nombre ou null
    donnees: 10n,                         // BigInt, texte (instruction) ou null
    controle: 'LECTURE'                   // 'LECTURE' | 'ECRITURE' | null
  },
  changements: {
    registres: { RAX: 15n },              // valeurs APRÈS l'étape
    memoire: [{ adresse: 256, valeur: 15n }] // écriture 64 bits en little-endian
  },
  ligne: 6                                // ligne du code source, ou null
}
```

Éléments possibles dans `actifs` : `RIP`, `RAX`, `RBX`, `RCX`, `RDX`, `UC` (unité de contrôle), `UAL`, `RAM`, `BUS_ADRESSE`, `BUS_DONNEES`, `BUS_CONTROLE`.

## Cycle d'une instruction (cours A, diapo 48)

| Phase | Quand | Ce qui s'allume |
|---|---|---|
| `recherche` | toujours | RIP, bus d'adresses, bus de contrôle (LECTURE), RAM, puis bus de données |
| `decodage` | toujours | UC |
| `compteur` | toujours | RIP (RIP + 8) |
| `lecture` | la valeur d'une `[variable]` sert au calcul (source, ou destination de ADD, SUB, INC, DEC, MUL) ; pas pour `MOV [variable], ...`, qui écrase la variable sans la lire | bus d'adresses, bus de contrôle (LECTURE), RAM, bus de données |
| `calcul` | ADD, SUB, INC, DEC, MUL | UAL, registres sources |
| `ecriture` | toujours | registre destination, ou bus + RAM avec ÉCRITURE si destination mémoire |
| `fin` | plus d'instruction à l'adresse RIP | rien |

## Exemple complet : `ADD RAX, [valeur]`

RAX = 5, `valeur` = 10 à l'adresse 256, instruction à l'adresse 8.

| # | Phase | Message |
|---|---|---|
| 1 | recherche | Je cherche la prochaine instruction à l'adresse 8. |
| 2 | decodage | Instruction ADD : additionner RAX et la variable valeur. |
| 3 | compteur | RIP passe à 16. |
| 4 | lecture | Je lis la variable valeur à l'adresse 256. |
| 5 | calcul | L'UAL calcule 5 + 10 = 15. |
| 6 | ecriture | Je range 15 dans RAX. |

## MUL (vrai comportement x86-64)

`MUL RBX` : RAX × RBX sur 128 bits. Partie basse dans RAX, partie haute dans RDX. L'étape `ecriture` change donc deux registres : `changements.registres = { RAX: ..., RDX: ... }`.
