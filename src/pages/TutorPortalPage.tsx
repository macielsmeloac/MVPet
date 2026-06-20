import { UserCircle, ShieldCheck, FileText, Smartphone } from 'lucide-react';

export function TutorPortalPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto mb-4">
          <UserCircle className="w-8 h-8 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Portal do Tutor (White-label)</h1>
        <p className="text-surface-500">
          Um portal exclusivo para seus clientes acessarem via web ou celular.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Carteirinha de Vacinação</h3>
            <p className="text-sm text-surface-500">O tutor acompanha online as vacinas em dia e os próximos reforços do pet.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Exames e Receitas</h3>
            <p className="text-sm text-surface-500">Acesso seguro ao histórico clínico, laudos de exames e receitas prescritas digitalmente.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Agendamento Online</h3>
            <p className="text-sm text-surface-500">Permita que seus clientes agendem banhos e consultas diretamente pelo portal.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 rounded-[var(--radius-xl)] p-8 text-center">
        <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-400 mb-2">Pronto para ativar?</h3>
        <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-6 max-w-lg mx-auto">
          Ative o Portal do Tutor e envie um link personalizado para seus clientes acessarem todas as informações dos pets.
        </p>
        <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-[var(--radius-md)] shadow-sm transition-colors">
          Configurar Meu Portal
        </button>
      </div>
    </div>
  );
}
