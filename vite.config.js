import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Chemins relatifs : le dossier dist/ fonctionne dans n'importe quel sous-dossier d'un serveur
  base: './',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
