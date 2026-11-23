/**
 * Types partagés (JSDoc uniquement, aucun code exécuté).
 * C'est le contrat entre les modules : ne le modifier qu'après accord de l'équipe.
 */

/**
 * Opérande d'une instruction.
 * @typedef {(
 *   { type: 'registre', nom: 'RAX'|'RBX'|'RCX'|'RDX' } |
 *   { type: 'immediat', valeur: bigint } |
 *   { type: 'memoire', etiquette: string }
 * )} Operande
 */

/**
 * Instruction produite par l'assembleur.
 * @typedef {Object} Instruction
 * @property {'MOV'|'ADD'|'SUB'|'INC'|'DEC'|'MUL'} op
 * @property {Operande[]} operandes
 * @property {number} ligne   Numéro de ligne dans le code source (à partir de 1)
 * @property {string} texte   Texte normalisé, ex : "ADD RAX, [valeur]"
 */

/**
 * Variable déclarée dans .data (Sprint 1 : dq uniquement).
 * @typedef {Object} Donnee
 * @property {string} nom
 * @property {bigint} valeur
 * @property {number} ligne
 */

/**
 * Erreur d'assemblage.
 * @typedef {Object} ErreurAssemblage
 * @property {number} ligne
 * @property {string} message  En français, compréhensible par un débutant
 */

/**
 * Résultat de l'assembleur.
 * @typedef {Object} Programme
 * @property {Instruction[]} instructions
 * @property {Donnee[]} donnees
 * @property {ErreurAssemblage[]} erreurs
 */

/**
 * État complet de la machine à un instant donné.
 * @typedef {Object} EtatMachine
 * @property {{RAX: bigint, RBX: bigint, RCX: bigint, RDX: bigint, RIP: bigint}} registres
 * @property {import('./memory/memoire.js').Memoire} memoire
 * @property {Object<string, number>} symboles        nom de variable -> adresse
 * @property {Map<number, Instruction>} codeParAdresse adresse -> instruction
 * @property {boolean} termine
 */

export {}
