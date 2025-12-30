/* global cy, Cypress, expect  */
import ObterToken from '../api/obterTokenMagistrado.js'

Cypress.Commands.add('assinar', (idProcessoOpcional) => {
  const obterIdProcesso = () => {
    if (idProcessoOpcional) {
      return cy.wrap(idProcessoOpcional)
    }

    return cy.url().then((url) => {
      const match = url.match(/gabinete\/(\d+)/)
      if (!match) {
        throw new Error('❌ Não foi possível capturar o idProcesso na URL')
      }
      const idProcesso = match[1]
      cy.log(`🔍 ID do processo capturado na URL: ${idProcesso}`)
      return cy.wrap(idProcesso)
    })
  }

  return obterIdProcesso().then((idProcesso) => {
    return ObterToken.obterTokenMagistrado().then((token) => {
      cy.log('🔑 Token obtido com sucesso!')

      // Buscar mérito
      return cy.api({
        method: 'GET',
        url: `https://sessao-julgamento-qa.stg.pdpj.jus.br/sjapp/processos-gabinete/${idProcesso}/merito`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then((responseMerito) => {
        expect(responseMerito.status).to.eq(200)
        const idDocumento = responseMerito.body.id
        cy.log(`📄 ID do documento: ${idDocumento}`)

        // Assinar documento
        const urlAssinatura = 'https://sessao-julgamento-qa.stg.pdpj.jus.br/sjapp/documentos/assinar'

        const bodyAssinatura = new URLSearchParams({
          idDocumento,
          idProcesso,
          tipoDocumento: 'MERITO_GABINETE_RELATORIO',
          assinatura: 'assinatura',
          algoritmoAssinatura: 'ASN1SHA256withRSA',
          cadeiaCertificado:
            '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',
          hash: 'ac91627f30ace877e2ef5ff8ea4e73fa909fb2c8b148b9caae2d705023f03ece',
          algoritmoHash: 'SHA256',
          idProcessamento: 'a97c1e01-c71c-d4fd-fdc3-30a5af7fc1c7',
          conteudoBase64: 'cmVsYXTDs3Jpbw=='
        })

        return cy.api({
          method: 'POST',
          url: urlAssinatura,
          headers: {
            Accept: 'text/plain',
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${token}`
          },
          body: bodyAssinatura.toString()
        }).then((responseAssinatura) => {
          expect(responseAssinatura.status).to.eq(200)
          cy.log('✅ Documento assinado com sucesso!')
          return cy.wrap(responseAssinatura)
        })
      })
    })
  })
})
