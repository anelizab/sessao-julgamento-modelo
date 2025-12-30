/* global describe, context, it, cy, before, Cypress, after */

import { setupTests } from '../../support/setup_commands'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../api/enviarProcessoIntegracaoApi'

setupTests()
context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 7', () => {
  describe(
    'MSDJ-37 - Executar aplicação dos filtros de processos da pauta de criação da sessão de julgamento [SP6] \n' +
    '(CA01_CT01, CA02_CT01, CA02_CT02, CA02_CT03, CA02_CT04, CA02_CT05, CA02_CT06, CA03_CT01, CA03_CT02, CA03_CT03, CA03_CT04, CA03_CT05, CA03_CT07, CA03_CT08)',
    () => {
      before(() => {
        Cypress.env('skipLogin', true)
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

      it('Executar filtros de processos a pautar', () => {
        cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
          cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
            1,
            dadosUsuarios.magistradoUserRelator,
            dadosUsuarios.magistradoPwRelator,
            'PRIMEIRA SEÇÃO',
            false
          )
        })

        it('Executar filtros de processos a pautar', () => {
          cy.loginSecretarioSessao()
          cy.executarFiltrosProcessosPautar()
          cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
        })
      })
      after(() => {
        Cypress.env('skipLogin', false)
      })
      before(() => {
        Cypress.env('skipLogin', true)
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
      it('Executar filtros de processos pautados', () => {
        cy.fluxoGabineteSessaoCompleto(1)
        cy.executarFiltrosProcessosPautados()
      })
    }
  )
})
