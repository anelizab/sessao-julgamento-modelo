/* global describe, Cypress, after, before, context, it, cy */

import { setupTests } from '../../support/setup_commands'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../api/enviarProcessoIntegracaoApi'

setupTests()

context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 11', () => {
  describe('MSDJ-57 - Pedir vistas / pedir adiamento do processo  \n' +
        '(CA01_CT01, CA01_CT02, CA01_CT03, CA02_CT01, CA03_CT01, CA03_CT02, CA03_CT03)', () => {
    it('Deve enviar processos via api', () => {
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
    it('Validar pedir vistas de um processo pelo secretário de sessão', () => {
      cy.pedirVistasSecretarioSessao()
    })
    it('Deve enviar processos via api', () => {
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
    it('Validar pedido de adiamento de um processo pelo secretário de sessão', () => {
      cy.pedirAdiamentoSecretarioSessao(true)
    })
    it('Deve enviar processos via api', () => {
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
    it('Validar pedir vistas de um processo pelo Magistrado', () => {
      cy.pedirVistasMagistrado()
    })

    it('Deve enviar processos via api', () => {
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
    it('Validar pedido de adiamento de um processo pelo Magistrado', () => {
      cy.pedirAdiamentoMagistrado()
    })
    after(() => {
      Cypress.env('skipLogin', false)
    })
  })
})
