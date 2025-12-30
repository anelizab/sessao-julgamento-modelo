/* global cy, Cypress */

import { ComposicaoElements } from '../paginaElementos/paginaComposicao'
import { CriarSesaoElements } from '../paginaElementos/paginaCriarSessao'
import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais'
import { PaginaListaSessoesElements } from '../paginaElementos/paginaListaSessoes'
import { PautarSessaoElements } from '../paginaElementos/paginaPautarSessao'
import 'cypress-plugin-tab'
import 'cypress-real-events/support'

Cypress.Commands.add('adicionarProcessosNaPauta', (indices) => {
  indices.forEach(index => {
    cy.get(PautarSessaoElements.checkProcessos).eq(index).check()
  })
})
// MSDJ-37 - Executar aplicação dos filtros de processos da pauta de criação da sessão de julgamento
Cypress.Commands.add('executarFiltrosProcessosPautar', () => {
  const numeroProcessoInexistente = '9999999-99.9999.9.99.9999'
  const orgaoJulgador = 'PRIMEIRA SEÇÃO'
  cy.criarSessao()
  cy.buscarSessaoSemClicarNoProcesso()
  cy.get(PaginaListaSessoesElements.btnEditarSessao)
    .eq(0)
    .should('be.visible')
    .click()

  cy.get(CriarSesaoElements.abasSessao).eq(2).click()
  cy.get(PautarSessaoElements.btnFiltrosPasso1).should('be.visible')
  cy.get(PautarSessaoElements.btnFiltrosPasso1).first().click()

  // captura numero do processo p fazer no filtrar
  cy.wait(1000)
  cy.get('.numero-processo')
    .first()
    .invoke('text') // Captura o texto
    .then((numeroProcesso) => {
      const numero = numeroProcesso.trim()

      // filtrar pelo numero do processo inteiro
      cy.get(PautarSessaoElements.numeroProcessoInteiro).type(numero)
      cy.get(PautarSessaoElements.btnFiltrar).click()
      cy.get(PautarSessaoElements.numeroProcessoCardLista).should('contain', numero)

      // captura classe judicial fazer no filtro
      cy.get('div.item')
        .filter(':has(> span:contains("Classe judicial"))')
        .find('span:nth-of-type(2)')
        .first() // Seleciona o primeiro elemento apenas
        .invoke('text')
        .then((classeJudicial) => {
          const classe = classeJudicial.trim()

          // limpar e filtrar pela classe judicial
          cy.get(PautarSessaoElements.btnFiltrosPasso1).first().click()
          cy.get(PautarSessaoElements.btnLimpar).should('be.visible').click()
          cy.get(PautarSessaoElements.classeJudicial).click()
          cy.get(PautarSessaoElements.classeJudicial).type(classe)
          cy.get(ElementoGlobais.textoSelecionarOpcao).contains(classe).click()

          cy.get(PautarSessaoElements.btnFiltrar).click()
          cy.get(PautarSessaoElements.descricoesCards).should('contain', classe)

          // limpar e filtrar pela combinação de filtros de classe judicial, número do processo,orgão julgador, assunto
          cy.get(PautarSessaoElements.btnFiltrosPasso1).first().click()
          cy.get(PautarSessaoElements.btnLimpar).should('be.visible').click()
          cy.get(PautarSessaoElements.numeroProcessoInteiro).type(numero)

          cy.get(PautarSessaoElements.orgaoJulgador).eq(2).click()
          cy.get(PautarSessaoElements.orgaoJulgador).eq(2).type(orgaoJulgador)
          cy.get(ElementoGlobais.textoSelecionarOpcao).contains(orgaoJulgador).click()

          cy.get(PautarSessaoElements.classeJudicial).click()
          cy.get(PautarSessaoElements.classeJudicial).type(classe)
          cy.get(ElementoGlobais.textoSelecionarOpcao).contains(classe).click()

          cy.get(PautarSessaoElements.btnFiltrar).click()
          cy.get(PautarSessaoElements.numeroProcessoCardLista).should('contain', numero)
          cy.get(PautarSessaoElements.descricoesCards).should('contain', orgaoJulgador)
          cy.get(PautarSessaoElements.descricoesCards).should('contain', classe)

          // validar se o campo de filtro principal atualizou conforme modal de filtros
          cy.get(PautarSessaoElements.descricaoFiltroOrgaoJulgador)
            .eq(1)
            .should('be.visible')
            .click()
          cy.contains(orgaoJulgador)

          // verifica filtro sem retorno
          cy.get(PautarSessaoElements.btnFiltrosPasso1).should('be.visible')
          cy.get(PautarSessaoElements.btnFiltrosPasso1).first().click()
          cy.get(PautarSessaoElements.btnLimpar).should('be.visible').click()

          // filtrar pelo numero do processo inexistente
          cy.get(PautarSessaoElements.numeroProcessoInteiro).type(numeroProcessoInexistente)
          cy.get(PautarSessaoElements.btnFiltrar).click()
          cy.contains('Nenhum processo disponível')
        })
    })
})

