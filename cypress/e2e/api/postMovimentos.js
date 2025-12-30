/* global cy, Cypress, expect  */

Cypress.Commands.add('postMovimentos', () => {
  cy.api({
    method: 'POST',
    url: 'https://sessao-julgamento-qa.stg.pdpj.jus.br/sjapp/sincronizacao/movimentos',
    headers: {
      'Content-Type': 'application/json',
      secretKey: '01987a9a-ff5d-7b4b-8cf6-df0be3a9483a'
    }
  }).then((response) => {
    expect(response.status).to.eq(204)
  })
})
