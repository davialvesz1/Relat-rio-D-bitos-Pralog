import React, { useState, useEffect } from 'react';
import { TrendingUp, Building, AlertTriangle, FileText } from 'lucide-react';
import { csvService, getSupabaseClient } from './lib/supabase';
import Sidebar from './components/Sidebar';
import LoginForm from './components/LoginForm';
import MetricCard from './components/MetricCard';
import Charts from './components/Charts';
import { DebitoData } from './types';
import { parseCSV, aggregateData } from './utils/csvParser';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [data, setData] = useState<DebitoData[]>([]);
  const [originalCsvData, setOriginalCsvData] = useState<string>('');
  const [isUsingCustomData, setIsUsingCustomData] = useState<boolean>(false);
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string[]>([]);
  const [aggregatedData, setAggregatedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  // Verificar autenticação salva
  useEffect(() => {
    const savedAuth = localStorage.getItem('dashboard_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setCurrentUser(authData.username);
    }
  }, []);

  // Carregar dados quando usuário faz login
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    
    loadInitialData();
    setupRealtimeSync();
    
    // Cleanup na desmontagem
    return () => {
      if (realtimeSubscription) {
        console.log('🧹 Limpando subscription...');
        csvService.unsubscribe(realtimeSubscription);
      }
    };
  }, [isAuthenticated, currentUser]);

  const loadInitialData = async () => {
    console.log('🚀 Carregando dados iniciais para:', currentUser);
    setLoading(true);
    setSyncStatus('syncing');
    
    try {
      // SEMPRE buscar dados do usuário 'cfsmart' como fonte única - FORÇAR RELOAD
      console.log('☁️ FORÇANDO busca de dados na nuvem (usuário: cfsmart)...');
      const cloudData = await csvService.loadCsvData('cfsmart');
      
      let csvText: string;
      let isCustom = false;
      
      if (cloudData && cloudData.trim()) {
        console.log('✅ DADOS ATUALIZADOS ENCONTRADOS NA NUVEM!');
        console.log('📄 Tamanho:', cloudData.length, 'caracteres');
        console.log('📄 Primeiras linhas:', cloudData.substring(0, 200));
        console.log('📄 CONTEÚDO COMPLETO:', cloudData);
        csvText = cloudData;
        isCustom = true;
        setSyncStatus('synced');
        
        // LIMPAR backup local antigo e salvar novo
        localStorage.removeItem('dashboard_csv_backup');
        localStorage.setItem('dashboard_csv_backup', csvText);
        console.log('💾 Backup local atualizado com dados da nuvem');
      } else {
        console.log('📁 Nenhum dado na nuvem, carregando dados padrão...');
        const response = await fetch('/src/data/Modelo_Situacoes_Fiscais.csv');
        csvText = await response.text();
        isCustom = false;
        setSyncStatus('idle');
      }
      
      // Processar dados
      console.log('📊 Processando CSV...');
      const parsedData = parseCSV(csvText);
      console.log('✅ Dados processados:', parsedData.length, 'registros');
      console.log('🏢 Grupos encontrados:', [...new Set(parsedData.map(d => d.GRUPO))]);
      
      // Atualizar estado
      setOriginalCsvData(csvText);
      setData(parsedData);
      setIsUsingCustomData(isCustom);
      
      // RESETAR filtros para garantir que não há cache
      setGrupoSelecionado([]);
      setEmpresasSelecionadas([]);
      setAggregatedData(null);
      
      console.log('🔄 Estado atualizado e filtros resetados');
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setSyncStatus('error');
      
      // Tentar backup local
      await loadBackupData();
    } finally {
      setLoading(false);
    }
  };

  const loadBackupData = async () => {
    console.log('💾 Tentando carregar backup local...');
    try {
      const backup = localStorage.getItem('dashboard_csv_backup');
      if (backup) {
        console.log('✅ Backup local encontrado!');
        const parsedData = parseCSV(backup);
        setOriginalCsvData(backup);
        setData(parsedData);
        setIsUsingCustomData(true);
        return;
      }
    } catch (error) {
      console.error('❌ Erro no backup local:', error);
    }
    
    // Último recurso: dados padrão
    console.log('📁 Carregando dados padrão como último recurso...');
    try {
      const response = await fetch('/src/data/Modelo_Situacoes_Fiscais.csv');
      const csvText = await response.text();
      const parsedData = parseCSV(csvText);
      setOriginalCsvData(csvText);
      setData(parsedData);
      setIsUsingCustomData(false);
    } catch (error) {
      console.error('❌ Erro crítico ao carregar dados padrão:', error);
    }
  };

  const setupRealtimeSync = async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      console.log('⚠️ Supabase não disponível - sem sincronização em tempo real');
      return;
    }
    
    console.log('📡 Configurando sincronização em tempo real...');
    
    // Limpar subscription anterior
    if (realtimeSubscription) {
      csvService.unsubscribe(realtimeSubscription);
    }
    
    // Configurar nova subscription
    const subscription = csvService.subscribeToChanges('cfsmart', (newCsvContent) => {
      console.log('🔄 DADOS ATUALIZADOS EM TEMPO REAL!');
      console.log('📄 Novo conteúdo recebido:', newCsvContent.length, 'caracteres');
      console.log('📄 Primeiras linhas:', newCsvContent.substring(0, 200));
      
      try {
        // Processar novos dados
        const parsedData = parseCSV(newCsvContent);
        console.log('📊 Novos dados processados:', parsedData.length, 'registros');
        console.log('🏢 Novos grupos:', [...new Set(parsedData.map(d => d.GRUPO))]);
        
        // Atualizar estado
        setOriginalCsvData(newCsvContent);
        setData(parsedData);
        setIsUsingCustomData(true);
        setSyncStatus('synced');
        
        // Salvar backup
        localStorage.setItem('dashboard_csv_backup', newCsvContent);
        
        // Resetar filtros
        setGrupoSelecionado([]);
        setEmpresasSelecionadas([]);
        setAggregatedData(null);
        
        // Mostrar notificação
        showUpdateNotification();
        
      } catch (error) {
        console.error('❌ Erro ao processar dados em tempo real:', error);
      }
    });
    
    setRealtimeSubscription(subscription);
    console.log('✅ Sincronização em tempo real configurada!');
  };

  const showUpdateNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce';
    notification.innerHTML = '🔄 Dados atualizados automaticamente!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  };

  const handleLogin = (username: string) => {
    console.log('🔐 Login realizado:', username);
    
    // LIMPAR estado anterior completamente
    setData([]);
    setOriginalCsvData('');
    setAggregatedData(null);
    setGrupoSelecionado([]);
    setEmpresasSelecionadas([]);
    setIsUsingCustomData(false);
    setSyncStatus('idle');
    
    console.log('🧹 Estado anterior limpo completamente');
    
    setIsAuthenticated(true);
    setCurrentUser(username);
    
    // Salvar autenticação
    localStorage.setItem('dashboard_auth', JSON.stringify({
      username,
      timestamp: Date.now()
    }));
    
    console.log('✅ Novo login configurado, dados serão carregados...');
  };

  const handleLogout = () => {
    console.log('👋 Logout realizado');
    
    // Limpar subscription
    if (realtimeSubscription) {
      csvService.unsubscribe(realtimeSubscription);
      setRealtimeSubscription(null);
    }
    
    // Limpar estado
    setIsAuthenticated(false);
    setCurrentUser('');
    setData([]);
    setAggregatedData(null);
    setGrupoSelecionado([]);
    setEmpresasSelecionadas([]);
    setLoading(false);
    setSyncStatus('idle');
    
    // Limpar localStorage
    localStorage.removeItem('dashboard_auth');
  };

  const handleResetDashboard = () => {
    console.log('🔄 Reset do dashboard');
    setGrupoSelecionado([]);
    setEmpresasSelecionadas([]);
    setAggregatedData(null);
  };

  const handleFileUpload = async (csvText: string) => {
    if (currentUser !== 'cfsmart') {
      alert('⚠️ Apenas o usuário CF Smart pode fazer upload de dados.');
      return;
    }
    
    console.log('📤 CF Smart fazendo upload...');
    console.log('📄 Conteúdo:', csvText.substring(0, 200));
    
    setSyncStatus('syncing');
    
    try {
      // Validar e processar dados
      const parsedData = parseCSV(csvText);
      console.log('📊 Upload processado:', parsedData.length, 'registros');
      console.log('🏢 Grupos no upload:', [...new Set(parsedData.map(d => d.GRUPO))]);
      
      // Atualizar estado local primeiro
      setData(parsedData);
      setOriginalCsvData(csvText);
      setIsUsingCustomData(true);
      
      // Salvar backup local
      localStorage.setItem('dashboard_csv_backup', csvText);
      
      // Salvar na nuvem
      console.log('☁️ Salvando na nuvem...');
      await csvService.saveCsvData('cfsmart', csvText);
      console.log('✅ Dados salvos na nuvem!');
      
      setSyncStatus('synced');
      
      // Resetar filtros
      setGrupoSelecionado([]);
      setEmpresasSelecionadas([]);
      setAggregatedData(null);
      
      alert('✅ Dados salvos e sincronizados!\n📡 Todos os usuários receberão a atualização automaticamente.');
      
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      setSyncStatus('error');
      alert('❌ Erro ao processar arquivo CSV. Verifique o formato.');
    }
  };

  const handleResetToDefault = async () => {
    if (currentUser !== 'cfsmart') {
      alert('⚠️ Apenas o usuário CF Smart pode resetar os dados.');
      return;
    }
    
    console.log('🔄 Resetando para dados padrão...');
    setSyncStatus('syncing');
    
    try {
      // Remover da nuvem
      const supabase = await getSupabaseClient();
      if (supabase) {
        console.log('🗑️ Removendo dados da nuvem...');
        await supabase
          .from('csv_data')
          .delete()
          .eq('user_id', 'cfsmart');
      }
      
      // Carregar dados padrão
      console.log('📁 Carregando dados padrão...');
      const response = await fetch('/src/data/Modelo_Situacoes_Fiscais.csv');
      const csvText = await response.text();
      const parsedData = parseCSV(csvText);
      
      // Atualizar estado
      setOriginalCsvData(csvText);
      setData(parsedData);
      setIsUsingCustomData(false);
      setSyncStatus('idle');
      
      // Limpar backup
      localStorage.removeItem('dashboard_csv_backup');
      
      // Resetar filtros
      setGrupoSelecionado([]);
      setEmpresasSelecionadas([]);
      setAggregatedData(null);
      
      alert('✅ Dados resetados para o padrão!');
      
    } catch (error) {
      console.error('❌ Erro ao resetar:', error);
      setSyncStatus('error');
      alert('❌ Erro ao resetar dados.');
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([originalCsvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_situacoes_fiscais.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular dados agregados quando filtros mudarem
  useEffect(() => {
    if (data.length === 0) {
      setAggregatedData(null);
      return;
    }

    // Só calcular se pelo menos um grupo estiver selecionado
    if (grupoSelecionado.length === 0) {
      setAggregatedData(null);
      return;
    }

    console.log('🔄 Recalculando dados agregados...');
    console.log('🏢 Grupos selecionados:', grupoSelecionado);
    console.log('🏭 Empresas selecionadas:', empresasSelecionadas);

    // Filtrar por grupo
    let filteredData = data.filter(item => grupoSelecionado.includes(item.GRUPO));
    console.log('📊 Dados após filtro de grupo:', filteredData.length);

    // Filtrar por empresa se selecionadas
    if (empresasSelecionadas.length > 0) {
      filteredData = filteredData.filter(item => empresasSelecionadas.includes(item['Nome da Empresa']));
      console.log('📊 Dados após filtro de empresa:', filteredData.length);
    }

    const aggregated = aggregateData(filteredData);
    console.log('📈 Dados agregados calculados:', aggregated);
    setAggregatedData(aggregated);
  }, [data, grupoSelecionado, empresasSelecionadas]);

  // Auto-selecionar empresas quando grupo mudar
  useEffect(() => {
    if (grupoSelecionado.length > 0 && data.length > 0) {
      const empresasDoGrupo = [...new Set(data
        .filter(item => grupoSelecionado.includes(item.GRUPO))
        .map(item => item['Nome da Empresa'])
      )].sort();
      
      console.log('🏭 Auto-selecionando empresas do grupo:', empresasDoGrupo);
      setEmpresasSelecionadas(empresasDoGrupo);
    } else {
      setEmpresasSelecionadas([]);
    }
  }, [grupoSelecionado, data]);

  // Calcular listas únicas
  const empresasUnicas = [...new Set(data.map(item => item['Nome da Empresa']))].sort();
  const gruposUnicos = [...new Set(data.map(item => item.GRUPO))].sort();
  
  const empresasDoGrupo = grupoSelecionado.length > 0 
    ? [...new Set(data
        .filter(item => grupoSelecionado.includes(item.GRUPO))
        .map(item => item['Nome da Empresa'])
      )].sort()
    : [];

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1B34] to-[#1E3A8A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div className="text-white text-xl">Carregando dados...</div>
          <div className="text-[#E5F0FF]/60 text-sm">Sincronizando com a nuvem...</div>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Dados para exibição (null se nenhum grupo selecionado)
  const displayData = aggregatedData || {
    totalFederal: null,
    totalPGFN: null,
    totalEstadual: null,
    totalMunicipal: null,
    debitosPorGrupo: [],
    distribuicaoPorTipo: [],
    debitosPorEmpresa: [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1B34] to-[#1E3A8A]">
      <Sidebar
        currentUser={currentUser}
        gruposUnicos={gruposUnicos}
        empresasDoGrupo={empresasDoGrupo}
        grupoSelecionado={grupoSelecionado}
        empresasSelecionadas={empresasSelecionadas}
        onGrupoChange={setGrupoSelecionado}
        onEmpresaChange={setEmpresasSelecionadas}
        onFileUpload={handleFileUpload}
        onResetToDefault={handleResetToDefault}
        onDownloadTemplate={handleDownloadTemplate}
        isUsingCustomData={isUsingCustomData}
        isLoading={loading}
        onLogout={handleLogout}
        onResetDashboard={handleResetDashboard}
      />
      
      <div className="ml-60 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-2">Dashboard Fiscal</h1>
          <div className="flex items-center gap-4">
            <p className="text-[#E5F0FF]/80">
              Análise de Situações Fiscais - {getUserDisplayName(currentUser)}
            </p>
            
            {/* Status badges */}
            <div className="flex gap-2">
              {isUsingCustomData && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                  📊 Dados Centralizados
                </span>
              )}
              
              {syncStatus === 'syncing' && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30 animate-pulse">
                  🔄 Sincronizando...
                </span>
              )}
              
              {syncStatus === 'synced' && (
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                  ✅ Sincronizado
                </span>
              )}
              
              {syncStatus === 'error' && (
                <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30">
                  ⚠️ Erro na Sincronização
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Total Débitos Federais"
            value={displayData.totalFederal}
            icon={<TrendingUp size={24} className="text-white" />}
            color="bg-[#2F6BFF]"
          />
          <MetricCard
            title="Total Débitos PGFN"
            value={displayData.totalPGFN}
            icon={<Building size={24} className="text-white" />}
            color="bg-[#1E40AF]"
          />
          <MetricCard
            title="Total Débitos Estaduais"
            value={displayData.totalEstadual}
            icon={<AlertTriangle size={24} className="text-white" />}
            color="bg-[#F97316]"
          />
          <MetricCard
            title="Total Débitos Municipais"
            value={displayData.totalMunicipal}
            icon={<FileText size={24} className="text-white" />}
            color="bg-[#6B7280]"
          />
        </div>

        {/* Charts */}
        <Charts
          debitosPorGrupo={displayData.debitosPorGrupo}
          distribuicaoPorTipo={displayData.distribuicaoPorTipo}
          debitosPorEmpresa={displayData.debitosPorEmpresa}
        />
      </div>
    </div>
  );
}

const getUserDisplayName = (username: string) => {
  const userNames: { [key: string]: string } = {
    'cfsmart': 'CF Smart',
    'pralog': 'Pralog'
  };
  return userNames[username] || username;
};

export default App;