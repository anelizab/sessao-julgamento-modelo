/* global cy, Cypress, expect  */
import { ComposicaoElements } from '../paginaElementos/paginaComposicao'
import { CriarSesaoElements } from '../paginaElementos/paginaCriarSessao'
import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais'
import { PautarSessaoElements } from '../paginaElementos/paginaPautarSessao'
import { PaginaLoginElements } from '../paginaElementos/paginaLogin'
import { ProcessosElements } from '../paginaElementos/paginaProcessos'
import EnviarProcessoIntegracaoApi, { COLEGIADOS, ORGAOS_JULGADORES, TRIBUNAIS } from '../e2e/api/enviarProcessoIntegracaoApi'

// MSDJ-9 - Apresentar filtros de processos [SP7]
Cypress.Commands.add('apresentarFiltrosProcessosUsuarioDeslogado', () => {
  // não deve aprensentar botões para usuáro público
  cy.get(ProcessosElements.btnResultadoJulgamento).should('not.exist')
  cy.get(ProcessosElements.btnFinalizarManualmente).should('not.exist')

  cy.get(ProcessosElements.btnOpcoesBusca).should('be.visible').click()
  cy.get(ProcessosElements.opcoesBusca)
    .should('be.visible')
    .then(($element) => {
      const text = $element.text()
      expect(text).to.include('Número do processo')
      expect(text).to.include('Nome da parte')
      expect(text).to.include('CPF/CNPJ da parte')
      cy.contains('Número do processo').click()
      cy.get(ProcessosElements.numeroProcessoCampoBusca)
        .should('be.visible')
        .and('contain', 'Número do processo')

      cy.get(ProcessosElements.btnOpcoesBusca).should('be.visible').click()
      cy.contains('Nome da parte').click()
      cy.get(ProcessosElements.nomeDaParte)
        .should('be.visible')
        .and('contain', 'Nome da parte')

      cy.get(ProcessosElements.btnOpcoesBusca).should('be.visible').click()
      cy.contains('CPF/CNPJ da parte').click()
      cy.get(ProcessosElements.cpfCnpjDaParte)
        .should('be.visible')
        .and('contain', 'CPF/CNPJ')
    })
})

// MSDJ-11 - Visualizar cabeçalho da sessão de julgamento [SP7]
Cypress.Commands.add('visualizarCabecalhoSessaoJulgamento', () => {
  cy.fluxoGabineteSessaoCompleto(1)
  cy.finalizarPlanejamento()
  cy.buscarSessao()

  // valida perfil do usuário
  cy.get(PaginaLoginElements.avatar).should('be.visible').click()
  cy.contains('Secretário de sessão')
})

// MSDJ-26 Apresentar ações em lote [SP7]
Cypress.Commands.add('validarApresentacaoLoteUserSecretario', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.fluxoGabineteSessaoCompleto(1, ['PRIMEIRA SEÇÃO'], false)
    cy.iniciarSessao()
  })
  cy.get(ProcessosElements.cardListagemProcessos).should('be.visible')
  cy.get(ProcessosElements.checkSelecionarTodosProcessos).should('be.visible')
  cy.wait(500)
  cy.get(ProcessosElements.checkSelecionarTodosProcessos).should('be.visible').click()
  cy.get(ProcessosElements.btnAcoesEmLote).realHover()
  cy.contains('Indisponível para sessão não finalizada.')
  cy.get(ProcessosElements.checkSelecionarTodosProcessos).should('be.visible').click()
  cy.contains('Selecionar todos')
  cy.get('[data-test="botao-adicionar-sessao-julgamento"]')
    .should('exist')
    .and('be.disabled')
})

