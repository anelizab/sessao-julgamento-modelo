/* global describe, Cypress, after, before, context, it, cy */

import { setupTests } from '../../support/setup_commands'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../api/enviarProcessoIntegracaoApi'

setupTests()

context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 13', () => {
  describe(
    'MSDJ-10 - Executar aplicação dos filtros de processos [SP9] \n' +
        '(CA01_CT01, CA06_CT01, CA07_CT01, CA08_CT01, CA09_CT01, CA10_CT01, CA11_CT01, CA13_CT01, CA15_CT01)',
    () => {
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
      it('Validar filtros de processos com usuário público', () => {
        cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
          cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
            1,
            dadosUsuarios.magistradoUserRelator,
            dadosUsuarios.magistradoPwRelator,
            'PRIMEIRA SEÇÃO', false
          )
        })
        cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
        cy.iniciarSessao()
        cy.executarFiltrosProcessosPublico()
      })

      after(() => {
        Cypress.env('skipLogin', false)
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
      it('Validar filtros de processos com usuário logado', () => {
        cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
          cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
            1,
            dadosUsuarios.magistradoUserRelator,
            dadosUsuarios.magistradoPwRelator,
            'PRIMEIRA SEÇÃO', false
          )
        })
        cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
        cy.iniciarSessao()
        cy.executarFiltrosProcessosLogado()
      })
    }
  )

  describe(
    'MSDJ-68 - Gerar e apresentar alertas para cenários conhecidos \n' +
        '(CA01_CT01, CA01_CT02, CA01_CT03, CA01_CT05, CA01_CT06, CA05_CT01)',
    () => {
      after(() => {
        Cypress.env('skipLogin', true)
      })
      it('Limpar notificações do magistrado', () => {
        cy.limparNotificaçaoMagistrado()
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
      before(() => {
        Cypress.env('skipLogin', true)
      })
      it('Realizar pedido de adiamento de um processo pelo secretário de sessão', () => {
        cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
          cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
            1,
            dadosUsuarios.magistradoUserRelator,
            dadosUsuarios.magistradoPwRelator,
            'PRIMEIRA SEÇÃO', false
          )
        })
        cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
        cy.finalizarPlanejamento()
        cy.pedirAdiamentoSecretarioSessaoSemReversao()
      })
      after(() => {
        Cypress.env('skipLogin', true)
      })

      before(() => {
        Cypress.env('skipLogin', true)
      })
      it('Validar notificação do Magistrado', () => {
        cy.validarNotificaçaoMagistrado()
      })
      after(() => {
        Cypress.env('skipLogin', false)
      })
      it('Visualizar histórico de notificações do magistrado', () => {
        cy.visualizarHistoricoNotificaçaoMagistrado()
      })
      it('Reverter adiamento de um processo pelo secretário de sessão', () => {
        cy.reversaoPedidoadiamentoSecretarioSessao()
      })
      it('Marcar todas notificações como lidas', () => {
        cy.marcarNotificacaoComoLida()
      })
    }
  )
})
