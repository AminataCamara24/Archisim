/**
 * Mémoire vive adressée à l'octet, en little-endian (cours d'assembleur, diapos 24 à 26).
 * Responsable : Baillo (US-05)
 *
 * Exemple : écrire 0x0A0B0C0D à l'adresse a donne
 *   a: 0D, a+1: 0C, a+2: 0B, a+3: 0A, a+4..a+7: 00
 */

import { MASQUE_64, TAILLE_MEMOIRE } from '../constants.js'

export class Memoire {
  /** @param {number} taille */
  constructor(taille = TAILLE_MEMOIRE) {
    this.taille = taille
    this.octets = new Uint8Array(taille)
  }

  /** Lève une erreur claire si l'adresse sort de la mémoire. */
  verifierAdresse(adresse, nbOctets = 1) {
    if (adresse < 0 || adresse + nbOctets > this.taille) {
      throw new Error(`Adresse hors mémoire : ${adresse}`)
    }
  }

  /** @returns {number} un octet (0 à 255) */
  lireOctet(adresse) {
    this.verifierAdresse(adresse)
    return this.octets[adresse]
  }

  ecrireOctet(adresse, valeur) {
    this.verifierAdresse(adresse)
    this.octets[adresse] = valeur & 0xff
  }

  /**
   * Lit 8 octets consécutifs en little-endian.
   * @returns {bigint}
   */
  lire64(adresse) {
    this.verifierAdresse(adresse, 8)
    let valeur = 0n
    // On part de l'octet de poids fort (adresse + 7) et on descend :
    // à chaque tour, on décale ce qu'on a déjà de 8 bits vers la gauche
    // et on ajoute l'octet suivant à droite.
    for (let i = 7; i >= 0; i--) {
      valeur = (valeur << 8n) | BigInt(this.octets[adresse + i])
    }
    return valeur
  }

  /**
   * Écrit une valeur 64 bits sur 8 octets consécutifs en little-endian.
   * @param {number} adresse
   * @param {bigint} valeur
   */
  ecrire64(adresse, valeur) {
    this.verifierAdresse(adresse, 8)
    let v = valeur & MASQUE_64
    // Little-endian : l'octet de poids faible va à l'adresse la plus basse.
    // À chaque tour, on garde les 8 bits de droite, puis on les « retire » en décalant.
    for (let i = 0; i < 8; i++) {
      this.octets[adresse + i] = Number(v & 0xffn)
      v = v >> 8n
    }
  }

  /** Copie indépendante (utile pour revenir en arrière ou réinitialiser). */
  copier() {
    const m = new Memoire(this.taille)
    m.octets.set(this.octets)
    return m
  }
}
