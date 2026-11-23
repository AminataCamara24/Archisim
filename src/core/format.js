/**
 * Affichage des valeurs en décimal et en binaire (cours B : complément à deux).
 * Responsable : Djawad (US-10)
 *
 * Les valeurs arrivent en BigInt non signé 64 bits.
 *   enDecimalSigne(2n ** 64n - 1n) -> "-1"
 *   enDecimalSigne(15n)            -> "15"
 *   enBinaire(10n, 8)              -> "00001010"
 *   enBinaire(10n)                 -> 64 bits groupés par 8 : "00000000 ... 00001010"
 */

const DEUX_PUISSANCE_64 = 1n << 64n
const BIT_DE_SIGNE = 1n << 63n

/**
 * @param {bigint} valeur
 * @returns {string}
 */
export function enDecimalSigne(valeur) {
  // Complément à deux : si le bit 63 vaut 1, le nombre est négatif
  if ((valeur & BIT_DE_SIGNE) !== 0n) {
    return (valeur - DEUX_PUISSANCE_64).toString()
  }
  return valeur.toString()
}

/**
 * @param {bigint} valeur
 * @param {number} [bits=64]
 * @param {boolean} [grouper=true] Espace tous les 8 bits
 * @returns {string}
 */
export function enBinaire(valeur, bits = 64, grouper = true) {
  // Zéros à gauche jusqu'à obtenir `bits` chiffres
  const binaire = valeur.toString(2).padStart(bits, '0')
  if (!grouper) {
    return binaire
  }
  // Découpe en paquets de 8 bits (un octet) séparés par un espace
  return binaire.match(/.{1,8}/g).join(' ')
}
