/**
 * Assembleur NASM simplifié.
 * Responsable : Aminata (US-03, US-04)
 *
 * Entrée : le texte du programme, tel qu'écrit dans le cours.
 * Sortie : un Programme (voir src/core/types.js), jamais d'exception :
 *          toute erreur va dans `erreurs` avec son numéro de ligne.
 *
 * Exemple accepté :
 *   section .data
 *       valeur dq 10
 *   section .text
 *       MOV RAX, 5          ; commentaire
 *       ADD RAX, [valeur]
 *
 * À gérer au Sprint 1 :
 *  - sections .data et .text (ignorer `global _start` et l'étiquette `_start:`)
 *  - variables : `nom dq nombre`
 *  - instructions MOV, ADD, SUB, INC, DEC, MUL (casse ignorée)
 *  - opérandes : registre (RAX, RBX, RCX, RDX), constante, [variable]
 *  - nombres : 10, 10d, 0x0A, 0Ah, 1010b, négatifs (-3)
 *  - commentaires après ';' et lignes vides
 *
 * Erreurs à produire (message en français, avec la ligne) :
 *  - instruction inconnue
 *  - mauvais nombre d'opérandes
 *  - deux opérandes mémoire dans la même instruction (règle du cours)
 *  - registre non supporté (EAX, AL... arrivent au Sprint 2)
 *  - variable non déclarée
 *  - constante en destination (ex : MOV 5, RAX)
 */

import { INSTRUCTIONS, MASQUE_64, REGISTRES } from '../constants.js'

/** Registres x86-64 qui existent mais ne sont pas encore gérés au Sprint 1. */
const REGISTRES_NON_SUPPORTES = [
  'EAX', 'EBX', 'ECX', 'EDX', 'AX', 'BX', 'CX', 'DX',
  'AL', 'AH', 'BL', 'BH', 'CL', 'CH', 'DL', 'DH',
  'RSI', 'RDI', 'RBP', 'RSP', 'RIP',
  'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15',
]

/** Un nom de variable : une lettre ou _, puis lettres, chiffres ou _. */
const NOM_VALIDE = /^[A-Za-z_]\w*$/

/** Plus petit négatif représentable sur 64 bits : -2^63. */
const MIN_SIGNE_64 = -(1n << 63n)

/**
 * @param {string} source
 * @returns {import('../types.js').Programme}
 */
export function assembler(source) {
  const programme = { instructions: [], donnees: [], erreurs: [] }
  let section = null // '.data', '.text' ou null tant qu'aucune section n'est ouverte

  const lignes = String(source ?? '').split(/\r?\n/)
  lignes.forEach((brute, index) => {
    const numero = index + 1
    let texte = retirerCommentaire(brute)
    if (texte === '') return

    // `global _start` est ignoré.
    if (/^global\s+\w+$/i.test(texte)) return

    // L'étiquette `_start:` est ignorée (elle peut être suivie d'une instruction).
    if (/^_start\s*:/.test(texte)) {
      texte = texte.replace(/^_start\s*:/, '').trim()
      if (texte === '') return
    }

    // Changement de section.
    const sectionLue = /^section\s+(\S+)$/i.exec(texte)
    if (sectionLue) {
      section = sectionLue[1].toLowerCase()
      if (section !== '.data' && section !== '.text') {
        ajouterErreur(programme, numero,
          `Section ${sectionLue[1]} inconnue : seules section .data et section .text sont acceptées.`)
      }
      return
    }

    if (section === '.data') {
      lireVariable(texte, numero, programme)
    } else if (section === '.text') {
      lireInstruction(texte, numero, programme)
    } else {
      ajouterErreur(programme, numero,
        'Cette ligne doit être dans une section : écrivez « section .data » ou « section .text » avant.')
    }
  })

  // Les variables peuvent être déclarées après leur utilisation :
  // on vérifie donc les [variable] seulement une fois tout le fichier lu.
  verifierVariables(programme)

  return programme
}

/**
 * Convertit un littéral du cours en BigInt 64 bits (complément à deux pour les négatifs).
 * Exemples : "10" -> 10n, "0x0A" -> 10n, "0Ah" -> 10n, "1010b" -> 10n, "-1" -> 2^64 - 1
 * @param {string} texte
 * @returns {bigint|null} null si le texte n'est pas un nombre valide
 */
