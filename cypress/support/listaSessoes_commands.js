/* global cy, Cypress  */
import { PaginaListaSessoesElements } from '../paginaElementos/paginaListaSessoes'
import 'cypress-plugin-tab'
import 'cypress-real-events/support'
import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais'
import { CriarSesaoElements } from '../paginaElementos/paginaCriarSessao'

// Comando auxiliar interno
Cypress.Commands.add('verificarTextosPresentes', (textos) => {
  textos.forEach((texto) => {
    cy.contains(texto).should('be.visible')
  })
})

// MSDJ-5 - Apresentar filtros de sessão de julgamento
Cypress.Commands.add('apresentarFiltrosListaSessoes', () => {
  cy.verificarTextosPresentes([
    'Filtros',
    'Sessões',
    'Sessões disponíveis para acompanhamento.'
  ])

  cy.get(PaginaListaSessoesElements.numeroSessao).should('be.visible').contains('Nome da sessão')
  cy.get(PaginaListaSessoesElements.numeroProcesso).should('be.visible').contains('Nº do processo')
  cy.get(PaginaListaSessoesElements.dataInicio).should('be.visible').contains('Data de início')
  cy.get(PaginaListaSessoesElements.dataFim).should('be.visible').contains('Data de fim')
  cy.get(PaginaListaSessoesElements.situacao).should('be.visible').contains('Situação')
  cy.get(PaginaListaSessoesElements.btnLimpar).should('be.visible').contains('Limpar')
  cy.get(PaginaListaSessoesElements.btnFiltrar).should('be.enabled').contains('Filtrar')
})

// MSDJ-6 - Executar aplicação dos filtros de sessão de julgamento [SP4]
Cypress.Commands.add('executarFiltrosListaSessoes', () => {
  cy.get(PaginaListaSessoesElements.listagemSessoes).should('be.visible')

  const textosEsperados = ['Nome da sessão', 'Nº do processo', 'Data de início', 'Data de fim', 'Situação']
  textosEsperados.forEach((texto) => {
    cy.contains(texto)
  })

  cy.get(PaginaListaSessoesElements.numeroSessao).should('be.visible').type('Sem retorno')
  cy.get(PaginaListaSessoesElements.btnFiltrar).click()

  const semResultado = ['Nenhum resultado encontrado.', 'Verifique sua pesquisa e tente novamente.']
  semResultado.forEach((texto) => {
    cy.contains(texto)
  })
})

// MSDJ-2 - Listar sessões de julgamento [SP4]
Cypress.Commands.add('listarSessoes', () => {
  cy.contains('Compor sessão')
  cy.get(CriarSesaoElements.btnVoltarListaSessao)
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled')
    .click()

  cy.verificarTextosPresentes([
    'Sessões',
    'Sessões disponíveis para acompanhamento.'
  ])
  cy.location('pathname').should('equal', '/sessao-julgamento')
  cy.get(ElementoGlobais.btnMenu).click()
  cy.get(ElementoGlobais.btnSessoes).realHover().click()
  cy.contains('Sessões')

  cy.get(PaginaListaSessoesElements.listagemSessoes).should('be.visible')
  cy.get(PaginaListaSessoesElements.descricaoIniciolistaSessoes).should('be.visible')
  cy.get(PaginaListaSessoesElements.descricaoFimlistaSessoes).should('be.visible')
  cy.get(PaginaListaSessoesElements.situacao).should('be.visible')

  const formatoDataHoraRegex = /^Início\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}Fim\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/
  cy.get(PaginaListaSessoesElements.datasListaSessao).each(($data) => {
    cy.wrap($data).invoke('text').should('match', formatoDataHoraRegex)
  })
})

// MSDJ-22 - Seleção do colegiado de atuação do secretário de sessão [SP7]
Cypress.Commands.add('selecionarColegiadoPerfilSecretarioSessao', () => {
  cy.loginSecretarioSessao()
  cy.get(ElementoGlobais.descricaoColegiado)
    .invoke('text')
    .then((currentValue) => {
      const colegiadoAtual = currentValue.trim()
      let novoColegiado = ''

      if (colegiadoAtual === 'TRF5 - DIVISÃO DE 5ª TURMA') {
        novoColegiado = 'DIVISÃO DE 6ª TURMA'
      } else {
        novoColegiado = 'DIVISÃO DE 5ª TURMA'
      }

      cy.get(CriarSesaoElements.btnSelecionarColegiado).should('be.visible').click()
      cy.get(CriarSesaoElements.btnLimparColegiado).should('be.visible').click()
      cy.get(ElementoGlobais.campoColegiado).clear().type(novoColegiado)
      cy.get(ElementoGlobais.textoSelecionarOpcao).contains(novoColegiado).click()
      cy.get(CriarSesaoElements.btnSalvarColegiado).click()
      cy.contains('Colegiado alterado com sucesso!').should('be.visible')
    })
})

// MSDJ-22 - Seleção do colegiado de atuação do público [SP7]
Cypress.Commands.add('selecionarColegiadoPerfilPublico', () => {
  cy.loginAcessoPublico()
  cy.get(CriarSesaoElements.btnSelecionarColegiado).should('be.visible').first().click()
  cy.get(ElementoGlobais.selecionarColegiado).should('be.visible').click()
  cy.contains('DIVISÃO DE 6ª TURMA').click()
  cy.get(CriarSesaoElements.btnSalvarColegiado).should('be.visible').click()
  cy.contains('Colegiado alterado com sucesso!')
  cy.get(ElementoGlobais.descricaoColegiado)
    .should('be.visible')
    .should('contain.text', 'DIVISÃO DE 6ª TURMA')
})
