/* global describe, Cypress, before, context, it, cy, after */

import { setupTests } from '../../support/setup_commands'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../api/enviarProcessoIntegracaoApi'

setupTests()

context('Testes e2e do módulo de Sessão de Julgamento - Callout 13 -Sprints 1,2,3 e 4 \n', () => {
  before(() => {
    Cypress.env('skipLogin', true)
  })
  describe('MSDJ-2996 Adotar modelo nativo para inteiro teor do acordão \n' +
        '(CA01_CT01, CA02_CT01)'
  , () => {
    it('Criar, editar e excluir modelo', () => {
      cy.criarModelo(5)
    })
  })
  after(() => {
    Cypress.env('skipLogin', false)
  })
  before(() => {
    Cypress.env('skipLogin', true)
  })
  describe('MSDJ-3265 Adotar modelo nativo para Relatório do mérito \n' +
        '(CA02_CT01, CA04_CT01)'
  , () => {
    it('Criar, editar e excluir modelo', () => {
      cy.criarModelo(6)
    })
  })
  after(() => {
    Cypress.env('skipLogin', false)
  })
  before(() => {
    Cypress.env('skipLogin', true)
  })
  describe('MSDJ-3266 Adotar modelo nativo para Ementa \n' +
        '(CA02_CT01, CA04_CT01)'
  , () => {
    it('Criar, editar e excluir modelo \n' +
      '(CA03_CT01,CA05_CT01)', () => {
      cy.criarModelo(4)
    })
  })

  before(() => {
    Cypress.env('skipLogin', true)
  })
  describe('MSDJ-3770 Realizar movimentação de retirada em lote na tela de sessão de julgamento pelo magistrado relator \n' +
        '(CA02_CT01, CA04_CT01) \n' +
        'MSDJ-3903 Reverter pedido de retirada em lote \n' +
        '(CA01_CT01)'

  , () => {
    it('Enviar processo e criar sessão', () => {
      cy.fluxoGabineteSessaoCompleto(1)
      cy.iniciarSessao()
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Retirar processo de julgamento e reverter retirada em lote', () => {
      cy.retirarReverterJulgamentoEmLote()
    })
  })
  describe('MSDJ-3077 Realizar movimentação destaque em lote na tela de sessão de julgamento pelo magistrado vogal\n' +
        '(CA02_CT01, CA04_CT01)'

  , () => {
    it('Enviar processo e criar sessão', () => {
      cy.fluxoGabineteSessaoCompleto(1)
      cy.iniciarSessao()
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Destacar processo e reverter retirada em lote', () => {
      cy.destacarProcessoEmLote()
    })
  })
  describe('MSDJ-3002 Ações em lote na tela de gabinete para o relator - Liberar para pauta\n' +
        '(CA02_CT01, CA04_CT01)'

  , () => {
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
    it('Liberar processo no gabinete', () => {
      cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
        cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
          1,
          dadosUsuarios.magistradoUserRelator,
          dadosUsuarios.magistradoPwRelator,
          'PRIMEIRA SEÇÃO',
          'votação antecipada'
        )
      })
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Liberar processo para pauta em lote', () => {
      cy.liberarPautaEmLoteGabinete()
    })
  })

  describe('MSDJ-3170 Votação em lote no gabinete disponível para o magistrado relator para processos semelhantes - minuta de voto em lote - Relatório\n' +
        '(CA01_CT01)\n' +
        'MSDJ-3874 Aplicação modelo nativo em relatório \n' +
        'CA01_CT01 \n' +
        'MSDJ-3078  Votação em lote no gabinete disponível para o magistrado relator para processos semelhantes - minuta de voto em lote - Ementa \n' +
        'CA01_CT02 \n' +
        'MSDJ-3042  Aplicação modelo nativo em ementa \n' +
        'CA01_CT01'

  , () => {
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
    it('Preparar voto do mérito (como relator)  em lote e aplicar modelo relatório e ementa ', () => {
      cy.prepararVotoMeritoEmLote()
    })
  })

  describe('MSDJ-3003 Ações em lote na tela de gabinete para o relator - Liberar para votação \n' +
        '(CA01_CT01, CA02_CT01)'

  , () => {
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
    it('Liberar processo no gabinete', () => {
      cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
        cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
          1,
          dadosUsuarios.magistradoUserRelator,
          dadosUsuarios.magistradoPwRelator,
          'PRIMEIRA SEÇÃO',
          'pauta'
        )
      })
    })

    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Liberar para votação antecipada em lote', () => {
      cy.liberarVotacaoAntecipada()
    })
  })

  describe('MSDJ-2944 Realizar movimentação de adiamento em lote na tela de sessão de julgamento pelo magistrado relator \n' +
        '(CA01_CT01, CA02_CT01)'

  , () => {
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Liberar processo no gabinete', () => {
      cy.fluxoGabineteSessaoCompleto(1)
      cy.iniciarSessao()
    })

    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Adiar processo em lote na sessão', () => {
      cy.adiarEmLote()
    })
  })

  describe('MSDJ-3924 Realizar movimentação de pedido de vistas em lote na tela de sessão de julgamento pelo magistrado vogal \n' +
        '(CA02_CT01, CA04_CT01)'

  , () => {
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
    it('Liberar processo no gabinete', () => {
      cy.fluxoGabineteSessaoCompleto(1)
      cy.iniciarSessao()
    })
    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Pedir vistas em lote na sessão', () => {
      cy.pedirVistasEmLote()
    })
  })

  describe('MSDJ-3025  Ações em lote na tela de gabinete para o relator - Liberar para a votação e pauta \n' +
        '(CA01_CT01, CA02_CT01)'

  , () => {
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
    it('Liberar processo no gabinete', () => {
      cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
        cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
          1,
          dadosUsuarios.magistradoUserRelator,
          dadosUsuarios.magistradoPwRelator,
          'PRIMEIRA SEÇÃO',
          'pauta'
        )
      })
    })

    before(() => {
      Cypress.env('skipLogin', true)
    })
    it('Liberar para pauta e votação antecipada em lote', () => {
      cy.liberarPautaVotacaoAntecipada()
    })
  })
})
