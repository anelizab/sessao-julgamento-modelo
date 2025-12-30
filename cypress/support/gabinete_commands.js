/* global cy, Cypress  */
import { ElementoGlobais } from '../paginaElementos/paginaElementosGlobais'
import { GabineteElements } from '../paginaElementos/paginaGabinete'
import { VotacaoElements } from '../paginaElementos/paginaVotacao'

// MSDJ-2633 - Preparar voto para o mérito
Cypress.Commands.add('prepararVotoRelatorGabinete', (quantidade) => {
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

    // Repetir para a quantidade de processos passada
    Cypress._.times(quantidade, () => {
      cy.get(GabineteElements.cardProcessos, { timeout: 10000 })
        .filter((_, el) => {
          const situacao = el.querySelector('[mattooltip="Situação do processo"]')?.textContent?.trim()
          return situacao !== 'LIBERADO PARA PAUTA E VOTAÇÃO'
        })
        .first()
        .should('be.visible')
        .click()

      cy.get(VotacaoElements.btnNovaPreliminar).should('be.visible').click()
      cy.get(GabineteElements.sugestaoVotoAcolhida).should('be.visible').click()
      cy.get(GabineteElements.declaracaoVotoPreliminar).should('be.visible').click()
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
      cy.validarMensagemDeRetorno('Mérito salvo com sucesso.')

      cy.clicarBotaoPorTexto(' Liberar para ')
      cy.clicarBotaoPorTexto(' Pauta ')
      cy.clicarBotaoPorTexto(' Sim, liberar processo ')
      cy.validarMensagemDeRetorno('Mérito salvo com sucesso.')

      cy.get(GabineteElements.cabecalhoProcessoStatus)
        .should('contain', 'Liberado para pauta')

      cy.clicarBotaoPorTexto(' Liberar para ')
      cy.clicarBotaoPorTexto(' Votação antecipada ')
      cy.clicarBotaoPorTexto(' Sim, liberar processo ')
      cy.get(GabineteElements.cabecalhoProcessoStatus)
        .should('contain', 'Liberado para pauta')
      cy.capturarNumeroProcessoCabecalho()
      cy.visit('/gabinete')
    })
  })
})

// MSDJ-2372 - Solicitar inclusão em pauta
Cypress.Commands.add('minutarProcessosAssessor', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.assessorUserRelator, dados.assessorPwRelator)
  })
  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(GabineteElements.listaProcessos).should('be.visible')
    cy.get(GabineteElements.btnAbrirFiltro).click()
    cy.get(GabineteElements.campoOrgaoJulgador).click()
    cy.get(ElementoGlobais.textoSelecionarOpcao).contains(dadosVotacao.orgaoJulgador).click()
    cy.clicarBotaoPorTexto(' Filtrar ')
    cy.contains(dadosVotacao.orgaoJulgador).should('be.visible')

    cy.get(GabineteElements.cardProcessos).first().click()
    cy.get(VotacaoElements.btnNovaPreliminar).click()
    cy.get(GabineteElements.sugestaoVotoAcolhida).click()
    cy.get(GabineteElements.declaracaoVotoPreliminar).type(dadosVotacao.textoDeclaracaoVotoPreliminar)
    cy.clicarBotaoPorTexto(' Salvar ')
    cy.validarMensagemDeRetorno('Preliminar salva com sucesso.')

    cy.get(VotacaoElements.campoTextoRelatorio).type(dadosVotacao.textoRelatorio)
    cy.get(VotacaoElements.abasMerito).eq(2).click()
    cy.get(VotacaoElements.campoTextoEmenta).type(dadosVotacao.textoEmenta)
    cy.get(VotacaoElements.abasMerito).eq(3).click()
    cy.get(VotacaoElements.sugestoesVotoMerito).contains('Conhecido e provido').click()
    cy.get(VotacaoElements.campoTextoDeclaracaoVoto).eq(1).type(dadosVotacao.textoDeclaracaoVotoMerito)
    cy.get(GabineteElements.btnSalvar).eq(1).click()
    cy.validarMensagemDeRetorno('Mérito salvo com sucesso.')
    cy.clicarBotaoPorTexto(' Finalizar minuta ')
    cy.validarMensagemDeRetorno('Mérito salvo com sucesso.')
    cy.validarMensagemDeRetorno('Minuta finalizada com sucesso.')
    cy.get(GabineteElements.cabecalhoProcessoStatus).should('contain', 'Minutado')
    cy.capturarNumeroProcessoCabecalho()
  })
})

