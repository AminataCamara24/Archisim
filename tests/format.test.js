// Spécification de l'affichage décimal / binaire (Djawad, US-10).
import { describe, it, expect } from 'vitest'
import { enDecimalSigne, enBinaire } from '../src/core/format.js'

const MAX = (1n << 64n) - 1n

describe('enDecimalSigne', () => {
  it('affiche les positifs tels quels', () => {
    expect(enDecimalSigne(15n)).toBe('15')
  })
  it('affiche les négatifs en complément à deux', () => {
    expect(enDecimalSigne(MAX)).toBe('-1')
    expect(enDecimalSigne(MAX - 1n)).toBe('-2')
  })
})

describe('enBinaire', () => {
  it('complète avec des zéros', () => {
    expect(enBinaire(10n, 8)).toBe('00001010')
  })
  it('groupe par 8 bits', () => {
    expect(enBinaire(10n, 16)).toBe('00000000 00001010')
  })
  it('affiche 64 bits par défaut', () => {
    expect(enBinaire(0n).replaceAll(' ', '')).toHaveLength(64)
  })
})
