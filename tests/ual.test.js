// Spécification de l'UAL (Alex, US-06).
import { describe, it, expect } from 'vitest'
import { calculer } from '../src/core/cpu/ual.js'

const MAX = (1n << 64n) - 1n

describe('calculer', () => {
  it('ADD, SUB, INC, DEC', () => {
    expect(calculer('ADD', 5n, 10n).resultat).toBe(15n)
    expect(calculer('SUB', 10n, 3n).resultat).toBe(7n)
    expect(calculer('INC', 9n).resultat).toBe(10n)
    expect(calculer('DEC', 10n).resultat).toBe(9n)
  })

  it('reste sur 64 bits', () => {
    expect(calculer('ADD', MAX, 1n).resultat).toBe(0n)
    expect(calculer('SUB', 5n, 7n).resultat).toBe(MAX - 1n) // -2 en complément à deux
  })

  it('MUL : partie basse dans RAX, partie haute dans RDX', () => {
    expect(calculer('MUL', 5n, 3n)).toEqual({ resultat: 15n, haut: 0n })
    const r = calculer('MUL', MAX, 2n)
    expect(r.resultat).toBe(MAX - 1n)
    expect(r.haut).toBe(1n)
  })
})