// MSDJ-58 Retirar processo de julgamento [SP8]
Cypress.Commands.add('retirarProcessoDeJulgamentoSecretarioSessao', () => {
  cy.loginSecretarioSessao()
  cy.buscarSessao()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()

  // validar se as opções do menu estão disponiveis e clicaveis
  const opcoesEsperadasMenu = [
    'Upload de sustentação',
    'Consultar processo',
    'Retirar de julgamento',
    'Pedir vistas',
    'Adiar',
    'Destacar',
    'Etiquetas'
  ]

  cy.get(ProcessosElements.opcoesMenuProcessos)
    .find('button')
    .should('have.length', opcoesEsperadasMenu.length)
    .each(($el, index) => {
      cy.wrap($el)
        .should('not.be.disabled') // Verifica se o botão está habilitado
        .invoke('text')
        .then((textoOpcao) => {
          expect(textoOpcao.trim()).to.equal(opcoesEsperadasMenu[index]) // Verifica o texto
        })
    })

  cy.contains('Retirar de julgamento ').click()
  cy.get(ProcessosElements.btnCancelarRetirarProcesso).should('be.visible')
  cy.contains('Retirar processo')
  cy.contains('Adicione abaixo o motivo para a retirada do processo na pauta.')
  cy.get(ProcessosElements.motivoRetirada).type('Este processo foi retirado da pauta devido à solicitação de adiamento feita pela parte interessada.')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Processo retirado com sucesso.')

  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  // validar se as opções do menu estão disponiveis e clicaveis após retirada
  const opcoesEsperadasAposRetiradaJulgamento = [
    'Consultar processo',
    'Reverter retirada',
    'Etiquetas'
  ]

  cy.get(ProcessosElements.opcoesMenuProcessos)
    .find('button:not(:disabled)')
    .should('have.length', opcoesEsperadasAposRetiradaJulgamento.length)
    .each(($el, index) => {
      cy.wrap($el)
        .invoke('text')
        .then((textoOpcao) => {
          expect(textoOpcao.trim()).to.equal(opcoesEsperadasAposRetiradaJulgamento[index])
        })
    })
})
// MSDJ-58 Retirar processo de julgamento [SP8]
Cypress.Commands.add('retirarProcessoDeJulgamentoMagistradoRelator', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.buscarSessao()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()

  cy.contains('Retirar de julgamento ').click()
  cy.get(ProcessosElements.btnCancelarRetirarProcesso).should('be.visible')
  cy.contains('Retirar processo')
  cy.contains('Adicione abaixo o motivo para a retirada do processo na pauta.')
  cy.get(ProcessosElements.motivoRetirada).type('Este processo foi retirado da pauta devido à solicitação de adiamento feita pela parte interessada.')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Processo retirado com sucesso.')

  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()

  // validar se as opções do menu estão disponiveis e clicaveis após retirada
  const opcoesEsperadasAposRetiradaJulgamento = [
    'Consultar processo',
    'Reverter retirada',
    'Etiquetas'
  ]

  cy.get(ProcessosElements.opcoesMenuProcessos)
    .find('button:not(:disabled)')
    .should('have.length', opcoesEsperadasAposRetiradaJulgamento.length)
    .each(($el, index) => {
      cy.wrap($el)
        .invoke('text')
        .then((textoOpcao) => {
          expect(textoOpcao.trim()).to.equal(opcoesEsperadasAposRetiradaJulgamento[index])
        })
    })
  cy.validarStatusProcesso(' Retirado ')
  cy.get(ProcessosElements.justicativaCardProcesso).realHover()
  cy.contains('Este processo foi retirado da pauta devido à solicitação de adiamento feita pela parte interessada.')
})
// MSDJ-59 Solicitar destaque do processo [SP8]
Cypress.Commands.add('solicitarDestaqueSecretarioSessao', () => {
  cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
    cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
      1,
      dadosUsuarios.magistradoUserRelator,
      dadosUsuarios.magistradoPwRelator,
      'PRIMEIRA SEÇÃO', true
    )
  })
  cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], true)
  cy.iniciarSessao()

  cy.get(ProcessosElements.cardProcessos).should('be.visible').click()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Destacar').click()
  cy.contains('Destacar processo')
  cy.contains('Selecione o magistrado e adicione abaixo o motivo para destacar o processo na pauta.')
  cy.get(ProcessosElements.campoMagistrado).should('be.visible').click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.get(ProcessosElements.campoTextoDestacar).type('O processo foi identificado como de alta prioridade devido a uma ordem judicial.')
  cy.contains('Cancelar')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Processo destacado com sucesso.')
  cy.contains('Processo destacado com sucesso.').should('not.exist')
  cy.validarStatusProcesso(' Destacado ')
  cy.get(ProcessosElements.justicativaCardProcesso).realHover()
  cy.contains('O processo foi identificado como de alta prioridade devido a uma ordem judicial.')
})

