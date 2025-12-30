/* global describe, Cypress, after, before, context, it, cy */

import { setupTests } from '../../support/setup_commands'
setupTests()
context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 8', () => {
  describe('MSDJ-11 - Visualizar cabeçalho da sessão de julgamento [SP7](CA02_CT01, CA03_CT01 )', () => {
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Validar apresentação cabeçalho da Sessão de julgamento', () => {
      cy.visualizarCabecalhoSessaoJulgamento()
    })
  })
  after(() => {
    Cypress.env('skipLogin', false)
  })

  describe('MSDJ-21 - Inicializar toolbar e menu [SP7]  \n' +
        '(CA01_CT01, CA02_CT01, CA02_CT03, CA02_CT04, CA02_CT06, CA03_CT02, CA03_CT02, CA05_CT01,  CA06_CT01)', () => {
    it('Validar alteração de foto do perfil', () => {
      cy.alterarFotoPerfil()
    })
  })

  describe('MSDJ-22 - Seleção do colegiado de atuação do secretário de sessão [SP7]  \n' +
        '(CA01_CT01, CA01_CT_02, CA02_CT01, CA02_CT03,  )', () => {
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Validar seleção colegiado com acesso público)', () => {
      cy.selecionarColegiadoPerfilPublico()
    })
    after(() => {
      Cypress.env('skipLogin', false)
    })
    it('Validar alteração de colegiado com usuário secretário de sessão', () => {
      cy.selecionarColegiadoPerfilSecretarioSessao()
    })
  })
})
