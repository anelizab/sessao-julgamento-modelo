module.exports = {
  ignorePatterns: [
    '**/cypress/reports/assets/**'
  ],
  env: {
    browser: true,
    es2021: true,
    // Adicione 'cypress' ao ambiente
    'cypress/globals': true
  },
  extends: [
    // outras extensões, se houver
    'standard',
    'plugin:cypress/recommended'
  ],
  plugins: [
    'cypress' // Adicione o plugin do Cypress
  ],
  rules: {
    // suas regras personalizadas, se houver
  }
}
