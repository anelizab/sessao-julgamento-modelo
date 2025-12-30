/* global cy, Cypress, expect  */

import { CriarSesaoElements } from '../paginaElementos/paginaCriarSessao.js'
import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais.js'
import { PaginaListaSessoesElements } from '../paginaElementos/paginaListaSessoes.js'
import { PaginaLoginElements } from '../paginaElementos/paginaLogin.js'

Cypress.Commands.add('loginSecretarioSessao', (
  fixtureFile = 'dadosUsuarios',
  { cacheSession = true } = {}
) => {
  const login = (secretarioUser, secretarioPw) => {
    cy.visit('https://sessao-julgamento-qa.stg.pdpj.jus.br/sessao-julgamento')
    cy.get(ElementoGlobais.btnEntrarComoUsuario).should('be.visible').click()

    cy.origin('https://sso.stg.cloud.pje.jus.br', { args: { secretarioUser, secretarioPw } }, ({ secretarioUser, secretarioPw }) => {
      cy.get('#username').type(secretarioUser)
      cy.get('#password').type(secretarioPw, { log: false })
      cy.get('#kc-login').click()
    })
  }

  const validate = () => {
    cy.visit('https://sessao-julgamento-qa.stg.pdpj.jus.br/sessao-julgamento')
    cy.get('body').should('contain.text', 'Sessões disponíveis para acompanhamento.')
  }

  const options = {
    cacheAcrossSpecs: true,
    validate
  }

  cy.fixture(fixtureFile).then(({ secretarioUser, secretarioPw }) => {
    // gera um ID de sessão em forma de string (evita problemas com arrays)
    const sessionId = `secretarioSessao:${fixtureFile}:${secretarioUser}`

    if (cacheSession) {
      cy.session(sessionId, () => login(secretarioUser, secretarioPw), options).then(() => {
        validate()
      })
    } else {
      login(secretarioUser, secretarioPw)
      validate()
    }
  })
})

Cypress.Commands.add('loginPerfisSemAcessoCriarSessao', (
  userNameSemAcesso,
  userPasswordSemAcesso
) => {
  const login = (userNameSemAcesso, userPasswordSemAcesso) => {
    cy.visit('https://sessao-julgamento-qa.stg.pdpj.jus.br/sessao-julgamento')
    cy.get(ElementoGlobais.btnEntrarComoUsuario, { timeout: 10000 })
      .should('be.visible')
      .click()
    cy.origin('https://sso.stg.cloud.pje.jus.br', { args: { userNameSemAcesso, userPasswordSemAcesso } }, ({ userNameSemAcesso, userPasswordSemAcesso }) => {
      cy.get('#username').should('be.visible').type(userNameSemAcesso)
      cy.get('#password').should('be.visible').type(userPasswordSemAcesso, { log: false })
      cy.get('#kc-login')
        .should('be.visible')
        .should('not.be.disabled')
        .click()
    })
    cy.get(ElementoGlobais.cabecalhoHome)
      .should('be.visible')
      .should($el => {
        // Espera até que esteja visível E clicável (não coberto e com altura real)
        expect($el).to.be.visible
        expect($el[0].getBoundingClientRect().height).to.be.greaterThan(0)
      })
      .click()

    cy.get('body').then(($body) => {
      if ($body.find(ElementoGlobais.btnMenu).length > 0) {
        cy.get(ElementoGlobais.btnMenu)
          .should('be.visible')
          .click({ force: true })
      } else {
        cy.log('Botão de menu não está presente')
      }
    })

    cy.get(ElementoGlobais.btnSessoes)
      .should('be.visible')
      .click()
    // Ex: Garante que a página de sessões carregou
    cy.url().should('include', '/sessao-julgamento')
    cy.contains(CriarSesaoElements.btnCriarSessao, 'Criar sessão')
      .should('not.exist')
  }

  login(userNameSemAcesso, userPasswordSemAcesso)
})

