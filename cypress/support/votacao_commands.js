/* global cy, Cypress */

import { ComposicaoElements } from '../paginaElementos/paginaComposicao'
import { CriarSesaoElements } from '../paginaElementos/paginaCriarSessao'
import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais'
import { GabineteElements } from '../paginaElementos/paginaGabinete'
import { PautarSessaoElements } from '../paginaElementos/paginaPautarSessao'
import { ProcessosElements } from '../paginaElementos/paginaProcessos'
import { VotacaoElements } from '../paginaElementos/paginaVotacao'

Cypress.Commands.add('adicionarProcessosNaPauta', (indices) => {
  indices.forEach(index => {
    cy.get(PautarSessaoElements.checkProcessos).eq(index).check()
  })
})

Cypress.Commands.add('prepararProcessosVotacao', () => {
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

  // Agora, podemos adicionar os processos à pauta
  cy.adicionarProcessosNaPauta([1])

  cy.get(PautarSessaoElements.btnAdicionarNaPauta)
    .should('be.visible')
    .click()

  cy.contains('button', 'Salvar cadastro').should('not.be.disabled')
  cy.get(PautarSessaoElements.salvarCadastro)
    .should('be.visible')
    .click()
  cy.validarMensagemDeRetorno('Pauta alterada com sucesso.')
  cy.contains('Finalizar planejamento').should('be.visible').click()
  cy.contains('Planejamento finalizado com sucesso.')
})

Cypress.Commands.add('prepararVotoMagistradoVogal', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserVogal1, dados.magistradoPwVogal1)
  })

  cy.buscarSessao()
  cy.contains('Preliminar 1/1').click()
  cy.get(VotacaoElements.conteudoMerito).should('be.visible')
  // vota na preliminar
  cy.get(VotacaoElements.textoAcordeon).should('be.visible').eq(1).click()
  cy.contains(VotacaoElements.descricaoCard, ' Preliminar 1 de 1 ')
  cy.get(VotacaoElements.btnPrepararVoto, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click()
  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(VotacaoElements.sugestaoVoto).should('be.visible').click({ force: true })
    cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
      .should('be.visible')
      .click()
      .type(dadosVotacao.textoDeclaracaoVotoMerito)
  })
  cy.contains('Cancelar').click()
  cy.contains('As alterações na preparação do voto serão perdidas')
  cy.contains('Você possui informações que não foram salvas e serão perdidas. Deseja sair sem salvar a preparação do voto?')
  cy.contains('Retornar').click()

  cy.get(VotacaoElements.btnConfirmar)
    .should('be.visible')
    .should('not.be.disabled')
    .eq(0)
    .click({ force: true })
  cy.validarMensagemDeRetorno('Voto proferido com sucesso.')
  cy.get(VotacaoElements.textoAcordeon)
    .eq(1)
    .click()

  cy.get(VotacaoElements.numeroVotos).last().scrollIntoView() // faz o scrool até o elemento necessário p validação
  cy.get(VotacaoElements.btnNovoVoto)
    .should('be.visible')
    .should('not.be.disabled')
  cy.contains('Convergente com o relator')
  cy.contains(VotacaoElements.numeroVotos, ' 0 voto ')
  cy.contains(VotacaoElements.numeroVotos, ' 1 voto ')
  cy.contains('Meu voto').click()
  cy.contains('Meu voto')
  cy.contains('Divergente do relator')

  // Verifica se após o magistrado votar em todas as preliminares fica mérito d
  cy.contains(VotacaoElements.textoAcordeon, 'Mérito')
  cy.contains(VotacaoElements.textoAdaptavel, 'Divergente do relator')
  cy.contains(VotacaoElements.numeroVotos, ' 1 voto ')

  // vota no mérito
  cy.get(VotacaoElements.textoAcordeon).should('be.visible').eq(2).click()
  cy.get(VotacaoElements.btnPrepararVoto, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click()
  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(VotacaoElements.sugestaoVoto).should('be.visible').click({ force: true })
    cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
      .should('be.visible')
      .click()
      .type(dadosVotacao.textoDeclaracaoVotoMerito)
  })
  cy.get(VotacaoElements.btnConfirmar)
    .should('be.visible')
    .should('not.be.disabled')
    .eq(0)
    .click({ force: true })
  cy.validarMensagemDeRetorno('Voto proferido com sucesso.')
  cy.get(VotacaoElements.consultaVotacaoMagistrado).should('be.visible').eq(1).click()
  cy.contains('Voto do magistrado')
  cy.contains('Declarado voto')
  cy.contains('Declaração de voto da Sessão de Julgamento')
  cy.contains(' Divergente do relator ')
  cy.get(VotacaoElements.btnFecharModal).click()
})

// MSDJ-60 Editar voto do relator
Cypress.Commands.add('editarVotoRelator', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })

  cy.buscarSessao()

  // Editar Ementa
  cy.get(VotacaoElements.btnEmenta)
    .should('be.visible')
    .click()
  cy.get(VotacaoElements.btnEditar)
    .should('be.visible')
    .click()
  cy.get('[data-test="editor-texto-relatorio"]')
    .should('be.visible')
    .click()
    .clear()
    .type('Teste de edição da ementa')
  cy.get(ElementoGlobais.btnConfirmar).click()

  // Novo voto
  cy.get(VotacaoElements.btnNovoVoto)
    .click()
  cy.contains('button', 'Conhecido e provido em parte').click()
  cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
    .should('be.visible')
    .click()
    .clear()
    .type('Voto Conhecido e provido em parte')
  cy.get(VotacaoElements.btnSalvar).click()
  cy.get(ProcessosElements.cardVotoVogal).should('be.visible')
  cy.contains('Voto do relator - Meu voto')
  cy.contains('Conhecido e provido em parte')

  // Modificar Voto relator
  cy.contains('button', 'Voto do relator').click()
  cy.contains('button', 'Editar').click()
  cy.get('.ql-editor')
    .should('be.visible')
    .click()
    .clear()
    .type('Teste de declaração do voto')
  cy.get(VotacaoElements.btnSalvar).click()
})
// MSDJ-1191 Editar voto do vogal
Cypress.Commands.add('editarVotoVogal', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserVogal1, dados.magistradoPwVogal1)
  })

  cy.buscarSessao()

  // Novo voto
  cy.get(VotacaoElements.btnNovoVoto)
    .click()
  cy.contains('button', 'Convergente com declaração').click()
  cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
    .should('be.visible')
    .click()
    .clear()
    .type('Voto convergente')
  cy.get(VotacaoElements.btnCancelar).click()
  cy.contains('As alterações na alteração do voto serão perdidas')
  cy.contains('button', 'Retornar').click()
  cy.contains('button', 'Confirmar').click()

  // Meu Voto
  cy.get(ProcessosElements.btnMeuVoto)
    .should('be.visible')
    .click()
  cy.contains('button', 'Editar').click()
  cy.get('.ql-editor')
    .should('be.visible')
    .click()
    .clear()
    .type('Teste de declaração do voto vogal')
  cy.get(VotacaoElements.btnSalvar).click()
})
// MSDJ-66 Invalidar voto do vogal
Cypress.Commands.add('invalidarVotoVogal', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.buscarSessao()
  // Novo voto
  cy.get(VotacaoElements.btnNovoVoto)
    .click()
  cy.contains('button', 'Conhecido e não provido').click()
  cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
    .should('be.visible')
    .click()
    .clear()
    .type('Voto Conhecido e não provido')
  cy.get(VotacaoElements.btnSalvar).click()
  cy.contains('A votação do colegiado para o mérito será invalidada ')
  cy.contains('button', 'Sim, confirmar modificação de voto').click()
  cy.contains('Convergente com o relator')
  cy.contains(VotacaoElements.numeroVotos, ' 0 voto ')
  cy.contains('Divergente do relator')
  cy.contains(VotacaoElements.numeroVotos, ' 0 voto ')
})
// MSDJ-8 Apresentar situação da votação para o magistrado
Cypress.Commands.add('apresentarSituacaoVotacaoMgistrado', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })

  cy.buscarSessao()
  cy.get(VotacaoElements.acordeonVotacao, { timeout: 10000 })
    .should('be.visible')
  cy.get(VotacaoElements.situacaoObjetoCorrente, { timeout: 10000 })
    .should('be.visible')
  cy.get(VotacaoElements.tituleAcordeon).should('be.visible').click()
  cy.get(VotacaoElements.conteudoVotoDeclarado, { timeout: 10000 })
    .should('be.visible')
    .should('include.text', 'Mérito')
    .should('include.text', 'Declarado voto')
  cy.contains(' PRELIMINAR 1 ').click()
  cy.get(VotacaoElements.conteudoVotoDeclarado, { timeout: 10000 })
    .should('be.visible')
    .should('include.text', ' PRELIMINAR 1 ')
    .should('include.text', 'Declarado voto')
})

