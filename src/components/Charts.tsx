import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ChartsProps {
  debitosPorGrupo: Array<{
    grupo: string;
    Federal: number;
    PGFN: number;
    Estadual: number;
    Municipal: number;
    empresas: string[];
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

const COLORS = {
  Federal: '#60A5FA',
  PGFN: '#3B82F6',
  Estadual: '#1E40AF',
  Municipal: '#1D4ED8',
};

const PIE_COLORS = ['#60A5FA', '#3B82F6', '#1E40AF', '#1D4ED8'];

const Charts: React.FC<ChartsProps> = ({ debitosPorGrupo, distribuicaoPorTipo, debitosPorEmpresa }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltipBarChart = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Encontrar o grupo correspondente para mostrar as empresas
      const grupoData = debitosPorGrupo.find(item => item.grupo === label);
      
      return (
        <div className="bg-[#0F2A5F] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-[#E5F0FF] font-medium mb-2">{label}</p>
          {grupoData && grupoData.empresas && (
            <div className="mb-2">
              <p className="text-[#E5F0FF]/80 text-xs mb-1">Empresas:</p>
              {grupoData.empresas.map((empresa, idx) => (
                <p key={idx} className="text-[#E5F0FF]/70 text-xs">• {empresa}</p>
              ))}
            </div>
          )}
          {payload.map((entry: any, index: number) => (
            entry.value > 0 && (
              <p key={index} className="text-[#E5F0FF]" style={{ color: entry.color }}>
                {entry.dataKey}: {formatCurrency(entry.value)}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F2A5F] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-[#E5F0FF]">
            {payload[0].name}: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Débitos por Grupo */}
      <div className="bg-[#0F2A5F] rounded-3xl p-6 shadow-lg border border-white/10">
        <h3 className="text-[#E5F0FF] text-lg font-semibold mb-4">Débitos por Grupo</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={debitosPorGrupo}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 240, 255, 0.1)" />
            <XAxis 
              dataKey="grupo" 
              tick={{ fill: '#E5F0FF', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(229, 240, 255, 0.2)' }}
            />
            <YAxis 
              tick={{ fill: '#E5F0FF', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(229, 240, 255, 0.2)' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltipBarChart />} />
            <Bar dataKey="Federal" stackId="a" fill={COLORS.Federal} radius={[0, 0, 0, 0]} />
            <Bar dataKey="PGFN" stackId="a" fill={COLORS.PGFN} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Estadual" stackId="a" fill={COLORS.Estadual} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Municipal" stackId="a" fill={COLORS.Municipal} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribuição por Tipo */}
      <div className="bg-[#0F2A5F] rounded-3xl p-6 shadow-lg border border-white/10">
        <h3 className="text-[#E5F0FF] text-lg font-semibold mb-4">Distribuição por Tipo de Débito</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={distribuicaoPorTipo}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="valor"
              nameKey="tipo"
            >
              {distribuicaoPorTipo.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#E5F0FF' }}
              formatter={(value) => <span style={{ color: '#E5F0FF' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Débitos por Empresa */}
      <div className="bg-[#0F2A5F] rounded-3xl p-6 shadow-lg border border-white/10 xl:col-span-2">
        <h3 className="text-[#E5F0FF] text-lg font-semibold mb-4">Débitos por Empresa</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, debitosPorEmpresa.length * 40)}>
          <BarChart data={debitosPorEmpresa} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 240, 255, 0.1)" />
            <XAxis 
              dataKey="empresa"
              tick={{ fill: '#E5F0FF', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(229, 240, 255, 0.2)' }}
              angle={-35}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tick={{ fill: '#E5F0FF', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(229, 240, 255, 0.2)' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0F2A5F] border border-white/20 rounded-lg p-3 shadow-lg">
                      <p className="text-[#E5F0FF] font-medium mb-2">{label}</p>
                      <p className="text-[#2F6BFF]">
                        Total: {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="valor" fill="#2F6BFF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;