// Magistrado relator libera processos minutados pelo assessor do relator
Cypress.Commands.add('magistradoRelatorLiberaProcessoMinutados', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })

  cy.get(GabineteElements.listaProcessos).should('be.visible')
  cy.contains('Minutados').click()
  // procura e clica no primeiro card com status Minutado
  cy.get('mat-card.card-processo').each(($card) => {
    const chip = $card.find('.mat-mdc-chip .mdc-evolution-chip__text-label')
    if (chip.text().trim().toUpperCase().includes('MINUTADO')) {
      cy.wrap($card).click()
      cy.contains('Liberar para').click()
      cy.contains('Pauta e votação antecipada ').click()
      cy.contains('Sim, liberar processo ').click()
      cy.validarMensagemDeRetorno('Liberação feita com sucesso.')
      return false
    }
  })
})
// Realiza a minuto com o assessor do vogal
Cypress.Commands.add('minutarProcessosAssessorVogal', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.assessorUserVogal1, dados.assessorPwVogal1)

    cy.get('[mattooltip="Situação do processo"]', { timeout: 10000 })
      .then($els => {
        // procura o primeiro elemento cujo texto contenha a string
        const match = [...$els].find(el => el.innerText && el.innerText.includes('LIBERADO PARA PAUTA E VOTAÇÃO'))
        if (match) {
          cy.wrap(match).scrollIntoView().click()
        } else {
          throw new Error('Elemento com texto não encontrado dentro dos [mattooltip="Situação do processo"]')
        }
      })

    cy.get('[aria-label="Convergente com o relator"]')
      .eq(1)
      .scrollIntoView()
      .should('be.visible')
      .click()

    cy.get('[data-test="botao-salvar"]').last().click()
    cy.contains('Finalizar minuta').click()
    cy.validarMensagemDeRetorno('Minuta finalizada com sucesso.')
  })
})

// MSDJ-2633 - Preparar voto magistrado relator
Cypress.Commands.add('prepararVotoMagistradoRelator', () => {
  cy.fixture('dadosUsuarios').then((dados) => {
    cy.loginPerfisSemAcessoGabinete(dados.magistradoUserRelator, dados.magistradoPwRelator)
  })
  cy.fixture('dadosVotacao').then((dadosVotacao) => {
    cy.get(GabineteElements.listaProcessos).should('be.visible')
    cy.get(GabineteElements.btnAbrirFiltro).click()
    cy.get(GabineteElements.campoOrgaoJulgador).click()
    cy.get(ElementoGlobais.textoSelecionarOpcao).contains(dadosVotacao.orgaoJulgador).click()
    cy.clicarBotaoPorTexto(' Filtrar ')
    cy.contains(dadosVotacao.orgaoJulgador).should('be.visible')

    cy.get(GabineteElements.cardProcessos).first().click()
    cy.get(VotacaoElements.btnNovaPreliminar).click()
    cy.get(GabineteElements.sugestaoVotoAcolhida).click()
    cy.get(GabineteElements.declaracaoVotoPreliminar).type(dadosVotacao.textoDeclaracaoVotoPreliminar)
    cy.clicarBotaoPorTexto(' Salvar ')
    cy.validarMensagemDeRetorno('Preliminar salva com sucesso.')

    cy.get(VotacaoElements.campoTextoRelatorio).type(dadosVotacao.textoRelatorio)
    cy.get(VotacaoElements.abasMerito).eq(2).click()
    cy.get(VotacaoElements.campoTextoEmenta).type(dadosVotacao.textoEmenta)
    cy.get(VotacaoElements.abasMerito).eq(3).click()
    cy.get(VotacaoElements.sugestoesVotoMerito).contains('Conhecido e provido').click()
    cy.get(VotacaoElements.campoTextoDeclaracaoVoto).eq(1).type(dadosVotacao.textoDeclaracaoVotoMerito)
    cy.get(GabineteElements.btnSalvar).eq(1).click()
    cy.validarMensagemDeRetorno('Mérito salvo com sucesso.')

    cy.clicarBotaoPorTexto(' Liberar para ')
    cy.clicarBotaoPorTexto(' Pauta ')
    cy.clicarBotaoPorTexto(' Sim, liberar processo ')
    cy.validarMensagemDeRetorno('Mérito salvo com sucesso.')
    cy.get(GabineteElements.cabecalhoProcessoStatus).should('contain', 'Liberado para pauta')

    cy.clicarBotaoPorTexto(' Liberar para ')
    cy.clicarBotaoPorTexto(' Votação antecipada ')
    cy.clicarBotaoPorTexto(' Sim, liberar processo ')
    cy.get(GabineteElements.cabecalhoProcessoStatus).should('contain', 'Liberado para pauta e votação')

    cy.capturarNumeroProcessoCabecalho()
  })
})
