import { defineConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite'

import { globSync } from 'node:fs'

import { resolve, basename } from 'node:path'

import { fileURLToPath } from 'node:url'



const rootDir = fileURLToPath(new URL('.', import.meta.url))



const pages = Object.fromEntries(

  globSync('*.html', { cwd: rootDir }).map(file => [

    basename(file, '.html'),

    resolve(rootDir, file)

  ])

)



export default defineConfig({

  plugins: [tailwindcss()],



  build: {

    rollupOptions: {

      input: pages

    }

  },



  server: {

    proxy: {

      '/api': 'http://localhost:3001'

    }

  }

})