// MSDJ-59 Solicitar destaque do processo [SP8]
Cypress.Commands.add('solicitarDestaqueMagistrado', () => {
  cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
    cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
      1,
      dadosUsuarios.magistradoUserRelator,
      dadosUsuarios.magistradoPwRelator,
      'PRIMEIRA SEÇÃO', false
    )
  })
  cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
  cy.iniciarSessao()
  cy.logout()
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.buscarSessao()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Destacar').click()
  cy.contains('Destacar processo')
  cy.contains('Para destacar o processo selecionado, preencha o campo abaixo:')
  cy.get(ProcessosElements.campoTextoDestacar).type('O processo foi identificado como de alta prioridade devido a uma ordem judicial.')
  cy.contains('Cancelar')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Processo destacado com sucesso.')
  cy.contains('Processo destacado com sucesso.').should('not.exist')
  cy.validarStatusProcesso(' Destacado ')
  cy.get(ProcessosElements.justicativaCardProcesso).realHover()
  cy.contains('O processo foi identificado como de alta prioridade devido a uma ordem judicial.')
})

// MSDJ-57 Pedir vistas / pedir adiamento do processo
Cypress.Commands.add('pedirVistasSecretarioSessao', () => {
  cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
    cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
      1,
      dadosUsuarios.magistradoUserRelator,
      dadosUsuarios.magistradoPwRelator,
      'PRIMEIRA SEÇÃO', false
    )
  })
  cy.logout()
  cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
  cy.iniciarSessao()
  cy.get(ProcessosElements.cardProcessos).should('be.visible').click()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Pedir vistas').click()
  cy.contains('Pedir vistas')
  cy.contains('Selecione o magistrado correspondente ao pedido de vistas do processo.')
  cy.get(ProcessosElements.campoMagistrado).should('be.visible').click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.contains('Cancelar')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Pedido de vistas realizado com sucesso.')
  cy.validarStatusProcesso(' Vistas ')
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Consultar processo').should('be.enabled')
  cy.contains('Retirar de julgamento').should('be.disabled')
  cy.contains('Adiar').should('be.disabled')
  cy.contains('Destacar').should('be.disabled')
  cy.contains('Reverter vistas').click()
  cy.validarMensagemDeRetorno('Reversão de pedido de vistas realizada com sucesso.')
  cy.contains('VISTAS').should('not.exist')
})
// MSDJ-57 Pedir vistas / pedir adiamento do processo - passando por parametro false n reverte o pedido de adiamento - logo true e reverte
Cypress.Commands.add('pedirAdiamentoSecretarioSessao', (deveReverter = false) => {
  cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
    cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
      1,
      dadosUsuarios.magistradoUserRelator,
      dadosUsuarios.magistradoPwRelator,
      'PRIMEIRA SEÇÃO',
      false
    )
  })

  cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
  cy.iniciarSessao()
  cy.get(ProcessosElements.cardProcessos).should('be.visible').click()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Adiar').click()
  cy.contains('Adiar processo')
  cy.get(ProcessosElements.textoConfirmacao).should('be.visible')
  cy.contains('Cancelar')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Pedido de adiamento realizado com sucesso.')
  cy.validarStatusProcesso(' Adiado ')
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Consultar processo').should('be.enabled')
  cy.contains('Retirar de julgamento').should('be.disabled')
  cy.contains('Pedir vistas').should('be.disabled')
  cy.contains('Destacar').should('be.disabled')

  if (deveReverter) {
    cy.contains('Reverter adiamento', { timeout: 0 }).then($btn => {
      if ($btn.length > 0) {
        cy.wrap($btn).click()
        cy.validarMensagemDeRetorno('Reversão de adiamento realizado com sucesso.')
        cy.contains('ADIADO').should('not.exist')
      } else {
        cy.log('Botão "Reverter adiamento" não encontrado.')
      }
    })
  } else {
    cy.log('Parâmetro indica que não deve reverter, seguindo fluxo sem clicar.')
  }
})

