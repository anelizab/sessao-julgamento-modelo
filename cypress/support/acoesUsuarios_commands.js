/* global cy, Cypress  */
import { PaginaLoginElements } from '../paginaElementos/paginaLogin'

Cypress.Commands.add('verificarVisibilidadeBotaoEntrar', () => {
  cy.get(PaginaLoginElements.avatar).then(($elementA) => {
    const isAvatarVisible = $elementA.length > 0
    if (isAvatarVisible) {
      cy.get(PaginaLoginElements.btnEntrar).should('not.exist')
    } else {
      cy.get(PaginaLoginElements.btnEntrar).should('be.visible')
    }
  })
})

Cypress.Commands.add('clicarNoAvatar', () => {
  cy.get(PaginaLoginElements.avatar).should('be.visible').click()
})

Cypress.Commands.add('verificarInformacoesDePerfil', () => {
  cy.get(PaginaLoginElements.avatar).should('be.visible')
})

Cypress.Commands.add('verificarOpcoesDoMenu', () => {
  cy.contains('Editar foto').should('be.visible')
  cy.contains('Sair').should('be.visible')
})

Cypress.Commands.add('realizarLogoff', () => {
  cy.clicarNoAvatar()
  cy.verificarInformacoesDePerfil()
  cy.verificarOpcoesDoMenu()

  // Tenta sair e cancela
  cy.contains('Sair').click()
  cy.contains('Cancelar').should('be.visible').click()

  // Realiza o logoff
  cy.clicarNoAvatar()
  cy.contains('Sair').click()
  cy.contains('Sair do sistema').should('be.visible')
})

Cypress.Commands.add('logoff', () => {
  cy.verificarVisibilidadeBotaoEntrar()
  cy.realizarLogoff()
})

Cypress.Commands.add('alterarFotoPerfil', () => {
  cy.loginSecretarioSessao()
  cy.clicarNoAvatar()
  cy.get('.mat-mdc-button-touch-target').realHover()
  cy.contains('Secretário de sessão')
  cy.contains('Editar foto').click()
  cy.contains('Selecione o arquivo de imagem para upload.')
  cy.contains('*Permitido imagens no formato JPEG/JPG ou PNG. Tamanho máximo do arquivo: 5mb.')

  cy.get(PaginaLoginElements.btnEnviarArquivo).click()
  cy.get(PaginaLoginElements.inputArquivo).attachFile('img/avatar.jpeg')
  cy.get(PaginaLoginElements.btnAlterarFoto).should('be.visible').click()
  cy.validarMensagemDeRetorno('Imagem alterada com sucesso!')
})