// MSDJ-1935 / MSDJ-48 Proclamar resultado | MSDJ-2940
Cypress.Commands.add('proclamarResultado', () => {
  cy.loginSecretarioSessao()
  cy.buscarSessao()
  cy.get(ProcessosElements.cardProcessos, { timeout: 10000 }).eq(0).click()
  cy.get(ProcessosElements.menuDadosProcesso, { timeout: 10000 }).should('be.visible').click()
  cy.contains('Proclamar', { timeout: 10000 }) // aguarda até 10s
    .should('be.visible')
    .click({ force: true })
  cy.contains('Proclamar julgamento').should('be.visible')
  cy.get(VotacaoElements.btnConfirmar).should('be.visible').click()
  cy.contains('Aguardando proclamação dos resultados').should('be.visible')

  // Removi movimento processual, pesquisa e insere
  cy.get('[data-test="botao-remover-movimento"]').scrollIntoView().click()
  cy.validarMensagemDeRetorno('Movimento removido com sucesso')
  cy.get('[data-test="filtro-input-movimento"]').type('12203')
  cy.contains('.node-pai-nome', '12203 - Adiado')
    .realHover()
  cy.get('[data-test="botao-adicionar-movimento"]').eq(0).click()
  cy.validarMensagemDeRetorno('Movimento salvo com sucesso.')

  cy.get('.titulo-resultado-votacao')
    .scrollIntoView()
    .click()
  cy.contains('2 votos divergentes do relator').should('be.visible')
  cy.get('[data-test="input-select-vencedor"]')
    .scrollIntoView()
    .should('be.visible')
    .click()
  cy.contains('SEGUNDA SEÇÃO', { timeout: 20000 }).click()
  cy.get('[data-test="editor-texto-proclamacao"]').type('Proclamação de resultado')
  cy.contains('Salvar').click()
  cy.contains('Confirmar').click()
  cy.contains('Proclamação').click()
  cy.contains('Modificar').click()
  cy.get('[data-test="editor-texto-proclamacao"]').type('Proclamação de resultao editada')
  cy.contains('Salvar').click()
  cy.contains('Confirmar').click()
  cy.contains('Sim, aplicar na certidão').click()
})

Cypress.Commands.add('prepararPreliminarMeritoVotoSemLiberararVotacao', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })

  cy.buscarSessao()
    .first()
    .should('be.visible')
    .click()
  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(VotacaoElements.btnPrepararVoto, { timeout: 10000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    cy.get(VotacaoElements.btnNovaPreliminar).should('be.visible').click()

    cy.get(VotacaoElements.sugestoesVotoPreliminar)
      .contains('Acolhida')
      .should('be.visible')
      .click()

    cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
      .should('be.visible')
      .click()
      .type(dadosVotacao.textoDeclaracaoVotoMerito)

    cy.get(VotacaoElements.btnSalvarRascunhoPreliminar)
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    cy.validarMensagemDeRetorno('Rascunho salvo com sucesso.')

    cy.get(VotacaoElements.btnExcluirPreliminar).should('be.visible').click()
    cy.get('.dialog-header-title').should('be.visible')
    cy.contains(' Exclusão de preliminar ')
    cy.contains('Deseja confirmar a exclusão da preliminar criada?')
    cy.get(VotacaoElements.btnConfirmar).should('be.visible').click()
    cy.validarMensagemDeRetorno('Preliminar excluída com sucesso.')

    cy.get(VotacaoElements.btnNovaPreliminar).should('be.visible').click()
    cy.get(VotacaoElements.sugestoesVotoPreliminar)
      .contains('Acolhida')
      .should('be.visible')
      .click()
    cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
      .should('be.visible')
      .click()
      .type(dadosVotacao.textoDeclaracaoVotoMerito)

    cy.get(VotacaoElements.btnSalvarRascunhoPreliminar)
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    cy.validarMensagemDeRetorno('Rascunho salvo com sucesso.')

    cy.contains('Preparar voto')
    cy.contains('Para preparar o voto, preencha os dados abaixo.')
    cy.contains('MÉRITO')
    cy.contains('RELATÓRIO')
    cy.contains('EMENTA')
    cy.contains('VOTO')

    cy.get(VotacaoElements.campoTextoRelatorio).should('be.visible').click().type(dadosVotacao.textoRelatorio)
    cy.get(VotacaoElements.btnSalvarRascunhoMerito)
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    cy.validarMensagemDeRetorno('Rascunho salvo com sucesso.')
    cy.get(VotacaoElements.abasMerito).eq(2).click()
    cy.get(VotacaoElements.campoTextoEmenta).should('be.visible').click().type(dadosVotacao.textoEmenta)
    cy.get(VotacaoElements.btnSalvarRascunhoMerito)
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    cy.validarMensagemDeRetorno('Rascunho salvo com sucesso.')
    cy.get(VotacaoElements.abasMerito).eq(3).click()
    cy.get(VotacaoElements.sugestoesVotoMerito)
      .contains('Conhecido e provido')
      .should('be.visible')
      .click()
    cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
      .should('be.visible')
      .eq(1)
      .click()
      .type(dadosVotacao.textoDeclaracaoVotoMerito)
    cy.get(VotacaoElements.btnSalvarRascunhoMerito)
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    cy.validarMensagemDeRetorno('Rascunho salvo com sucesso.')
    cy.get(VotacaoElements.btnConfimarPreparacaoVoto)
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    cy.validarMensagemDeRetorno('Voto proferido com sucesso.')
  })
})

Cypress.Commands.add('minutarVogalSemConfirmarMinutaAssessorVogal', () => {
  cy.buscarSessao()
  cy.get(VotacaoElements.btnMinutar).should('be.visible').click()
  cy.get(VotacaoElements.susgetaoVotoMinutarVogal)
    .contains('Revisado com relator')
    .should('be.visible')
    .click()
  cy.clicarBotaoPorTexto('Confirmar')
  cy.validarMensagemDeRetorno('Minuta preparada com sucesso.')
  cy.contains('Preliminar 1/1').click()
  cy.contains('Mérito').click()
  cy.get(VotacaoElements.btnMinutar).should('be.visible').click()
  cy.get(VotacaoElements.susgetaoVotoMinutarVogal)
    .contains('Revisado com relator')
    .should('be.visible')
    .click()
  cy.clicarBotaoPorTexto('Confirmar')
  cy.validarMensagemDeRetorno('Minuta preparada com sucesso.')
})

