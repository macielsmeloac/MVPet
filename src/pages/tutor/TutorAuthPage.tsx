import { useState } from 'react';
import { PawPrint, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';
import { useNavigate } from 'react-router-dom';

export function TutorAuthPage() {
  const [cpfOrEmail, setCpfOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useTutorStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(cpfOrEmail);
      if (success) {
        navigate('/tutor');
      } else {
        setError('Tutor não encontrado. Verifique seu E-mail ou CPF.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute left-0 top-2 p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
          title="Voltar para Clínica"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-surface-900 dark:text-white">
          Portal do Cliente
        </h2>
        <p className="mt-2 text-center text-sm text-surface-600 dark:text-surface-400">
          Acesse os dados do seu pet, vacinas e exames
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

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                E-mail ou CPF
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-surface-400" />
                </div>
                <input
                  type="text"
                  required
                  value={cpfOrEmail}
                  onChange={(e) => setCpfOrEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Seu E-mail ou CPF"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Acessar Portal'
                )}
              </button>
            </div>
            
            <div className="text-center text-xs text-surface-500 mt-4">
              Para testar, digite qualquer e-mail (ex: tutor@exemplo.com)
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