// MSDJ-57 Pedir vistas / pedir adiamento do processo
Cypress.Commands.add('pedirVistasMagistrado', () => {
  cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
    cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
      1,
      dadosUsuarios.magistradoUserRelator,
      dadosUsuarios.magistradoPwRelator,
      'PRIMEIRA SEÇÃO', false
    )
  })
  cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
  cy.iniciarSessao()
  cy.get(ProcessosElements.cardProcessos).should('be.visible').click()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Pedir vistas').click()
  cy.contains('Pedir vistas')
  cy.get(ProcessosElements.campoMagistrado).should('be.visible').click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.contains('Cancelar')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Pedido de vistas realizado com sucesso.')
  cy.validarStatusProcesso(' Vistas ')
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Consultar processo').should('be.enabled')
  cy.contains('Destacar').should('be.disabled')
  cy.contains('Reverter vistas').click()
  cy.validarMensagemDeRetorno('Reversão de pedido de vistas realizada com sucesso.')
  cy.contains('VISTAS').should('not.exist')
})
// MSDJ-57 Pedir vistas / pedir adiamento do processo
Cypress.Commands.add('pedirAdiamentoMagistrado', () => {
  cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
    cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
      1,
      dadosUsuarios.magistradoUserRelator,
      dadosUsuarios.magistradoPwRelator,
      'PRIMEIRA SEÇÃO', false
    )
  })
  cy.prepararProcessosSessao(1, ['PRIMEIRA SEÇÃO'], false)
  cy.iniciarSessao()
  cy.get(ProcessosElements.cardProcessos).should('be.visible').click()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Adiar').click()
  cy.contains('Adiar processo')
  cy.get(ProcessosElements.textoConfirmacao).should('be.visible')
  cy.contains('Cancelar')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Pedido de adiamento realizado com sucesso.')
  cy.validarStatusProcesso(' Adiado ')
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Consultar processo').should('be.enabled')
  cy.contains('Retirar de julgamento').should('be.disabled')
  cy.contains('Destacar').should('be.disabled')
  cy.contains('Reverter adiamento').click()
  cy.validarMensagemDeRetorno('Reversão de adiamento realizado com sucesso.')
  cy.contains('ADIADO').should('not.exist')
})

Cypress.Commands.add('executarFiltrosProcessosLogado', () => {
  // Captura e armazena o número do processo
  cy.get(ProcessosElements.cabecalhoProcesso)
    .invoke('text')
    .then((numeroProcesso) => {
      cy.wrap(numeroProcesso.trim()).as('numeroProcesso') // Armazena como um alias
    })

  cy.get(ProcessosElements.btnModalFiltroProcessos).should('be.visible').click()

  // Recupera o número do processo armazenado e usa no campo de filtro
  cy.get('@numeroProcesso').then((num) => {
    cy.get(ProcessosElements.numeroProcessoModal).should('be.visible').type(num)
  })
  cy.get(ProcessosElements.btnFiltrar).should('be.visible').click()

  cy.get(ProcessosElements.badgeFiltroAplicado)
    .should('be.visible')
    .invoke('text')
    .then((badgeCount) => {
      expect(parseInt(badgeCount.trim())).to.be.greaterThan(0) // Garante que há notificações
    })
  cy.get(ProcessosElements.cabecalhoProcesso).should('be.visible')

  // Pesquisa sem retorno user logado
  cy.get(ProcessosElements.btnModalFiltroProcessos).should('be.visible').click()
  cy.get(ProcessosElements.numeroProcessoModal).should('be.visible').type('99999999999999999999')
  cy.get(ProcessosElements.btnFiltrar).should('be.visible').click()
  cy.contains('Não foram encontrados processos correspondentes ao filtro aplicado.')
})

