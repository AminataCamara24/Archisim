/**
 * Séquenceur : découpe une instruction en étapes pédagogiques.
 * Responsable : Alex (US-07)
 *
 * Cycle du cours (cours A, diapo 48) :
 *   1. recherche  : RIP -> bus d'adresses, bus de contrôle LECTURE
 *                   la mémoire renvoie l'instruction sur le bus de données
 *   2. decodage   : l'unité de contrôle analyse l'instruction
 *   3. compteur   : RIP passe à l'instruction suivante (+8)
 *   4. lecture    : si la valeur d'une [variable] est utilisée (pas pour MOV [variable], ... qui l'écrase)
 *   5. calcul     : l'UAL calcule (sauf MOV)
 *   6. ecriture   : le résultat va dans le registre, ou en mémoire (bus de contrôle ECRITURE)
 *
 * Exemple attendu pour ADD RAX, [valeur] avec RAX = 5 et valeur = 10 (adresse 256) :
 *   recherche  "Je cherche la prochaine instruction à l'adresse 8."
 *   decodage   "Instruction ADD : additionner RAX et la variable valeur."
 *   compteur   "RIP passe à 16."
 *   lecture    "Je lis la variable valeur à l'adresse 256."
 *   calcul     "L'UAL calcule 5 + 10 = 15."
 *   ecriture   "Je range 15 dans RAX."
 */

import { creerEtape } from './etapes.js'
import { calculer } from '../cpu/ual.js'
import { enDecimalSigne } from '../format.js'
import { CONTROLE, TAILLE_INSTRUCTION } from '../constants.js'

/** Bus et RAM utilisés pour un échange entre le CPU et la mémoire. */
const ACCES_MEMOIRE = ['BUS_ADRESSE', 'BUS_CONTROLE', 'RAM', 'BUS_DONNEES']

/** Symbole affiché dans le message de l'étape « calcul ». */
const SYMBOLES = { ADD: '+', SUB: '-', MUL: '×' }

/**
 * Produit les étapes d'une instruction SANS modifier `etat`.
 * Les valeurs finales sont dans `changements` de chaque étape.
 * @param {import('../types.js').EtatMachine} etat
 * @param {import('../types.js').Instruction} instruction
 * @param {number} adresse  Adresse de l'instruction (valeur de RIP)
 * @returns {import('./etapes.js').Etape[]}
 */
export function genererEtapes(etat, instruction, adresse) {
  const { op, operandes, ligne } = instruction
  const [destination, source] = operandes
  const etapes = []

  // 1. Recherche : la mémoire envoie l'instruction pointée par RIP
  etapes.push(creerEtape({
    phase: 'recherche',
    message: `Je cherche la prochaine instruction à l'adresse ${adresse}.`,
    actifs: ['RIP', ...ACCES_MEMOIRE],
    bus: { adresse, donnees: instruction.texte, controle: CONTROLE.LECTURE },
    ligne,
  }))

  // 2. Décodage : l'unité de contrôle comprend ce qu'il faut faire
  etapes.push(creerEtape({
    phase: 'decodage',
    message: `Instruction ${op} : ${decrire(op, destination, source)}.`,
    actifs: ['UC'],
    ligne,
  }))

  // 3. Compteur : RIP passe à l'instruction suivante
  const nouveauRip = BigInt(adresse + TAILLE_INSTRUCTION)
  etapes.push(creerEtape({
    phase: 'compteur',
    message: `RIP passe à ${nouveauRip}.`,
    actifs: ['RIP'],
    changements: { registres: { RIP: nouveauRip } },
    ligne,
  }))

  // 4. Lecture : seulement si une variable doit être lue en mémoire
  const variableLue = operandes.find((o) => o.type === 'memoire' && doitEtreLu(op, o, destination))
  if (variableLue) {
    const adresseVariable = etat.symboles[variableLue.etiquette]
    etapes.push(creerEtape({
      phase: 'lecture',
      message: `Je lis la variable ${variableLue.etiquette} à l'adresse ${adresseVariable}.`,
      actifs: ACCES_MEMOIRE,
      bus: {
        adresse: adresseVariable,
        donnees: etat.memoire.lire64(adresseVariable),
        controle: CONTROLE.LECTURE,
      },
      ligne,
    }))
  }

  // 5. Calcul : l'UAL travaille (MOV copie sans calculer)
  let resultat
  let haut = null
  if (op === 'MOV') {
    resultat = valeurDe(source, etat)
  } else {
    // MUL multiplie toujours RAX par son opérande
    const a = op === 'MUL' ? etat.registres.RAX : valeurDe(destination, etat)
    const b = op === 'MUL' ? valeurDe(destination, etat) : source ? valeurDe(source, etat) : 0n
    const calcul = calculer(op, a, b)
    resultat = calcul.resultat
    haut = calcul.haut ?? null
    etapes.push(creerEtape({
      phase: 'calcul',
      message: `L'UAL calcule ${formuleCalcul(op, a, b, resultat, haut)}.`,
      actifs: ['UAL', ...registresSources(op, operandes)],
      ligne,
    }))
  }

  // 6. Écriture : le résultat va dans sa destination
  etapes.push(etapeEcriture(op, destination, resultat, haut, etat, ligne))

  return etapes
}

