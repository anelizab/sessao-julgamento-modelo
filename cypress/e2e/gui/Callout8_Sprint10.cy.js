/* global describe, Cypress, after, before, context, it, cy */

import { setupTests } from '../../support/setup_commands'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../api/enviarProcessoIntegracaoApi'

setupTests()

context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 10', () => {
  describe('MSDJ-42 - Alterar composição da sessão de julgamento em um processo individual  \n' +
        '(CA01_CT01, CA02_CT01, CA03_CT01, CA04_CT01, CA05_CT01)', () => {
    it('Deve enviar processos via api', () => {
      cy.wrap(null).then(() =>
        EnviarProcessoIntegracaoApi.enviarMultiplosProcessos(
          2,
          false,
          ORGAOS_JULGADORES.primeiraSecao,
          TRIBUNAIS.trf5,
          COLEGIADOS.divisao5Turma
        )
      )
    })

    it('Validar a alteração da composição de um processo pelo secretário de sessão', () => {
      cy.alterarComposicaoProcessoSecretarioSessao()
    })
    it('Deve enviar processos via api', () => {
      cy.wrap(null).then(() =>
        EnviarProcessoIntegracaoApi.enviarMultiplosProcessos(
          2,
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
    it('Validar a alteração da composição de um processo pelo magistrado', () => {
      cy.alterarComposicaoProcessoMagistrado()
    })
  })

  describe('MSDJ-59 - Solicitar destaque do processo [SP8]  \n' +
        '(CA01_CT01, CA01_CT02, CA01_CT03, CA01_CT04, CA01_CT05, CA01_CT06, CA02_CT01, CA03_CT01)', () => {
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
    it('Validar destacar processo pelo secretário de sessão', () => {
      cy.solicitarDestaqueSecretarioSessao()
      cy.logout()
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
    it('Validar destacar processo pelo Magistrado', () => {
      cy.solicitarDestaqueMagistrado()
    })
    after(() => {
      Cypress.env('skipLogin', false)
    })
  })
})
