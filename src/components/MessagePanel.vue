<script setup>
/**
 * Message explicatif de l'étape en cours (« Je cherche la prochaine instruction... »).
 * Responsable : Mariem (US-07)
 */
defineProps({
  etape: { type: Object, default: null },
  /** Vrai quand un programme est chargé (après « Charger » ou « Réinitialiser »). */
  pret: { type: Boolean, default: false },
})
</script>

<template>
  <div class="panneau" aria-live="polite">
    <template v-if="etape">
      <span class="phase mono">{{ etape.phase }}</span>
      <p>{{ etape.message }}</p>
    </template>
    <p v-else-if="pret">Programme prêt : cliquez sur « Suivant » pour avancer pas à pas, ou sur « Exécuter ».</p>
    <p v-else>Chargez un programme puis cliquez sur « Suivant » ou « Exécuter ».</p>
  </div>
</template>

<style scoped>
.panneau {
  background: var(--surface);
  border: 1px solid var(--bordure);
  border-radius: 8px;
  padding: 16px;
  min-height: 96px;
}
.phase {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--texte-secondaire);
}
p {
  margin: 4px 0 0;
  font-size: 18px;
}
</style>
