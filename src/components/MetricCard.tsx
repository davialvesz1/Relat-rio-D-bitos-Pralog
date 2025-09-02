import React, { useState } from 'react';

interface DetalhamentoEmpresa {
  empresa: string;
  detalhamento: string;
  planoAcao?: string;
  simulacaoParcelamento?: string;
}

interface MetricCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  color: string;
  detalhamentos?: DetalhamentoEmpresa[];
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, detalhamentos }) => {
  // Debug: verificar se os detalhamentos estão chegando
  console.log(`MetricCard ${title}:`, { 
    detalhamentos: detalhamentos ? JSON.stringify(detalhamentos, null, 2) : 'undefined',
    length: detalhamentos?.length,
    hasContent: detalhamentos?.some(item => item.detalhamento || item.planoAcao || item.simulacaoParcelamento)
  });
  
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

  // Tooltip customizado
  const renderTooltip = () => {
    if (!detalhamentos || detalhamentos.length === 0) return null;
    
    // Filtrar apenas empresas que têm pelo menos um campo preenchido
    const empresasComDetalhes = detalhamentos.filter(item => 
      item.detalhamento || item.planoAcao || item.simulacaoParcelamento
    );
    
    if (empresasComDetalhes.length === 0) {
      return (
        <div className="bg-[#0F2A5F] border border-white/20 rounded-lg p-4 shadow-lg min-w-[280px] max-w-[320px]">
          <p className="text-[#E5F0FF] font-semibold mb-3 text-sm">📋 Detalhamento</p>
          <p className="text-[#E5F0FF]/60 text-xs">Nenhum detalhamento disponível para as empresas selecionadas.</p>
        </div>
      );
    }
    
    return (
      <div className="bg-[#0F2A5F] border border-white/20 rounded-lg p-4 shadow-lg min-w-[280px] max-w-[320px]">
        <p className="text-[#E5F0FF] font-semibold mb-3 text-sm">📋 Detalhamento</p>
        {empresasComDetalhes.map((item, idx) => (
          <div key={idx} className="mb-3 last:mb-0 p-2 bg-[#1E40AF]/20 rounded-lg">
            <p className="text-[#2F6BFF] font-bold text-sm mb-2 border-b border-[#2F6BFF]/30 pb-1">{item.empresa}</p>
            
            {item.detalhamento && (
              <div className="mb-2">
                <p className="text-[#60A5FA] font-semibold text-xs mb-1">💼 Débitos:</p>
                <div className="text-[#E5F0FF]/90 text-xs leading-relaxed space-y-1">
                  {item.detalhamento.split('|').map((debito, idx) => {
                    if (!debito.trim()) return null;
                    
                    // Limpar e formatar cada débito
                    const debitoLimpo = debito.trim().replace(/\s+/g, ' ');
                    
                    return (
                      <div key={idx} className="p-1 bg-[#1E40AF]/10 rounded text-xs">
                        <span className="text-[#FCD34D]">📅</span> {debitoLimpo}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {item.planoAcao && (
              <div className="mb-2">
                <p className="text-[#F97316] font-semibold text-xs mb-1">📋 Plano de Ação:</p>
                <p className="text-[#E5F0FF]/80 text-xs leading-relaxed">
                  {item.planoAcao}
                </p>
              </div>
            )}
            
            {item.simulacaoParcelamento && (
              <div className="mb-2">
                <p className="text-[#10B981] font-semibold text-xs mb-1">💰 Simulação de Parcelamento:</p>
                <p className="text-[#E5F0FF]/70 text-xs leading-relaxed">
                  {item.simulacaoParcelamento}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');

  // Detectar posição ideal para o tooltip
  const handleMouseEnter = () => {
    setShowTooltip(true);
    
    // Detectar se há espaço suficiente acima
    const rect = document.querySelector(`[data-card="${title}"]`)?.getBoundingClientRect();
    if (rect) {
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      setTooltipPosition(spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
  };

  return (
    <div
      className="bg-[#0F2A5F] rounded-3xl p-6 shadow-lg border border-white/10 relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ cursor: detalhamentos && detalhamentos.length > 0 ? 'help' : 'default' }}
      data-card={title}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
      <h3 className="text-[#E5F0FF] text-sm font-medium mb-2">{title}</h3>
      <p className={`text-2xl font-bold ${getValueColor(value)}`}>{displayValue(value)}</p>
      
      {/* Tooltip com posicionamento inteligente */}
      {showTooltip && detalhamentos && detalhamentos.length > 0 && (
        <div className={`absolute z-50 left-1/2 transform -translate-x-1/2 ${
          tooltipPosition === 'top' 
            ? 'bottom-full mb-2' 
            : 'top-full mt-2'
        }`}>
          {renderTooltip()}
          {/* Seta do tooltip */}
          <div className={`absolute ${
            tooltipPosition === 'top' 
              ? 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0F2A5F]'
              : 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#0F2A5F]'
          }`}></div>
        </div>
      )}
      
      {/* Indicador visual de que há tooltip */}
      {detalhamentos && detalhamentos.filter(item => 
        item.detalhamento || item.planoAcao || item.simulacaoParcelamento
      ).length > 0 && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-[#2F6BFF] rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default MetricCard;