/* global describe, context, it, cy */

import { setupTests } from '../../support/setup_commands'

setupTests()
context('Testes e2e do módulo de Sessão de Julgamento | Callout 8 - Sprint 5 e 6', () => {
  describe('MSDJ-31 - Criar sessão Julgamento (CA01_CT01, CA02_CT01, CA02_CT03, CA03_CT01, CA03_CT02, CA03_CT03)', () => {
    it('Deve validar campos obrigatórios', () => {
      cy.validarCamposObrigatoriosDadosSessao()
    })
    it('Deve validar dados inválidos para campos de data e hora', () => {
      cy.validarDadosInvalidosDataHora()
    })
  })
})