export function lireNombre(texte) {
  if (typeof texte !== 'string') return null
  let corps = texte.trim()
  const negatif = corps.startsWith('-')
  if (negatif) corps = corps.slice(1)

  const valeur = lireNombrePositif(corps)
  if (valeur === null) return null

  if (negatif) {
    if (-valeur < MIN_SIGNE_64) return null // trop petit pour 64 bits
    return -valeur & MASQUE_64 // complément à deux : -1 devient 2^64 - 1
  }
  if (valeur > MASQUE_64) return null // trop grand pour 64 bits
  return valeur
}

/**
 * Lit un nombre sans signe, dans l'une des bases du cours.
 * @param {string} corps
 * @returns {bigint|null}
 */
function lireNombrePositif(corps) {
  // Hexadécimal : 0x0A
  if (/^0x[0-9a-f]+$/i.test(corps)) return BigInt(corps)
  // Hexadécimal : 0Ah (doit commencer par un chiffre, sinon c'est un nom)
  if (/^[0-9][0-9a-f]*h$/i.test(corps)) return BigInt('0x' + corps.slice(0, -1))
  // Binaire : 1010b
  if (/^[01]+b$/i.test(corps)) return BigInt('0b' + corps.slice(0, -1))
  // Décimal : 10 ou 10d
  if (/^[0-9]+d?$/i.test(corps)) return BigInt(corps.replace(/d$/i, ''))
  return null
}

/** Enlève le commentaire (tout ce qui suit ';') et les espaces autour. */
function retirerCommentaire(ligne) {
  const debutCommentaire = ligne.indexOf(';')
  const sansCommentaire = debutCommentaire === -1 ? ligne : ligne.slice(0, debutCommentaire)
  return sansCommentaire.trim()
}

function ajouterErreur(programme, ligne, message) {
  programme.erreurs.push({ ligne, message })
}

/**
 * Lit une déclaration de variable de la section .data : `nom dq nombre`.
 */
function lireVariable(texte, numero, programme) {
  const morceaux = /^(\S+)\s+(\S+)\s+(.+)$/.exec(texte)
  if (!morceaux) {
    ajouterErreur(programme, numero,
      'Déclaration de variable incorrecte. Forme attendue : nom dq nombre (ex : valeur dq 10).')
    return
  }
  const [, nom, directive, texteValeur] = morceaux

  if (directive.toLowerCase() !== 'dq') {
    ajouterErreur(programme, numero,
      `« ${directive} » n'est pas géré : au Sprint 1, les variables se déclarent uniquement avec dq (64 bits).`)
    return
  }
  if (!NOM_VALIDE.test(nom)) {
    ajouterErreur(programme, numero,
      `« ${nom} » n'est pas un nom de variable valide (lettres, chiffres et _, sans commencer par un chiffre).`)
    return
  }
  const dejaDeclaree = programme.donnees.find((d) => d.nom === nom)
  if (dejaDeclaree) {
    ajouterErreur(programme, numero,
      `La variable ${nom} est déjà déclarée (ligne ${dejaDeclaree.ligne}).`)
    return
  }
  const valeur = lireNombre(texteValeur)
  if (valeur === null) {
    ajouterErreur(programme, numero,
      `« ${texteValeur.trim()} » n'est pas un nombre valide sur 64 bits.`)
    return
  }
  programme.donnees.push({ nom, valeur, ligne: numero })
}

/**
 * Lit une instruction de la section .text, par exemple `ADD RAX, [valeur]`.
 * Si tout est correct, l'instruction est ajoutée à programme.instructions.
 */
function lireInstruction(texte, numero, programme) {
  // Le premier mot est l'instruction, le reste les opérandes.
  const [, motCle, reste = ''] = /^(\S+)\s*(.*)$/.exec(texte)
  const op = motCle.toUpperCase()

  if (!(op in INSTRUCTIONS)) {
    ajouterErreur(programme, numero,
      `Instruction inconnue : ${motCle}. Au Sprint 1, les instructions sont : ${Object.keys(INSTRUCTIONS).join(', ')}.`)
    return
  }

  const textesOperandes = reste.trim() === '' ? [] : reste.split(',').map((t) => t.trim())
  const attendu = INSTRUCTIONS[op]
  if (textesOperandes.length !== attendu) {
    ajouterErreur(programme, numero,
      `${op} attend ${attendu} opérande(s), mais ${textesOperandes.length} trouvé(s).`)
    return
  }

  // Lecture de chaque opérande : on s'arrête à la première erreur.
  const operandes = []
  for (const t of textesOperandes) {
    const resultat = lireOperande(t)
    if (resultat.erreur) {
      ajouterErreur(programme, numero, resultat.erreur)
      return
    }
    operandes.push(resultat.operande)
  }

  const erreur = verifierRegles(op, operandes)
  if (erreur) {
    ajouterErreur(programme, numero, erreur)
    return
  }

  programme.instructions.push({
    op,
    operandes,
    ligne: numero,
    texte: texteNormalise(op, operandes, textesOperandes),
  })
}