/** Valeur actuelle d'un opérande (registre, constante ou variable). */
function valeurDe(operande, etat) {
  if (operande.type === 'registre') return etat.registres[operande.nom]
  if (operande.type === 'immediat') return operande.valeur
  return etat.memoire.lire64(etat.symboles[operande.etiquette])
}

/** Nom d'un opérande pour les messages : "RAX", "5" ou "la variable valeur". */
function nommer(operande) {
  if (operande.type === 'registre') return operande.nom
  if (operande.type === 'immediat') return enDecimalSigne(operande.valeur)
  return `la variable ${operande.etiquette}`
}

/** Phrase du décodage, ex : "additionner RAX et la variable valeur". */
function decrire(op, destination, source) {
  switch (op) {
    case 'MOV': return `copier ${nommer(source)} dans ${nommer(destination)}`
    case 'ADD': return `additionner ${nommer(destination)} et ${nommer(source)}`
    case 'SUB': return `soustraire ${nommer(source)} de ${nommer(destination)}`
    case 'INC': return `ajouter 1 à ${nommer(destination)}`
    case 'DEC': return `retirer 1 à ${nommer(destination)}`
    case 'MUL': return `multiplier RAX par ${nommer(destination)}, résultat dans RDX et RAX`
  }
}

/**
 * Une variable est lue si sa valeur sert au calcul.
 * Exception : MOV [variable], ... écrase la variable sans la lire.
 */
function doitEtreLu(op, operande, destination) {
  return !(op === 'MOV' && operande === destination)
}

/** Registres qui fournissent une valeur à l'UAL (à allumer pendant le calcul). */
function registresSources(op, operandes) {
  const noms = operandes.filter((o) => o.type === 'registre').map((o) => o.nom)
  if (op === 'MUL') noms.push('RAX')
  return [...new Set(noms)]
}

/** Formule du message de calcul, ex : "5 + 10 = 15". */
function formuleCalcul(op, a, b, resultat, haut) {
  const v = enDecimalSigne
  if (op === 'INC') return `${v(a)} + 1 = ${v(resultat)}`
  if (op === 'DEC') return `${v(a)} - 1 = ${v(resultat)}`
  if (op === 'MUL' && haut !== 0n) {
    return `${v(a)} × ${v(b)} : partie basse ${v(resultat)}, partie haute ${v(haut)}`
  }
  return `${v(a)} ${SYMBOLES[op]} ${v(b)} = ${v(resultat)}`
}

/** Dernière étape : rangement du résultat dans un registre ou en mémoire. */
function etapeEcriture(op, destination, resultat, haut, etat, ligne) {
  if (op === 'MUL') {
    return creerEtape({
      phase: 'ecriture',
      message: `Je range ${enDecimalSigne(resultat)} dans RAX et ${enDecimalSigne(haut)} dans RDX.`,
      actifs: ['RAX', 'RDX'],
      changements: { registres: { RAX: resultat, RDX: haut } },
      ligne,
    })
  }
  if (destination.type === 'registre') {
    return creerEtape({
      phase: 'ecriture',
      message: `Je range ${enDecimalSigne(resultat)} dans ${destination.nom}.`,
      actifs: [destination.nom],
      changements: { registres: { [destination.nom]: resultat } },
      ligne,
    })
  }
  // Destination en mémoire : le CPU envoie la valeur avec le signal ÉCRITURE
  const adresseVariable = etat.symboles[destination.etiquette]
  return creerEtape({
    phase: 'ecriture',
    message: `J'écris ${enDecimalSigne(resultat)} dans la variable ${destination.etiquette} à l'adresse ${adresseVariable}.`,
    actifs: ACCES_MEMOIRE,
    bus: { adresse: adresseVariable, donnees: resultat, controle: CONTROLE.ECRITURE },
    changements: { memoire: [{ adresse: adresseVariable, valeur: resultat }] },
    ligne,
  })
}

/**
 * Applique une étape à l'état et renvoie le NOUVEL état (l'ancien n'est pas modifié).
 * Implémenté : c'est le contrat commun, ne pas changer sans accord de l'équipe.
 * @param {import('../types.js').EtatMachine} etat
 * @param {import('./etapes.js').Etape} etape
 * @returns {import('../types.js').EtatMachine}
 */
export function appliquerEtape(etat, etape) {
  const registres = { ...etat.registres, ...etape.changements.registres }
  let memoire = etat.memoire
  if (etape.changements.memoire.length > 0) {
    memoire = etat.memoire.copier()
    for (const { adresse, valeur } of etape.changements.memoire) {
      memoire.ecrire64(adresse, valeur)
    }
  }
  return { ...etat, registres, memoire }
}
