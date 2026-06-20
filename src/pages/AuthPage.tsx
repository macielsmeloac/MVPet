import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PawPrint, Mail, Lock, Loader2, Building, ShieldAlert, UserCog } from 'lucide-react';
import { useAuthStore, UserRole } from '../store/useAuthStore';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setRole } = useAuthStore();

  const handleSimulatedLogin = (role: UserRole) => {
    setRole(role);
    // Cria uma sessão falsa para bypassar a verificação do App.tsx no modo de testes locais
    useAuthStore.setState({ 
      session: { 
        access_token: 'fake', 
        refresh_token: 'fake', 
        expires_in: 3600, 
        token_type: 'bearer', 
        user: { id: 'fake-user', aud: 'authenticated', role: 'authenticated', email: 'admin@demo.com', app_metadata: {}, user_metadata: {}, created_at: '', updated_at: '' } 
      } 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              clinic_name: clinicName,
            }
          }
        });
        if (error) throw error;
        // Optionally show a message to check email for confirmation
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-[-10deg]">
            <PawPrint className="w-10 h-10 text-white transform rotate-[10deg]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-surface-900 dark:text-white">
          {isLogin ? 'Acesse sua conta' : 'Cadastre sua Clínica'}
        </h2>
        <p className="mt-2 text-center text-sm text-surface-600 dark:text-surface-400">
          {isLogin ? 'Não possui conta?' : 'Já possui conta?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            {isLogin ? 'Cadastre-se grátis' : 'Faça login'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-surface-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-surface-200 dark:border-surface-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Nome da Clínica
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm"
                    placeholder="Minha Clínica Vet"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                E-mail
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-surface-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="voce@clinica.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-surface-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? 'Entrar no Sistema' : 'Criar Conta Grátis'
                )}
              </button>
            </div>
          </form>

          {/* Simulação de Perfis para Teste */}
          <div className="mt-8 border-t border-surface-200 dark:border-surface-700 pt-6">
            <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider text-center mb-4">
              Acesso Rápido de Testes (Simulador)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleSimulatedLogin('admin')}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-surface-300 dark:border-surface-600 rounded-lg shadow-sm text-sm font-bold text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
              >
                <UserCog className="w-4 h-4 text-blue-500" /> Entrar como Admin da Clínica
              </button>
              <button
                onClick={() => handleSimulatedLogin('superadmin')}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-surface-300 dark:border-surface-600 rounded-lg shadow-sm text-sm font-bold text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Entrar como Super Admin (SaaS)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
