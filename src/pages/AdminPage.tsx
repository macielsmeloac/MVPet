import { Building, Users, Settings as SettingsIcon } from 'lucide-react';

export function AdminPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Administração da Clínica</h1>
          <p className="text-sm text-surface-500">Gestão interna, equipe e dados fiscais</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Dados da Clínica */}
        <div className="bg-white dark:bg-surface-800 p-6 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-surface-400" />
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Dados da Clínica</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Nome Fantasia</label>
              <input type="text" defaultValue="Minha Clínica Vet" className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md bg-surface-50 dark:bg-surface-900" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">CNPJ</label>
              <input type="text" defaultValue="00.000.000/0001-00" className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md bg-surface-50 dark:bg-surface-900" disabled />
            </div>
          </div>
        </div>

        {/* Card: Gestão de Equipe */}
        <div className="bg-white dark:bg-surface-800 p-6 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-surface-400" />
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Equipe</h2>
            </div>
            <button className="px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-md font-medium">Novo Membro</button>
          </div>
          <div className="space-y-3">
            <div className="p-3 border border-surface-200 dark:border-surface-700 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-surface-900 dark:text-white">Dr. Carlos (Vet)</p>
                <p className="text-xs text-surface-500">Acesso: Profissional</p>
              </div>
              <button className="text-sm text-blue-600 font-medium">Editar</button>
            </div>
            <div className="p-3 border border-surface-200 dark:border-surface-700 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-surface-900 dark:text-white">Ana (Recepção)</p>
                <p className="text-xs text-surface-500">Acesso: Recepcionista</p>
              </div>
              <button className="text-sm text-blue-600 font-medium">Editar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