// MSDJ-37 - Executar aplicação dos filtros de processos da pauta de criação da sessão de julgamento
Cypress.Commands.add('executarFiltrosProcessosPautados', () => {
  const numeroProcessoInexistente = '9999999-99.9999.9.99.9999'
  cy.buscarSessaoSemClicarNoProcesso()
  cy.get(PaginaListaSessoesElements.btnFiltrar).click()

  cy.get(PaginaListaSessoesElements.btnEditarSessao)
    .eq(0)
    .should('be.visible')
    .click()

  cy.get(CriarSesaoElements.abasSessao).eq(2).click()

  cy.get(PautarSessaoElements.btnFiltrosPasso2).should('be.visible').eq(1).click()

  // captura numero do processo p fazer no filtro
  cy.get('.numero-processo')
    .last()
    .invoke('text') // Captura o texto
    .then((numeroProcesso) => {
      const numero = numeroProcesso.trim()

      // filtra pelo número do processo pautado
      cy.get(PautarSessaoElements.numeroProcessoInteiro).type(numero)
      cy.get(PautarSessaoElements.btnFiltrar).click()
      cy.get(PautarSessaoElements.numeroProcessoCardLista).should('contain', numero)

      // captura classe judicial fazer no filtro
      cy.get('div.item')
        .filter(':has(> span:contains("Classe judicial"))')
        .find('span:nth-of-type(2)')
        .last() // Seleciona o primeiro elemento apenas
        .invoke('text')
        .then((classeJudicial) => {
          const classe = classeJudicial.trim()

          // filtra pela classe judicial
          cy.get(PautarSessaoElements.btnFiltrosPasso2).last().click()
          cy.get(PautarSessaoElements.btnLimpar).should('be.visible').click()
          cy.get(PautarSessaoElements.classeJudicial).click()
          cy.get(PautarSessaoElements.classeJudicial).type(classe)
          cy.get(PautarSessaoElements.descricoesCards).should('contain', classe)
          cy.get(ElementoGlobais.textoSelecionarOpcao).contains(classe).click()
          cy.get(PautarSessaoElements.btnFiltrar).click()
          cy.get(PautarSessaoElements.descricoesCards).should('contain', classe)

          // limpar e filtrar pela combinação de filtros de classe judicial, número do processo,orgão julgador, assunto
          cy.get(PautarSessaoElements.btnFiltrosPasso2).last().click()
          cy.get(PautarSessaoElements.btnLimpar).should('be.visible').click()
          cy.get(PautarSessaoElements.numeroProcessoInteiro).type(numeroProcesso)

          cy.get('div.card-content')
            .find('div.item')
            .filter(':has(> span:contains("Órgão julgador"))')
            .find('span:nth-of-type(2)')
            .last()
            .invoke('text')
            .then((texto) => {
              const orgaoJulgador = texto.trim()

              cy.get(PautarSessaoElements.orgaoJulgador).eq(2).click()
              cy.get(PautarSessaoElements.orgaoJulgador).eq(2).type(orgaoJulgador)
              cy.get(ElementoGlobais.textoSelecionarOpcao).contains(orgaoJulgador).click()

              cy.get(PautarSessaoElements.classeJudicial).click()
              cy.get(PautarSessaoElements.classeJudicial).type(classe)
              cy.get(ElementoGlobais.textoSelecionarOpcao).contains(classe).click()

              // captura assunto para fazer no filtro
              cy.get('div.item')
                .filter(':has(> span:contains("Assunto"))')
                .find('span:nth-of-type(2)')
                .last()
                .invoke('text')
                .then((texto) => {
                  const assunto = texto.trim()

                  cy.get(PautarSessaoElements.assunto).click()
                  cy.get(PautarSessaoElements.assunto).type(assunto)
                  cy.get(ElementoGlobais.textoSelecionarOpcao).contains(assunto).click()

                  cy.get(PautarSessaoElements.btnFiltrar).click()

                  // validar se o campo de filtro principal atualizou conforme modal de filtros
                  cy.get(PautarSessaoElements.descricaoFiltroOrgaoJulgador)
                    .eq(1)
                    .should('be.visible')
                    .click()
                  cy.contains(orgaoJulgador)
                  // valida retorno conforme filtro
                  cy.get(PautarSessaoElements.numeroProcessoCardLista).should('contain', numero)
                  cy.get(PautarSessaoElements.descricoesCards).should('contain', orgaoJulgador)
                  cy.get(PautarSessaoElements.descricoesCards).should('contain', classe)
                  cy.get(PautarSessaoElements.descricoesCards).should('contain', assunto)
                  cy.contains('1 processo em pauta')

                  // verifica filtro sem retorno
                  cy.get(PautarSessaoElements.btnFiltrosPasso2).should('be.visible')
                  cy.get(PautarSessaoElements.btnFiltrosPasso2).last().click()
                  cy.get(PautarSessaoElements.btnLimpar).should('be.visible').click()
                  cy.get(PautarSessaoElements.numeroProcessoInteiro).should('be.visible').type(numeroProcessoInexistente)
                  cy.get(PautarSessaoElements.btnFiltrar).click()
                  cy.contains('Selecione os processos ao lado para definir a pauta')
                })
            })
        })
    })
})

