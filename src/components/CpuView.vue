<script setup>
/**
 * Processeur : registres, unité de contrôle, UAL.
 * Responsable : Djawad (US-12)
 */
import { computed } from 'vue'
import ValueDisplay from './ValueDisplay.vue'
import { REGISTRES } from '../core/constants.js'

const props = defineProps({
  registres: { type: Object, default: null },
  actifs: { type: Set, default: () => new Set() },
  // Instruction calculée par l'UAL (ex : 'ADD'), seulement pendant l'étape « calcul »
  operation: { type: String, default: null },
})

/** Symbole mathématique de chaque opération de l'UAL. */
const SYMBOLES = { ADD: '+', SUB: '-', MUL: '×', INC: '+ 1', DEC: '- 1' }

const symbole = computed(() => SYMBOLES[props.operation] ?? '')
</script>

<template>
  <div class="cpu">
    <h2>CPU</h2>

    <div class="bloc" :class="{ actif: actifs.has('UC') }">Unité de contrôle</div>

    <!-- Compteur ordinal (cours d'architecture, diapo 45) : adresse de la prochaine instruction -->
    <div class="groupe">
      <h3>Compteur ordinal</h3>
      <div class="registre" :class="{ actif: actifs.has('RIP') }">
        <span class="nom mono">RIP</span>
        <ValueDisplay v-if="registres" :valeur="registres.RIP" />
        <span v-else class="vide">-</span>
      </div>
    </div>

    <div class="groupe">
      <h3>Registres généraux</h3>
      <div class="registres">
        <div
          v-for="nom in REGISTRES"
          :key="nom"
          class="registre"
          :class="{ actif: actifs.has(nom) }"
        >
          <span class="nom mono">{{ nom }}</span>
          <ValueDisplay v-if="registres" :valeur="registres[nom]" />
          <span v-else class="vide">-</span>
        </div>
      </div>
    </div>

    <!-- UAL sous les registres, comme le chemin de données (diapo 48) -->
    <div class="bloc" :class="{ actif: actifs.has('UAL') }">
      UAL
      <div v-if="operation" class="operation mono">{{ operation }} ({{ symbole }})</div>
    </div>
  </div>
</template>

<style scoped>
.cpu {
  background: var(--surface);
  border: 2px solid var(--accent);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
h2 {
  margin: 0;
  font-size: 18px;
}
.bloc {
  padding: 12px;
  border: 1px solid var(--bordure);
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
}
h3 {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--texte-secondaire);
}
.groupe {
  border: 1px solid var(--bordure);
  border-radius: 6px;
  padding: 6px;
}
.operation {
  margin-top: 4px;
  color: var(--accent);
}
.registres {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.registre {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 8px;
  align-items: center;
  padding: 6px;
  border-radius: 4px;
}
/* Dans le CPU, le binaire garde au moins 35 caractères (2 lignes de 32 bits),
   même quand la fenêtre rétrécit. ch = largeur d'un caractère de sa police. */
.registre :deep(.binaire) {
  min-width: 35ch;
}
/* ValueDisplay a min-width: 0 ; ici on veut que sa largeur minimale élargisse le CPU */
.registre :deep(.valeur) {
  min-width: min-content;
}
/* Sur téléphone, le binaire s'adapte à la largeur de l'écran */
@media (max-width: 900px) {
  .registre :deep(.binaire),
  .registre :deep(.valeur) {
    min-width: 0;
  }
}
.nom {
  font-weight: 600;
}
.vide {
  color: var(--texte-secondaire);
}
</style>
