<script setup>
/**
 * Boutons de pilotage : Suivant, Exécuter / Pause, Réinitialiser, vitesse.
 * Responsable : Mariem (US-07, US-08)
 */
defineProps({
  pret: Boolean,
  enCours: Boolean,
  termine: Boolean,
})
const vitesse = defineModel('vitesse', { type: Number, default: 800 })
const emit = defineEmits(['suivant', 'executer', 'pause', 'reinitialiser'])
</script>

<template>
  <div class="controles">
    <button type="button" :disabled="!pret || enCours || termine" @click="emit('suivant')">Suivant</button>
    <button v-if="!enCours" type="button" :disabled="!pret || termine" @click="emit('executer')">Exécuter</button>
    <button v-else type="button" @click="emit('pause')">Pause</button>
    <button type="button" :disabled="!pret" @click="emit('reinitialiser')">Réinitialiser</button>

    <label class="vitesse">
      Vitesse
      <input v-model.number="vitesse" type="range" min="200" max="2000" step="100" />
      <span class="mono">{{ vitesse }} ms</span>
    </label>
  </div>
</template>

<style scoped>
.controles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.vitesse {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