Cypress.Commands.add('executarFiltrosProcessosPublico', () => {
  cy.logout()
  cy.loginAcessoPublico()
  cy.buscarSessao()
  // Captura e armazena o número do processo
  cy.get(ProcessosElements.cabecalhoProcesso)
    .invoke('text')
    .then((numeroProcesso) => {
      cy.wrap(numeroProcesso.trim()).as('numeroProcesso') // Armazena como um alias
    })
  cy.get(ProcessosElements.btnOpcoesBusca).should('be.visible').click()
  cy.contains('Número do processo').click()
  cy.get('@numeroProcesso').then((num) => {
    cy.get(ProcessosElements.camposBusca).should('be.visible').type(num)
  })
  cy.get(ProcessosElements.btnLupa).should('be.visible').click()
  cy.get(ProcessosElements.cabecalhoProcesso).should('be.visible')

  // Pesquisa sem retorno user público
  cy.get(ProcessosElements.btnLimparBusca)
  cy.get(ProcessosElements.camposBusca).should('be.visible').type('9999999999999999999999')
  cy.get(ProcessosElements.btnLupa).should('be.visible').click()
  cy.contains('Não foram encontrados processos correspondentes ao filtro aplicado.')
})

Cypress.Commands.add('uploadSustentacao', () => {
  cy.buscarSessao()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Upload de sustentação ').click()
  cy.contains(' Upload de sustentação ')
  cy.contains('Para fazer upload do seu arquivo, siga as etapas abaixo:')
  cy.get(PaginaLoginElements.inputArquivo)
    .attachFile('img/avatar.jpeg')
  cy.contains('Arquivo inválido: são aceitos arquivos com as seguintes extensões:')
  cy.get(PaginaLoginElements.inputArquivo)
    .attachFile('audio/valido.mp3')
  cy.get(ProcessosElements.representanteSustentacao).click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.contains(ProcessosElements.btnEnviarSustentacao, 'Enviar').click()
  cy.validarMensagemDeRetorno('Enviando arquivo.')
  cy.validarMensagemDeRetorno('Upload de sustentação concluído com sucesso.')
})
// MSDJ-68 Gerar e apresentar alertas para cenários conhecidos
Cypress.Commands.add('limparNotificaçaoMagistrado', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.get(ProcessosElements.btnNotificacoes).should('be.visible').click()
  cy.contains('NOTIFICAÇÕES')
  cy.get(ProcessosElements.btnAcoesNotificacao).should('be.visible').click()
  cy.get(ProcessosElements.btnLimparNotificacao).then($btn => {
    if ($btn.is(':visible') && !$btn.is(':disabled')) {
      cy.wrap($btn).click()
      cy.clicarBotaoPorTexto('Limpar todas')

      if (ProcessosElements.btnConfirmar) {
        cy.get(ProcessosElements.btnConfirmar, { timeout: 10000 })
          .should('be.visible')
          .click()
      } else {
        cy.log('Seletor "btnConfirmar" não está definido. Pulando clique.')
      }

      // Valida apenas se tentou limpar notificações
      cy.contains('Notificações limpas com sucesso', { timeout: 10000 })
        .should('be.visible')
    } else {
      // Se o botão não estiver visível ou estiver desabilitado, assume que não há notificações
      cy.log('Nenhuma notificação disponível para limpar. Nada será validado.')
    }
  })
})
// MSDJ-68 Gerar e apresentar alertas para cenários conhecidos
Cypress.Commands.add('pedirAdiamentoSecretarioSessaoSemReversao', () => {
  cy.loginSecretarioSessao()
  cy.buscarSessao()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Adiar').click()
  cy.contains('Adiar processo')
  cy.get(ProcessosElements.textoConfirmacao).should('be.visible')
  cy.contains('Cancelar')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Pedido de adiamento realizado com sucesso.')
  cy.validarStatusProcesso(' Adiado ')
})
// MSDJ-68 Gerar e apresentar alertas para cenários conhecidos
Cypress.Commands.add('validarNotificaçaoMagistrado', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.buscarSessao()
  cy.get(ProcessosElements.btnNotificacoes).should('be.visible').click()
  cy.contains('NOTIFICAÇÕES')
  cy.contains('pediu adiamento').click()
  cy.get(ProcessosElements.cardProcessos).should('be.visible')
  cy.get(ProcessosElements.cardProcessos).eq(0).click()
  cy.validarStatusProcesso(' Adiado ')
})
// MSDJ-68 Gerar e apresentar alertas para cenários conhecidos
Cypress.Commands.add('visualizarHistoricoNotificaçaoMagistrado', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.buscarSessao()
  cy.contains(ProcessosElements.contadorNotificacoes, '+1')
  cy.get(ProcessosElements.btnNotificacoes).should('be.visible').click()
  cy.contains('NOTIFICAÇÕES')
  cy.get(ProcessosElements.btnAcoesNotificacao).should('be.visible').click()
  // cy.get('[data-test="botao-historico"]').eq(0).click({ force: true });

  cy.get(ProcessosElements.btnHistoricoNotificacao).should('be.visible').eq(0).click({ force: true })
  cy.contains('pediu adiamento').click()
  cy.get(ProcessosElements.cardProcessos).should('be.visible')
  cy.get(ProcessosElements.cardProcessos).eq(0).click()
  cy.validarStatusProcesso(' Adiado ')
})

