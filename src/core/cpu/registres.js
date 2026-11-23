/**
 * Registres du processeur au Sprint 1.
 * Responsable : Alex (US-06)
 */

import { ADRESSE_CODE, REGISTRES } from '../constants.js'

/** @returns {{RAX: bigint, RBX: bigint, RCX: bigint, RDX: bigint, RIP: bigint}} */
export function creerRegistres() {
  const r = {}
  for (const nom of REGISTRES) r[nom] = 0n
  r.RIP = BigInt(ADRESSE_CODE)
  return r
}
