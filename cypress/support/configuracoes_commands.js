/* global cy, Cypress  */
import { ConfiguracoesElements } from '../paginaElementos/paginaConfiguracoes'
import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais'
import { PaginaLoginElements } from '../paginaElementos/paginaLogin'

Cypress.Commands.add('configuracoesModelos', () => {
  cy.get(ElementoGlobais.btnMenu).click()
  cy.get(ConfiguracoesElements.btnConfiguracoes).should('be.visible').click()
  cy.contains('Configurações')
  cy.contains('Modelos')
  cy.get(ConfiguracoesElements.btnEditarModelos).should('be.visible').click()
  cy.contains('Modelos de documentos')
  cy.contains('Crie e personalize modelos para os seus documentos.')
  cy.get('[data-test="icone-expandir"]').eq(0).click()
  cy.contains(' ata_de_julgamento ').click()
  cy.contains('MODELO NATIVO')
  cy.get('[data-test="editor-texto-descricao"]')
    .should('contain', 'ATA Nº [INCLUIR NUMERO ATA]')
  cy.get('[data-test="editor-texto-descricao"]')
    .should('contain', '@{{tribunal_brasao}}')
  cy.get(ConfiguracoesElements.btnCriarModelo).should('be.visible').eq(0).click()
  cy.get('[data-test="editor-texto-descricao"]')
    .should('contain', 'ATA Nº [INCLUIR NUMERO ATA]')
  cy.get('[data-test="editor-texto-descricao"]').clear()
  cy.get('[data-test="editor-texto-descricao"]').click()
  cy.get('.ql-editor.ql-blank').type('Modelo de teste de automação')
  cy.contains('Salvar').click()
  cy.validarMensagemDeRetorno('Modelo salvo com sucesso.')

  cy.contains('Excluir').click()
  cy.contains('Excluir modelo')
  cy.contains('O modelo será excluído e todas as informações serão perdidas. Essa ação é irreversível. Deseja continuar?')
  cy.get(ElementoGlobais.btnConfirmar).should('be.visible').click()
  cy.validarMensagemDeRetorno('Modelo excluído com sucesso.')

  // Incluir brasão do tribunal
  cy.get('[data-test="adicionar-brasao-tribunal"]').click()
  cy.contains('Adicionar brasão do tribunal')
  cy.get('[data-test="botao-enviar-arquivo"]').click()
  cy.get(PaginaLoginElements.inputArquivoTrf5)
    .attachFile('img/trf5.jpeg')
  cy.contains('button', /^ Adicionar brasão $/).click()

  // Excluir brasão do tribunal
  cy.get('.botao-remover-brasao').click()
  cy.contains('Excluir brasão')
  cy.clicarBotaoPorTexto('Excluir')
})
Cypress.Commands.add('configuracaoHierarquiaOrgaosTribunal', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginAdminstradorTribunal(dados.administradorUserCnj, dados.administradorPwCnj)

    cy.get(ConfiguracoesElements.selecionarTribunal, { timeout: 12000 })
      .should('be.visible')
      .click()
    cy.contains('Tribunal de Justiça do Estado de Mato Grosso').click()
    cy.get(ConfiguracoesElements.btnAtualizarLista).should('be.visible')
    cy.get(ConfiguracoesElements.btnAtualizarLista, { timeout: 10000 }).first().click()
    cy.get(ConfiguracoesElements.checkboxColegiado, { timeout: 10000 })
      .first()
      .then(($checkbox) => {
        if (!$checkbox.prop('checked')) {
          cy.wrap($checkbox).click()
        } else {
          cy.log('Checkbox já está selecionado')
        }
      })
    cy.get('[data-test="botao-continuar"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click()

    cy.validarMensagemDeRetorno('Indicação de colegiado bem sucedida!')
    cy.clicarBotaoPorTexto(' Adicionar órgão julgador ')

    cy.contains(' Órgão julgador ').click()

    cy.get('[data-test="input-autocomplete-orgao-julgador"]').then(($campo) => {
      const textoAtual = $campo.text().trim() || $campo.val()

      if (!textoAtual || textoAtual === 'Selecione o órgão julgador') {
      // Nada selecionado -> abre o autocomplete
        cy.wrap($campo).click().focused()

        // Aguarda as opções ficarem visíveis e seleciona a primeira
        cy.get('mat-option', { timeout: 10000 })
          .should('be.visible')
          .first()
          .click()
      } else {
        cy.log('Já existe um órgão julgador selecionado: ' + textoAtual)
      }
    })
    cy.get('[data-test="input-autocomplete-magistrado-titular"]').then(($campo) => {
      const textoAtual = ($campo.val() || $campo.text()).toString().trim()

      if (!textoAtual || textoAtual === 'Magistrado titular') {
      // Força o clique no input
        cy.wrap($campo).click({ force: true })

        // Seleciona a primeira opção visível
        cy.get('mat-option', { timeout: 10000 })
          .should('be.visible')
          .first()
          .click()
      } else {
        cy.log('Já existe magistrado titular selecionado: ' + textoAtual)
      }
    })
    // Função para gerar data atual no formato dd/MM/yyyy
    const hoje = () => {
      const data = new Date()
      const dia = String(data.getDate()).padStart(2, '0')
      const mes = String(data.getMonth() + 1).padStart(2, '0') // meses começam do 0
      const ano = data.getFullYear()
      return `${dia}/${mes}/${ano}`
    }

    cy.get('[formcontrolname="dataPosse"]').find('input').then(($input) => {
      const valorAtual = $input.val() || $input.text().trim()

      if (!valorAtual || valorAtual.toLowerCase() === 'posse') {
        cy.wrap($input)
          .clear({ force: true })
          .type(hoje(), { force: true })
      } else {
        cy.log('Já existe uma data preenchida: ' + valorAtual)
      }
    })
    cy.contains('Integrantes do órgão julgador').click()
    cy.clicarBotaoPorTexto(' Adicionar integrante ')
    cy.contains('Perfil').click()
    cy.get(ElementoGlobais.textoSelecionarOpcao).contains(' Magistrado ').click()
    cy.get(ConfiguracoesElements.selecionarMagistrado).should('be.visible').eq(1).click()
    cy.get(ElementoGlobais.textoSelecionarOpcao).last().click()
    cy.get(ConfiguracoesElements.btnAdcionarIntegrante).should('be.visible').click()
    cy.validarMensagemDeRetorno('Colegiados salvos com sucesso!')

    cy.get(ConfiguracoesElements.btnExcluirOrgaoJulgador).should('be.visible').scrollIntoView().click()
    cy.validarMensagemDeRetorno('Colegiados salvos com sucesso!')
    cy.clicarBotaoPorTexto(' Retornar ')

    cy.get(ConfiguracoesElements.checkboxColegiado, { timeout: 10000 }).first().click()
    cy.contains('button', 'Salvar configurações').scrollIntoView().should('be.visible').click()
  })
})

