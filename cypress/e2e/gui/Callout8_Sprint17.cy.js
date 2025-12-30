/* global describe, Cypress, before, context, it, cy */

import { setupTests } from '../../support/setup_commands'

setupTests()

context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 17', () => {
  describe('MSDJ-72 Estruturar componente de entrada de dados para a sessão de julgamento \n' +
        '(CA01_CT01, CA02_CT01, CA03_CT01, CA03_CT02, CA03_CT03, CA03_CT04) \n' +
        'MSDJ-3075 - Incluir usuários do perfil administrador \n' +
        'CA01_CT01, CA01_CT02', () => {
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Validar a estrutura de hierarquia de órgãos', () => {
      cy.hierarquiaOrgaos()
    })
  })
})
