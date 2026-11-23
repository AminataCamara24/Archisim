// Spécification du séquenceur (Alex, US-07) et du contrat des étapes (toute l'équipe).
import { describe, it, expect } from 'vitest'
import { creerEtape } from '../src/core/sequencer/etapes.js'
import { genererEtapes, appliquerEtape } from '../src/core/sequencer/sequenceur.js'
import { Memoire } from '../src/core/memory/memoire.js'

function etatDeTest() {
  const memoire = new Memoire()
  memoire.ecrire64(256, 10n)
  return {
    registres: { RAX: 5n, RBX: 0n, RCX: 0n, RDX: 0n, RIP: 8n },
    memoire,
    symboles: { valeur: 256 },
    codeParAdresse: new Map(),
    termine: false,
  }
}

const ADD = {
  op: 'ADD',
  operandes: [{ type: 'registre', nom: 'RAX' }, { type: 'memoire', etiquette: 'valeur' }],
  ligne: 6,
  texte: 'ADD RAX, [valeur]',
}

describe('creerEtape (contrat)', () => {
  it('refuse une phase ou un composant inconnu', () => {
    expect(() => creerEtape({ phase: 'magie' })).toThrow()
    expect(() => creerEtape({ phase: 'calcul', actifs: ['GPU'] })).toThrow()
  })
})

describe('genererEtapes', () => {
  it('suit le cycle du cours pour ADD RAX, [valeur]', () => {
    const etapes = genererEtapes(etatDeTest(), ADD, 8)
    expect(etapes.map((e) => e.phase)).toEqual([
      'recherche', 'decodage', 'compteur', 'lecture', 'calcul', 'ecriture',
    ])
    expect(etapes[3].bus).toMatchObject({ adresse: 256, controle: 'LECTURE' })
    expect(etapes.at(-1).changements.registres.RAX).toBe(15n)
    expect(etapes[2].changements.registres.RIP).toBe(16n)
  })

  it('ne modifie pas l\'état reçu', () => {
    const etat = etatDeTest()
    genererEtapes(etat, ADD, 8)
    expect(etat.registres.RAX).toBe(5n)
  })
})

describe('appliquerEtape', () => {
  it('renvoie un nouvel état sans toucher l\'ancien', () => {
    const etat = etatDeTest()
    const e = creerEtape({ phase: 'ecriture', changements: { registres: { RAX: 15n } } })
    const nouveau = appliquerEtape(etat, e)
    expect(nouveau.registres.RAX).toBe(15n)
    expect(etat.registres.RAX).toBe(5n)
  })
})
