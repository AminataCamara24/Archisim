<script setup>
/**
 * Éditeur de code assembleur et import de fichier .asm.
 * Responsable : Aminata (US-01, US-02, US-04)
 *
 * Fait :
 *  - numéros de ligne à gauche du texte
 *  - surlignage de `ligneActive` (instruction en cours) et des lignes en erreur
 *  - US-02 : import d'un fichier .asm ou .txt, avec un message si le fichier ne peut pas être lu
 *
 * Principe du surlignage : un <textarea> ne sait pas colorier une seule ligne.
 * On place donc derrière lui (fond transparent) une couche de bandes, une par ligne,
 * à la même hauteur que les lignes du texte. Quand on fait défiler le textarea,
 * on décale la couche et la colonne des numéros d'autant.
 */
import { computed, ref } from 'vue'

const props = defineProps({
  erreurs: { type: Array, default: () => [] },
  ligneActive: { type: Number, default: null },
})
const emit = defineEmits(['charger'])

const source = ref(`section .data
    valeur dq 10

section .text
    MOV RAX, 5
    ADD RAX, [valeur]
    MOV RBX, 3
    MUL RBX
`)

/** Défilement vertical du textarea, en pixels. */
const defilement = ref(0)

/** Numéros des lignes : 1, 2, 3... autant que de lignes dans le texte. */
const numeros = computed(() => {
  const nombre = source.value.split('\n').length
  return Array.from({ length: nombre }, (_, i) => i + 1)
})

/** Message d'erreur de chaque ligne fautive (numéro de ligne -> message). */
const messagesParLigne = computed(() => {
  const messages = new Map()
  for (const e of props.erreurs) {
    const deja = messages.get(e.ligne)
    messages.set(e.ligne, deja ? `${deja}\n${e.message}` : e.message)
  }
  return messages
})

/** Classes CSS d'une ligne : en erreur, en cours d'exécution, ou rien. */
function classesLigne(numero) {
  return {
    erreur: messagesParLigne.value.has(numero),
    active: numero === props.ligneActive,
  }
}

function suivreDefilement(evenement) {
  defilement.value = evenement.target.scrollTop
}

/** Extensions acceptées à l'import : un programme assembleur est un simple fichier texte. */
const EXTENSIONS_ACCEPTEES = ['.asm', '.txt']

/** Au-delà, ce n'est sûrement pas un programme de TP (la mémoire ne fait que 512 octets). */
const TAILLE_MAX_IMPORT = 100 * 1024

/** Caractères de contrôle, sauf tabulation (\x09) et fins de ligne (\x0A à \x0D). */
const CARACTERES_BINAIRES = /[\x00-\x08\x0E-\x1F\x7F]/

/** Résultat du dernier import : { type: 'succes' | 'erreur', texte }, ou null. */
const messageImport = ref(null)

/**
 * Lit le fichier choisi et met son contenu dans l'éditeur.
 * Si le fichier ne convient pas, l'éditeur n'est pas modifié et un message explique pourquoi.
 */
async function importer(evenement) {
  const champ = evenement.target
  const fichier = champ.files?.[0]
  if (!fichier) return
  messageImport.value = null

  try {
    const nom = fichier.name
    const extensionValide = EXTENSIONS_ACCEPTEES.some((ext) => nom.toLowerCase().endsWith(ext))
    if (!extensionValide) {
      messageImport.value = {
        type: 'erreur',
        texte: `« ${nom} » n'est pas un programme assembleur : choisissez un fichier .asm ou .txt.`,
      }
      return
    }
    if (fichier.size > TAILLE_MAX_IMPORT) {
      messageImport.value = {
        type: 'erreur',
        texte: `« ${nom} » est trop gros (plus de 100 Ko) pour être un programme de TP.`,
      }
      return
    }

    const contenu = await fichier.text()
    if (contenu.trim() === '') {
      messageImport.value = { type: 'erreur', texte: `« ${nom} » est vide.` }
      return
    }
    // Des caractères de contrôle (hors tabulation et retours à la ligne) n'apparaissent
    // jamais dans un programme : c'est un fichier binaire renommé (image, PDF...).
    if (CARACTERES_BINAIRES.test(contenu)) {
      messageImport.value = {
        type: 'erreur',
        texte: `« ${nom} » ne contient pas du texte : impossible de le lire comme un programme.`,
      }
      return
    }

    source.value = contenu
    messageImport.value = {
      type: 'succes',
      texte: `« ${nom} » importé. Cliquez sur « Charger dans le simulateur ».`,
    }
  } catch {
    messageImport.value = {
      type: 'erreur',
      texte: `Impossible de lire « ${fichier.name} ». Vérifiez que le fichier existe toujours et réessayez.`,
    }
  } finally {
    // Sans cela, choisir de nouveau le même fichier ne déclencherait pas l'import.
    champ.value = ''
  }
}