Cypress.Commands.add('loginAcessoPublico', () => {
  cy.visit('https://sessao-julgamento-qa.stg.pdpj.jus.br/sessao-julgamento')
  cy.get(ElementoGlobais.selecionarTribunal, { timeout: 12000 })
    .should('be.visible')
    .click({ force: true })
  cy.contains('TRF5 - Tribunal Regional Federal da 5ª Região', { timeout: 10000 })
    .should('be.visible')
    .click()
  cy.get(ElementoGlobais.selecionarColegiado).should('be.visible').click()
  cy.contains('DIVISÃO DE 5ª TURMA').click()
  cy.get(PaginaLoginElements.btnEntrarUusarioPublico).should('be.visible').click()
  cy.contains(CriarSesaoElements.btnCriarSessao, 'Criar sessão')
    .should('not.exist')
  cy.get(PaginaListaSessoesElements.listagemSessoes).should('be.visible')
})

Cypress.Commands.add('loginPerfisSemAcessoGabinete', (
  userNameSemAcesso,
  userPasswordSemAcesso
) => {
  const login = (userNameSemAcesso, userPasswordSemAcesso) => {
    cy.visit('https://sessao-julgamento-qa.stg.pdpj.jus.br/sessao-julgamento')
    cy.get(ElementoGlobais.btnEntrarComoUsuario).should('be.visible').click()

    cy.origin('https://sso.stg.cloud.pje.jus.br', { args: { userNameSemAcesso, userPasswordSemAcesso } }, ({ userNameSemAcesso, userPasswordSemAcesso }) => {
      cy.get('#username').should('be.visible').type(userNameSemAcesso)
      cy.get('#password').should('be.visible').type(userPasswordSemAcesso, { log: false })
      cy.get('#kc-login')
        .should('be.visible')
        .should('not.be.disabled')
        .click()
    })
    cy.get(ElementoGlobais.cabecalhoHome)
      .should('be.visible')
      .should($el => {
        // Espera até que esteja visível E clicável (não coberto e com altura real)
        expect($el).to.be.visible
        expect($el[0].getBoundingClientRect().height).to.be.greaterThan(0)
      })
      .click()
  }

  login(userNameSemAcesso, userPasswordSemAcesso)
})

Cypress.Commands.add('loginAdminstradorTribunal', (
  userNameSemAcesso,
  userPasswordSemAcesso
) => {
  const login = (userNameSemAcesso, userPasswordSemAcesso) => {
    cy.visit('https://sessao-julgamento-qa.stg.pdpj.jus.br/sessao-julgamento')
    cy.get(ElementoGlobais.btnEntrarComoUsuario).should('be.visible').click()

    cy.origin('https://sso.stg.cloud.pje.jus.br', { args: { userNameSemAcesso, userPasswordSemAcesso } }, ({ userNameSemAcesso, userPasswordSemAcesso }) => {
      cy.get('#username').should('be.visible').type(userNameSemAcesso)
      cy.get('#password').should('be.visible').type(userPasswordSemAcesso, { log: false })
      cy.get('#kc-login')
        .should('be.visible')
        .should('not.be.disabled')
        .click()
    })
  }

  login(userNameSemAcesso, userPasswordSemAcesso)
})

Cypress.Commands.add('loginAssessoresMagistrados', (
  userName,
  userPassword
) => {
  const login = (userNameSemAcesso, userPasswordSemAcesso) => {
    cy.visit('https://sessao-julgamento-qa.stg.pdpj.jus.br/sessao-julgamento')
    cy.get(ElementoGlobais.btnEntrarComoUsuario, { timeout: 10000 })
      .should('be.visible')
      .click()
    cy.origin('https://sso.stg.cloud.pje.jus.br', { args: { userNameSemAcesso, userPasswordSemAcesso } }, ({ userNameSemAcesso, userPasswordSemAcesso }) => {
      cy.get('#username').should('be.visible').type(userNameSemAcesso)
      cy.get('#password').should('be.visible').type(userPasswordSemAcesso, { log: false })
      cy.get('#kc-login')
        .should('be.visible')
        .should('not.be.disabled')
        .click()
    })
  }

  login(userName, userPassword)
})