Cypress.Commands.add('prepararVotoMagistradoVogais', (usuario, senha) => {
  cy.loginPerfisSemAcessoCriarSessao(usuario, senha)
  cy.buscarSessao()
  cy.contains('Preliminar 1/1').click()
  cy.get(VotacaoElements.conteudoMerito).should('be.visible')
  // vota na preliminar
  cy.get(VotacaoElements.textoAcordeon).should('be.visible').eq(1).click()
  cy.contains(VotacaoElements.descricaoCard, ' Preliminar 1 de 1 ')
  cy.get(VotacaoElements.btnPrepararVoto, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click()
  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(VotacaoElements.sugestaoVoto).should('be.visible').click({ force: true })
    cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
      .should('be.visible')
      .click()
      .type(dadosVotacao.textoDeclaracaoVotoMerito)
  })
  cy.contains('Cancelar').click()
  cy.contains('As alterações na preparação do voto serão perdidas')
  cy.contains('Você possui informações que não foram salvas e serão perdidas. Deseja sair sem salvar a preparação do voto?')
  cy.contains('Retornar').click()

  cy.get(VotacaoElements.btnConfirmar)
    .should('be.visible')
    .should('not.be.disabled')
    .eq(0)
    .click({ force: true })
  cy.validarMensagemDeRetorno('Voto proferido com sucesso.')
  cy.get(VotacaoElements.textoAcordeon)
    .eq(1)
    .click()

  cy.get(VotacaoElements.numeroVotos).last().scrollIntoView() // faz o scrool até o elemento necessário p validação
  cy.get(VotacaoElements.btnNovoVoto)
    .should('be.visible')
    .should('not.be.disabled')
  cy.contains('Convergente com o relator')
  cy.get(VotacaoElements.consultaVotacaoMagistrado).should('be.visible').eq(2).click()
  cy.contains('Voto do magistrado')
  cy.contains('Divergente do relator')
  cy.contains('Declarado voto')
  cy.get(VotacaoElements.btnFecharModal).should('be.visible').click()
  // Verifica se após o magistrado votar em todas as preliminares fica mérito d
  cy.contains(VotacaoElements.textoAcordeon, 'Mérito')
  cy.contains(VotacaoElements.textoAdaptavel, 'Divergente do relator')
  cy.contains(VotacaoElements.numeroVotos, ' 1 voto ')

  // vota no mérito
  cy.get(VotacaoElements.textoAcordeon).should('be.visible').eq(2).click()
  cy.get(VotacaoElements.btnPrepararVoto, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click()
  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(VotacaoElements.sugestaoVoto).should('be.visible').click({ force: true })
    cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
      .should('be.visible')
      .click()
      .type(dadosVotacao.textoDeclaracaoVotoMerito)
  })
  cy.get(VotacaoElements.btnConfirmar)
    .should('be.visible')
    .should('not.be.disabled')
    .eq(0)
    .click({ force: true })
  cy.validarMensagemDeRetorno('Voto proferido com sucesso.')
  cy.get(VotacaoElements.consultaVotacaoMagistrado).should('be.visible').eq(2).click()
  cy.contains('Voto do magistrado')
  cy.contains('Declarado voto')
  cy.contains('Declaração de voto da Sessão de Julgamento')
  cy.contains(' Divergente do relator ')
  cy.get(VotacaoElements.btnFecharModal).click()
})

