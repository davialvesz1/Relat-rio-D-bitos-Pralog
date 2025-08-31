export interface DebitoData {
  GRUPO: string;
  'Nome da Empresa': string;
  CNPJ: string;
  'Tipo de Débito': string;
  Valor: number;
}

export interface AggregateData {
  totalFederal: number;
  totalPGFN: number;
  totalEstadual: number;
  totalMunicipal: number;
  debitosPorGrupo: Array<{
    grupo: string;
    Federal: number;
    PGFN: number;
    Estadual: number;
    Municipal: number;
  }>;
  distribuicaoPorTipo: Array<{
    tipo: string;
    valor: number;
  }>;
  debitosPorEmpresa: Array<{
    empresa: string;
    valor: number;
  }>;
}