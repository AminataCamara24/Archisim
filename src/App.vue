<script setup>
/**
 * Page principale : assemble les composants, ne contient aucune logique métier.
 */
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useSimulation } from './composables/useSimulation.js'
import CodeEditor from './components/CodeEditor.vue'
import Controls from './components/Controls.vue'
import ArchitectureView from './components/ArchitectureView.vue'
import MessagePanel from './components/MessagePanel.vue'

const sim = useSimulation()

/** Éléments à allumer pendant l'étape courante. */
const actifs = computed(() => new Set(sim.etapeCourante.value?.actifs ?? []))

/*
 * Même disposition sur tous les PC : au-dessus de LARGEUR_MIN, la page est
 * dessinée à LARGEUR_REFERENCE pixels puis agrandie ou réduite (zoom CSS)
 * pour remplir exactement la largeur de la fenêtre. En dessous (téléphone,
 * tablette), on garde la disposition responsive.
 * 1700 px = largeur minimale mesurée de la disposition (~1580 px) + marge pour
 * les polices plus larges selon le système. À 1280 px, l'échelle vaut 0,75 :
 * en dessous, le texte deviendrait trop petit.
 */
const LARGEUR_REFERENCE = 1700
const LARGEUR_MIN = 1280
const echelle = ref(null)

function ajusterEchelle() {
  // clientWidth : largeur utile, sans la place de la barre de défilement
  const largeur = document.documentElement.clientWidth
  echelle.value = window.innerWidth >= LARGEUR_MIN ? largeur / LARGEUR_REFERENCE : null
}

const styleApplication = computed(() =>
  echelle.value ? { width: `${LARGEUR_REFERENCE}px`, zoom: echelle.value } : null,
)

onMounted(() => {
  ajusterEchelle()
  window.addEventListener('resize', ajusterEchelle)
})
onBeforeUnmount(() => window.removeEventListener('resize', ajusterEchelle))
</script>

<template>
  <div class="application" :class="{ 'echelle-fixe': echelle }" :style="styleApplication">
    <header class="entete">
      <h1>ArchiSim</h1>
      <p>Simulateur d'architecture de Von Neumann (x86-64, syntaxe NASM)</p>
    </header>

    <main class="page">
      <!-- Boutons de pilotage au-dessus des colonnes, sur une seule ligne, centrés -->
      <section class="ligne-controles">
        <Controls
          :pret="sim.pret.value"
          :en-cours="sim.enCours.value"
          :termine="sim.termine.value"
          v-model:vitesse="sim.vitesse.value"
          @suivant="sim.suivant"
          @executer="sim.executer"
          @pause="sim.pause"
          @reinitialiser="sim.reinitialiser"
        />
      </section>

      <section class="colonne-code">
        <CodeEditor
          :erreurs="sim.erreurs.value"
          :ligne-active="sim.etapeCourante.value?.ligne ?? null"
          @charger="sim.charger"
        />
      </section>

      <section class="colonne-machine">
        <ArchitectureView
          :etat="sim.etat.value"
          :etape="sim.etapeCourante.value"
          :actifs="actifs"
        />
      </section>

      <!-- Messages explicatifs sous les deux colonnes, centrés, lisibles au vidéoprojecteur -->
      <section class="ligne-messages">
        <MessagePanel :etape="sim.etapeCourante.value" :pret="sim.pret.value" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.entete {
  padding: 16px 24px;
  background: var(--accent);
  color: #ffffff;
}
.entete h1 {
  margin: 0;
  font-size: 24px;
}
.entete p {
  margin: 4px 0 0;
  opacity: 0.85;
}
.page {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 24px;
}
.colonne-code {
  flex: 1 1 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.colonne-machine {
  flex: 999 1 640px;
  min-width: 0;
}
.ligne-controles {
  flex: 1 1 100%;
  display: flex;
  justify-content: center;
}
.ligne-messages {
  flex: 1 1 100%;
  display: flex;
  justify-content: center;
}
.ligne-messages > * {
  width: 100%;
  max-width: 600px;
}
/* Disposition fixe (PC) : contrôles en haut, code | machine, messages en bas */
.echelle-fixe .page {
  display: grid;
  grid-template-columns: 360px 1fr;
  grid-template-areas:
    'controles controles'
    'code machine'
    'messages messages';
  align-items: start;
}
.echelle-fixe .ligne-controles {
  grid-area: controles;
}
.echelle-fixe .colonne-code {
  grid-area: code;
}
.echelle-fixe .colonne-machine {
  grid-area: machine;
}
.echelle-fixe .ligne-messages {
  grid-area: messages;
}
</style>

<style>
/* Barre de défilement verticale toujours présente : la largeur utile ne change
   pas quand la page s'allonge, donc l'échelle calculée reste juste.
   (scrollbar-gutter: stable n'est pas appliqué sur html quand overflow vaut visible) */
html {
  overflow-y: scroll;
}
</style>