/**
 * Transforme le texte d'un opérande en objet Operande (voir types.js).
 * @param {string} texte
 * @returns {{ operande?: import('../types.js').Operande, erreur?: string }}
 */
function lireOperande(texte) {
  if (texte === '') {
    return { erreur: 'Il manque un opérande (virgule en trop ?).' }
  }

  // Mémoire : [variable], éventuellement précédé de « qword ».
  const memoire = /^(?:qword\s+)?\[\s*(.*?)\s*\]$/i.exec(texte)
  if (memoire) {
    const etiquette = memoire[1]
    if (!NOM_VALIDE.test(etiquette) || estUnRegistre(etiquette)) {
      return {
        erreur: `L'opérande ${texte} n'est pas géré : au Sprint 1, seule la forme [nom_de_variable] est acceptée.`,
      }
    }
    return { operande: { type: 'memoire', etiquette } }
  }

  // Registre
  const nom = texte.toUpperCase()
  if (REGISTRES.includes(nom)) {
    return { operande: { type: 'registre', nom } }
  }
  if (REGISTRES_NON_SUPPORTES.includes(nom)) {
    return {
      erreur: `Le registre ${nom} n'est pas encore géré : au Sprint 1, seuls ${REGISTRES.join(', ')} sont disponibles.`,
    }
  }

  // Constante
  const valeur = lireNombre(texte)
  if (valeur !== null) {
    return { operande: { type: 'immediat', valeur } }
  }

  // Un nom de variable sans crochets : erreur fréquente chez les débutants.
  if (NOM_VALIDE.test(texte)) {
    return {
      erreur: `« ${texte} » n'est ni un registre ni un nombre. Pour utiliser une variable, écrivez [${texte}].`,
    }
  }
  return { erreur: `« ${texte} » n'est pas un opérande valide (ni un registre, ni un nombre sur 64 bits, ni [variable]).` }
}

function estUnRegistre(nom) {
  const majuscules = nom.toUpperCase()
  return REGISTRES.includes(majuscules) || REGISTRES_NON_SUPPORTES.includes(majuscules)
}

/**
 * Règles du cours sur les opérandes.
 * @returns {string|null} le message d'erreur, ou null si tout va bien
 */
function verifierRegles(op, operandes) {
  const destination = operandes[0]

  if (destination.type === 'immediat') {
    if (op === 'MUL') {
      return 'MUL ne peut pas multiplier par une constante : utilisez un registre ou [variable] (ex : MUL RBX).'
    }
    return `La destination de ${op} ne peut pas être une constante : écrivez dans un registre ou dans [variable].`
  }

  const nbMemoire = operandes.filter((o) => o.type === 'memoire').length
  if (nbMemoire > 1) {
    return 'Une instruction ne peut pas utiliser deux opérandes mémoire. Passez par un registre (ex : MOV RAX, [b] puis MOV [a], RAX).'
  }
  return null
}

/** Texte de l'instruction réécrit proprement, ex : "ADD RAX, [valeur]". */
function texteNormalise(op, operandes, textesOperandes) {
  const parties = operandes.map((o, i) => {
    if (o.type === 'registre') return o.nom
    if (o.type === 'memoire') return `[${o.etiquette}]`
    return textesOperandes[i] // constante : on garde l'écriture de l'utilisateur (ex : 0Ah, -3)
  })
  return parties.length === 0 ? op : `${op} ${parties.join(', ')}`
}

/** Signale chaque [variable] utilisée mais jamais déclarée dans .data. */
function verifierVariables(programme) {
  const declarees = new Set(programme.donnees.map((d) => d.nom))
  for (const instruction of programme.instructions) {
    for (const o of instruction.operandes) {
      if (o.type === 'memoire' && !declarees.has(o.etiquette)) {
        ajouterErreur(programme, instruction.ligne,
          `La variable ${o.etiquette} n'est pas déclarée. Ajoutez-la dans section .data (ex : ${o.etiquette} dq 0).`)
      }
    }
  }
  // Les erreurs restent dans l'ordre des lignes, plus simple à lire.
  programme.erreurs.sort((a, b) => a.ligne - b.ligne)
}
