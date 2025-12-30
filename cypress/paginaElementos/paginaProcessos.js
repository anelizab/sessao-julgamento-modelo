export const ProcessosElements = {
  btnOpcoesBusca: '.mat-mdc-menu-trigger.arrow-button',
  btnAcoesEmLote: '.botao-acoes-lote-container',
  opcoesBusca: '.mat-mdc-menu-item-text',
  numeroProcessoCampoBusca: '[formcontrolname="nProcesso"]',
  nomeDaParte: '[formcontrolname="parte"]',
  cpfCnpjDaParte: '[formcontrolname="cpfCnpj"]',
  btnModalFiltroProcessos: '.filtro-processos',
  cabecalhoSessao: '.header-info',
  btnResultadoJulgamento: '[data-test="botao-resultado-julgamento"]',
  btnFinalizarManualmente: '[data-test="botao-finalizar-manualmente"]',
  badgeFiltroAplicado: '.filtro-processos mat-icon span.mat-badge-content',

  // campos modal filtro
  numeroProcessoModal: '[datatest="filtro-input-text-numero-processo"]',
  nomeDaParteModal: '[datatest="filtro-input-text-nome-parte"]',
  cpfCnpjDaParteModal: '[datatest="filtro-input-text-cpf-parte"]',
  situacaoModal: '[datatest="filtro-input-select-situacao"]',
  intecaoVotoModal: '[datatest="filtro-input-select-orientacao-voto"]',
  orientacaoVotoModal: '[datatest="filtro-input-select-orientacao-voto"]',
  condicaoVotoModal: '[datatest="filtro-input-autocomplete-condicao-voto"]',
  vencedorModal: '[datatest="filtro-input-autocomplete-criterio-voto"]',
  criterioVotoModal: '[datatest="filtro-input-autocomplete-criterio-voto"]',
  colegiadoModal: '[datatest="filtro-input-autocomplete-colegiado"]',
  etiquetasModal: '[datatest="input-autocomplete-chips-etiqueta"]',
  prioridades: '[datatest="filtro-input-autocomplete-prioridades"]',
  checkBoxSustentacaoOral: '[datatest="checkbox-sustentacao-oral"]',
  btnLimpar: '[data-test="filtro-botao-limpar"]',
  btnFiltrar: '[data-test="botao-confirmar"]',
  scroolOpcoesCampos: '[role="listbox"]',
  ScroolLateralFiltrosProcessos: '.mat-mdc-dialog-content',

  // card de processos lateral esquerda
  statusProcesso: '.mdc-evolution-chip__text-label.mat-mdc-chip-action-label',
  cardProcessos: '.listagem-item.ng-star-inserted',
  cardListagemProcessos: '.listagem-processos-pautados-container',
  cardProcessoPauta: '.card-processo-pauta',
  numeroProcessoCard: '.numero-processo',
  checkSelecionarTodosProcessos: '[data-test="selecionar-todos"]',
  acoesProcessos: '.selecionar-processos-pautados',
  iconeProcessoSegredo: '[data-mat-icon-name="visibility_off"]',
  classSigilo: '.sigilo',
  copiarNumeroProcesso: '[datatest="copiar-numero-processo"]',
  nomePartesCardProcessos: 'div[mattooltipposition="above"] span.color-high-contrast',
  classeJudicial: 'span.color-high-contrast',
  orgaoJulgador: 'div.item span.color-high-contrast',
  assunto: 'div.item span.color-high-contrast.text-ellipsis',
  modalidade: '.mdc-evolution-chip__text-label',
  situacaoSessao: '.mdc-evolution-chip__text-label.mat-mdc-chip-action-label',
  btnLupa: '.search-button',
  btnLimparBusca: '[aria-label="Limpar busca"]',
  camposBusca: '.inputs',
  opcoesAcoes: '.container-options',

  // Dados do processo direita
  cabecalhoProcesso: '.numero-processo h4',
  cardDadosProcessos: '.dados-processo-body',
  // Botão sanduiche ao lado do histórico
  menuDadosProcesso: '.menu-dados-processo',
  opcoesMenuProcessos: '.cdk-overlay-pane',
  headerProcessos: '.header-dados-processo',
  itemCard: '.item',
  processoSigilo: '.numero-processo.sigilo',
  processoSegredoJustica: '.item.item-parte.ng-star-inserted',

  // modal retirar processos
  motivoRetirada: '[data-test="textarea-motivo-retirada"]',

  // destacar processo
  campoMagistrado: '[data-test="input-select-magistrado"]',
  campoTextoDestacar: '[formcontrolname="textoDestacar"]',
  justicativaCardProcesso: '.mat-mdc-chip-focus-overlay',

  // modal adiar e pedir vistas de processo
  textoConfirmacao: '.dialog-confirm-content',

  // Card com as informações do Voto do relator
  cardVotoRelator: '.card-header',
  cardDadosRelator: '.card-relator-dados',
  btnEmenta: '[data-test="botao-ementa"]',
  btnHistorico: '[data-test="botao-historico"]',
  btnPrepararVoto: '[data-test="botao-preparar-voto"]',
  btnPrepararRevisao: '[data-test="botao-preparar-revisao"]',
  btnVotoRelator: '[data-test="botao-voto-relator"]',
  btnRelatorio: '[data-test="botao-relatorio"]',

  // Card com as informações do Voto do vogal
  cardVotoVogal: '.mat-mdc-card-content',
  btnMeuVoto: '[data-test="botao-meu-voto"]',

  // Modal retirar processo
  btnCancelarRetirarProcesso: '[data-test="cancelar-botao"]',

  // Sustentação oral
  representanteSustentacao: '[datatest="input-select-representante"]',
  btnEnviarSustentacao: '.button-content',
  btnBaixarArquivo: '[mattooltip="Baixar arquivo"]',
  btnExcluirArqivo: '[mattooltip="Excluir"]',

  // Notificações
  btnNotificacoes: '[data-test="botao-notificacoes"]',
  btnAcoesNotificacao: '[data-test="botao-acoes-notificacao"]',
  btnLimparNotificacao: '[data-test="botao-limpar"]',
  btnHistoricoNotificacao: '[data-test="botao-historico"]',
  btnMarcarTodasLidas: '[data-test="botao-marcar-todas-lidas"]',
  contadorNotificacoes: '.mat-badge-content.mat-badge-active',

  // Criar etiquetas
  btnEtiquetasCardProcesso: '[data-test="botao-etiquetas-processo"]',
  novaEtiqueta: '[placeholder="Nova etiqueta..."]',
  btnSalvarEtiquetas: '[data-test="botao-salvar-etiquetas"]',
  btnExcluirAlterarCorEtiquetas: '[role="gridcell"]',
  corVerdeClaro: '[aria-label="Selecione a cor verde claro"]'
}