Cypress.Commands.add('prepararVotoRelatorGabineteProcessoSegredoJustica', (quantidade) => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })

  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(GabineteElements.listaProcessos).should('be.visible')
    cy.get(GabineteElements.btnAbrirFiltro).should('be.visible').click()
    cy.get(GabineteElements.campoOrgaoJulgador).should('be.visible').click()
    cy.get(ElementoGlobais.textoSelecionarOpcao).contains(dadosVotacao.orgaoJulgador).click()
    cy.clicarBotaoPorTexto(' Filtrar ')
    cy.contains(dadosVotacao.orgaoJulgador).should('be.visible')

    const procurarProcessoNaPagina = (tentativas = 0, maxTentativas = 10) => {
      if (tentativas >= maxTentativas) {
        throw new Error('Processo com ícone [data-mat-icon-name="visibility_off"] não encontrado após paginar.')
      }

      cy.get('body').then(($body) => {
        const processosComIcone = $body.find('[data-mat-icon-name="visibility_off"]')

        if (processosComIcone.length > 0) {
          cy.wrap(processosComIcone)
            .first()
            .closest(GabineteElements.cardProcessos)
            .scrollIntoView()
            .should('be.visible')
            .click()
        } else if ($body.find('[aria-label="Próxima página"]').length > 0 && !$body.find('[aria-label="Próxima página"]').is(':disabled')) {
          cy.get('[aria-label="Próxima página"]').should('be.visible').click()
          cy.get(GabineteElements.listaProcessos, { timeout: 10000 }).should('be.visible')
          cy.get(GabineteElements.cardProcessos, { timeout: 10000 }).should('have.length.greaterThan', 0)

          procurarProcessoNaPagina(tentativas + 1, maxTentativas)
        } else {
          throw new Error('Nenhuma página seguinte disponível ou processo não encontrado.')
        }
      })
    }

    Cypress._.times(quantidade, () => {
      procurarProcessoNaPagina()

      // Fluxo para preparar o voto
      cy.get(VotacaoElements.btnNovaPreliminar).should('be.visible').click()
      cy.get(GabineteElements.sugestaoVotoAcolhida).should('be.visible').click()
      cy.get(GabineteElements.declaracaoVotoPreliminar).should('be.visible')
        .type(dadosVotacao.textoDeclaracaoVotoPreliminar)
      cy.clicarBotaoPorTexto(' Salvar ')
      cy.validarMensagemDeRetorno('Preliminar salva com sucesso.')

      cy.get(VotacaoElements.campoTextoRelatorio).should('be.visible').click()
        .type(dadosVotacao.textoRelatorio)
      cy.get(VotacaoElements.abasMerito).eq(2).click()
      cy.get(VotacaoElements.campoTextoEmenta).should('be.visible').click()
        .type(dadosVotacao.textoEmenta)
      cy.get(VotacaoElements.abasMerito).eq(3).click()
      cy.get(VotacaoElements.sugestoesVotoMerito)
        .contains('Conhecido e provido')
        .should('be.visible')
        .click()
      cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
        .should('be.visible')
        .eq(1)
        .click()
        .type(dadosVotacao.textoDeclaracaoVotoMerito)

      cy.get(GabineteElements.btnSalvar).should('be.visible').eq(1).click()

      cy.clicarBotaoPorTexto(' Liberar para ')
      cy.clicarBotaoPorTexto(' Pauta ')
      cy.clicarBotaoPorTexto(' Sim, liberar processo ')
      cy.validarMensagemDeRetorno('Mérito salvo com sucesso.')

      cy.get(GabineteElements.cabecalhoProcessoStatus).should('contain', 'Liberado para pauta')

      cy.clicarBotaoPorTexto(' Liberar para ')
      cy.clicarBotaoPorTexto(' Votação antecipada ')
      cy.clicarBotaoPorTexto(' Sim, liberar processo ')
      cy.get(GabineteElements.cabecalhoProcessoStatus).should('contain', 'Liberado para pauta')

      cy.capturarNumeroProcessoCabecalho()

      // Volta para a lista
      cy.visit('/gabinete')
    })
  })
})
// Prepara processos passando a quantidade, órgão julgador e se o processo incluído deve ou não ser segredo de justiça
Cypress.Commands.add('prepararProcessosSessao', (quantidadeTotal, secoes = [], incluirSegredo = true) => {
  if (!quantidadeTotal || typeof quantidadeTotal !== 'number' || quantidadeTotal < 1) {
    throw new Error('Você deve passar uma quantidade válida (número maior que 0) de processos a selecionar.')
  }

  if (!Array.isArray(secoes) || secoes.length === 0) {
    throw new Error('Você deve passar uma lista com ao menos uma seção válida.')
  }

  let processosSelecionados = 0
  let finalizado = false

  // Login e criação da sessão
  cy.loginSecretarioSessao()
  cy.criarSessao()

  // Captura o número da sessão criada
  cy.get(CriarSesaoElements.cabecalhoSessao)
    .invoke('text')
    .then((texto) => {
      const match = texto.match(/Sessão Nº \d+/)
      if (!match) throw new Error(`Não foi possível extrair número da sessão do texto: "${texto}"`)
      Cypress.env('sessaoComPrefixo', match[0])
      cy.log(`Sessão capturada: ${match[0]}`)
    })

  // Vai para aba de pauta
  cy.get(PautarSessaoElements.abaPauta).should('be.visible').click()
  cy.contains('button', 'Salvar cadastro').should('be.disabled')
  cy.contains('Passo 1: Selecione os processos')

  // Auxiliar: clica no card pelo índice e adiciona na pauta (sempre reobtém o card para evitar "stale element")
  const clickCard = (index) => {
    cy.get('.content-card-processo.card-processo', { timeout: 20000 })
      .eq(index)
      .should('exist')
      .within(() => {
        cy.get('.card-content', { timeout: 10000 }).should('exist').click({ force: true })
      })

    cy.get(PautarSessaoElements.btnAdicionarNaPauta, { timeout: 10000 })
      .should('be.visible')
      .click()

    processosSelecionados++

    if (processosSelecionados === quantidadeTotal && !finalizado) {
      finalizado = true
      cy.log('Último processo adicionado, clicando em Salvar cadastro.')
      cy.get(PautarSessaoElements.salvarCadastro, { timeout: 40000 })
        .should('be.visible')
        .click({ force: true })
        .then(() => cy.validarMensagemDeRetorno('Pauta alterada com sucesso.'))
    }
  }

  // Seleciona processos em uma seção (loop recursivo para sempre trabalhar com DOM fresco)
  const selecionarProcessosDaSecao = (secao) => {
    if (finalizado || processosSelecionados >= quantidadeTotal) return

    // Seleciona a seção
    cy.get(ComposicaoElements.campoSelecaoOrgaoJulgador).eq(0).click()
    cy.get(ElementoGlobais.textoSelecionarOpcao).contains(secao).click()

    const addNextFromSection = () => {
      if (finalizado || processosSelecionados >= quantidadeTotal) return

      cy.get('.content-card-processo.card-processo', { timeout: 20000 })
        .should('have.length.greaterThan', 0)
        .then(($cards) => {
          // Descobre o primeiro índice elegível nesta seção (sem usar .find no $el)
          let eligibleIndex = -1

          for (let i = 0; i < $cards.length; i++) {
            const el = $cards[i] // nó DOM atual
            const hasSegredo = !!el.querySelector('[data-mat-icon-name="visibility_off"]')
            if ((incluirSegredo && hasSegredo) || (!incluirSegredo)) {
              eligibleIndex = i
              break
            }
          }

          // Se não há mais card elegível nesta seção, para
          if (eligibleIndex === -1) {
            return
          }

          // Clica e adiciona o card elegível
          clickCard(eligibleIndex)

          // Após adicionar, reavalia a lista (DOM mudou) e tenta novamente nesta mesma seção
          addNextFromSection()
        })
    }

    // Inicia o loop desta seção
    addNextFromSection()

    // Ao terminar (quando não achar mais elegíveis ou atingir a quantidade), limpa o autocomplete
    cy.then(() => {
      if (!finalizado && processosSelecionados < quantidadeTotal) {
        cy.get('[data-test="botao-limpar-autocomplete-Órgão julgador"]').should('be.visible').click()
      }
    })
  }

  // Executa a seleção em cada seção em sequência
  cy.wrap(null).then(() => {
    return Cypress.Promise.each(secoes, (secao) => {
      if (!finalizado && processosSelecionados < quantidadeTotal) {
        return selecionarProcessosDaSecao(secao)
      }
      return false
    })
  })
})

Cypress.Commands.add('prepararProcessosSessaoNumero', (quantidadeTotal, secoes = [], incluirSegredo = true) => {
  const numero = Cypress.env('numeroCapturado')
  if (!quantidadeTotal || typeof quantidadeTotal !== 'number' || quantidadeTotal < 1) {
    throw new Error('Você deve passar uma quantidade válida (número maior que 0) de processos a selecionar.')
  }

  if (!Array.isArray(secoes) || secoes.length === 0) {
    throw new Error('Você deve passar uma lista com ao menos uma seção válida.')
  }

  let processosSelecionados = 0
  let finalizado = false

  // Login e criação da sessão
  cy.loginSecretarioSessao()
  cy.criarSessao()

  // Captura o número da sessão criada
  cy.get(CriarSesaoElements.cabecalhoSessao)
    .invoke('text')
    .then((texto) => {
      const match = texto.match(/Sessão Nº \d+/)
      if (!match) throw new Error(`Não foi possível extrair número da sessão do texto: "${texto}"`)
      Cypress.env('sessaoComPrefixo', match[0])
      cy.log(`Sessão capturada: ${match[0]}`)
    })

  // Vai para aba de pauta
  cy.get(PautarSessaoElements.abaPauta).should('be.visible').click()
  cy.contains('button', 'Salvar cadastro').should('be.disabled')
  cy.contains('Passo 1: Selecione os processos')

  // Auxiliar: clica no card pelo índice e adiciona na pauta (sempre reobtém o card para evitar "stale element")
  const clickCard = (index) => {
    cy.get('.content-card-processo.card-processo', { timeout: 20000 })
      .eq(index)
      .should('exist')
      .within(() => {
        cy.get('.card-content', { timeout: 10000 }).should('exist').click({ force: true })
      })

    cy.get(PautarSessaoElements.btnAdicionarNaPauta, { timeout: 10000 })
      .should('be.visible')
      .click()

    processosSelecionados++

    if (processosSelecionados === quantidadeTotal && !finalizado) {
      finalizado = true
      cy.log('Último processo adicionado, clicando em Salvar cadastro.')
      cy.get(PautarSessaoElements.salvarCadastro, { timeout: 40000 })
        .should('be.visible')
        .click({ force: true })
        .then(() => cy.validarMensagemDeRetorno('Pauta alterada com sucesso.'))
    }
  }

  // Seleciona processos em uma seção (loop recursivo para sempre trabalhar com DOM fresco)
  const selecionarProcessosDaSecao = (secao) => {
    if (finalizado || processosSelecionados >= quantidadeTotal) return

    // Seleciona a seção
    cy.get(ComposicaoElements.campoSelecaoOrgaoJulgador).eq(0).click()
    cy.get(ElementoGlobais.textoSelecionarOpcao).contains(secao).click()

    cy.get(PautarSessaoElements.btnFiltrosPasso1).eq(0).should('be.visible').click()
    cy.contains('Nº do processo').click()
    // insere o numero do processo capturado para realizar o filtro
    cy.get(PautarSessaoElements.numeroProcessoInteiro).type(numero)

    const addNextFromSection = () => {
      if (finalizado || processosSelecionados >= quantidadeTotal) return

      cy.get('.content-card-processo.card-processo', { timeout: 20000 })
        .should('have.length.greaterThan', 0)
        .then(($cards) => {
          // Descobre o primeiro índice elegível nesta seção (sem usar .find no $el)
          let eligibleIndex = -1

          for (let i = 0; i < $cards.length; i++) {
            const el = $cards[i] // nó DOM atual
            const hasSegredo = !!el.querySelector('[data-mat-icon-name="visibility_off"]')
            if ((incluirSegredo && hasSegredo) || (!incluirSegredo)) {
              eligibleIndex = i
              break
            }
          }

          // Se não há mais card elegível nesta seção, para
          if (eligibleIndex === -1) {
            return
          }

          // Clica e adiciona o card elegível
          clickCard(eligibleIndex)

          // Após adicionar, reavalia a lista (DOM mudou) e tenta novamente nesta mesma seção
          addNextFromSection()
        })
    }

    // Inicia o loop desta seção
    addNextFromSection()

    // Ao terminar (quando não achar mais elegíveis ou atingir a quantidade), limpa o autocomplete
    cy.then(() => {
      if (!finalizado && processosSelecionados < quantidadeTotal) {
        cy.get('[data-test="botao-limpar-autocomplete-Órgão julgador"]').should('be.visible').click()
      }
    })
  }

  // Executa a seleção em cada seção em sequência
  cy.wrap(null).then(() => {
    return Cypress.Promise.each(secoes, (secao) => {
      if (!finalizado && processosSelecionados < quantidadeTotal) {
        return selecionarProcessosDaSecao(secao)
      }
      return false
    })
  })
})

