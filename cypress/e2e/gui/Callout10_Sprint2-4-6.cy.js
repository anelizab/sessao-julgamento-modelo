/* global describe, Cypress, before, context, it, cy, after */

import { ElementoGlobais } from '../../paginaElementos/paginaElementosGlobais'
import { setupTests } from '../../support/setup_commands'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../api/enviarProcessoIntegracaoApi'

setupTests()

context('Testes e2e do módulo de Sessão de Julgamento - Callout 10 - Sprint 2,4 e 6 \n' +
  'Callout 11 Sprint 6', () => {
  describe('MSDJ-1935 Encerramento de processos para proclamações de resultado \n' +
        '(CA01_CT01, CA02_CT01, CA02_CT02, CA03_CT01, CA04_CT01) \n' +
        'MSDJ-48 Apresentar subdivisão de Proclamação de Resultado \n' +
        '(CA01_CT01, CA02_CT01, CA04_CT01, CA05_CT01, CA06_CT01, CA08_CT01) \n' +
        'MSDJ-2375 SECRETÁRIO - Editar o acórdão \n' +
        'CA01_CT01, CA04_CT01 \n' +
        'MSDJ-3071 Iniciar sessão manualmente(modal de aviso) \n' +
        'CA01_CT01, CA01_CT02, CA01_CT04, CA01_CT05, CA01_CT06 \n' +
        'MSDJ-3092 -Restringir seleção de órgãos julgadores na composição da sessão a órgãos ativos e pertencentes a ao menos um colegiado ativo \n' +
        'CA01_CT01, CA03_CT01, CA04_CT01 \n' +
        'MSDJ-2380 Apresentar subdivisão de Proclamação de Resultado - Fechamento do Processo (Produção de documentos - Vogal vencedor) \n' +
        'CA02_CT01, CA03_CT01, CA04_CT01, CA04_CT02 \n' +
        'MSDJ-2379 Apresentar subdivisão de Proclamação de Resultado - Fechamento do Processo (Produção de documentos - Vogal vencedor) \n' +
        'CA01_CT01, CA02_CT01, CA03_CT01, CA05_CT01 \n' +
        'MSDJ-2378 SECRETÁRIO - NA CRIAÇÃO DA PAUTA incluir nos metadados do processo as prioridades processuais (Integração) \n' +
        'CA01_CT01, CA02_CT01, CA03_CT01 \n' +
        'MSDJ-2685 Configuração de movimentações com complementos dinâmicos - nome da parte \n' +
        'CA01_CT01, CA01_CT03 \n' +
        'MSDJ-2373 Listagem dos processos com os filtros \n' +
        'CA0T01, CA02_CT01, CA03_CT01 \n' +
        'MSDJ-2376 Sessão dados do processo \n' +
        'CA01_CT01, CA01_CT02 \n' +
        'MSDJ-2458 - (Técnica) Disponibilizar recurso de integração com o módulo de sessão de julgamento - Recebimento dos processos pelo sistema de origem / consumir dos processos - Entrada de dados \n' +
        'CA01_CT01, CA01_CT02, CA02_CT01, CA02_CT02, CA03_CT01, CA03_CT02, CA03_CT04 \n' +
        'MSDJ-2940 - Apresentar os movimentos processuais na proclamação de resultado \n' +
        'CA01_CT01 \n' +
        'MSDJ-3340 Publicação da pauta no DJEN \n' +
        'CA01_CT01, CA01_CT02 \n' +
        'MSDJ-3072 - Encerrar sessão manualmente \n' +
        'CA01_CT01 \n' +
        'MSDJ-2384 - Secretário da sessão gerar e editar ATA - sessão inteira \n' +
        'CA01_CT01, CA05_CT01 \n ' +
        'MSDJ-3816 - Refatorar a produção do inteiro teor do acórdão atual (utilizar modelo de documento) \n' +
        'CA01_CT01, CA02_CT01'

  , () => {
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Magistrado relator prepara o voto no gabinete, inclui preliminar e mérito e libera para pauta e votação', () => {
      cy.fluxoGabineteSessaoCompleto(1)
      cy.clicarBotaoPorTexto('Finalizar planejamento')
    })
    after(() => {
      Cypress.env('skipLogin', false)
    })
    it('Secretário publica sessão Djen', () => {
      cy.publicarSessaoDjen()
      
      cy.get(ElementoGlobais.btnIniciarSessao, { timeout: 20000 })
        .first()
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      cy.clicarBotaoPorTexto('Iniciar')
    })
    after(() => {
      Cypress.env('skipLogin', false)
    })

    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Primeiro magistrado vogal prepara o voto, preliminar e mérito', () => {
      cy.fixture('dadosUsuarios').then((dados) => {
        cy.prepararVotoVogalPreliminarMerito(dados.magistradoUserVogal1, dados.magistradoPwVogal1, { incluirPreliminar: true, votoMerito: 'divergente' })
      })
    })
    after(() => {
      Cypress.env('skipLogin', false)
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Segundo magistrado vogal prepara o voto, preliminar e mérito', () => {
      cy.fixture('dadosUsuarios').then((dados) => {
        cy.prepararVotoVogalPreliminarMerito(dados.magistradoUserVogal2, dados.magistradoPwVogal2, { incluirPreliminar: true, votoMerito: 'divergente' })
      })
    })
    after(() => {
      Cypress.env('skipLogin', false)
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Secretário de sessão proclama resultado e edita certidão de julgamento', () => {
      cy.postMovimentos()
      cy.proclamarResultado()
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Magistrado vencedor preenche dados do Inteiro teor do acórdão, valida apresentação prioridades precessuais', () => {
      cy.inteiroTeorAcordao()
      cy.prioridadeProcessuais()
      cy.logout()
    })
    it('Secretário de sessão encerra sessão manualmente', () => {
      cy.encerrarSessao()
    })
    it('Secretário de sessão cria Ata', () => {
      cy.criarAta()
    })
  })

  describe('MSDJ-2372 Solicitar inclusão em pauta - Indicar que o processo está CONCLUSO NO GABINETE \n' +
        '(CA01_CT01, CA01_CT02, CA01_CT03, CA01_CT04)'
  , () => {
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
    it('Assesor do relator faz a minuta no gabinete', () => {
      cy.minutarProcessosAssessor()
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Magistrado relator libera processos minutados pelo assessor no gabinete', () => {
      cy.magistradoRelatorLiberaProcessoMinutados()
    })
    it('Assessor do vogal faz a minuta na tela de gabinete', () => {
      cy.minutarProcessosAssessorVogal()
    })
    after(() => {
      Cypress.env('skipLogin', false)
    })
  })
})
