<script setup>
/**
 * Vue de la mémoire vive : une ligne par bloc de 8 octets.
 * Responsable : Baillo (US-05, US-11)
 *
 *  - zone programme : le texte de l'instruction (codeParAdresse)
 *  - zone données : le nom de la variable et sa valeur (lire64) en décimal + binaire (ValueDisplay)
 *  - US-11 : la ligne pointée par RIP est surlignée et marquée « RIP → »
 *  - les blocs vides sont masqués pour rester lisible (sauf la case pointée par RIP)
 */
import { computed } from 'vue'
import { ADRESSE_DONNEES, TAILLE_INSTRUCTION } from '../core/constants.js'
import ValueDisplay from './ValueDisplay.vue'

const props = defineProps({
  memoire: { type: Object, default: null },
  codeParAdresse: { type: Map, default: null },
  /** nom de variable -> adresse (sert à afficher le nom et à garder visibles les variables à 0) */
  symboles: { type: Object, default: null },
  rip: { type: Number, default: null },
  adresseBus: { type: Number, default: null },
  actifs: { type: Set, default: () => new Set() },
})

/** Inverse de symboles : adresse -> nom de la variable. */
const nomParAdresse = computed(() => {
  const resultat = new Map()
  for (const [nom, adresse] of Object.entries(props.symboles ?? {})) {
    resultat.set(adresse, nom)
  }
  return resultat
})

/** Les 8 octets du bloc en hexadécimal, dans l'ordre des adresses (little-endian). */
function octetsEnHexa(adresse) {
  const octets = Array.from(props.memoire.octets.slice(adresse, adresse + TAILLE_INSTRUCTION))
  return octets.map((o) => o.toString(16).padStart(2, '0').toUpperCase()).join(' ')
}

/**
 * Un bloc est caché s'il ne contient rien d'utile à montrer :
 * ni instruction, ni variable, ni octet différent de 0, et que ni le bus ni RIP ne le visent.
 * La case pointée par RIP reste toujours visible : à la fin du programme,
 * on voit que RIP désigne une case sans instruction.
 */
function estVide(adresse, instruction, variable) {
  if (instruction || variable) return false
  if (adresse === props.adresseBus || adresse === props.rip) return false
  for (let i = 0; i < TAILLE_INSTRUCTION; i++) {
    if (props.memoire.lireOctet(adresse + i) !== 0) return false
  }
  return true
}

const lignes = computed(() => {
  if (!props.memoire) return []
  const resultat = []
  for (let adresse = 0; adresse < props.memoire.taille; adresse += TAILLE_INSTRUCTION) {
    const instruction = props.codeParAdresse?.get(adresse) ?? null
    const variable = nomParAdresse.value.get(adresse) ?? null
    if (estVide(adresse, instruction, variable)) continue

    const zone = adresse < ADRESSE_DONNEES ? 'programme' : 'données'
    resultat.push({
      adresse,
      zone,
      octets: octetsEnHexa(adresse),
      instruction: instruction?.texte ?? '',
      variable,
      // Zone données : la valeur 64 bits relue en little-endian
      valeur: zone === 'données' ? props.memoire.lire64(adresse) : null,
    })
  }
  return resultat
})
</script>

<template>
  <div class="memoire" :class="{ actif: actifs.has('RAM') }">
    <h2>Mémoire vive</h2>
    <p v-if="!memoire" class="vide">Aucun programme chargé.</p>
    <table v-else class="mono">
      <thead>
        <tr>
          <th scope="col">Adresse</th>
          <th scope="col">Zone</th>
          <th scope="col">Octets (hexa)</th>
          <th scope="col">Contenu</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="l in lignes"
          :key="l.adresse"
          :class="{ rip: l.adresse === rip, cible: l.adresse === adresseBus }"
        >
          <td>
            <span v-if="l.adresse === rip" class="marqueur-rip">RIP →</span>
            {{ l.adresse }}
          </td>
          <td>{{ l.zone }}</td>
          <td>{{ l.octets }}</td>
          <td v-if="l.zone === 'programme'">
            <template v-if="l.instruction">{{ l.instruction }}</template>
            <span v-else class="vide">aucune instruction</span>
          </td>
          <td v-else>
            <span class="donnee">
              <span v-if="l.variable" class="nom-variable">{{ l.variable }}</span>
              <ValueDisplay :valeur="l.valeur" />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.memoire {
  background: var(--surface);
  border: 2px solid var(--accent);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}
h2 {
  margin: 0 0 12px;
  font-size: 18px;
}
table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
}
th,
td {
  text-align: left;
  padding: 4px 8px;
  border-bottom: 1px solid var(--bordure);
  white-space: nowrap;
}
.donnee {
  display: flex;
  gap: 8px;
  align-items: baseline;
}
.nom-variable {
  font-weight: 600;
  color: var(--accent);
}
.rip {
  background: #fff4d6;
  font-weight: 600;
}
.rip td:first-child {
  box-shadow: inset 4px 0 0 var(--actif);
}
.marqueur-rip {
  color: var(--accent);
  margin-right: 4px;
}
.cible {
  outline: 2px solid var(--bus-adresse);
}
.vide {
  color: var(--texte-secondaire);
}
</style>
