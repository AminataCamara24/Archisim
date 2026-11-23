<script setup>
/**
 * Schéma de Von Neumann : CPU, bus, mémoire.
 * Responsable : Djawad (US-12)
 *
 * TODO (Djawad) : disposition finale inspirée des diapos du cours
 * (cours A diapo 48, cours Assembleur diapo 24), lisible au vidéoprojecteur.
 */
import { computed } from 'vue'
import CpuView from './CpuView.vue'
import BusView from './BusView.vue'
import MemoryView from './MemoryView.vue'

const props = defineProps({
  etat: { type: Object, default: null },
  etape: { type: Object, default: null },
  actifs: { type: Set, default: () => new Set() },
})

/**
 * Pendant l'étape « calcul », retrouve l'instruction en cours grâce à sa ligne
 * dans le code chargé, et renvoie son opération (ex : 'ADD'). Sinon null.
 */
const operation = computed(() => {
  if (props.etape?.phase !== 'calcul' || !props.etat) return null
  for (const instruction of props.etat.codeParAdresse.values()) {
    if (instruction.ligne === props.etape.ligne) return instruction.op
  }
  return null
})
</script>

<template>
  <div class="architecture">
    <CpuView
      class="zone-cpu"
      :registres="etat?.registres ?? null"
      :actifs="actifs"
      :operation="operation"
    />
    <BusView class="zone-bus" :bus="etape?.bus ?? null" :actifs="actifs" />
    <MemoryView
      class="zone-memoire"
      :memoire="etat?.memoire ?? null"
      :code-par-adresse="etat?.codeParAdresse ?? null"
      :rip="etat ? Number(etat.registres.RIP) : null"
      :actifs="actifs"
      :symboles="etat?.symboles ?? null"
      :adresse-bus="etape?.bus?.adresse ?? null"
    />
  </div>
</template>

<style scoped>
/*
 * CPU | Bus | Mémoire côte à côte (cours Assembleur, diapo 24), mêmes proportions
 * qu'avant (1 / 0.6 / 1.2). Le CPU et la mémoire ne descendent jamais sous la
 * largeur minimale de leur contenu (min-content) : si la mémoire ne tient plus
 * sur la ligne, flex-wrap la fait passer en dessous, sur toute la largeur,
 * au lieu d'afficher une barre de défilement.
 * Sur PC, la page entière est mise à l'échelle (App.vue) : pas de bascule.
 */
.architecture {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: stretch;
}
.zone-cpu {
  flex: 1 1 0;
  min-width: min-content;
}
.zone-bus {
  flex: 0.6 1 0;
  min-width: 160px;
}
.zone-memoire {
  flex: 1.2 1 0;
  min-width: min-content;
}
/* Sur PC, App.vue met la page à l'échelle (classe echelle-fixe) :
   CPU | Bus | Mémoire restent toujours sur une seule ligne. */
:global(.echelle-fixe) .architecture {
  flex-wrap: nowrap;
}
@media (max-width: 900px) {
  /* nowrap : en colonne, wrap élargirait chaque zone à la taille de la plus large */
  .architecture {
    flex-direction: column;
    flex-wrap: nowrap;
  }
  /* Sur téléphone, la mémoire garde sa barre de défilement plutôt que de déborder,
     et le CPU prend la largeur de l'écran (le binaire passe sur plus de lignes) */
  .zone-memoire,
  .zone-cpu {
    min-width: 0;
  }
  /* En colonne, chaque zone prend la hauteur de son contenu (sinon flex-basis 0
     écrase la mémoire, qui a une barre de défilement) */
  .zone-cpu,
  .zone-bus,
  .zone-memoire {
    flex: none;
  }
}
</style>