// MSDJ-68 Gerar e apresentar alertas para cenários conhecidos
Cypress.Commands.add('reversaoPedidoadiamentoSecretarioSessao', () => {
  cy.loginSecretarioSessao()
  cy.buscarSessao()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Reverter adiamento').click()
  cy.validarMensagemDeRetorno('Reversão de adiamento realizado com sucesso.')
  cy.contains('ADIADO').should('not.exist')
})
// MSDJ-68 Gerar e apresentar alertas para cenários conhecidos
Cypress.Commands.add('marcarNotificacaoComoLida', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.buscarSessao()
  cy.get(ProcessosElements.btnNotificacoes).should('be.visible').click()
  cy.contains('NOTIFICAÇÕES')
  cy.get(ProcessosElements.btnAcoesNotificacao).should('be.visible').click()
  cy.get(ProcessosElements.btnMarcarTodasLidas).should('be.visible').click()
  cy.contains('Marcar todas as notificações como lidas')
  cy.contains('button', 'Marcar todas')
    .should('be.visible')
    .click()
})
// MSDJ-52 Realizar download da sustentação oral
Cypress.Commands.add('downloadSustentacaoOral', () => {
  cy.uploadSustentacao()
  cy.contains('Sustentações orais e questões de ordem')
  cy.contains('PARTE:')
  cy.contains('Arquivos')
  cy.get('[mattooltip="Nome e tamanho do arquivo"]')
    .eq(0)
    .trigger('mouseover')
  cy.contains('Nome e tamanho do arquivo')
  cy.get(ProcessosElements.btnBaixarArquivo)
    .eq(0)
    .trigger('mouseover')
  cy.contains('Baixar arquivo')
  cy.get(ProcessosElements.btnExcluirArqivo)
    .eq(0)
    .trigger('mouseover')
  cy.contains('Excluir')
  cy.get(ProcessosElements.btnExcluirArqivo)
    .eq(0)
    .click()
  cy.contains('Tem certeza que deseja excluir o arquivo?')
  cy.get(ElementoGlobais.btnConfirmar).should('be.visible').click()
  cy.validarMensagemDeRetorno('Arquivo excluído com sucesso.')
})
// MSDJ-39 Criar / desvincular etiquetas
Cypress.Commands.add('criarEtiquetas', () => {
  cy.buscarSessao()
  cy.get(ProcessosElements.cardListagemProcessos).should('be.visible')
  cy.get(ProcessosElements.cardProcessos).eq(0).click()
  cy.get('[data-mat-icon-name="menu"]').click()
  cy.contains('Etiquetas', { timeout: 10000 }) // espera até 10s
    .should('be.visible')
    .should('not.be.disabled')
    .click()
  cy.contains('Clique em uma etiqueta para trocar a cor.')
  cy.contains('Clique na área de etiquetas para incluir novas.')

  cy.get(ProcessosElements.novaEtiqueta).click().type('Etiqueta teste').type('{enter}')
  cy.contains('Salvar etiquetas').click()
  // Alterar cor etiqueta
  cy.get('[data-mat-icon-name="menu"]').click()
  cy.get('[data-test="botao-gerenciar-etiquetas"]', { timeout: 8000 }).click()
  cy.get('[mattooltip="Etiquetas nativas não podem ser alteradas"]').click()
  cy.get('[data-test="selecionar-cor-#FFEDE4"]').click()
  cy.get(ProcessosElements.btnSalvarEtiquetas).should('be.visible').click()
  cy.validarMensagemDeRetorno('Etiquetas salvas com sucesso!')
  // Excluir etiquetas
  cy.get('[data-mat-icon-name="menu"]').click()
  cy.get('[data-test="botao-gerenciar-etiquetas"]', { timeout: 8000 }).click()
  cy.get('[aria-label="Remover etiqueta Etiqueta teste"]').click()
  cy.get(ProcessosElements.btnSalvarEtiquetas).should('be.visible').click()
  cy.validarMensagemDeRetorno('Etiquetas salvas com sucesso!')
})

