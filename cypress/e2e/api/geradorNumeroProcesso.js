function padStart (numero, tamanho) {
  return String(numero).padStart(tamanho, '0')
}

function gerarNumeroProcesso (ano = new Date().getFullYear(), jtr = '405') {
  const numeroSequencial = Math.floor(Math.random() * 9999999) + 1
  const origem = Math.floor(Math.random() * 9999) + 1

  const orgaoJustica = jtr.substring(0, 1)
  const tribunal = jtr.substring(1, 3)

  const numeroParaCalculo =
    padStart(numeroSequencial, 7) +
    padStart(ano, 4) +
    padStart(orgaoJustica, 1) +
    padStart(tribunal, 2) +
    padStart(origem, 4) +
    '00'

  const baseCalculo = 98
  const moduloVerificador = BigInt(97)
  const numeroBigInt = BigInt(numeroParaCalculo)
  const resto = numeroBigInt % moduloVerificador
  const digitoVerificador = baseCalculo - Number(resto)

  const numeroFormatado = `${padStart(numeroSequencial, 7)}-${padStart(digitoVerificador, 2)}.${padStart(ano, 4)}.${padStart(jtr, 3)}.${padStart(origem, 4)}`

  return numeroFormatado
}

module.exports = {
  gerarNumeroProcesso
}
