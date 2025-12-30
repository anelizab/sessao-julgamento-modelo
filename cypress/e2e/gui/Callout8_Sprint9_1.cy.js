/* global describe, context, before, Cypress, it, cy */

import { setupTests } from '../../support/setup_commands'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../api/enviarProcessoIntegracaoApi'

setupTests()
context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 9', () => {
  describe('MSDJ-26 - Apresentar ações em lote [SP7]  \n' +
  '(CA01_CT01, CA01_CT03, CA02_CT01, CA02_CT03, CA02_CT04, CA03_CT02, CA04_CT01 ))', () => {
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Validar ações em lote usuário Secretário de sessão sessão não finalizada, não deve permitir ações em lote', () => {
      cy.validarApresentacaoLoteUserSecretario()
    })
  })

  describe('MSDJ-34 - Alterar composição inicial da sessão de julgamento [Alteração] \n' +
        '(CA01_CT01, CA02_CT01, CA03_CT01, CA03_CT02, CA03_CT03, CA03_CT04, CA03_CT06, CA04_CT01 )', () => {
    it('Validar a alteração de um representante na composição da sessão', () => {
      cy.loginSecretarioSessao()
      cy.criarSessao()
      cy.alterarRepresentanteOrgaoJulgadorComposicao()
    })
  })
  describe('MSDJ-41 - Ordenar pauta da sessão de julgamento (CA01_CT01, CA02_CT01, CA03_CT01, CA04_CT01, CA05_CT01)', () => {
    it('Deve enviar processos via api primeira seção', () => {
      cy.wrap(null).then(() =>
        EnviarProcessoIntegracaoApi.enviarMultiplosProcessos(
          4,
          true,
          ORGAOS_JULGADORES.primeiraSecao,
          TRIBUNAIS.trf5,
          COLEGIADOS.divisao5Turma
        )
      )
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Validar a ordenação de processos na pauta', () => {
      cy.fluxoGabineteSessaoCompleto(3)
      cy.logout()
      cy.ordenarProcessosPauta()
    })
  })
})