// Prepara processos passando a quantidade, órgão julgador e se o processo incluído deve ou não ser segredo de justiça e finaliza planejamento
Cypress.Commands.add('prepararProcessosSessaoFinalizaPlanejamento', (quantidadeTotal, secoes = [], incluirSegredo = true) => {
  if (!quantidadeTotal || typeof quantidadeTotal !== 'number' || quantidadeTotal < 1) {
    throw new Error('Você deve passar uma quantidade válida (número maior que 0) de processos a selecionar.')
  }

  if (!Array.isArray(secoes) || secoes.length === 0) {
    throw new Error('Você deve passar uma lista com ao menos uma seção válida.')
  }

  let processosSelecionados = 0
  let finalizado = false

  // Login e criação da sessão
  cy.loginSecretarioSessao()
  cy.criarSessao()

  // Captura o número da sessão criada
  cy.get(CriarSesaoElements.cabecalhoSessao)
    .invoke('text')
    .then((texto) => {
      const match = texto.match(/Sessão Nº \d+/)
      if (!match) throw new Error(`Não foi possível extrair número da sessão do texto: "${texto}"`)
      Cypress.env('sessaoComPrefixo', match[0])
      cy.log(`Sessão capturada: ${match[0]}`)
    })

  // Vai para aba de pauta
  cy.get(PautarSessaoElements.abaPauta).should('be.visible').click()
  cy.contains('button', 'Salvar cadastro').should('be.disabled')
  cy.contains('Passo 1: Selecione os processos')

  // Auxiliar: clica no card pelo índice e adiciona na pauta (sempre reobtém o card para evitar "stale element")
  const clickCard = (index) => {
    cy.get('.content-card-processo.card-processo', { timeout: 20000 })
      .eq(index)
      .should('exist')
      .within(() => {
        cy.get('.card-content', { timeout: 10000 }).should('exist').click({ force: true })
      })

    cy.get(PautarSessaoElements.btnAdicionarNaPauta, { timeout: 10000 })
      .should('be.visible')
      .click()

    processosSelecionados++

    if (processosSelecionados === quantidadeTotal && !finalizado) {
      finalizado = true
      cy.log('Último processo adicionado, clicando em Salvar cadastro.')
      cy.get(PautarSessaoElements.salvarCadastro, { timeout: 40000 })
        .should('be.visible')
        .click({ force: true })
        .then(() => cy.validarMensagemDeRetorno('Pauta alterada com sucesso.'))
    }
  }

  // Seleciona processos em uma seção (loop recursivo para sempre trabalhar com DOM fresco)
  const selecionarProcessosDaSecao = (secao) => {
    if (finalizado || processosSelecionados >= quantidadeTotal) return

    // Seleciona a seção
    cy.get(ComposicaoElements.campoSelecaoOrgaoJulgador).eq(0).click()
    cy.get(ElementoGlobais.textoSelecionarOpcao).contains(secao).click()

    const addNextFromSection = () => {
      if (finalizado || processosSelecionados >= quantidadeTotal) return

      cy.get('.content-card-processo.card-processo', { timeout: 20000 })
        .should('have.length.greaterThan', 0)
        .then(($cards) => {
          // Descobre o primeiro índice elegível nesta seção (sem usar .find no $el)
          let eligibleIndex = -1

          for (let i = 0; i < $cards.length; i++) {
            const el = $cards[i] // nó DOM atual
            const hasSegredo = !!el.querySelector('[data-mat-icon-name="visibility_off"]')
            if ((incluirSegredo && hasSegredo) || (!incluirSegredo)) {
              eligibleIndex = i
              break
            }
          }

          // Se não há mais card elegível nesta seção, para
          if (eligibleIndex === -1) {
            return
          }

          // Clica e adiciona o card elegível
          clickCard(eligibleIndex)

          // Após adicionar, reavalia a lista (DOM mudou) e tenta novamente nesta mesma seção
          addNextFromSection()
        })
    }

    // Inicia o loop desta seção
    addNextFromSection()

    // Ao terminar (quando não achar mais elegíveis ou atingir a quantidade), limpa o autocomplete
    cy.then(() => {
      if (!finalizado && processosSelecionados < quantidadeTotal) {
        cy.get('[data-test="botao-limpar-autocomplete-Órgão julgador"]').should('be.visible').click()
      }
    })
  }

  // Executa a seleção em cada seção em sequência
  cy.wrap(null).then(() => {
    return Cypress.Promise.each(secoes, (secao) => {
      if (!finalizado && processosSelecionados < quantidadeTotal) {
        return selecionarProcessosDaSecao(secao)
      }
      return false
    })
  })
  cy.contains('Salvar cadastro').then(($btn) => {
    if (!$btn.prop('disabled')) {
      cy.wrap($btn).click()
    } else {
      cy.log('Botão Salvar cadastro está desabilitado, seguindo fluxo...')
    }
  })
})

