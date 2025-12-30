/* global cy, expect */
import 'cypress-plugin-tab'
import 'cypress-real-events/support'

export class ObterTokenMagistrado {
  // Função auxiliar para obter o token de autenticação
  static obterTokenMagistrado () {
    const keycloakAuthUrl = 'https://sso.stg.cloud.pje.jus.br/auth'
    const keycloakAuthRealm = 'pje'
    const keycloakAuthClientId = 'sessao-julgamento-frontend'
    const keycloakUserCpf = '88598616087'
    const keycloakUserPassword = 'Sj123456_'

    // Faz a requisição para obter o token
    return cy.api({
      method: 'POST',
      url: `${keycloakAuthUrl}/realms/${keycloakAuthRealm}/protocol/openid-connect/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `username=${keycloakUserCpf}&password=${keycloakUserPassword}&grant_type=password&client_id=${keycloakAuthClientId}&scope=openid email profile`
    }).then((response) => {
      // Verifica se a resposta foi bem-sucedida
      expect(response.status).to.equal(200)
      return response.body.access_token
    })
  }
}

export default ObterTokenMagistrado
