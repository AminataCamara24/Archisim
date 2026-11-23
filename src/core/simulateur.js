/**
 * Point d'entrée du moteur, utilisé par l'interface.
 * Il enchaîne : assembler -> charger -> produire les étapes de l'instruction pointée par RIP.
 * Aucun code Vue ici : tout est testable sans navigateur.
 */

import { assembler } from './assembler/parser.js'
import { charger } from './memory/chargeur.js'
import { creerRegistres } from './cpu/registres.js'
import { genererEtapes, appliquerEtape } from './sequencer/sequenceur.js'
import { creerEtape } from './sequencer/etapes.js'

/**
 * @param {string} source
 * @returns {{ erreurs: import('./types.js').ErreurAssemblage[], etat: import('./types.js').EtatMachine|null }}
 */
export function preparer(source) {
  const programme = assembler(source)
  if (programme.erreurs.length > 0) {
    return { erreurs: programme.erreurs, etat: null }
  }
  const { memoire, symboles, codeParAdresse } = charger(programme)
  return {
    erreurs: [],
    etat: { registres: creerRegistres(), memoire, symboles, codeParAdresse, termine: false },
  }
}

/**
 * Étapes de la prochaine instruction (celle pointée par RIP).
 * S'il n'y a plus d'instruction, renvoie une seule étape « fin ».
 * @param {import('./types.js').EtatMachine} etat
 * @returns {import('./sequencer/etapes.js').Etape[]}
 */
export function etapesSuivantes(etat) {
  const adresse = Number(etat.registres.RIP)
  const instruction = etat.codeParAdresse.get(adresse)
  if (!instruction) {
    return [creerEtape({ phase: 'fin', message: 'Fin du programme.' })]
  }
  return genererEtapes(etat, instruction, adresse)
}

export { appliquerEtape }
