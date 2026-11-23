/**
 * Charge un programme assemblé dans la mémoire (principe de Von Neumann :
 * le programme et les données sont dans la même mémoire).
 * Responsable : Baillo (US-05)
 *
 * Règles :
 *  - instruction n°i rangée à ADRESSE_CODE + i * TAILLE_INSTRUCTION
 *    (1er octet = OPCODES[op], les 7 autres à 0 au Sprint 1)
 *  - variable n°j rangée à ADRESSE_DONNEES + j * TAILLE_DQ, en little-endian
 *  - erreur si le code dépasse ADRESSE_DONNEES ou si les données dépassent la mémoire
 */

import { ADRESSE_CODE, ADRESSE_DONNEES, OPCODES, TAILLE_DQ, TAILLE_INSTRUCTION } from '../constants.js'
import { Memoire } from './memoire.js'

/**
 * @param {import('../types.js').Programme} programme
 * @returns {{ memoire: Memoire, symboles: Object<string, number>, codeParAdresse: Map<number, import('../types.js').Instruction> }}
 */
export function charger(programme) {
  const memoire = new Memoire()
  const symboles = {}
  const codeParAdresse = new Map()

  rangerInstructions(programme.instructions, memoire, codeParAdresse)
  rangerDonnees(programme.donnees, memoire, symboles)

  return { memoire, symboles, codeParAdresse }
}

/**
 * Zone programme : une case de 8 octets par instruction, à partir de ADRESSE_CODE.
 * Le 1er octet contient le code opération, les 7 autres restent à 0.
 */
function rangerInstructions(instructions, memoire, codeParAdresse) {
  const finDuCode = ADRESSE_CODE + instructions.length * TAILLE_INSTRUCTION
  if (finDuCode > ADRESSE_DONNEES) {
    const maximum = (ADRESSE_DONNEES - ADRESSE_CODE) / TAILLE_INSTRUCTION
    throw new Error(`Programme trop long : ${instructions.length} instructions, ${maximum} au maximum.`)
  }

  instructions.forEach((instruction, i) => {
    const adresse = ADRESSE_CODE + i * TAILLE_INSTRUCTION
    memoire.ecrireOctet(adresse, OPCODES[instruction.op])
    codeParAdresse.set(adresse, instruction)
  })
}

/**
 * Zone données : une case de 8 octets (dq) par variable, à partir de ADRESSE_DONNEES.
 * La valeur est rangée en little-endian par ecrire64.
 */
function rangerDonnees(donnees, memoire, symboles) {
  const finDesDonnees = ADRESSE_DONNEES + donnees.length * TAILLE_DQ
  if (finDesDonnees > memoire.taille) {
    const maximum = (memoire.taille - ADRESSE_DONNEES) / TAILLE_DQ
    throw new Error(`Trop de variables : ${donnees.length} variables, ${maximum} au maximum.`)
  }

  donnees.forEach((donnee, j) => {
    const adresse = ADRESSE_DONNEES + j * TAILLE_DQ
    memoire.ecrire64(adresse, donnee.valeur)
    symboles[donnee.nom] = adresse
  })
}
