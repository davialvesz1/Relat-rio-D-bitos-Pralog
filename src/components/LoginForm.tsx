import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, Building } from 'lucide-react';

interface LoginFormProps {
  onLogin: (username: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const users = {
    'cfsmart': 'soubotafogo',
    'pralog': '1234'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simular delay de autenticação para UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const userPassword = users[username.toLowerCase() as keyof typeof users];
    
    if (userPassword && userPassword === password) {
      onLogin(username.toLowerCase());
    } else {
      setError('Usuário ou senha incorretos');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1B34] to-[#1E3A8A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2F6BFF] to-[#1E40AF] rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6 border-2 border-white/20 overflow-hidden">
            <img 
              src={`${import.meta.env.BASE_URL}logocfsmart.jpg`} 
              alt="CF Smart Logo" 
              className="w-16 h-16 object-cover rounded-xl"
            />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Smart Tax</h1>
          <p className="text-[#E5F0FF]/80 text-sm">Dashboard de Situações Fiscais</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-[#0F2A5F] rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-[#2F6BFF]/20 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#2F6BFF]" />
            </div>
          </div>
          
          <h2 className="text-white text-xl font-semibold text-center mb-6">Acesso ao Sistema</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuário */}
            <div className="space-y-2">
              <label className="block text-[#E5F0FF] text-sm font-medium">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#E5F0FF]/60" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0B1B34] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#E5F0FF]/60 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:border-transparent transition-all"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label className="block text-[#E5F0FF] text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#E5F0FF]/60" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B1B34] border border-white/20 rounded-xl pl-10 pr-12 py-3 text-white placeholder-[#E5F0FF]/60 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:border-transparent transition-all"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#E5F0FF]/60 hover:text-[#E5F0FF] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#2F6BFF] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>

          {/* Informações de Acesso */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="bg-[#2F6BFF]/10 border border-[#2F6BFF]/20 rounded-xl p-4">
              <h3 className="text-[#E5F0FF] text-sm font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Usuários Autorizados
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#E5F0FF]/80">CF Smart:</span>
                  <code className="text-[#2F6BFF] bg-[#2F6BFF]/10 px-2 py-1 rounded">cfsmart</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#E5F0FF]/80">Pralog:</span>
                  <code className="text-[#2F6BFF] bg-[#2F6BFF]/10 px-2 py-1 rounded">pralog</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[#E5F0FF]/60 text-xs">
            © 2025 Smart Tax - Sistema de Gestão Fiscal
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;