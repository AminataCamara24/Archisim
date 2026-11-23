// Spécification de l'assembleur (Aminata, US-03 et US-04).
// Ces tests échouent tant que parser.js n'est pas codé : c'est normal.
import { describe, it, expect } from 'vitest'
import { assembler, lireNombre } from '../src/core/assembler/parser.js'

const DEMO = `section .data
    valeur dq 10

section .text
    MOV RAX, 5          ; commentaire
    add rax, [valeur]
    MUL RBX
`

describe('lireNombre', () => {
  it('lit les formats du cours', () => {
    expect(lireNombre('10')).toBe(10n)
    expect(lireNombre('10d')).toBe(10n)
    expect(lireNombre('0x0A')).toBe(10n)
    expect(lireNombre('0Ah')).toBe(10n)
    expect(lireNombre('1010b')).toBe(10n)
  })
  it('code les négatifs en complément à deux sur 64 bits', () => {
    expect(lireNombre('-1')).toBe((1n << 64n) - 1n)
  })
  it('refuse un texte qui n\'est pas un nombre', () => {
    expect(lireNombre('RAX')).toBeNull()
  })
})

describe('assembler', () => {
  it('lit les variables et les instructions', () => {
    const p = assembler(DEMO)
    expect(p.erreurs).toEqual([])
    expect(p.donnees).toEqual([{ nom: 'valeur', valeur: 10n, ligne: 2 }])
    expect(p.instructions).toHaveLength(3)
    expect(p.instructions[1]).toMatchObject({
      op: 'ADD',
      operandes: [
        { type: 'registre', nom: 'RAX' },
        { type: 'memoire', etiquette: 'valeur' },
      ],
      ligne: 6,
    })
  })

  it('refuse deux opérandes mémoire', () => {
    const p = assembler('section .data\n a dq 1\n b dq 2\nsection .text\n MOV [a], [b]')
    expect(p.erreurs[0].ligne).toBe(5)
  })

  it('signale une instruction inconnue avec sa ligne', () => {
    const p = assembler('section .text\n JMP fin')
    expect(p.erreurs[0].ligne).toBe(2)
  })

  it('signale une variable non déclarée', () => {
    const p = assembler('section .text\n MOV RAX, [inconnue]')
    expect(p.erreurs).toHaveLength(1)
  })

  it('refuse les sous-registres au Sprint 1', () => {
    const p = assembler('section .text\n MOV EAX, 1')
    expect(p.erreurs).toHaveLength(1)
  })
})
