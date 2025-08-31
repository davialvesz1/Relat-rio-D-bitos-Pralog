import Papa from 'papaparse';
import { DebitoData } from '../types';

export const parseCSV = (csvText: string): DebitoData[] => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    delimiter: ';',
    transformHeader: (header) => header.trim(),
  });

  return result.data.map((row: any) => ({
    GRUPO: row.GRUPO?.trim() || '',
    'Nome da Empresa': row['Nome da Empresa']?.trim() || '',
    CNPJ: row.CNPJ?.trim() || '',
    'Tipo de Débito': row['Tipo de Débito']?.trim() || '',
    Valor: parseFloat(row.Valor?.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
  })).filter(item => item.GRUPO && item['Nome da Empresa'] && item['Tipo de Débito']);
};

const truncateCompanyName = (name: string): string => {
  // Remove palavras comuns e encurta nomes
  return name
    .replace(/LTDA|S\.A\.|S\/A|SOCIEDADE ANÔNIMA|LIMITADA/gi, '')
    .replace(/DISTRIBUIDORA DE MEDICAMENTOS/gi, 'DISTRIB. MED.')
    .replace(/TRANSPORTES E SERVIÇOS/gi, 'TRANSP.')
    .replace(/TRANSPORTES/gi, 'TRANSP.')
    .replace(/– Matriz|Matriz/gi, 'MTZ')
    .replace(/– FILIAL|FILIAL|Filial/gi, 'FL')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 25); // Limita a 25 caracteres
};
export const aggregateData = (data: DebitoData[], empresasFiltradas?: string[]): any => {
  let filteredData = data;
  
  if (empresasFiltradas && empresasFiltradas.length > 0) {
    filteredData = data.filter(item => empresasFiltradas.includes(item['Nome da Empresa']));
  }

  // Calcular totais por tipo de débito
  const totalFederal = filteredData
    .filter(item => item['Tipo de Débito']?.toLowerCase() === 'federal')
    .reduce((sum, item) => sum + (item.Valor || 0), 0);

  const totalPGFN = filteredData
    .filter(item => item['Tipo de Débito']?.toLowerCase() === 'pgfn')
    .reduce((sum, item) => sum + (item.Valor || 0), 0);

  const totalEstadual = filteredData
    .filter(item => item['Tipo de Débito']?.toLowerCase() === 'estadual')
    .reduce((sum, item) => sum + (item.Valor || 0), 0);

  const totalMunicipal = filteredData
    .filter(item => item['Tipo de Débito']?.toLowerCase() === 'municipal')
    .reduce((sum, item) => sum + (item.Valor || 0), 0);

  // Débitos por Grupo
  const gruposMap = new Map();
  filteredData.forEach(item => {
    const grupo = item.GRUPO?.trim();
    const tipoDebito = item['Tipo de Débito']?.trim();
    
    if (!grupo || !tipoDebito) return;
    
    if (!gruposMap.has(grupo)) {
      gruposMap.set(grupo, { 
        Federal: 0, 
        PGFN: 0, 
        Estadual: 0, 
        Municipal: 0,
        empresas: new Set()
      });
    }
    
    const grupoData = gruposMap.get(grupo);
    
    // Mapear tipos de débito corretamente
    if (tipoDebito.toLowerCase() === 'federal') {
      grupoData.Federal += item.Valor || 0;
    } else if (tipoDebito.toLowerCase() === 'pgfn') {
      grupoData.PGFN += item.Valor || 0;
    } else if (tipoDebito.toLowerCase() === 'estadual') {
      grupoData.Estadual += item.Valor || 0;
    } else if (tipoDebito.toLowerCase() === 'municipal') {
      grupoData.Municipal += item.Valor || 0;
    }
    
    if (item['Nome da Empresa']) {
      grupoData.empresas.add(truncateCompanyName(item['Nome da Empresa']));
    }
  });

  const debitosPorGrupo = Array.from(gruposMap.entries()).map(([grupo, valores]) => ({
    grupo,
    Federal: valores.Federal,
    PGFN: valores.PGFN,
    Estadual: valores.Estadual,
    Municipal: valores.Municipal,
    empresas: Array.from(valores.empresas),
  }));

  // Distribuição por Tipo
  const distribuicaoPorTipo = [
    { tipo: 'Federal', valor: totalFederal },
    { tipo: 'PGFN', valor: totalPGFN },
    { tipo: 'Estadual', valor: totalEstadual },
    { tipo: 'Municipal', valor: totalMunicipal },
  ].filter(item => item.valor > 0);

  // Débitos por Empresa
  const empresasMap = new Map();
  filteredData.forEach(item => {
    const empresa = item['Nome da Empresa']?.trim();
    if (!empresa) return;
    
    if (!empresasMap.has(empresa)) {
      empresasMap.set(empresa, 0);
    }
    empresasMap.set(empresa, empresasMap.get(empresa) + (item.Valor || 0));
  });

  const debitosPorEmpresa = Array.from(empresasMap.entries())
    .map(([empresa, valor]) => ({ empresa: truncateCompanyName(empresa), valor }))
    .sort((a, b) => b.valor - a.valor);

  return {
    totalFederal,
    totalPGFN,
    totalEstadual,
    totalMunicipal,
    debitosPorGrupo,
    distribuicaoPorTipo,
    debitosPorEmpresa,
  };
};