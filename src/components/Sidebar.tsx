import React from 'react';
import { User, Filter, Upload, Download, RotateCcw, Settings, LogOut, Home } from 'lucide-react';
import MultiSelect from './MultiSelect';

interface SidebarProps {
  currentUser: string;
  gruposUnicos: string[];
  empresasDoGrupo: string[];
  grupoSelecionado: string[];
  empresasSelecionadas: string[];
  onGrupoChange: (grupos: string[]) => void;
  onEmpresaChange: (empresas: string[]) => void;
  onFileUpload: (csvText: string) => Promise<void>;
  onResetToDefault: () => Promise<void>;
  onDownloadTemplate: () => void;
  isUsingCustomData: boolean;
  isLoading: boolean;
  onLogout: () => void;
  onResetDashboard: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  gruposUnicos,
  empresasDoGrupo,
  grupoSelecionado,
  empresasSelecionadas,
  onGrupoChange,
  onEmpresaChange,
  onFileUpload,
  onResetToDefault,
  onDownloadTemplate,
  isUsingCustomData,
  onLogout,
  onResetDashboard,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileUpload(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-60 bg-[#0B1B34] text-white shadow-lg z-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
      {/* Logo e Título */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#2F6BFF] to-[#1E40AF] rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-4 border-2 border-white/20 overflow-hidden">
          <img
            src={`${import.meta.env.BASE_URL}logocfsmart.jpg`}
            alt="CF Smart Logo"
            className="w-16 h-16 object-cover rounded-xl"
          />
        </div>
        <h2 className="text-white text-xl font-bold">Grupo Pralog</h2>
        <p className="text-[#E5F0FF]/80 text-sm">Dashboard Fiscal</p>
        
        {/* Botão Home */}
        <button
          onClick={onResetDashboard}
          className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 rounded-lg transition-colors text-[#E5F0FF] hover:text-white"
          title="Voltar ao início"
        >
          <Home size={16} />
          <span className="text-sm">Início</span>
        </button>
      </div>

      {/* Usuário Logado */}
      <div className="flex items-center gap-3 mb-8 bg-[#0F2A5F] p-3 rounded-xl border border-white/10">
        <User size={20} className="text-[#2F6BFF]" />
        <span className="text-sm font-medium">{currentUser}</span>
      </div>

      {/* Filtros */}
      <div className="mb-8 space-y-4">
        <h3 className="text-[#E5F0FF] text-sm font-semibold mb-2 flex items-center gap-2">
          <Filter size={16} />
          Filtros
        </h3>
        <div>
          <label className="block text-[#E5F0FF]/80 text-xs font-medium mb-1">Grupo</label>
          <MultiSelect
            options={gruposUnicos}
            selected={grupoSelecionado}
            onChange={onGrupoChange}
            placeholder="Selecione o Grupo"
          />
        </div>
        <div>
          <label className="block text-[#E5F0FF]/80 text-xs font-medium mb-1">Empresa</label>
          <MultiSelect
            options={empresasDoGrupo}
            selected={empresasSelecionadas}
            onChange={onEmpresaChange}
            placeholder="Selecione a Empresa"
          />
        </div>
      </div>

      {/* Ações de Dados - Apenas para CF Smart */}
      {currentUser === 'cfsmart' && (
      <div className="mb-8 space-y-4">
        <h3 className="text-[#E5F0FF] text-sm font-semibold mb-2 flex items-center gap-2">
          <Settings size={16} />
          Gerenciar Dados
        </h3>
        <label
          htmlFor="csv-upload"
          className="flex items-center gap-3 text-[#E5F0FF] hover:text-[#2F6BFF] cursor-pointer transition-colors"
        >
          <Upload size={20} />
          <span>Carregar CSV</span>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          onClick={onDownloadTemplate}
          className="flex items-center gap-3 text-[#E5F0FF] hover:text-[#2F6BFF] transition-colors w-full text-left"
        >
          <Download size={20} />
          <span>Baixar Modelo CSV</span>
        </button>
        <button
          onClick={onResetToDefault}
          className="flex items-center gap-3 text-[#E5F0FF] hover:text-[#2F6BFF] transition-colors w-full text-left"
        >
          <RotateCcw size={20} />
          <span>Resetar para Padrão</span>
        </button>
        
        {/* Indicador de Sincronização */}
        <div className="mt-4 p-3 bg-[#2F6BFF]/10 border border-[#2F6BFF]/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-[#E5F0FF] text-xs font-medium">Sincronização Ativa</span>
          </div>
          <p className="text-[#E5F0FF]/70 text-xs">
            Você controla os dados para todos os usuários
          </p>
        </div>
      </div>
      )}
      
      {/* Indicador para usuários Pralog */}
      {currentUser === 'pralog' && (
        <div className="mb-8">
          <div className="p-4 bg-[#2F6BFF]/10 border border-[#2F6BFF]/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[#E5F0FF] text-xs font-medium">Sincronização Ativa</span>
            </div>
            <p className="text-[#E5F0FF]/70 text-xs">
              Dados sincronizados automaticamente do CF Smart
            </p>
          </div>
        </div>
      )}
      </div>

      {/* Rodapé */}
      <div className="p-6 pt-4 border-t border-white/10 bg-[#0B1B34]">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full text-left"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;