// MSDJ-41 - Ordenar pauta da sessão de julgamento
Cypress.Commands.add('ordenarProcessosPauta', () => {
  cy.loginSecretarioSessao()
  cy.buscarSessaoSemClicarNoProcesso()
  cy.get(PaginaListaSessoesElements.btnEditarSessao).should('be.visible').click()
  cy.get(CriarSesaoElements.abasSessao).eq(2).click()

  cy.get('[mattooltip="Situação do processo"]')
    .contains('Julgamento pendente')
    .first()
    .parents('.content-card-processo') // ajuste conforme o container do processo
    .find('[datatest="copiar-numero-processo"] h4') // ou direto no botão se for um <button> ou <span>
    .invoke('text')
    .then((numero) => {
      const numeroProcesso = numero.trim()
      cy.log('Número copiado:', numeroProcesso)

      // Salva na variável de ambiente do Cypress
      Cypress.env('numeroProcessoCopiado', numeroProcesso)

      // Reordenar pauta (drag-drop)
      cy.get(PautarSessaoElements.btnReordenarPauta).should('be.visible').click()
      cy.get(PautarSessaoElements.tituloReordenarPauta).should('contain.text', 'Reordenar pauta')
      cy.get(PautarSessaoElements.descricaoReordenarPauta).should('contain.text', 'Arraste os processos abaixo para alterar a ordem.')
      cy.get('[data-mat-icon-name="drag_pan"]').should('be.visible')
      cy.get(PautarSessaoElements.btnConfirmarReordenacaoPauta).should('contain.text', 'Confirmar')
      cy.contains('Cancelar')
      cy.contains('Confirmar').click()

      // reordenar de para
      cy.get(PautarSessaoElements.btnReordenarModalDePara).click()
      cy.contains('Reordenar processo')
      cy.contains('Escolha para qual posição deseja mover um processo específico.')
      cy.get(PautarSessaoElements.posicaoDe).should('be.visible').type('1')
      cy.get(PautarSessaoElements.posicaoPara).should('be.visible').type('3')
      cy.contains('Confirmar').click()

      cy.get(':nth-child(3) > .content-card-processo > .posicao-processo')
        .should('exist')
        .contains('3')

      cy.get(':nth-child(3) > .content-card-processo > .posicao-processo') // Seleciona novamente a mesma div
        .next()
        .should('contain.text', numeroProcesso)

      // Retorna o processo para primeira posição
      cy.get(PautarSessaoElements.btnReordenarModalDePara).click()
      cy.get(PautarSessaoElements.posicaoDe).should('be.visible').type('3')
      cy.get(PautarSessaoElements.posicaoPara).should('be.visible').type('1')
      cy.contains('Confirmar').click()

      cy.get(':nth-child(1) > .content-card-processo > .posicao-processo')
        .should('exist')
        .contains('1')

      cy.get(':nth-child(1) > .content-card-processo > .posicao-processo')
        .next()
        .should('contain.text', numeroProcesso)
    })
})
// MSDJ-42 - Alterar composição da sessão de julgamento em um processo individual (Secretátio da sessão)
Cypress.Commands.add('alterarComposicaoProcessoSecretarioSessao', () => {
  cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
    cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
      1,
      dadosUsuarios.magistradoUserRelator,
      dadosUsuarios.magistradoPwRelator,
      'PRIMEIRA SEÇÃO', false
    )
  })
  cy.loginSecretarioSessao()
  cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
  cy.get(CriarSesaoElements.btnVoltarListaSessao).click()
  cy.buscarSessaoSemClicarNoProcesso()
  cy.get(PaginaListaSessoesElements.btnEditarSessao).should('be.visible').click()
  cy.get(CriarSesaoElements.abasSessao).eq(2).click()

  // Adicionar um orgão julgador na composição individual do processo
  cy.get(PautarSessaoElements.btnMaisOpcoes).last().click()
  cy.get(PautarSessaoElements.btnListaOpcoes).contains('Ver composição').click()
  cy.get(ComposicaoElements.btnAdicionarOrgaoJulgadores).should('be.visible').click()
  cy.get(PautarSessaoElements.tituloModal).should('contain', 'Adicionar órgão julgador')
  cy.get(ComposicaoElements.campoColegiado).should('be.visible').click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).last().click()
  cy.get(ComposicaoElements.campoOrgaoJulgador).should('be.visible').click()
  cy.get(PautarSessaoElements.listaOrgaoJulgador)
    .first()
    .click()
  cy.get(ComposicaoElements.campoRepresentante).click()
  cy.get(PautarSessaoElements.listaRepresentante)
    .first()
    .click()
  cy.contains('button', 'Alterar na composição do processo').click()
  cy.validarMensagemDeRetorno('Inclusão de órgão julgador realizada com sucesso.')
  cy.get(CriarSesaoElements.abasSessao).eq(1).click()
  cy.contains('Obs: Você possui 1 processo com composição individual.')
  // alterar um representante na composição individual do processo
  cy.get(CriarSesaoElements.abasSessao).eq(2).click()
  cy.get(PautarSessaoElements.btnMaisOpcoes).should('be.visible')
  cy.get(PautarSessaoElements.btnMaisOpcoes).last().click()
  cy.get(PautarSessaoElements.btnListaOpcoes).should('be.visible')
  cy.get(PautarSessaoElements.btnListaOpcoes).contains('Ver composição').click()
  cy.get(PautarSessaoElements.btnAlterarRepresentante).eq(2).should('be.visible').click()
  cy.get(PautarSessaoElements.tituloModal).should('contain', 'Alterar representante')
  cy.contains('button', 'Alterar na composição do processo').should('be.disabled')
  cy.get(ComposicaoElements.limparRepresentante).should('be.visible').click()
  cy.get(ComposicaoElements.campoRepresentante).should('be.visible').click()
  cy.get(PautarSessaoElements.listaRepresentante)
    .first()
    .click()
  cy.contains('button', 'Alterar na composição do processo').click()
  cy.get(CriarSesaoElements.abasSessao).eq(1).click()
  cy.contains('Obs: Você possui 1 processo com composição individual.')

  // excluir um orgão julgador na composição individual do processo
  cy.get(CriarSesaoElements.abasSessao).eq(2).click()
  cy.get(PautarSessaoElements.btnMaisOpcoes).should('be.visible')
  cy.get(PautarSessaoElements.btnMaisOpcoes).last().click()
  cy.get(PautarSessaoElements.btnListaOpcoes).contains('Ver composição').click()
  cy.get(PautarSessaoElements.btnRemoverOrgaoJulgador)
    .filter(':enabled')
    .first()
    .click()

  cy.get(PautarSessaoElements.tituloModal).should('contain', 'Remover órgão julgador')
  cy.contains('button', 'Remover da composição').click()
  cy.validarMensagemDeRetorno('Exclusão de órgão julgador realizada com sucesso.')
  cy.get(PautarSessaoElements.btnFecharModalVerComposicao).click()
  cy.get(CriarSesaoElements.abasSessao).eq(1).click()
  cy.get(PautarSessaoElements.contadorComposicaoIndividual).should('not.be.exist')
})

