/* global cy, Cypress */

import { CriarSesaoElements } from '../paginaElementos/paginaCriarSessao'
import { ComposicaoElements } from '../paginaElementos/paginaComposicao'
import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais'
import 'cypress-plugin-tab'
import 'cypress-real-events/support'

Cypress.Commands.add('alterarRepresentanteOrgaoJulgadorComposicao', () => {
  cy.get(ComposicaoElements.alterarComposicao).realHover()
  cy.contains('Alterar')
  cy.get(ElementoGlobais.abaSelecionadaCriaSessao).should('have.text', '2')
  cy.get(ElementoGlobais.descricaoAbas).eq(1).should('have.text', 'Composição')

  // Sem propagar
  cy.get(ComposicaoElements.alterarComposicao).eq(0).click()
  cy.get(ComposicaoElements.tituloModal).should('contain', 'Alterar representante')
  cy.get(ComposicaoElements.btnAdicionarAlterarComposicao).should('be.disabled')
  cy.get(ComposicaoElements.campoOrgaoJulgador).should('be.visible')
  cy.get(ComposicaoElements.limparRepresentante).click()
  cy.get(ComposicaoElements.campoRepresentante).click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.get(ComposicaoElements.opcaoPropagarNao).should('have.class', 'mat-mdc-radio-checked')
  cy.get(ComposicaoElements.btnAdicionarAlterarComposicao).click()
  cy.validarMensagemDeRetorno('Composição alterada com sucesso.')

  // Com propagar
  cy.get(ComposicaoElements.alterarComposicao).eq(0).click()
  cy.get(ComposicaoElements.tituloModal).should('contain', 'Alterar representante')
  cy.get(ComposicaoElements.btnAdicionarAlterarComposicao).should('be.disabled')
  cy.get(ComposicaoElements.campoOrgaoJulgador).should('be.visible')
  cy.get(ComposicaoElements.limparRepresentante).click()
  cy.get(ComposicaoElements.campoRepresentante).click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.contains('Sim, exceto processos com composição individual')
  cy.contains('Não')
  cy.get(ComposicaoElements.opcaoAplicarAlteração).eq(0).click()
  cy.get(ComposicaoElements.btnAdicionarAlterarComposicao).click()
  cy.get(ComposicaoElements.tituloModalConfirmacao).should('contain', 'Aviso: alteração de composição')
  cy.get(ComposicaoElements.btnCancelarConfirmacao).click()
  cy.get(ComposicaoElements.tituloModal).should('contain', 'Alterar representante')
  cy.get(ComposicaoElements.btnAdicionarAlterarComposicao).click()
  cy.get(ComposicaoElements.tituloModalConfirmacao).should('contain', 'Aviso: alteração de composição')
  cy.get(ElementoGlobais.btnConfirmar).click()
  cy.get(ComposicaoElements.nomeMagistrado).eq(1)
})

Cypress.Commands.add('excluirOrgaoJulgadorComposicao', () => {
  cy.get(ComposicaoElements.btnExcluirOrgaoJulgadores).filter(':enabled').first().click()
  cy.get(ComposicaoElements.opcoesAplicarProcessosPautados).eq(0).click()
  cy.get(ComposicaoElements.btnRemoverDaComposicao).click()
  cy.get(ElementoGlobais.btnConfirmar).should('be.visible')
  cy.contains('Aviso: remover órgão julgador')
  cy.contains('Cancelar')
  cy.contains('Confirmar remoção').click()
  cy.validarMensagemDeRetorno('Órgão julgador removido com sucesso.')
})

Cypress.Commands.add('adicionarOrgaoJulgadorComposicao', () => {
  cy.get(CriarSesaoElements.abasSessao).eq(1).click()
  cy.get(ComposicaoElements.btnAdicionarOrgaoJulgadores)
    .scrollIntoView()
    .click()
  cy.get(ComposicaoElements.campoColegiado).should('be.visible').click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).last().click()
  cy.get(ComposicaoElements.campoOrgaoJulgador).click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.get(ComposicaoElements.campoRepresentante).click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.contains('Sim, exceto processos com composição individual')
  cy.contains('Não')
  cy.get(ComposicaoElements.opcoesAplicarProcessosPautados).eq(1).click()
  cy.contains('Adicionar na composição').click()
  cy.get(ComposicaoElements.btnAdicionarAlterarComposicao).click()
  cy.contains('Órgão julgador adicionado com sucesso.')
  cy.validarMensagemDeRetorno('Órgão julgador adicionado com sucesso.')
})

Cypress.Commands.add('validarAlteracaoRepresentanteDuplicidade', () => {
  cy.get(CriarSesaoElements.abasSessao).eq(1).click()
  cy.get('.nome-magistrado').first().invoke('text').then((nomeMagistrado) => {
    const nome = nomeMagistrado.trim()
    cy.get(ComposicaoElements.alterarComposicao).eq(1).click()
    cy.get(ComposicaoElements.campoOrgaoJulgador).should('be.visible')
    cy.get(ComposicaoElements.limparRepresentante).click()
    cy.get(ComposicaoElements.campoRepresentante).click().type(nome)
    cy.get(ComposicaoElements.btnAdicionarAlterarComposicao).should('be.disabled')
    cy.get('[data-test="botao-fechar-dialogo"]').click()
    cy.get(ComposicaoElements.btnAdicionarOrgaoJulgadores)
      .scrollIntoView()
      .click()
    cy.get(ComposicaoElements.campoColegiado).should('be.visible').click()
    cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
    cy.get(ComposicaoElements.campoOrgaoJulgador).click()
    cy.get(ComposicaoElements.btnAdicionarAlterarComposicao).should('be.disabled')
  })
})
