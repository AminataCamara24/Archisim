// Spécification de la mémoire et du chargeur (Baillo, US-05).
import { describe, it, expect } from 'vitest'
import { Memoire } from '../src/core/memory/memoire.js'
import { charger } from '../src/core/memory/chargeur.js'

describe('Memoire', () => {
  it('range une valeur 64 bits en little-endian (diapo 25 du cours)', () => {
    const m = new Memoire()
    m.ecrire64(256, 0x0a0b0c0dn)
    expect([0, 1, 2, 3, 4].map((i) => m.lireOctet(256 + i))).toEqual([0x0d, 0x0c, 0x0b, 0x0a, 0])
    expect(m.lire64(256)).toBe(0x0a0b0c0dn)
  })

  it('refuse une adresse hors mémoire', () => {
    const m = new Memoire()
    expect(() => m.lire64(510)).toThrow()
  })
})

describe('charger', () => {
  it('range le code à partir de 0 et les données à partir de 256', () => {
    const programme = {
      instructions: [
        { op: 'MOV', operandes: [], ligne: 5, texte: 'MOV RAX, 5' },
        { op: 'ADD', operandes: [], ligne: 6, texte: 'ADD RAX, [valeur]' },
      ],
      donnees: [{ nom: 'valeur', valeur: 10n, ligne: 2 }],
      erreurs: [],
    }
    const { memoire, symboles, codeParAdresse } = charger(programme)
    expect(codeParAdresse.get(0).op).toBe('MOV')
    expect(codeParAdresse.get(8).op).toBe('ADD')
    expect(memoire.lireOctet(0)).toBe(1) // OPCODES.MOV
    expect(symboles.valeur).toBe(256)
    expect(memoire.lire64(256)).toBe(10n)
  })
})
