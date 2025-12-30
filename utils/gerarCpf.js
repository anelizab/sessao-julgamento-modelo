function gerarCPF () {
  const rand = () => Math.floor(Math.random() * 9)
  const n = Array.from({ length: 9 }, rand)

  const calcDV = (base, peso) => {
    const soma = base.reduce((acc, val, i) => acc + val * (peso - i), 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  n.push(calcDV(n, 10))
  n.push(calcDV(n, 11))

  return n.join('')
}

export default gerarCPF
