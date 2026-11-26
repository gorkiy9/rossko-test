import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const page = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  // Относительные пути — сборка открывается с любого подкаталога (GitHub Pages и т.п.)
  base: './',
  plugins: [react(), tailwindcss()],
  // @/ — как в компонентах BoardUI
  resolve: { alias: { '@': page('./src') } },
  // Две страницы: презентация тестового (index) и сам прототип (prototype), который она встраивает
  build: {
    rollupOptions: {
      input: { index: page('./index.html'), prototype: page('./prototype.html') },
    },
  },
})
