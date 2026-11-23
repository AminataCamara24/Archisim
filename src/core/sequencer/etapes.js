/**
 * Contrat des étapes entre le moteur et l'interface.
 * Spécification complète : docs/contrat-etapes.md
 *
 * Une instruction est découpée en plusieurs étapes. Le séquenceur les produit,
 * l'interface les joue une par une (Pas à pas) ou en continu (Exécuter).
 */

import { COMPOSANTS, CONTROLE, PHASES } from '../constants.js'

/**
 * @typedef {Object} Etape
 * @property {string} phase      Une valeur de PHASES
 * @property {string} message    Phrase affichée à l'utilisateur
 * @property {string[]} actifs   Éléments à allumer (valeurs de COMPOSANTS)
 * @property {{adresse: number|null, donnees: bigint|string|null, controle: string|null}} bus
 * @property {{registres: Object<string, bigint>, memoire: Array<{adresse: number, valeur: bigint}>}} changements
 *           Valeurs APRÈS l'étape. memoire : écriture de 8 octets (valeur 64 bits) à l'adresse.
 * @property {number|null} ligne Ligne du code source concernée
 */

/**
 * Crée une étape valide. Lève une erreur si le contrat n'est pas respecté.
 * @param {Partial<Etape>} e
 * @returns {Etape}
 */
export function creerEtape(e) {
  const etape = {
    phase: e.phase,
    message: e.message ?? '',
    actifs: e.actifs ?? [],
    bus: { adresse: null, donnees: null, controle: null, ...(e.bus ?? {}) },
    changements: { registres: {}, memoire: [], ...(e.changements ?? {}) },
    ligne: e.ligne ?? null,
  }
  if (!PHASES.includes(etape.phase)) {
    throw new Error(`Phase inconnue : ${etape.phase}`)
  }
  for (const a of etape.actifs) {
    if (!COMPOSANTS.includes(a)) throw new Error(`Composant inconnu : ${a}`)
  }
  if (etape.bus.controle !== null && !Object.values(CONTROLE).includes(etape.bus.controle)) {
    throw new Error(`Valeur de bus de contrôle inconnue : ${etape.bus.controle}`)
  }
  return etape
}
