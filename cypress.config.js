const { defineConfig } = require('cypress')
const allureWriter = require('@shelex/cypress-allure-plugin/writer')

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  projectId: '9kqby9',
  viewportWidth: 1366,
  viewportHeight: 768,
  video: false,
  videoCompression: 32,
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',

  env: {
    allure: true
  },

  e2e: {
    baseUrl: 'https://sessao-julgamento-qa.stg.pdpj.jus.br',

    // ⚡️ Ajustes para reduzir consumo de memória
    numTestsKeptInMemory: 0,
    experimentalMemoryManagement: true,

    setupNodeEvents (on, config) {
      // ✅ Writer do Allure
      allureWriter(on, config)

      // ✅ Task para imprimir payloads no terminal
      on('task', {
        logToTerminal ({ title, data }) {
          console.log(`\n${title}:\n`, JSON.stringify(data, null, 2))
          return null
        }
      })

      // ✅ Animação de carregamento
      let loadingInterval
      on('before:run', () => {
        const frames = ['|', '/', '-', '\\']
        let i = 0
        loadingInterval = setInterval(() => {
          process.stdout.write(`\rExecutando testes e2e... ${frames[i]}`)
          i = (i + 1) % frames.length
        }, 250)
      })

      // ✅ Mensagem final
      on('after:run', () => {
        clearInterval(loadingInterval)
        console.log(`\n
           ___________    .-''''''-.
          |  _______  |  /          \\
          | |       | | |   O    O   |
          | |       | | |     __     |
          | |_______| |  \\  '----'  /
           \\_________/    '-......-'
            |   |   |      |      |
            |___|___|      |______|

         Automação e2e da Sessão de Julgamento finalizada!
         QAS: Aneliza Ferrer | André Scheffer
        `)
      })

      return config
    }
  }
})
