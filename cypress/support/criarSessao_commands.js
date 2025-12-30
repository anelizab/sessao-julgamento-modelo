// cypress/support/commands/criarSessao.js

/* global cy, Cypress, expect  */
import dayjs from 'dayjs'
import { CriarSesaoElements } from '../paginaElementos/paginaCriarSessao'
import { PautarSessaoElements } from '../paginaElementos/paginaPautarSessao'
import 'cypress-plugin-tab'
import 'cypress-real-events/support'
import { ProcessosElements } from '../paginaElementos/paginaProcessos'

const dataInicio = dayjs().format('DD/MM/YYYY')
const dataFim = dayjs().add(10, 'day').format('DD/MM/YYYY')

Cypress.Commands.add('criarSessao', () => {
  cy.fixture('sessaoJulgamento').then((dadosSessao) => {
    cy.contains('Criar sessão')
    cy.contains(dadosSessao.descricaoPagina)

    cy.get(CriarSesaoElements.btnCriarSessao).click()
    cy.get(CriarSesaoElements.modalCriarSessao).should('be.visible')
    cy.contains('Preencha os dados para criar uma nova sessão.')

    cy.get(CriarSesaoElements.nomeSessao).should('have.attr', 'placeholder', 'Insira o nome da sessão')

    cy.get(CriarSesaoElements.modalCriarSessao, { timeout: 10000 })
      .should('be.visible')

    cy.get('body').then(($body) => {
      if ($body.find('.mat-mdc-dialog-inner-container.mdc-dialog__container').length > 0) {
        // Modal existe, aguarda estar visível
        cy.get('.mat-mdc-dialog-inner-container.mdc-dialog__container')
          .should('be.visible')

        // Garante que o campo modalidade está disponível
        cy.get(CriarSesaoElements.modalidade)
          .should('be.visible')
          .click()

        // Seleciona a opção Virtual
        cy.contains('Virtual', { timeout: 10000 })
          .should('be.visible')
          .click()
      } else {
        throw new Error('Modal não foi exibida')
      }
    })
    cy.get(CriarSesaoElements.tipoSessao).click()
    cy.contains('Extraordinária').click()

    cy.get(CriarSesaoElements.dataInicio).type(dataInicio)
    cy.get(CriarSesaoElements.dataFim).type(dataFim)
    cy.get(CriarSesaoElements.horarioInicio).type(dadosSessao.horarioInicio)
    cy.get(CriarSesaoElements.horarioFim).type(dadosSessao.horarioFim)

    cy.get(CriarSesaoElements.btnCriarSessaoModal).click()
    cy.validarMensagemDeRetorno('Sessão criada com sucesso!')
    cy.contains('Em planejamento')

    cy.get(CriarSesaoElements.cabecalhoSessao)
      .invoke('text')
      .then((numeroSessao) => {
        expect(numeroSessao).to.match(/Sessão Nº \d+/)
      })
  })
})

Cypress.Commands.add('validarCamposObrigatoriosDadosSessao', () => {
  cy.get(CriarSesaoElements.btnCriarSessao).click()
  cy.get(CriarSesaoElements.nomeSessao).click().clear()
  cy.pressionarTab(CriarSesaoElements.nomeSessao, 15)

  cy.get(CriarSesaoElements.nomeSessao)
    .parents('mat-form-field')
    .find('mat-error')
    .should('contain.text', 'Campo obrigatório.')

  cy.get(CriarSesaoElements.dataInicio).should('contain.text', 'Campo obrigatório.')
  cy.get(CriarSesaoElements.dataFim).should('contain.text', 'Campo obrigatório.')
  cy.get(CriarSesaoElements.horarioInicio).should('contain.text', 'Campo obrigatório.')
  cy.get(CriarSesaoElements.horarioFim).should('contain.text', 'Campo obrigatório.')
})

Cypress.Commands.add('validarDadosInvalidosDataHora', () => {
  cy.fixture('sessaoJulgamentoInvalidos').then((dadosSessao) => {
    cy.contains(dadosSessao.descricaoPagina)
    cy.get(CriarSesaoElements.btnCriarSessao).click()
    cy.get(CriarSesaoElements.dataInicio).type(dadosSessao.dataInicioInvalida)
    cy.get(CriarSesaoElements.dataFim).type(dadosSessao.dataFimInvalida)
    cy.get(CriarSesaoElements.horarioInicio).type(dadosSessao.horarioInicioInvalida)
    cy.get(CriarSesaoElements.horarioFim).type(dadosSessao.horarioFimInvalida).click()
    cy.focused().tab().tab().tab()

    cy.get(CriarSesaoElements.dataInicio).should('contain.text', 'Data inválida')
    cy.get(CriarSesaoElements.dataFim).should('contain.text', 'Data inválida')
    cy.get(CriarSesaoElements.horarioInicio).should('contain.text', 'Hora inválida.')
    cy.get(CriarSesaoElements.horarioFim).should('contain.text', 'Hora inválida.')
  })
})

Cypress.Commands.add('adicionarProcessosNaPauta', (indices) => {
  indices.forEach(index => {
    cy.get(PautarSessaoElements.checkProcessos).eq(index).check()
  })
})

Cypress.Commands.add('encerrarSessao', (indices) => {
  cy.loginSecretarioSessao()
  cy.buscarSessao()
  cy.get(ProcessosElements.cardListagemProcessos).should('be.visible')
  cy.get(ProcessosElements.cardProcessos).eq(0).click()
  cy.contains('Encerrar sessão').click()
  cy.contains('Encerrar sessão')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Sessão encerrada com sucesso.')
  cy.contains('Encerrada')
})
