// Verificar se as variáveis de ambiente do Supabase estão disponíveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Função para obter o cliente Supabase de forma assíncrona
export async function getSupabaseClient() {
  if (supabaseUrl && supabaseAnonKey) {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return null
}

export interface CsvData {
  id?: string
  user_id: string
  csv_content: string
  created_at?: string
  updated_at?: string
}

export const csvService = {
  // Salvar dados CSV na nuvem (só funciona se Supabase estiver configurado)
  async saveCsvData(userId: string, csvContent: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      console.log('Supabase não configurado - salvando apenas localmente')
      return
    }

    try {
      // Primeiro, tentar atualizar registro existente
      const { data: existingData, error: selectError } = await supabase
        .from('csv_data')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Erro ao verificar dados existentes:', selectError)
        throw selectError
      }

      let error
      if (existingData) {
        // Atualizar registro existente
        console.log('📝 Atualizando registro existente...')
        const result = await supabase
          .from('csv_data')
          .update({
            csv_content: csvContent,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
        error = result.error
      } else {
        // Criar novo registro
        console.log('➕ Criando novo registro...')
        const result = await supabase
          .from('csv_data')
          .insert({
            user_id: userId,
            csv_content: csvContent,
            updated_at: new Date().toISOString()
          })
        error = result.error
      }

      if (error) {
        console.error('Erro ao salvar CSV:', error)
        throw error
      } else {
        console.log('✅ Dados salvos com sucesso na nuvem!')
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
      throw error // Re-throw para que o App.tsx possa tratar
    }
  },

  // Carregar dados CSV da nuvem
  async loadCsvData(userId: string): Promise<string | null> {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      console.log('⚠️ Supabase não configurado');
      return null
    }

    console.log('🔍 Buscando dados na nuvem para usuário:', userId);
    
    try {
      const { data, error } = await supabase
        .from('csv_data')
        .select('csv_content')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .single()

      if (error) {
        console.error('❌ Erro ao carregar CSV da nuvem:', error);
        if (error.code === 'PGRST116') {
          console.log('📭 Nenhum dado encontrado na nuvem para:', userId);
        }
        return null
      }

      const csvContent = data?.csv_content || null;
      console.log('✅ Dados carregados da nuvem:', csvContent ? 'SIM' : 'NÃO');
      if (csvContent) {
        console.log('📊 Tamanho dos dados:', csvContent.length, 'caracteres');
        console.log('📄 Preview:', csvContent.substring(0, 100));
      }
      
      return csvContent;
    } catch (error) {
      console.error('❌ Erro crítico ao carregar da nuvem:', error);
      return null
    }
  },

  // Verificar se há dados mais recentes na nuvem
  async getLastUpdated(userId: string): Promise<string | null> {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('csv_data')
        .select('updated_at')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        return null
      }

      return data.updated_at
    } catch (error) {
      console.error('Erro ao verificar última atualização:', error)
      return null
    }
  },

  // Configurar listener para mudanças em tempo real
  async subscribeToChanges(userId: string, onUpdate: (csvContent: string) => void) {
    const supabase = await getSupabaseClient()
    if (!supabase) {
      console.log('Supabase não disponível para tempo real');
      return null
    }

    console.log('🔄 Configurando sincronização em tempo real para:', userId);
    
    const subscription = supabase
      .channel('csv_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'csv_data',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📡 Dados atualizados em tempo real:', payload);
          if (payload.new && payload.new.csv_content) {
            console.log('✅ Aplicando novos dados...');
            onUpdate(payload.new.csv_content)
          } else {
            console.log('⚠️ Payload sem csv_content:', payload);
          }
        }
      )
      .subscribe()

    console.log('📻 Subscription ativa:', subscription);
    return subscription
  },

  // Cancelar subscription
  async unsubscribe(subscription: any) {
    const supabase = await getSupabaseClient()
    if (subscription && supabase) {
      supabase.removeChannel(subscription)
    }
  }
}