// MSDJ-42 - Alterar composição da sessão de julgamento em um processo individual (Magistrado)
Cypress.Commands.add('alterarComposicaoProcessoMagistrado', () => {
  cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
    cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
      1,
      dadosUsuarios.magistradoUserRelator,
      dadosUsuarios.magistradoPwRelator,
      'PRIMEIRA SEÇÃO', false
    )
  })
  cy.loginSecretarioSessao()
  cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
  cy.logout()
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.buscarSessaoSemClicarNoProcesso()
  cy.get(ElementoGlobais.btnComposicao).should('be.visible').click()
  cy.get(CriarSesaoElements.abasSessao).eq(2).click()
  cy.get(PautarSessaoElements.btnMaisOpcoes).last().click()
  cy.get(PautarSessaoElements.btnListaOpcoes).contains('Ver composição').click()
  cy.get(ComposicaoElements.btnAdicionarOrgaoJulgadores).should('not.be.exist')
  cy.get(PautarSessaoElements.btnAlterarRepresentante).should('not.be.exist')
  cy.get(PautarSessaoElements.btnAlterarRepresentante).should('not.be.exist')
})

Cypress.Commands.add('publicarSessaoDjen', () => {
  cy.loginSecretarioSessao()
  cy.buscarSessaoSemClicarNoProcesso()
  cy.get('[aria-label="Publicar pauta"]', { timeout: 10000 })
    .click()
  cy.contains('Publicar pauta da sessão de julgamento')
  cy.contains('Ao confirmar a publicação da pauta da sessão de julgamento, os dados dos processos serão enviados ao DJEN e a sessão poderá ser iniciada. Deseja continuar?')
  cy.contains('Confirmar').click()
  cy.get('.mat-mdc-snack-bar-label.mdc-snackbar__label').should('be.visible')
  cy.contains('Aguardando início')
  cy.get(PaginaListaSessoesElements.btnJulgamento).should('be.visible').click()
  cy.get('.icones-status').should('be.visible')
  cy.get(CriarSesaoElements.btnVoltarListaSessao).should('be.visible').click()
})
