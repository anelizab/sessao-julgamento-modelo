/* global describe, Cypress, before, context, it, cy */

import { setupTests } from '../../support/setup_commands'

setupTests()

context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 16', () => {
  describe('MSDJ-1704 Configurar parâmetros do sistema (incremental) - Modelos de documentos \n' +
        '(CA01_CT01, CA01_CT02, CA01_CT04, CA01_CT05, CA02_CT03, CA02_CT04, CA02_CT05, CA02_CT07, CA02_CT10) \n' +
        'MSDJ-3029 Adotar modelo nativo para Ata da sessão de julgamento \n' +
        '(CA01_CT01, CA02_CT01)'
  , () => {
    it('Validar configuração de modelos de documentos', () => {
      cy.configuracoesModelos()
    })
  })

  describe(
    'MSDJ-52 Realizar download da sustentação oral \n' +
    '(CA01_CT01, CA01_CT05, CA02_CT01)',
    () => {
      before(() => {
        Cypress.env('skipLogin', true)
      })
      it('Validar upload e submeter sustentação oral', () => {
        cy.fluxoGabineteSessaoCompleto(1)
        cy.finalizarPlanejamento()
        cy.downloadSustentacaoOral()
      })
    }
  )

  describe('MSDJ-39 Criar / desvincular etiquetas \n' +
        '(CA01_CT02, CA02_CT06, CA02_CT09, CA03_CT07, CA04_CT04,CA05_CT02) \n' +
        'MSDJ-840 Segmentação por local na atuação com etiquetas \n' +
        'CA02_CT01, CA02_CT02, CA02_CT03, CA03_CT01, CA03_CT02, CA05_CT01'
  , () => {
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Validar cadastro de etiquetas', () => {
      cy.fluxoGabineteSessaoCompleto(1)
      cy.finalizarPlanejamento()
      cy.criarEtiquetas()
    })
  })

  describe(
    'MSDJ-60 Editar voto do relator \n' +
    '(CA01_CT01, CA01_CT02, CA01_CT03, CA01_CT04, CA02_CT01, CA03_CT01, CA03_CT02) \n' +
    'MSDJ-1191 Editar voto do vogal \n' +
    '(CA01_CT01, CA02_CT01, CA03_CT02, CA03_CT03, CA03_CT04, CA03_CT06) \n' +
    'MSDJ-8 Apresentar situação da votação para o magistrado \n' +
    '(CA01_CT01, CA02_CT01, MSDJ-2_CA04_CT01, CA03_CT02, CA03_CT04, CA03_CT05, CA03_CT06, CA04_CT01) \n' +
    'MSDJ-66 Invalidar voto do vogal \n' +
    '(CA01_CT01, CA02_CT01)',
    () => {
      it('Criar sessão e incluir processos para iniciar votação', () => {
        cy.fluxoGabineteSessaoCompleto(1)
        cy.finalizarPlanejamento()
      })
      before(() => {
        Cypress.env('skipLogin', true)
      })
      it('Editar voto do relator', () => {
        cy.editarVotoRelator()
      })

      it('Validar apresentação da situação da votação', () => {
        cy.apresentarSituacaoVotacaoMgistrado()
      })

      it('Incluir voto para o colegiado (vogais)', () => {
        cy.prepararVotoMagistradoVogal()
      })

      it('Editar voto do vogal', () => {
        cy.editarVotoVogal()
      })

      it('Invalidar voto do vogal', () => {
        cy.invalidarVotoVogal()
      })
    }
  )
})
