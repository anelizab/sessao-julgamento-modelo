/* global Cypress, cy, assert, expect  */
import { ComposicaoElements } from '../paginaElementos/paginaComposicao'
import { CriarSesaoElements } from '../paginaElementos/paginaCriarSessao'
import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais'
import { PaginaListaSessoesElements } from '../paginaElementos/paginaListaSessoes'
import { PautarSessaoElements } from '../paginaElementos/paginaPautarSessao'
import { ProcessosElements } from '../paginaElementos/paginaProcessos'

Cypress.Commands.add('validarMensagemDeRetorno', (message) => {
  cy.get(ElementoGlobais.mensagemRetorno)
    .contains(message, { timeout: 9000 })
    .should('be.visible')
  cy.get(ElementoGlobais.botaoFecharMensagem)
    .should('be.visible')
    .should('not.be.disabled')
    .click()
})

Cypress.Commands.add('buscarSessaoJulgamentoPeloNome', (textoSessao) => {
  if (!textoSessao || typeof textoSessao !== 'string') {
    throw new Error('O parâmetro textoSessao é obrigatório e deve ser uma string válida.')
  }
  // Aguarda a URL estar correta
  cy.url().should('include', '/sessao-julgamento')
  cy.get('.loading-spinner', { timeout: 10000 }).should('not.exist')

  cy.wait(1000)
  cy.get(ElementoGlobais.btnMenu, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click()
  cy.get('.mat-drawer-inner-container').should('be.visible')

  cy.get(ElementoGlobais.btnSessoes).should('be.visible').click()
  cy.get(PaginaListaSessoesElements.numeroSessao, { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled')
    .then(($campo) => {
      cy.wrap($campo).type(textoSessao)
    })

  cy.get(PaginaListaSessoesElements.btnFiltrar, { timeout: 10000 })
    .should('be.visible')
    .click()
})

Cypress.Commands.add('pressionarTab', (elemento, vezes) => {
  cy.get(elemento).click()
  for (let i = 0; i < vezes; i++) {
    cy.focused().tab()
  }
})

Cypress.Commands.add('selecionarColegiado', (nomeColegiado) => {
  cy.get('.selecao-colegiado h4.colegiado-texto')
    .first()
    .invoke('text')
    .then((text) => {
      const tribunalAtual = text.split(' - ')[0].trim() // pega só o "TRF5"
      if (tribunalAtual !== nomeColegiado) {
        cy.get(CriarSesaoElements.btnSelecionarColegiado).should('be.visible').first().click()
        cy.get(CriarSesaoElements.btnLimparColegiado).should('be.visible').first().click()
        cy.contains(nomeColegiado, { timeout: 10000 }).should('be.visible').click()
        cy.get(CriarSesaoElements.btnSalvarColegiado).should('be.visible').click()
      }
    })
})

Cypress.Commands.add('aguardarCardProcessos', () => {
  cy.get(ProcessosElements.cardProcessos, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.empty')
  cy.get(ProcessosElements.cardListagemProcessos, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.empty') // Garante que o conteúdo foi renderizado
})

Cypress.Commands.add('clicarBotaoPorTexto', (texto, timeout = 10000) => {
  cy.contains('button', texto, { timeout })
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled')
    .click()
})

Cypress.Commands.add('aguardarBotaoPronto', (texto, timeout = 10000) => {
  cy.log(`Aguardando botão "${texto}" estar pronto`)

  cy.contains('button', texto, { timeout })
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled')
    .then(($btn) => {
      // Verificação extra: botão não pode estar "carregando"
      const isBusy = $btn.attr('aria-busy') === 'true' || $btn.hasClass('loading')
      if (isBusy) {
        cy.log('Botão em estado de carregamento, aguardando...')
        // Retry até o botão deixar de estar ocupado
        cy.wrap($btn, { timeout }).should(($b) => {
          expect($b.attr('aria-busy')).not.to.eq('true')
          expect($b).not.to.have.class('loading')
        })
      }
    })
})

Cypress.Commands.add('validarBotaoComTexto', (texto) => {
  cy.contains('button', texto)
    .should('be.visible')
    .and('not.be.disabled')
    .and('contain.text', texto)
})

Cypress.Commands.add('buscarSessao', () => {
  // Espera até que a variável de ambiente esteja definida
  cy.waitUntil(() => Cypress.env('sessaoComPrefixo') !== undefined, {
    timeout: 10000, // espera até 10s
    interval: 500, // verifica a cada 0,5s
    errorMsg: 'A sessão com prefixo ainda não está disponível'
  }).then(() => {
    const sessaoComPrefixo = Cypress.env('sessaoComPrefixo')

    // Verificação adicional de segurança
    if (!sessaoComPrefixo) {
      cy.log('⚠️ A sessão com prefixo não está definida. Pulando este passo.')
      return
    }

    cy.log(`🔎 Buscando sessão: ${sessaoComPrefixo}`)
    cy.buscarSessaoJulgamentoPeloNome(sessaoComPrefixo)

    cy.get(PaginaListaSessoesElements.btnJulgamento, { timeout: 10000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true })

    cy.aguardarCardProcessos()

    cy.get(ProcessosElements.cardListagemProcessos).should('be.visible')

    cy.get(ProcessosElements.cardProcessos, { timeout: 10000 })
      .first()
      .should('be.visible')
      .click()
  })
})

Cypress.Commands.add('validarStatusProcesso', (textoEsperado) => {
  cy.get(ProcessosElements.statusProcesso)
    .should('contain.text', textoEsperado)
})

Cypress.Commands.add('criarSessaoProcessoEspecifico', () => {
  const numero = Cypress.env('numeroCapturado')
  cy.loginSecretarioSessao()
  cy.contains('Colegiado alterado com sucesso!').should('not.exist')
  cy.criarSessao()

  // Captura o número da sessão e armazena como alias
  cy.get(CriarSesaoElements.cabecalhoSessao)
    .invoke('text')
    .then((numeroSessao) => {
      const numeroExtraido = numeroSessao.match(/\d+/)[0]
      const sessaoComPrefixo = `Sessão Nº ${numeroExtraido}`

      Cypress.env('sessaoComPrefixo', sessaoComPrefixo) // ✅ Armazena na variável de ambiente
    })

  // Compor pauta
  cy.get(PautarSessaoElements.abaPauta)
    .should('be.visible')
    .click()

  // Verifica se os botões estão habilitados
  cy.contains('button', 'Salvar cadastro').should('be.disabled')
  cy.contains('Passo 1: Selecione os processos')

  // Seciona processos da PRIMEIRA SEÇÃO
  // cy.intercept('GET', '**/processos/pautar/disponiveis**').as('pautaDisponiveis')
  cy.get(ComposicaoElements.campoSelecaoOrgaoJulgador)
    .eq(0)
    .click()

  cy.get(ElementoGlobais.textoSelecionarOpcao)
    .contains('PRIMEIRA SEÇÃO')
    .click()

  // Aguarda a requisição ser concluída
  // cy.wait('@pautaDisponiveis')
  cy.get(PautarSessaoElements.btnFiltrosPasso1).eq(0).should('be.visible').click()
  cy.contains('Nº do processo').click()
  // insere o numero do processo capturado para realizar o filtro
  cy.get(PautarSessaoElements.numeroProcessoInteiro).type(numero)
  cy.clicarBotaoPorTexto(' Filtrar ')
  cy.adicionarProcessosNaPauta([1])
  cy.get(PautarSessaoElements.btnAdicionarNaPauta)
    .should('be.visible')
    .click()

  cy.contains('button', 'Salvar cadastro').should('not.be.disabled')
  cy.get(PautarSessaoElements.salvarCadastro)
    .should('be.visible')
    .click()
  cy.validarMensagemDeRetorno('Pauta alterada com sucesso.')
})

Cypress.Commands.add('capturarNumeroProcessoCabecalho', () => {
  cy.get('div.numero-processo')
    .first()
    .invoke('text')
    .then((texto) => {
      const numero = texto.trim()
      Cypress.env('numeroCapturado', numero)
    })
})

Cypress.Commands.add('adicionarProcessosNaPauta', (indices) => {
  indices.forEach((index) => {
    cy.get(PautarSessaoElements.checkProcessos).eq(index).check({ force: true })
  })
})
// MSDJ-3071 - Iniciar sessão manualmente(modal de aviso)
Cypress.Commands.add('iniciarSessao', () => {
  cy.clicarBotaoPorTexto('Finalizar planejamento')
  cy.validarMensagemDeRetorno('Planejamento finalizado com sucesso.')
  cy.buscarSessaoSemClicarNoProcesso()
  cy.get(ElementoGlobais.btnIniciarSessao).should('be.visible').click()
  const textosEsperados = [
    'Atenção: Iniciar sessão',
    'Não foi realizada a publicação da pauta da sessão',
    'Atenção: após a confirmação não será possível reverter a ação.'
  ]
  textosEsperados.forEach(texto => {
    cy.contains(texto)
      .should('be.visible')
      .and('exist')
  })
  cy.get('[data-test="botao-confirmar"]').click()
  cy.validarMensagemDeRetorno('Sessão iniciada com sucesso.')
  cy.contains('Em andamento')
})

Cypress.Commands.add('buscarSessaoSemClicarNoProcesso', () => {
  cy.then(() => {
    const sessaoComPrefixo = Cypress.env('sessaoComPrefixo')
    assert.exists(sessaoComPrefixo, 'A sessão com prefixo deve existir')
    cy.buscarSessaoJulgamentoPeloNome(sessaoComPrefixo)
  })
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-test="botao-avatar"]').eq(0).click()
  cy.contains('Sair').should('be.visible').click()
  cy.contains('Sair do sistema').should('be.visible').click()
})