/** Le message d'import ne sert plus une fois le programme chargé. */
function charger() {
  messageImport.value = null
  emit('charger', source.value)
}
</script>

<template>
  <div class="editeur">
    <label for="code-source" class="titre">Programme assembleur</label>

    <div class="zone-code mono">
      <!-- Colonne des numéros de ligne (décorative : le message d'erreur est aussi écrit en dessous) -->
      <div class="gouttiere" aria-hidden="true">
        <div class="decale" :style="{ transform: `translateY(${-defilement}px)` }">
          <div
            v-for="n in numeros"
            :key="n"
            class="numero"
            :class="classesLigne(n)"
            :title="messagesParLigne.get(n)"
          >
            <span class="repere">{{ n === ligneActive ? '▶' : messagesParLigne.has(n) ? '!' : '' }}</span>{{ n }}
          </div>
        </div>
      </div>

      <div class="saisie">
        <!-- Bandes de couleur derrière le texte -->
        <div class="surlignage" aria-hidden="true">
          <div class="decale" :style="{ transform: `translateY(${-defilement}px)` }">
            <div v-for="n in numeros" :key="n" class="bande" :class="classesLigne(n)"></div>
          </div>
        </div>

        <textarea
          id="code-source"
          v-model="source"
          spellcheck="false"
          wrap="off"
          rows="14"
          @scroll="suivreDefilement"
        ></textarea>
      </div>
    </div>

    <div class="actions">
      <label class="import">
        Importer un fichier .asm
        <input type="file" accept=".asm,.txt,text/plain" @change="importer" />
      </label>
      <button type="button" @click="charger">Charger dans le simulateur</button>
    </div>

    <p
      v-if="messageImport"
      class="message-import"
      :class="messageImport.type"
      :role="messageImport.type === 'erreur' ? 'alert' : 'status'"
    >
      {{ messageImport.texte }}
    </p>

    <ul v-if="erreurs.length" class="erreurs" role="alert">
      <li v-for="e in erreurs" :key="e.ligne + e.message">Ligne {{ e.ligne }} : {{ e.message }}</li>
    </ul>
  </div>
</template>

<style scoped>
.editeur {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--bordure);
  border-radius: 8px;
  padding: 16px;
  /* Hauteur d'une ligne : la même pour le texte, les numéros et les bandes. */
  --hauteur-ligne: 21px;
  --marge-haut: 8px;
  --fond-erreur: #fde8e8;
  --fond-active: #fff1c7;
}
.titre {
  font-weight: 600;
}
.zone-code {
  display: flex;
  font-size: 14px;
  line-height: var(--hauteur-ligne);
  border: 1px solid var(--bordure);
  border-radius: 6px;
  overflow: hidden;
}
.gouttiere {
  flex: 0 0 auto;
  min-width: 48px;
  padding-top: var(--marge-haut);
  overflow: hidden;
  background: var(--fond);
  border-right: 1px solid var(--bordure);
  color: var(--texte-secondaire);
  text-align: right;
  user-select: none;
}
.numero {
  height: var(--hauteur-ligne);
  padding: 0 8px 0 4px;
}
.repere {
  display: inline-block;
  width: 14px;
  text-align: center;
}
.numero.erreur {
  background: var(--fond-erreur);
  color: #9b1c1c;
  font-weight: 700;
}
.numero.active {
  background: var(--fond-active);
  color: var(--texte);
  font-weight: 700;
}
.saisie {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
}
.surlignage {
  position: absolute;
  inset: 0;
  padding-top: var(--marge-haut);
  overflow: hidden;
  pointer-events: none;
}
.bande {
  height: var(--hauteur-ligne);
}
.bande.erreur {
  background: var(--fond-erreur);
}
/* La ligne en cours passe devant l'erreur : pendant l'exécution, c'est elle qui compte. */
.bande.active {
  background: var(--fond-active);
  box-shadow: inset 3px 0 0 var(--actif);
}
textarea {
  position: relative; /* au-dessus des bandes */
  display: block;
  width: 100%;
  margin: 0;
  padding: var(--marge-haut) 8px;
  border: none;
  background: transparent;
  color: var(--texte);
  font: inherit;
  line-height: var(--hauteur-ligne);
  resize: vertical;
  white-space: pre;
  overflow: auto;
}
textarea:focus {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.import input {
  display: block;
  margin-top: 4px;
}
.message-import {
  margin: 0;
  padding: 8px;
  border-radius: 6px;
}
.message-import.erreur {
  color: #9b1c1c;
  background: #fde8e8;
}
.message-import.succes {
  color: #14532d;
  background: #dcfce7;
}
.erreurs {
  margin: 0;
  padding: 8px 8px 8px 24px;
  color: #9b1c1c;
  background: #fde8e8;
  border-radius: 6px;
}
</style>
