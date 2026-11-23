<script setup>
/**
 * Les trois bus entre le CPU et la mémoire.
 * Responsable : Mariem (US-09)
 *
 * Fait :
 *  - chaque bus s'allume avec sa couleur quand il sert pendant l'étape
 *  - sens du transfert écrit en toutes lettres (CPU → RAM ou RAM → CPU) et valeur qui glisse dans ce sens
 *  - état d'attente visible quand un bus ne sert pas (entre deux étapes, décodage, calcul...)
 *
 * Sens des bus (cours A) :
 *  - adresses : toujours du CPU vers la RAM (c'est le CPU qui choisit la case)
 *  - contrôle : toujours du CPU vers la RAM (l'unité de contrôle donne l'ordre LECTURE ou ECRITURE)
 *  - données  : RAM → CPU en LECTURE, CPU → RAM en ECRITURE
 */
import { computed } from 'vue'
import { CONTROLE } from '../core/constants.js'
import { enDecimalSigne } from '../core/format.js'

const props = defineProps({
  bus: { type: Object, default: null },
  actifs: { type: Set, default: () => new Set() },
})

const VERS_RAM = { classe: 'vers-ram', texte: 'CPU → RAM' }
const VERS_CPU = { classe: 'vers-cpu', texte: 'RAM → CPU' }

/** Texte affiché sur le bus de données : un nombre (décimal signé) ou le texte de l'instruction. */
function texteDonnees(valeur) {
  if (typeof valeur === 'bigint') return enDecimalSigne(valeur)
  return valeur ?? ''
}

/** Les trois bus, dans l'ordre du schéma, avec ce qu'ils transportent pendant l'étape. */
const lignes = computed(() => [
  {
    id: 'BUS_ADRESSE',
    classe: 'adresse',
    nom: "Bus d'adresses",
    valeur: props.bus?.adresse ?? '',
    sens: VERS_RAM,
  },
  {
    id: 'BUS_DONNEES',
    classe: 'donnees',
    nom: 'Bus de données',
    valeur: texteDonnees(props.bus?.donnees),
    sens: props.bus?.controle === CONTROLE.ECRITURE ? VERS_RAM : VERS_CPU,
  },
  {
    id: 'BUS_CONTROLE',
    classe: 'controle',
    nom: 'Bus de contrôle',
    valeur: props.bus?.controle ?? '',
    sens: VERS_RAM,
  },
].map((ligne) => ({ ...ligne, allume: props.actifs.has(ligne.id) })))

/** Vrai quand aucun bus ne sert pendant l'étape en cours. */
const enAttente = computed(() => lignes.value.every((ligne) => !ligne.allume))
</script>

<template>
  <div class="bus" :class="{ attente: enAttente }">
    <div
      v-for="ligne in lignes"
      :key="ligne.id"
      class="ligne"
      :class="[ligne.classe, { allume: ligne.allume }]"
    >
      <div class="entete">
        <span class="nom">{{ ligne.nom }}</span>
        <span class="sens">{{ ligne.allume ? ligne.sens.texte : 'En attente' }}</span>
      </div>

      <!-- La piste : la valeur glisse du côté qui l'envoie vers le côté qui la reçoit. -->
      <div class="piste" :class="ligne.allume ? ligne.sens.classe : null">
        <span
          v-if="ligne.allume"
          :key="`${ligne.sens.classe}-${ligne.valeur}`"
          class="paquet mono"
        >{{ ligne.valeur }}</span>
        <span v-else class="vide">—</span>
      </div>
    </div>

    <p class="legende" role="status">
      {{ enAttente ? 'Aucun transfert : les bus sont en attente.' : 'Transfert en cours entre le CPU et la RAM.' }}
    </p>
  </div>
</template>

<style scoped>
.bus {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}
.ligne {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 2px solid var(--bordure);
  background: var(--surface);
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}
.entete {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 8px;
}
.nom {
  font-weight: 600;
}
.sens {
  font-size: 13px;
  color: var(--texte-secondaire);
}
.allume .sens {
  color: inherit;
  font-weight: 700;
}

/* Piste du bus : une bande où la valeur se déplace. */
.piste {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--fond);
  overflow: hidden;
}
.allume .piste {
  background: rgba(255, 255, 255, 0.18);
}
/* Flèches discrètes qui défilent dans le sens du transfert, derrière la valeur. */
.piste.vers-ram,
.piste.vers-cpu {
  background-image: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0 12px,
    rgba(255, 255, 255, 0.35) 12px 14px
  );
  background-size: 28px 100%;
}
.piste.vers-ram {
  animation: defile-droite 0.8s linear infinite;
}
.piste.vers-cpu {
  animation: defile-gauche 0.8s linear infinite;
}
.paquet {
  max-width: 100%;
  padding: 2px 8px;
  border-radius: 4px;
  background: #ffffff;
  color: var(--texte);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* À chaque nouvelle valeur, elle arrive depuis le côté qui l'envoie. */
.vers-ram .paquet {
  animation: arrive-depuis-cpu 0.5s ease-out;
}
.vers-cpu .paquet {
  animation: arrive-depuis-ram 0.5s ease-out;
}
.vide {
  color: var(--texte-secondaire);
}

.adresse.allume {
  border-color: var(--bus-adresse);
  background: var(--bus-adresse);
  color: #ffffff;
}
.donnees.allume {
  border-color: var(--bus-donnees);
  background: var(--bus-donnees);
  color: #ffffff;
}
.controle.allume {
  border-color: var(--bus-controle);
  background: var(--bus-controle);
  color: #ffffff;
}

.legende {
  margin: 0;
  font-size: 13px;
  text-align: center;
  color: var(--texte-secondaire);
}
.attente .legende {
  font-style: italic;
}

@keyframes defile-droite {
  from { background-position: 0 0; }
  to { background-position: 28px 0; }
}
@keyframes defile-gauche {
  from { background-position: 28px 0; }
  to { background-position: 0 0; }
}
@keyframes arrive-depuis-cpu {
  from { transform: translateX(-60%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes arrive-depuis-ram {
  from { transform: translateX(60%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Pas d'animation pour qui l'a désactivée dans son système : le sens reste écrit en toutes lettres. */
@media (prefers-reduced-motion: reduce) {
  .piste.vers-ram,
  .piste.vers-cpu,
  .paquet {
    animation: none;
  }
}
</style>