Cypress.Commands.add('hierarquiaOrgaos', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.administradorUserCnj, dados.administradorPwCnj)
  })
  cy.get(ConfiguracoesElements.btnConfiguracoes).should('be.visible').click()
  cy.get(ConfiguracoesElements.btnHierarquiaOrgaos).should('be.visible').click()
  cy.contains('Hierarquia de órgãos')
  cy.contains('Importação')
  cy.contains('Tribunal').click()
  cy.contains('Tribunal de Justiça do Estado de Mato Grosso').click()
  cy.get(ConfiguracoesElements.selecaoTribunal).should('be.visible')
  cy.get(ConfiguracoesElements.btnAtualizarLista, { timeout: 10000 }).first().click()
  cy.get(ConfiguracoesElements.checkAtivo).should('be.visible').eq(2).click()
  cy.get(ConfiguracoesElements.btnAtualizarLista, { timeout: 10000 }).last().click()
  cy.get(ConfiguracoesElements.listaColegiados).should('be.visible')
  cy.get(ConfiguracoesElements.btnSalvarConfiguracoes).should('exist').click()
  cy.contains('Configuração salva com sucesso.', { timeout: 12000 })
    .should('be.visible')
})

// Cria modelo conforme posição informada que representa o modelo
Cypress.Commands.add('criarModelo', (posicaoBotao = 4) => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(
      dados.magistradoUserRelator,
      dados.magistradoPwRelator
    )
  })

  cy.get(ElementoGlobais.btnMenu).click()
  cy.get(ConfiguracoesElements.btnConfiguracoes).should('be.visible').click()
  cy.get(ConfiguracoesElements.btnEditarModelos).click()

  cy.get('[data-test="botao-criar-modelo"]')
    .eq(posicaoBotao)
    .should('be.visible')
    .click()
  cy.get('[data-test="editor-texto-descricao"]')
    .clear()
    .type('Modelo de teste editado')
  cy.contains('Salvar').click()
  cy.validarMensagemDeRetorno('Modelo salvo com sucesso.')
  cy.contains('Excluir').click()
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Modelo excluído com sucesso.')
})
