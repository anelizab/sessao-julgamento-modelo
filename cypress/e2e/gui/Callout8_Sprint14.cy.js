/* global describe, Cypress, before, context, it, cy */

import { setupTests } from '../../support/setup_commands'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../api/enviarProcessoIntegracaoApi'

setupTests()

context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 14', () => {
  describe(
    'MSDJ-51 - Visualizar subdivisão de upload e submeter sustentação oral enviada pelo representante da parte \n' +
    '(CA01_CT01, CA01_CT02, CA01_CT03, CA01_CT04, CA01_CT05, CA01_CT06, CA01_CT07) \n' +
    'MSDJ-2633 - Preparar voto para o mérito [Quebra da MSDJ-2372] \n' +
    'CA01_CT01, CA01_CT02, CA01_CT03, CA01_CT04, CA01_CT07 \n' +
    'MSDJ-2458 -  (Técnica) Disponibilizar recurso de integração com o módulo de sessão de julgamento - Recebimento dos processos pelo sistema de origem / consumir dos processos - Entrada de dados \n' +
    'CA01_CT01, CA01_CT02, CA02_CT01, CA02_CT02, CA03_CT01, CA03_CT02, CA03_CT04',
    () => {
      before(() => {
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

      it('Validar upload e submeter sustentação oral', () => {
        cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
          cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
            1,
            dadosUsuarios.magistradoUserRelator,
            dadosUsuarios.magistradoPwRelator,
            'PRIMEIRA SEÇÃO',
            false
          )
          cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
          cy.finalizarPlanejamento()
          cy.uploadSustentacao()
        })
      })
    }
  )
})
