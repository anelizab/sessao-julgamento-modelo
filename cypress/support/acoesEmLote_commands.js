/* global cy, Cypress */

import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais'
import { GabineteElements } from '../paginaElementos/paginaGabinete'

Cypress.Commands.add('retirarReverterJulgamentoEmLote', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })

  cy.get('[data-test="botao-menu-lateral"]').should('be.visible').click()
  cy.get('[data-test="botao-menu-sessões"]').should('be.visible').click()
  cy.buscarSessao()
  cy.get('[data-test="selecionar-todos"]').should('be.visible').click()
  cy.get('[data-test="botao-adicionar-sessao-julgamento"]').should('be.visible').click()
  cy.contains('Retirar de julgamento').click()
  cy.get('[datatest="textarea-motivo-retirada"]').should('be.visible').type('Motivo retirada')
  cy.get('[data-test="confirmar-botao"]').should('be.visible').click()
  cy.validarMensagemDeRetorno('1 processo foi retirado de julgamento com sucesso.')
  cy.contains('Retirado')
  cy.get('[data-test="selecionar-todos"]').should('be.visible').click()
  cy.get('[data-test="botao-menu-lateral"]').should('be.visible').click()
  cy.get('[data-test="botao-adicionar-sessao-julgamento"]').should('be.visible').click()
  cy.contains('Reverter retirada').click()
  cy.contains('Reverter retirada de 1 processo').click()
  cy.validarMensagemDeRetorno('1 processo revertido com sucesso.')
  cy.contains('Julgamento pendente')
})

Cypress.Commands.add('destacarProcessoEmLote', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })

  cy.get('[data-test="botao-menu-lateral"]').should('be.visible').click()
  cy.get('[data-test="botao-menu-sessões"]').should('be.visible').click()
  cy.buscarSessao()
  cy.get('[data-test="selecionar-todos"]').should('be.visible').click()
  cy.get('[data-test="botao-adicionar-sessao-julgamento"]').should('be.visible').click()
  cy.contains('Destacar').click()
  cy.get('[formcontrolname="textoDestacar"]').should('be.visible').type('Motivo de automação')
  cy.contains('Confirmar destaque do processo').click()
  cy.validarMensagemDeRetorno('1 processo foi destacado com sucesso.')
  cy.contains('Destacado')
  cy.contains('Retirado para inclusão em sessão presencial')
})

Cypress.Commands.add('liberarPautaEmLoteGabinete', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(GabineteElements.listaProcessos).should('be.visible')
    cy.wait(2000)
    cy.get('body').then(($body) => {
      const btn = $body.find('[aria-label="Última página"]:not([disabled]):not(.mat-mdc-button-disabled)')
      if (btn.length > 0) {
        cy.wrap(btn).click({ force: true })
        cy.wait(1500)
      }
    })
    cy.wait(2000)
    cy.get('[data-test="selecionar-todos"]').should('be.visible').click()
    cy.get('[data-test="botao-adicionar-sessao-julgamento"]').should('be.visible').click()
    cy.contains('Liberar para pauta').click()
    cy.get('[data-test="botao-confirmar"]').click()
    cy.get(ElementoGlobais.mensagemRetorno).should('be.visible')
  })
})

// prepara voto, importa modelo relatório
Cypress.Commands.add('prepararVotoMeritoEmLote', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(
      dados.magistradoUserRelator,
      dados.magistradoPwRelator
    )
  })

  cy.wait(2000)
  cy.get('body').then(($body) => {
    const btn = $body.find('[aria-label="Última página"]:not([disabled]):not(.mat-mdc-button-disabled)')
    if (btn.length > 0) {
      cy.wrap(btn).click({ force: true })
      cy.wait(1500)
    }
  })
  cy.wait(2000)
  cy.get('[data-test="selecionar-todos"]', { timeout: 20000 })
    .should('be.visible')
    .click({ force: true })
  cy.get('[data-test="botao-adicionar-sessao-julgamento"]')
    .should('be.visible')
    .click()

  cy.contains('Preparar voto do mérito (como relator)')
    .should('be.visible')
    .click()

  cy.wait(2000)
  cy.get('body', { timeout: 10000 }).then($body => {
    const botaoConfirmar = $body.find('[data-test="botao-confirmar"]:visible')

    if (botaoConfirmar.length) {
      cy.wrap(botaoConfirmar)
        .should('be.visible', { timeout: 10000 })
        .click()
    }
  })
  cy.get('[data-test="botao-importar-modelo"]')
    .should('be.visible')
    .click()
  cy.get('[data-test="input-select-modelo"]')
    .should('be.visible')
    .click()
  cy.contains('relatorio_do_merito')
    .should('be.visible')
    .click()
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Modelo selecionado com sucesso.')
  cy.get('[data-test="botao-salvar-merito"]', { timeout: 20000 })
    .scrollIntoView()
    .should('be.visible')
    .click()
  cy.get('.mdc-tab__content')
    .eq(1)
    .scrollIntoView()
    .should('be.visible')
    .click()
  cy.contains('EMENTA', { timeout: 15000 })
    .should('be.visible')
    .click()
  cy.contains('Selecionar modelo').click()
  cy.contains('Modelo').click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Modelo selecionado com sucesso.')
})

