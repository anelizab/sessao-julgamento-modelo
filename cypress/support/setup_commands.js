/* global Cypress, cy, beforeEach */
export const setupTests = () => {
  beforeEach(() => {
    if (!Cypress.env('skipLogin')) {
      cy.session('secretarioSessao', () => {
        cy.loginSecretarioSessao()
      })
      cy.visit('/sessao-julgamento')
      cy.url().should('include', '/sessao-julgamento')
    }
  })
}
