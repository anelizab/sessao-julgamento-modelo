/* global Cypress, cy */

import { faker } from '@faker-js/faker'
import { gerarNumeroProcesso } from '../api/geradorNumeroProcesso.js'
import ObterToken from '../api/obterToken.js.js'
import gerarCPF from '../../../utils/gerarCpf.js'
import gerarCNPJ from '../../../utils/gerarCnpj.js'

// 🔹 Flag global para controlar os logs
const LOGS_ATIVOS = false

// Constantes exportadas para usar no teste e facilitar configurações
export const ORGAOS_JULGADORES = {
  // TRF5
  primeiraSecao: { codigo: '85790', nome: 'PRIMEIRA SEÇÃO' },
  segundaSecao: { codigo: '85791', nome: 'SEGUNDA SEÇÃO' },
  terceiraSecao: { codigo: '85792', nome: 'TERCEIRA SEÇÃO' },

  // TRF3
  gabinete01: { codigo: '21670', nome: 'GABINETE 01 - DESEMBARGADOR FEDERAL DAVID DANTAS - TRF 3ª REGIÃO' },
  gabinete02: { codigo: '21671', nome: 'GABINETE 02 - DESEMBARGADOR FEDERAL RENATO BECHO - TRF 3ª REGIÃO' },
  gabinete03: { codigo: '21672', nome: 'GABINETE 03 - DESEMBARGADOR FEDERAL COTRIM GUIMARÃES - TRF 3ª REGIÃO' },
  decimaPrimeiraTurma: { codigo: '21731', nome: '11ª TURMA' }
}

export const TRIBUNAIS = {
  trf5: { codigo: '7', jtr: '405', nome: 'Tribunal Regional Federal da 5ª Região' },
  trf3: { codigo: '5', jtr: '403', nome: 'Tribunal Regional Federal da 3ª Região' }
}

export const COLEGIADOS = {
  // trf5
  divisao5Turma: { codigo: '85785', nome: 'DIVISÃO DE 5ª TURMA' },

  // trf3
  decimaTurma: { codigo: '21730', nome: 'COLEGIADO TESTE' },
  decimaPrimeiraTurma: { codigo: '21731', nome: 'COLEGIADO TESTE' }
}

export class EnviarProcessoIntegracaoApi {
  /**
   * Envia um processo via API
   * @param {boolean} segredoJustica - Se o processo é segredo de justiça
   * @param {object} orgaoJulgador - Objeto com código e nome do órgão julgador
   * @param {object} tribunal - Objeto com código, jtr e nome do tribunal
   * @param {object} colegiado - Objeto com código e nome do colegiado
   */
  static enviarProcesso (
    segredoJustica = false,
    orgaoJulgador = ORGAOS_JULGADORES.primeiraSecao,
    tribunal = TRIBUNAIS.trf5,
    colegiado = COLEGIADOS.divisao5Turma
  ) {
    const numeroProcesso = gerarNumeroProcesso(undefined, tribunal.jtr)
    const cpfParteA = gerarCPF()
    const cnpjParteA = gerarCNPJ()
    const cpfParteP = gerarCPF()
    const cpfRepParteP = gerarCPF()

    if (!numeroProcesso || !cpfParteA || !cnpjParteA || !cpfParteP || !cpfRepParteP) {
      throw new Error('Erro ao gerar dados do processo. Verifique os geradores de CPF/CNPJ/numeroProcesso.')
    }

    if (LOGS_ATIVOS) cy.log(`📄 Gerando processo: ${numeroProcesso}`)

    return ObterToken.obterToken().then((token) => {
      if (!token) {
        throw new Error('Token não foi obtido corretamente. Verifique a autenticação.')
      }

      const payload = {
        tribunal,
        numeroProcesso,
        segredoJustica,
        partes: [
          {
            tipoParte: 'A',
            nomeCivil: faker.person.fullName(),
            nomeSocial: faker.person.lastName(),
            nomeAlternativo: faker.person.firstName(),
            sigilo: false,
            tipoDocumento: 'CNPJ',
            numeroDocumento: cnpjParteA,
            principal: true,
            representantes: [
              {
                nome: 'MarcosFelipeLeviAragão',
                tipoDocumento: 'CPF',
                numeroDocumento: cpfParteA,
                oab: '789456',
                oabUF: 'MS',
                tipoRepresentante: 'ADVOGADO'
              }
            ]
          },
          {
            tipoParte: 'P',
            nomeCivil: faker.person.firstName(),
            nomeSocial: faker.person.lastName(),
            nomeAlternativo: faker.person.fullName(),
            sigilo: false,
            tipoDocumento: 'CPF',
            numeroDocumento: cpfParteP,
            principal: true,
            representantes: [
              {
                nome: 'AparecidaMarcelaCamilaNascimento',
                tipoDocumento: 'CPF',
                numeroDocumento: cpfRepParteP,
                oabUF: 'MS',
                oab: '852649',
                tipoRepresentante: 'ADVOGADO'
              }
            ]
          }
        ],
        prioridadesProcessuais: [
          'Réu preso',
          'Idoso acima de 60 anos',
          'Menor',
          'Acolhimento institucional'
        ],
        colegiado,
        orgaoJulgador,
        classeProcessual: {
          codigo: '191',
          nome: 'Protesto'
        },
        assunto: {
          codigo: '12826',
          nome: 'Ensino Noturno'
        }
      }

      if (LOGS_ATIVOS) {
        cy.task('logToTerminal', {
          title: '📤 Payload enviado',
          data: payload
        })
      }

      return cy.request({
        method: 'POST',
        url: 'https://sessao-julgamento-qa.stg.pdpj.jus.br/sjapp/processos/integracao',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          accept: '*/*'
        },
        body: payload,
        failOnStatusCode: false
      }).then((response) => {
        if (LOGS_ATIVOS) {
          cy.task('logToTerminal', {
            title: '📥 Resposta da API',
            data: {
              status: response.status,
              body: response.body
            }
          })
        }

        if (response.status !== 204) {
          throw new Error(`❌ Falha ao enviar processo. Status: ${response.status}\nResposta: ${JSON.stringify(response.body, null, 2)}`)
        }

        if (LOGS_ATIVOS) {
          Cypress.log({
            name: 'Processo enviado via API',
            message: `Número do processo: ${numeroProcesso}`,
            consoleProps: () => ({
              numeroProcesso,
              payloadEnviado: payload,
              statusResposta: response.status,
              corpoResposta: response.body
            })
          })
        }
      })
    })
  }

  static async enviarMultiplosProcessos (
    quantidade,
    segredoJustica = false,
    orgaoJulgador = ORGAOS_JULGADORES.primeiraSecao,
    tribunal = TRIBUNAIS.trf5,
    colegiado = COLEGIADOS.divisao5Turma
  ) {
    if (typeof quantidade !== 'number') {
      throw new Error('Você deve passar a quantidade de processos como primeiro parâmetro.')
    }

    const intervaloMs = 500

    for (let i = 0; i < quantidade; i++) {
      try {
        await EnviarProcessoIntegracaoApi.enviarProcesso(segredoJustica, orgaoJulgador, tribunal, colegiado)
      } catch (error) {
        if (LOGS_ATIVOS) {
          cy.task('logToTerminal', {
            title: `❌ Erro ao enviar processo ${i + 1}`,
            data: error.message
          })
        }
      }

      if (i < quantidade - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervaloMs))
      }
    }
  }
}

export default EnviarProcessoIntegracaoApi