// Prepara minuta com assessor no gabinete passando parametros(quantidade, usuario, senha, orgaoJulgador, segredoJustica = false):
Cypress.Commands.add(
  'prepararVotoGabineteAssessorUsuarioPorParametro',
  (quantidade, usuario, senha, orgaoJulgador, segredoJustica = false) => {
    // Login
    cy.loginPerfisSemAcessoGabinete(usuario, senha)

    cy.fixture('dadosVotacao').then((dadosVotacao) => {
      const aplicarFiltro = () => {
        cy.get(GabineteElements.listaProcessos).should('be.visible')
        cy.get(GabineteElements.btnAbrirFiltro).should('be.visible').click()
        cy.get(GabineteElements.campoOrgaoJulgador).should('be.visible').click()
        cy.get(ElementoGlobais.textoSelecionarOpcao)
          .contains(orgaoJulgador)
          .click()
        cy.clicarBotaoPorTexto(' Filtrar ')
        cy.contains(orgaoJulgador).should('be.visible')
      }

      const procurarProcessoNaPagina = (tentativas = 0, maxTentativas = 10) => {
        if (tentativas >= maxTentativas) {
          throw new Error('Processo não encontrado após paginar.')
        }

        cy.get('body').then(($body) => {
          const processosValidos = $body
            .find(GabineteElements.cardProcessos)
            .filter((_, card) => {
              const situacaoEl = card.querySelector('[mattooltip="Situação do processo"]')
              const textoSituacao = situacaoEl ? situacaoEl.innerText.trim() : ''

              // só aceitar se for "NÃO MINUTADO"
              if (!textoSituacao.includes('NÃO MINUTADO')) {
                return false
              }

              // ignora processos já liberados para pauta e votação
              if (textoSituacao.includes('LIBERADO PARA PAUTA E VOTAÇÃO')) {
                return false
              }

              // verifica segredo de justiça
              const ehSegredo = !!card.querySelector('[data-mat-icon-name="visibility_off"]')
              return segredoJustica ? ehSegredo : !ehSegredo
            })

          if (processosValidos.length > 0) {
            const processoParaClicar = processosValidos[0]

            cy.wrap(processoParaClicar)
              .scrollIntoView()
              .should('be.visible')
              .click()
          } else if (
            $body.find('[aria-label="Próxima página"]').length > 0 &&
            !$body.find('[aria-label="Próxima página"]').is(':disabled')
          ) {
            cy.get('[aria-label="Próxima página"]')
              .should('be.visible')
              .click()

            cy.get(GabineteElements.listaProcessos, { timeout: 10000 }).should('be.visible')
            cy.get(GabineteElements.cardProcessos, { timeout: 10000 }).should('have.length.greaterThan', 0)

            procurarProcessoNaPagina(tentativas + 1, maxTentativas)
          } else {
            throw new Error('Nenhum processo disponível para seleção (todos inválidos ou sem próxima página).')
          }
        })
      }

      Cypress._.times(quantidade, () => {
        aplicarFiltro() // reaplica o filtro antes de cada seleção
        procurarProcessoNaPagina()

        // Votação preliminar
        cy.get(VotacaoElements.btnNovaPreliminar).should('be.visible').click()
        cy.get(GabineteElements.sugestaoVotoAcolhida).should('be.visible').click()
        cy.get(GabineteElements.declaracaoVotoPreliminar)
          .should('be.visible')
          .click()
          .type(dadosVotacao.textoDeclaracaoVotoPreliminar)
        cy.clicarBotaoPorTexto(' Salvar ')
        cy.validarMensagemDeRetorno('Preliminar salva com sucesso.')

        // Relatório e ementa
        cy.get(VotacaoElements.campoTextoRelatorio).should('be.visible').click()
          .type(dadosVotacao.textoRelatorio)
        cy.get(VotacaoElements.abasMerito).eq(2).click()
        cy.get(VotacaoElements.campoTextoEmenta).should('be.visible').click()
          .type(dadosVotacao.textoEmenta)
        cy.get(VotacaoElements.abasMerito).eq(3).click()
        cy.get(VotacaoElements.sugestoesVotoMerito)
          .contains('Conhecido e provido')
          .should('be.visible')
          .click()
        cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
          .should('be.visible')
          .eq(1)
          .click()
          .type(dadosVotacao.textoDeclaracaoVotoMerito)

        cy.get(GabineteElements.btnSalvar).should('be.visible').eq(1).click()
        cy.validarMensagemDeRetorno('Mérito salvo com sucesso.')

        // Liberação do processo
        cy.clicarBotaoPorTexto(' Finalizar minuta ')
        cy.validarMensagemDeRetorno('Mérito salvo com sucesso.')
      })
    })
  }
)

Cypress.Commands.add('magistradoRelatorLiberaVotacaoGabineteMinutados', (orgaoJulgador) => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginAssessoresMagistrados(dados.magistradoUserRelator, dados.magistradoPwRelator).then(() => {
      // Função que aplica o filtro
      const aplicarFiltro = () => {
        cy.get(GabineteElements.listaProcessos).should('be.visible')
        cy.get(GabineteElements.btnAbrirFiltro).should('be.visible').click()
        cy.get(GabineteElements.campoOrgaoJulgador).should('be.visible').click()
        cy.get(ElementoGlobais.textoSelecionarOpcao)
          .contains(orgaoJulgador)
          .click()
        cy.clicarBotaoPorTexto(' Filtrar ')
        cy.contains(orgaoJulgador).should('be.visible')
      }

      // Função recursiva para verificar minutados ou paginar
      const verificarMinutadosOuPaginar = () => {
        cy.get('[data-test="botao-selecionar-aba-minutados"]')
          .find('span')
          .invoke('text')
          .then((text) => {
            const quantidade = parseInt(text.trim()) || 0
            Cypress.log({
              name: 'Verificando Minutados',
              message: `Quantidade de processos minutados: ${quantidade}`
            })

            if (quantidade > 0) {
              cy.log('Processos minutados encontrados. Clicando na aba...')
              cy.get('[data-test="botao-selecionar-aba-minutados"]')
                .should('be.visible')
                .click()

              cy.get('.card-processo-gabinete', { timeout: 10000 })
                .should('exist')
                .should('be.visible')

              cy.get('.card-processo-gabinete')
                .contains(' MINUTADO ')
                .first()
                .click()

              cy.clicarBotaoPorTexto(' Liberar para ')
              cy.clicarBotaoPorTexto(' Pauta ')
              cy.clicarBotaoPorTexto(' Sim, liberar processo ')
              cy.contains('Liberado para pauta')
            } else {
              cy.log('Nenhum processo minutado. Paginação necessária.')
              cy.get('[aria-label="Próxima página"]')
                .should('exist')
                .should('be.visible')
                .should('not.be.disabled')
                .as('btnProxima')

              cy.get('@btnProxima').then($btn => {
                cy.wrap($btn).click()

                cy.get('.card-processo-gabinete', { timeout: 10000 })
                  .should('exist')
                  .should('be.visible')

                verificarMinutadosOuPaginar()
              })
            }
          })
      }

      // Executa o filtro primeiro
      aplicarFiltro()

      // Depois inicia a verificação/paginação
      verificarMinutadosOuPaginar()
    })
  })
})

