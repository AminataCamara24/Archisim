/**
 * Pilote de la simulation côté interface : Pas à pas, Exécuter, Pause, Réinitialiser.
 * Responsable : Mariem (US-08 mode Exécuter, US-09 bus animés)
 *
 * Il ne calcule rien lui-même : il demande les étapes au moteur (src/core/simulateur.js)
 * et les applique une par une.
 */

import { ref, shallowRef, computed, watch } from 'vue'
import { preparer, etapesSuivantes, appliquerEtape } from '../core/simulateur.js'

export function useSimulation() {
  const erreurs = ref([])
  const etatInitial = shallowRef(null)
  const etat = shallowRef(null)
  const etapeCourante = shallowRef(null)
  const fileEtapes = shallowRef([])
  const enCours = ref(false)
  /** Délai entre deux étapes en mode Exécuter, en millisecondes. */
  const vitesse = ref(800)

  const pret = computed(() => etat.value !== null)
  const termine = computed(() => etat.value?.termine === true)

  /** Identifiant du minuteur du mode Exécuter (setTimeout), ou null s'il n'y en a pas. */
  let minuteur = null

  /** Assemble et charge le programme. */
  function charger(source) {
    pause()
    const resultat = preparer(source)
    erreurs.value = resultat.erreurs
    etatInitial.value = resultat.etat
    etat.value = resultat.etat
    etapeCourante.value = null
    fileEtapes.value = []
  }

  /** Joue UNE étape (bouton Suivant). */
  function suivant() {
    if (!etat.value || etat.value.termine) return
    if (fileEtapes.value.length === 0) {
      fileEtapes.value = etapesSuivantes(etat.value)
    }
    const [etape, ...reste] = fileEtapes.value
    fileEtapes.value = reste
    etapeCourante.value = etape
    const nouvelEtat = appliquerEtape(etat.value, etape)
    etat.value = etape.phase === 'fin' ? { ...nouvelEtat, termine: true } : nouvelEtat
    if (etat.value.termine) pause()
  }

  /** Lance l'exécution continue (bouton Exécuter). */
  function executer() {
    if (enCours.value || termine.value) return
    enCours.value = true
    const prochaineEtape = () => {
      suivant()
      // suivant() appelle déjà pause() quand le programme se termine.
      if (enCours.value) {
        minuteur = setTimeout(prochaineEtape, vitesse.value)
      }
    }
    minuteur = setTimeout(prochaineEtape, vitesse.value)
  }

  /** Met en pause l'exécution continue. */
  function pause() {
    if (minuteur !== null) {
      clearTimeout(minuteur)
      minuteur = null
    }
    enCours.value = false
  }

  // Si la vitesse change pendant l'exécution, on redémarre l'attente en cours
  // avec le nouveau délai au lieu d'attendre la fin de l'ancien.
  watch(vitesse, () => {
    if (enCours.value) {
      pause()
      executer()
    }
  })

  /** Revient à l'état juste après le chargement. */
  function reinitialiser() {
    pause()
    etat.value = etatInitial.value
    etapeCourante.value = null
    fileEtapes.value = []
  }

  return {
    erreurs, etat, etapeCourante, enCours, vitesse, pret, termine,
    charger, suivant, executer, pause, reinitialiser,
  }
}
