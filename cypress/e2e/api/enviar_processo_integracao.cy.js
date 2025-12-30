/* global describe, it, cy */

import EnviarProcessoIntegracaoApi, { ORGAOS_JULGADORES, TRIBUNAIS, COLEGIADOS } from '../api/enviarProcessoIntegracaoApi'

describe('Envio de processo via API', () => {
  it('Deve enviar via api um processo para órgão diferente gabinete 01', () => {
    cy.wrap(null).then(() =>
      EnviarProcessoIntegracaoApi.enviarMultiplosProcessos(
        20,
        false,
        ORGAOS_JULGADORES.gabinete01,
        TRIBUNAIS.trf3,
        COLEGIADOS.decimaTurma
      )
    )
  })
  it('Deve enviar via api um processo para órgão diferente gabinete 02', () => {
    cy.wrap(null).then(() =>
      EnviarProcessoIntegracaoApi.enviarMultiplosProcessos(
        20,
        false,
        ORGAOS_JULGADORES.gabinete02,
        TRIBUNAIS.trf3,
        COLEGIADOS.decimaTurma
      )
    )
  })
  it('Deve enviar via api um processo para órgão diferente gabinete 03', () => {
    cy.wrap(null).then(() =>
      EnviarProcessoIntegracaoApi.enviarMultiplosProcessos(
        20,
        false,
        ORGAOS_JULGADORES.gabinete03,
        TRIBUNAIS.trf3,
        COLEGIADOS.decimaTurma
      )
    )
  })
})