Cypress.Commands.add('executarAcoesEmLoteAssessorRelatorConfirmarMinuta', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoCriarSessao(dados.assessorPwRelator, dados.assessorPwRelator)
  })
  cy.buscarSessao()
  cy.get(ProcessosElements.checkSelecionarTodosProcessos).should('be.visible').click()
  cy.clicarBotaoPorTexto(' Ações em lote ')
  cy.get(ProcessosElements.opcoesAcoes).contains('Confirmar minuta').click()
  cy.contains('Confirmar minuta - em lote')
  cy.contains('1 processo total')
  cy.clicarBotaoPorTexto(' Confirmar minuta de 1 processo ')
  cy.validarMensagemDeRetorno('Minuta confirmada para 1 processo')
  cy.get(ElementoGlobais.btnConfirmar).should('be.visible').click()
  cy.validarMensagemDeRetorno('1 votação liberada com sucesso')
  cy.clicarBotaoPorTexto(' Ações em lote ')
  cy.get(ProcessosElements.opcoesBusca).should('not.be.disabled')
})

Cypress.Commands.add('adicionarProcessosNaPauta', (indices) => {
  if (!Array.isArray(indices)) {
    throw new Error('O parâmetro deve ser um array de índices dos processos a serem adicionados.')
  }

  indices.forEach((index, i) => {
    cy.wait(i === 0 ? 0 : 500)

    cy.get(PautarSessaoElements.checkProcessos)
      .eq(index)
      .scrollIntoView()
      .check({ force: true })
  })
})
// Prepara processo passando apenas a quandidade
Cypress.Commands.add(
  'prepararProcessosVotacaoMultiplosProcessos',
  (quantidade = 3) => { // quantidade default = 3 se não passar nada
    cy.loginSecretarioSessao()
    cy.contains('Colegiado alterado com sucesso!').should('not.exist')
    cy.criarSessao()

    // Captura o número da sessão e armazena como variável de ambiente
    cy.get(CriarSesaoElements.cabecalhoSessao)
      .invoke('text')
      .then((numeroSessao) => {
        const numeroExtraido = numeroSessao.match(/\d+/)[0]
        const sessaoComPrefixo = `Sessão Nº ${numeroExtraido}`
        Cypress.env('sessaoComPrefixo', sessaoComPrefixo)
      })

    // Abre a aba de pauta
    cy.get(PautarSessaoElements.abaPauta)
      .should('be.visible')
      .click()

    // Valida estado inicial da tela
    cy.contains('button', 'Salvar cadastro').should('be.disabled')
    cy.contains('Passo 1: Selecione os processos')

    // Seleciona relatoria
    cy.intercept('GET', '**/processos/pautar/disponiveis**').as('pautaDisponiveis')
    cy.get(ComposicaoElements.campoSelecaoOrgaoJulgador)
      .eq(0)
      .click()

    cy.get(ElementoGlobais.textoSelecionarOpcao)
      .contains('SEGUNDA SEÇÃO')
      .click()

    // gera dinamicamente os processos [1, 2, ..., quantidade]
    const processos = Array.from({ length: quantidade }, (_, i) => i + 1)
    cy.adicionarProcessosNaPauta(processos)

    cy.get(PautarSessaoElements.btnAdicionarNaPauta)
      .should('be.visible')
      .click()

    cy.validarMensagemDeRetorno('Pauta alterada com sucesso.')
  }
)

