<script setup>
/**
 * Une valeur affichée en décimal et en binaire côte à côte.
 * Responsable : Djawad (US-10)
 */
import { computed } from 'vue'
import { enDecimalSigne, enBinaire } from '../core/format.js'

const props = defineProps({
  valeur: { type: BigInt, required: true },
  bits: { type: Number, default: 64 },
})

const decimal = computed(() => enDecimalSigne(props.valeur))
const binaire = computed(() => enBinaire(props.valeur, props.bits))
</script>

<template>
  <span class="valeur">
    <span class="decimal mono">{{ decimal }}</span>
    <span class="binaire mono" :title="binaire">{{ binaire }}</span>
  </span>
</template>

<style scoped>
.valeur {
  display: flex;
  gap: 12px;
  align-items: baseline;
  min-width: 0;
}
.decimal {
  font-weight: 600;
  min-width: 4ch;
}
.binaire {
  /* 12px : reste lisible quand la page est réduite sur un petit écran de PC */
  font-size: 12px;
  color: var(--texte-secondaire);
  /* On affiche les 64 bits en entier (jamais d'ellipse : les bits de poids
     faible, à droite, sont les plus importants). 35ch = 4 octets de 8 bits
     + 3 espaces : la valeur passe sur 2 lignes de 32 bits. */
  max-width: 35ch;
  white-space: normal;
}
</style>
