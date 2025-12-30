function gerarCNPJ () {
  const rand = () => Math.floor(Math.random() * 10)
  const n = Array.from({ length: 8 }, rand) // base do CNPJ: 8 números aleatórios
  n.push(0, 0, 0, 1) // sufixo fixo "0001"

  const calcDV = (base, pesos) => {
    const soma = base.reduce((acc, val, i) => acc + val * pesos[i], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const dv1 = calcDV(n, pesos1)
  const dv2 = calcDV([...n, dv1], pesos2)

  return [...n, dv1, dv2].join('')
}

export default gerarCNPJ
