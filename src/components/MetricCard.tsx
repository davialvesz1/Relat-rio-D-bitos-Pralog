import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getValueColor = (value: number | null) => {
    if (value === null) return 'text-[#E5F0FF]/60';
    return value === 0 ? 'text-green-400' : 'text-red-400';
  };

  const displayValue = (value: number | null) => {
    if (value === null) return 'Selecione um grupo';
    return formatCurrency(value);
  };

  return (
    <div className="bg-[#0F2A5F] rounded-3xl p-6 shadow-lg border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-[#E5F0FF] text-sm font-medium mb-2">{title}</h3>
      <p className={`text-2xl font-bold ${getValueColor(value)}`}>{displayValue(value)}</p>
    </div>
  );
};

export default MetricCard;