Cypress.Commands.add('capturarNumeroProcessoCard', () => {
  cy.get('div.numero-processo h4')
    .invoke('text')
    .then((numeroProcesso) => {
      const numeroProcessoTrimmed = numeroProcesso.trim()

      cy.get(ProcessosElements.numeroProcessoCard)
        .invoke('text')
        .then((textoAlvo) => {
          const textoNormalizado = textoAlvo.replace(/\s+/g, ' ').trim()
          const numeroNormalizado = numeroProcessoTrimmed.replace(/\s+/g, ' ').trim()

          expect(textoNormalizado).to.include(numeroNormalizado)
        })
    })
})

// Enviar processos, insere processos gabinete e cria sessão
Cypress.Commands.add('fluxoGabineteSessaoCompleto', (quantidadeProcessos = 1) => {
  // Pula login
  Cypress.env('skipLogin', true)

  // Envia os processos pela API
  cy.wrap(null).then(() =>
    EnviarProcessoIntegracaoApi.enviarMultiplosProcessos(
      1,
      false,
      ORGAOS_JULGADORES.primeiraSecao,
      TRIBUNAIS.trf5,
      COLEGIADOS.divisao5Turma
    )
  )
  // Inclui processos e prepara relator
  cy.fixture('dadosUsuarios').then((dadosUsuarios) => {
    cy.prepararVotoRelatorGabineteProcessoTipoLiberacaoParametro(
      quantidadeProcessos,
      dadosUsuarios.magistradoUserRelator,
      dadosUsuarios.magistradoPwRelator,
      'PRIMEIRA SEÇÃO',
      false
    )
  })
  cy.prepararProcessosSessao(quantidadeProcessos, ['PRIMEIRA SEÇÃO'], false)
})

Cypress.Commands.add('prioridadeProcessuais', () => {
  cy.get('.icone-prioritario.ng-star-inserted')
    .first()
    .should('be.visible')
    .trigger('mouseover')
    .trigger('mouseenter')

  cy.contains('body', 'Prioridades', { timeout: 10000 })
    .should('be.visible')
})

Cypress.Commands.add('criarAta', () => {
  cy.loginSecretarioSessao()
  cy.buscarSessaoSemClicarNoProcesso()
  cy.contains('Criar ata').click()
  cy.contains('Ata da sessão de julgamento criada com sucesso.')
  cy.contains('Excluir modelo de ata').click()
  cy.contains('Excluir ata da sessão de julgamento')
  cy.get('[data-test="botao-confirmar"]').click()
  cy.validarMensagemDeRetorno('Ata da sessão excluída com sucesso.')
})

Cypress.Commands.add('clicarCopiarNumeroProcessoCard', () => {
  cy.loginSecretarioSessao()
  cy.buscarSessao()

  cy.get('[data-test="copiar-numero-processo"]')
    .eq(1)
    .invoke('text')
    .then((numeroProcesso) => {
      const numeroLimpo = numeroProcesso.trim()
      cy.log(`Número do processo capturado: ${numeroLimpo}`)
      Cypress.env('numeroProcessoCapturado', numeroLimpo)
      cy.get('.listagem-item.ng-star-inserted').eq(1).click()
    })
})

Cypress.Commands.add('pedirVistasSecretarioSessaoSemReverter', () => {
  cy.loginSecretarioSessao()
  cy.get(ProcessosElements.menuDadosProcesso).should('be.visible').click()
  cy.contains('Pedir vistas').click()
  cy.contains('Pedir vistas')
  cy.contains('Selecione o magistrado correspondente ao pedido de vistas do processo.')
  cy.get(ProcessosElements.campoMagistrado).should('be.visible').click()
  cy.get(ElementoGlobais.textoSelecionarOpcao).first().click()
  cy.contains('Cancelar')
  cy.contains('Confirmar').click()
  cy.validarMensagemDeRetorno('Pedido de vistas realizado com sucesso.')
  cy.validarStatusProcesso(' Vistas ')
})
