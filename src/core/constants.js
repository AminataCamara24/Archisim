/**
 * Constantes du simulateur (Sprint 1).
 * Toute valeur de la machine est un BigInt non signé sur 64 bits.
 */

/** Registres généraux supportés au Sprint 1 (64 bits seulement). */
export const REGISTRES = ['RAX', 'RBX', 'RCX', 'RDX']

/** Mémoire vive : 512 octets adressés à l'octet. */
export const TAILLE_MEMOIRE = 512

/** Zone programme : les instructions sont rangées à partir de l'adresse 0. */
export const ADRESSE_CODE = 0

/** Zone données : les variables (.data) sont rangées à partir de l'adresse 256. */
export const ADRESSE_DONNEES = 256

/** Chaque instruction occupe une case fixe de 8 octets. RIP avance de 8. */
export const TAILLE_INSTRUCTION = 8

/** Taille d'une variable dq (quad word) en octets. */
export const TAILLE_DQ = 8

/** Masque pour rester sur 64 bits après un calcul. */
export const MASQUE_64 = (1n << 64n) - 1n

/** Instructions du Sprint 1 et leur nombre d'opérandes. */
export const INSTRUCTIONS = {
  MOV: 2,
  ADD: 2,
  SUB: 2,
  INC: 1,
  DEC: 1,
  MUL: 1,
}

/** Code opération (simplifié) écrit dans le 1er octet de la case de l'instruction. */
export const OPCODES = {
  MOV: 1,
  ADD: 2,
  SUB: 3,
  INC: 4,
  DEC: 5,
  MUL: 6,
}

/** Phases d'une étape (voir docs/contrat-etapes.md). */
export const PHASES = ['recherche', 'decodage', 'compteur', 'lecture', 'calcul', 'ecriture', 'fin']

/** Valeurs possibles du bus de contrôle. */
export const CONTROLE = { LECTURE: 'LECTURE', ECRITURE: 'ECRITURE' }

/** Identifiants des éléments qui peuvent s'allumer à l'écran. */
export const COMPOSANTS = [
  'RIP', 'RAX', 'RBX', 'RCX', 'RDX',
  'UC', 'UAL', 'RAM',
  'BUS_ADRESSE', 'BUS_DONNEES', 'BUS_CONTROLE',
]