Cypress.Commands.add('liberarVotacaoAntecipada', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(
      dados.magistradoUserRelator,
      dados.magistradoPwRelator
    )
  })
  cy.get(GabineteElements.listaProcessos)
    .should('be.visible')
  cy.wait(2000)
  cy.get('body').then(($body) => {
    const seletorUltimaPagina = '[aria-label="Última página"]'
    const ultimaPagina = $body.find(seletorUltimaPagina)

    // Verificamos se existe, se está visível E se NÃO está desabilitado
    if (ultimaPagina.length && ultimaPagina.is(':visible') && !ultimaPagina.prop('disabled')) {
      cy.get(seletorUltimaPagina).click()
    } else {
      cy.log('O botão de última página não existe ou já está desabilitado.')
    }
  })
  cy.wait(2000)
  cy.get('[data-test="selecionar-todos"]', { timeout: 20000 })
    .should('be.visible')
    .click({ force: true })
  cy.get('[data-test="botao-adicionar-sessao-julgamento"]')
    .should('be.visible')
    .click()

  cy.contains('Liberar para votação antecipada')
    .should('be.visible')
    .click()

  cy.get('[data-test="botao-confirmar"]').should('be.visible').click()
})

Cypress.Commands.add('adiarEmLote', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })

  cy.get('[data-test="botao-menu-lateral"]').should('be.visible').click()
  cy.get('[data-test="botao-menu-sessões"]').should('be.visible').click()
  cy.buscarSessao()
  cy.get('[data-test="selecionar-todos"]').should('be.visible').click()
  cy.get('[data-test="botao-adicionar-sessao-julgamento"]').should('be.visible').click()
  cy.contains('Adiar').click()
  cy.contains('Adiar processos em lote').click()
  cy.contains('Foi selecionado 1 processo para adiamento em lote. Deseja continuar?').click()
  cy.contains('Confirmar adiamento de 1 processo').click()
  cy.validarMensagemDeRetorno('1 processo foi adiado de julgamento com sucesso.')
  cy.contains('Julgamento do processo adiado')
})

Cypress.Commands.add('pedirVistasEmLote', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.magistradoUserVogal1, dados.magistradoPwVogal1)
  })

  cy.get('[data-test="botao-menu-lateral"]').should('be.visible').click()
  cy.get('[data-test="botao-menu-sessões"]').should('be.visible').click()
  cy.buscarSessao()
  cy.get('[data-test="selecionar-todos"]').should('be.visible').click()
  cy.get('[data-test="botao-adicionar-sessao-julgamento"]').should('be.visible').click()
  cy.contains('Pedir vistas').click()
  cy.contains('Pedido de vistas em lote')
  cy.contains('Foi selecionado 1 processo para pedido de vistas em lote. Deseja continuar?')
  cy.contains(' Confirmar pedido de vistas de 1 processo ').click()
  cy.validarMensagemDeRetorno('Houve pedido de vistas em 1 processo com sucesso.')
  cy.reload()
  cy.contains('Processo com pedido de vistas')
})

Cypress.Commands.add('liberarPautaVotacaoAntecipada', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(
      dados.magistradoUserRelator,
      dados.magistradoPwRelator
    )
  })
  cy.get(GabineteElements.listaProcessos)
    .should('be.visible')
  cy.wait(2000)
  cy.get('body').then(($body) => {
    const seletorUltimaPagina = '[aria-label="Última página"]'
    const ultimaPagina = $body.find(seletorUltimaPagina)

    // Verificamos se existe, se está visível E se NÃO está desabilitado
    if (ultimaPagina.length && ultimaPagina.is(':visible') && !ultimaPagina.prop('disabled')) {
      cy.get(seletorUltimaPagina).click()
    } else {
      cy.log('O botão de última página não existe ou já está desabilitado.')
    }
  })
  cy.wait(2000)
  cy.get('[data-test="selecionar-todos"]', { timeout: 20000 })
    .should('be.visible')
    .click({ force: true })
  cy.get('[data-test="botao-adicionar-sessao-julgamento"]')
    .should('be.visible')
    .click()

  cy.contains('Liberar para pauta e votação antecipada')
    .should('be.visible')
    .click()

  cy.get('[data-test="botao-confirmar"]').should('be.visible').click()
})
