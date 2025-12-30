/* global describe, Cypress, after, before, context, it, cy */

import { setupTests } from '../../support/setup_commands'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../api/enviarProcessoIntegracaoApi'

setupTests()
context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 9', () => {
  describe('MSDJ-58 - Retirar processo de julgamento [SP8](CA01_CT01)', () => {
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Deve enviar processos via api primeira seção', () => {
      cy.wrap(null).then(() =>
        EnviarProcessoIntegracaoApi.enviarMultiplosProcessos(
          1,
          false,
          ORGAOS_JULGADORES.primeiraSecao,
          TRIBUNAIS.trf5,
          COLEGIADOS.divisao5Turma
        )
      )
    })

    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Validar a retirada de um processo de julgamento por um secretário de sessão', () => {
      cy.fluxoGabineteSessaoCompleto(1)
      cy.iniciarSessao()
      cy.logout()
      cy.retirarProcessoDeJulgamentoSecretarioSessao()
    })
    after(() => {
      Cypress.env('skipLogin', false)
    })

    it('Deve enviar processos via api primeira seção', () => {
      cy.wrap(null).then(() =>
        EnviarProcessoIntegracaoApi.enviarMultiplosProcessos(
          1,
          false,
          ORGAOS_JULGADORES.primeiraSecao,
          TRIBUNAIS.trf5,
          COLEGIADOS.divisao5Turma
        )
      )
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Validar a retirada de um processo de julgamento por um magistrado relator', () => {
      cy.fluxoGabineteSessaoCompleto(1)
      cy.iniciarSessao()
      cy.logout()
      cy.retirarProcessoDeJulgamentoMagistradoRelator()
    })
  })

  describe('MSDJ-584 - Alterar composição inicial da sessão de julgamento [Inclusão]  \n' +
        '(CA01_CT01, CA02_CT01, CA03_CT01, CA03_CT02, CA03_CT02, CA03_CT04)', () => {
    it('Validar o adicionar um orgão julgador', () => {
      cy.criarSessao()
      cy.adicionarOrgaoJulgadorComposicao()
    })
  })

  describe('MSDJ-585 - Alterar composição inicial da sessão de julgamento [Exclusão]  \n' +
        '(CA01_CT01, CA02_CT01, CA03_CT01, CA03_CT02, CA03_CT03, CA03_CT02)', () => {
    it('Validar a exclusão de um orgão julgador', () => {
      cy.criarSessao()
      cy.excluirOrgaoJulgadorComposicao()
    })
  })
  describe('MSDJ-1074 | MSDJ-1283 - [MELHORIA] Restringir duplicidade de representante na composição da sessão (MSDJ-34)  \n' +
        '(CA01_CT01, CA02_CT01, CA03_CT01)', () => {
    it('Não deve permitir duplicidade de representante na composição da sessão', () => {
      cy.criarSessao()
      cy.validarAlteracaoRepresentanteDuplicidade()
    })
  })
})