// Prepara voto do magistrado vogal, preliminares e mérito
Cypress.Commands.add('prepararVotoVogalPreliminarMerito', (usuario, senha, { incluirPreliminar = true, votoMerito = 'convergente' } = {}) => {
  // Login
  cy.loginPerfisSemAcessoCriarSessao(usuario, senha)
  cy.buscarSessao()

  if (incluirPreliminar) {
    // ----- Fluxo Preliminar -----
    cy.contains('Preliminar 1/1').click()
    cy.get(VotacaoElements.conteudoMerito).should('be.visible')

    cy.get(VotacaoElements.textoAcordeon).should('be.visible').eq(1).click()
    cy.contains(VotacaoElements.descricaoCard, ' Preliminar 1 de 1 ')

    cy.get(VotacaoElements.btnPrepararVoto, { timeout: 10000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click()

    cy.fixture('dadosVotacao').then((dadosVotacao) => {
      cy.get(VotacaoElements.sugestaoVoto).should('be.visible').click({ force: true })
      cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
        .should('be.visible')
        .click()
        .type(dadosVotacao.textoDeclaracaoVotoMerito)
    })

    cy.contains('Cancelar').click()
    cy.contains('As alterações na preparação do voto serão perdidas')
    cy.contains('Retornar').click()

    cy.get(VotacaoElements.btnConfirmar)
      .should('be.visible')
      .should('not.be.disabled')
      .eq(0)
      .click({ force: true })

    cy.validarMensagemDeRetorno('Voto proferido com sucesso.')
  }

  // ----- Fluxo Mérito -----
  cy.get(ProcessosElements.cardListagemProcessos).should('be.visible')
  cy.get(ProcessosElements.cardProcessos).eq(0).click()

  cy.get(VotacaoElements.textoAcordeon).contains('Mérito').click()

  cy.get(VotacaoElements.btnPrepararVoto, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click()

  if (votoMerito === 'convergente') {
    cy.contains('button', 'Convergente com o relator').should('be.visible').click()
  } else if (votoMerito === 'divergente') {
    cy.contains('button', 'Divergente do relator').should('be.visible').click()
  } else if (votoMerito === 'declarado') {
    cy.contains('button', 'Declarado voto').should('be.visible').click()
  }

  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
      .should('be.visible')
      .click()
      .type(dadosVotacao.textoDeclaracaoVotoMerito)
  })
  cy.contains('button', 'Confirmar').click()
  cy.validarMensagemDeRetorno('Voto proferido com sucesso.')
})

// Libera para pauta e votação
Cypress.Commands.add(
  'clicarSeNaoMarcadoSeguro',
  (getElementoCallback, maxRetries = 3) => {
    const tentarClicar = (tentativa = 1) => {
      getElementoCallback().then(($el) => {
        const selecionado = $el.attr('selecionado')
        const ariaPressed = $el.attr('aria-pressed')

        const estaMarcado =
          selecionado === 'true' || ariaPressed === 'true'

        if (estaMarcado) {
          cy.log('Elemento já marcado, não vai clicar.')
          return
        }

        const precisaScroll = !$el.is(':visible')

        const acao = precisaScroll
          ? cy.wrap($el).scrollIntoView({ block: 'center' })
          : cy.wrap($el)

        acao
          .should('exist')
          .click({ force: true })
          .then(() => {
            getElementoCallback().then(($elAtual) => {
              const selecionadoAtual =
                $elAtual.attr('selecionado') ||
                $elAtual.attr('aria-pressed')

              if (selecionadoAtual !== 'true') {
                if (tentativa < maxRetries) {
                  cy.log(`Tentativa ${tentativa} falhou, tentando novamente...`)
                  tentarClicar(tentativa + 1)
                } else {
                  throw new Error(
                    'Não foi possível marcar o botão após várias tentativas.'
                  )
                }
              } else {
                cy.log('Botão marcado com sucesso.')
              }
            })
          })
      })
    }

    tentarClicar()
  }
)

// Prepara processo no gabinete passando o tipo de liberação por parametro e por padrão o tipo pauta e votação antecipada
// Prepara processo no gabinete passando o tipo de liberação por parâmetro
// Padrão: Pauta e votação antecipada
Cypress.Commands.add(
  'prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro',
  (
    quantidade,
    usuario,
    senha,
    orgaoJulgador,
    tipoLiberacao = 'pauta e votação antecipada',
    segredoJustica = false
  ) => {
    cy.loginPerfisSemAcessoGabinete(usuario, senha)

    cy.wait(2000)
    cy.get('body').then(($body) => {
      const btn = $body.find('[aria-label="Última página"]:not([disabled]):not(.mat-mdc-button-disabled)')
      if (btn.length > 0) {
        cy.wrap(btn).click({ force: true })
        cy.wait(1500)
      }
    })

    cy.fixture('dadosVotacao').then((dadosVotacao) => {
      // ---------- HELPERS ----------
      const limparSeTiverTexto = ($campo) => {
        const texto = $campo.text() ? $campo.text().trim() : ''
        if (texto.length > 0) {
          cy.wrap($campo).type('{selectall}{backspace}')
        }
      }

      const gerarTextoDiferente = (base) =>
        `${base} - ${Date.now().toString().slice(-5)}`

      const aplicarFiltro = () => {
        cy.get(GabineteElements.listaProcessos, { timeout: 20000 }).should('be.visible')
        cy.get(GabineteElements.btnAbrirFiltro).should('be.visible').click()
        cy.get(GabineteElements.campoOrgaoJulgador).should('be.visible').click()
        cy.get(ElementoGlobais.textoSelecionarOpcao)
          .contains(orgaoJulgador)
          .click()
        cy.clicarBotaoPorTexto(' Filtrar ')
        cy.get(GabineteElements.listaProcessos).should('be.visible')
      }

      const paginaDisponivel = () => {
        return cy.get('body').then(($body) => {
          const $next = $body.find('[aria-label="Próxima página"]')
          return (
            $next.length > 0 &&
            $next.is(':visible') &&
            !$next.prop('disabled')
          )
        })
      }

      const prepararProcesso = (
        numeroProcesso,
        processosIgnorados = [],
        tipoLiberacaoParam = 'pauta e votação antecipada'
      ) => {
        cy.log(`Editando: ${numeroProcesso}`)

        // Aguarda tela de edição
        cy.get('.titulo-preliminar', { timeout: 30000 })
          .should('be.visible')
          .click()

        cy.get('body').then(($body) => {
          const $preliminar = $body.find('.form-preliminar-gabinete')
          const existePreliminar1 =
            $preliminar.length > 0 &&
            $preliminar.text().includes('Preliminar 1')

          if (!existePreliminar1) {
            const $semPreliminares = $body.find('.sem-preliminares.ng-star-inserted')
            if ($semPreliminares.text().includes('Adicione uma preliminar.')) {
              cy.get('[data-test="botao-nova-preliminar"]').click({ force: true })
            }
          }
        })

        cy.clicarSeNaoMarcadoSeguro(() =>
          cy.get(GabineteElements.sugestaoVotoAcolhida)
        )

        cy.get(GabineteElements.declaracaoVotoPreliminar)
          .scrollIntoView({ block: 'center' })
          .should('be.visible')
          .then(($campo) => {
            limparSeTiverTexto($campo)

            cy.wrap($campo).type(
              gerarTextoDiferente(dadosVotacao.textoDeclaracaoVotoPreliminar)
            )
          })

        cy.clicarBotaoPorTexto(' Salvar ')
        cy.validarMensagemDeRetorno('Preliminar salva com sucesso.')

        cy.get(VotacaoElements.campoTextoRelatorio)
          .should('be.visible')
          .then(($campo) => {
            // 1. Limpa o texto (sua lógica atual)
            limparSeTiverTexto($campo)

            // 2. Localiza a div de edição e remove classes de formatação/estilos inline
            cy.wrap($campo)
              .find('.ql-editor')
              .invoke('attr', 'class', 'ql-editor') // Mantém apenas a classe base, removendo 'ql-align-center', etc.
              .invoke('attr', 'style', '') // Remove estilos inline como text-align
              .invoke('html', '<p><br></p>') // Garante uma estrutura de parágrafo limpa

            // 3. Agora digita o novo texto
            cy.wrap($campo).find('.ql-editor').type('Relatório')
          })
        cy.get(GabineteElements.btnSalvar).eq(1).click({ force: true })

        cy.contains(' VOTO ').click()

        cy.clicarSeNaoMarcadoSeguro(() =>
          cy.get('button[aria-label="Conhecido e provido"]')
        )

        cy.get(VotacaoElements.campoTextoDeclaracaoVoto)
          .should('be.visible')
          .eq(1)
          .then(($campo) => {
            limparSeTiverTexto($campo)
            cy.wrap($campo).type(
              gerarTextoDiferente(dadosVotacao.textoDeclaracaoVotoMerito)
            )
          })

        cy.contains(' EMENTA ').click()

        cy.get(VotacaoElements.campoTextoEmenta)
          .should('be.visible')
          .then(($campo) => {
            limparSeTiverTexto($campo)
            cy.wrap($campo).type(
              gerarTextoDiferente(dadosVotacao.textoEmenta)
            )
          })
        cy.get(GabineteElements.btnSalvar).eq(1).click({ force: true })

        cy.assinar()
        cy.reload()

        // ---------- LIBERAÇÃO (AJUSTADO) ----------

        // Aguarda e clica no botão "Liberar para"
        cy.contains('button, a', 'Liberar para', { timeout: 20000 })
          .should('exist')
          .scrollIntoView({ block: 'center' })
          .click({ force: true })

        // Define tipo de liberação (padrão obrigatório)
        const tl = String(tipoLiberacaoParam ?? '').toLowerCase()

        let textoBotao = 'Pauta e votação antecipada' // ✅ padrão

        if (tl.includes('pauta') && !tl.includes('vot')) {
          textoBotao = 'Pauta'
        } else if (tl.includes('vot') && !tl.includes('pauta')) {
          textoBotao = 'Votação antecipada'
        }

        // Clica na opção correta
        cy.contains(textoBotao, { timeout: 20000 })
          .should('be.visible')
          .scrollIntoView({ block: 'center' })
          .click({ force: true })

        cy.clicarBotaoPorTexto(' Sim, liberar processo ', { force: true })
        cy.validarMensagemDeRetorno('Liberação feita com sucesso.')
      }

      const procurarProcessoNaPagina = (
        tentativas = 0,
        maxTentativas = 50,
        processosIgnorados = []
      ) => {
        if (tentativas >= maxTentativas) {
          throw new Error('Limite de páginas atingido.')
        }

        cy.get(GabineteElements.listaProcessos, { timeout: 20000 })
          .should('be.visible')
        cy.get(GabineteElements.cardProcessos, { timeout: 15000 })
          .should('have.length.greaterThan', 0)

        cy.get('body').then(($body) => {
          const $cards = $body.find(GabineteElements.cardProcessos)
          let numeroEncontrado = null

          $cards.each((_, card) => {
            if (numeroEncontrado) return

            const situacaoEl = card.querySelector(
              '[mattooltip="Situação do processo"]'
            )
            const textoSituacao = situacaoEl
              ? situacaoEl.innerText.trim()
              : ''

            const numero =
              card.querySelector('.numero-processo')?.innerText?.trim()

            if (textoSituacao.includes('LIBERADO PARA PAUTA E VOTAÇÃO')) return
            if (numero && processosIgnorados.includes(numero)) return

            const ehSegredo = !!card.querySelector(
              '[data-mat-icon-name="visibility_off"]'
            )

            if (segredoJustica ? ehSegredo : !ehSegredo) {
              numeroEncontrado = numero
            }
          })

          if (numeroEncontrado) {
            cy.log(`Abrindo processo: ${numeroEncontrado}`)

            cy.contains('.numero-processo', numeroEncontrado)
              .closest(GabineteElements.cardProcessos)
              .scrollIntoView({ block: 'center' })
              .within(() => {
                cy.get('a').invoke('removeAttr', 'target')
                cy.get('.numero-processo')
                  .should('be.visible')
                  .click({ force: true })
              })

            prepararProcesso(
              numeroEncontrado,
              processosIgnorados,
              tipoLiberacao
            )
          } else {
            paginaDisponivel().then((temProxima) => {
              if (temProxima) {
                cy.get('[aria-label="Próxima página"]').click()
                cy.wait(2000)
                procurarProcessoNaPagina(
                  tentativas + 1,
                  maxTentativas,
                  processosIgnorados
                )
              } else {
                throw new Error('Nenhum processo válido encontrado.')
              }
            })
          }
        })
      }

      Cypress._.times(quantidade, (index) => {
        cy.log(`--- ITERAÇÃO ${index + 1} ---`)
        aplicarFiltro()
        procurarProcessoNaPagina(0, 2000, [])
      })
    })
  }
)

Cypress.Commands.add('inteiroTeorAcordao', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserVogal1, dados.magistradoPwVogal1)
  })
  cy.buscarSessao()
  cy.get(ProcessosElements.cardProcessos, { timeout: 10000 }).eq(0).click()
  cy.contains('Inteiro teor do acórdão')
  cy.contains('Justiça Federal')
  cy.contains('Tribunal Regional Federal da 5ª Região')

  // faz o filtro e adiciona e valida mensagem retorno
  cy.get('[data-test="filtro-input-movimento"]').type('11876')
  cy.contains('.node-pai-nome', '11876 - Absolvição Sumária do art. 397-CPP')
    .realHover()
  cy.get('[data-test="botao-adicionar-movimento"]').eq(0).click()
  cy.validarMensagemDeRetorno('Movimento salvo com sucesso.')

  // limpar o filtro
  cy.get('[data-test="botao-close-Nome ou código"]').click()

  // faz o filtro e adiciona e valida mensagem retorno
  cy.get('[data-test="filtro-input-movimento"]').type('11877')
  cy.contains('.node-pai-nome', '11877 - Absolvição sumária - crimes dolosos contra a vida')
    .realHover()
  cy.get('[data-test="botao-adicionar-movimento"]').eq(0).click()
  cy.validarMensagemDeRetorno('Movimento salvo com sucesso.')

  // limpar o filtro
  cy.get('[data-test="botao-close-Nome ou código"]').click()

  // faz o filtro, adiciona movimento com tipo petição e parte, e valida mensagem retorno
  cy.get('[data-test="filtro-input-movimento"]').type('235')
  cy.contains('.node-pai-nome', '235 - Não Conhecimento de recurso')
    .realHover()
  cy.get('[data-test="botao-adicionar-movimento"]').eq(0).click()
  cy.get('[formarrayname="complementos"] app-input-select .mat-mdc-form-field')
    .click()
  cy.get('.mat-mdc-select-panel .mat-mdc-option')
    .first()
    .click()
  cy.contains('Aplicar à todas as partes').click()
  cy.clicarBotaoPorTexto('Adicionar')
  cy.validarMensagemDeRetorno('Movimento salvo com sucesso.')

  // Edita ementa e adiciona texto
  cy.contains('button', 'Editar')
    .scrollIntoView()
    .should('be.visible')
    .click()
  cy.contains('EMENTA*').click()
  cy.get('[datatest="editor-texto-ementa"]').type('Ementa automação')
  cy.contains('Salvar').click()
  cy.contains('Edição salva com sucesso.')
})

Cypress.Commands.add('finalizarPlanejamento', () => {
  // Aguarda o botão estar visível e habilitado
  cy.contains('Finalizar planejamento')
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true }) // força clique caso tenha overlays temporários

  // Aguarda a mensagem de sucesso de forma dinâmica
  cy.contains('Planejamento finalizado com sucesso.', { timeout: 15000 })
    .should('be.visible')
})
