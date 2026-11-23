/**
 * Unité arithmétique et logique (UAL).
 * Responsable : Alex (US-06)
 *
 * Toutes les valeurs sont des BigInt non signés sur 64 bits.
 * Un résultat qui dépasse 64 bits est tronqué (& MASQUE_64), comme sur un vrai processeur.
 *
 * Comportement attendu (cours d'assembleur) :
 *   ADD a, b  -> a + b
 *   SUB a, b  -> a - b        (5 - 7 donne 2^64 - 2, soit -2 en complément à deux)
 *   INC a     -> a + 1
 *   DEC a     -> a - 1
 *   MUL b     -> RAX * b, résultat sur 128 bits : partie basse dans RAX, partie haute dans RDX
 */

import { MASQUE_64 } from '../constants.js'

/**
 * @param {'ADD'|'SUB'|'INC'|'DEC'|'MUL'} op
 * @param {bigint} a   Destination (pour MUL : valeur de RAX)
 * @param {bigint} [b] Source (inutile pour INC et DEC)
 * @returns {{ resultat: bigint, haut?: bigint }} `haut` seulement pour MUL (va dans RDX)
 */
export function calculer(op, a, b = 0n) {
  switch (op) {
    case 'ADD':
      return { resultat: (a + b) & MASQUE_64 }
    case 'SUB':
      // Un résultat négatif devient son complément à deux sur 64 bits
      return { resultat: (a - b) & MASQUE_64 }
    case 'INC':
      return { resultat: (a + 1n) & MASQUE_64 }
    case 'DEC':
      return { resultat: (a - 1n) & MASQUE_64 }
    case 'MUL': {
      // Produit complet sur 128 bits, découpé en deux moitiés de 64 bits
      const produit = a * b
      return { resultat: produit & MASQUE_64, haut: produit >> 64n }
    }
    default:
      throw new Error(`Opération inconnue pour l'UAL : ${op}`)
  }
}
