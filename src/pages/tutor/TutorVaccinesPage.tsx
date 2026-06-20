import { Syringe, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';

export function TutorVaccinesPage() {
  const { tutorAuth } = useTutorStore();

  if (!tutorAuth) return null;

  // Mock data
  const vaccines = [
    {
      id: 'vac-1',
      petName: 'Rex',
      vaccine: 'V10',
      dateGiven: '15/10/2025',
      nextDose: '15/10/2026',
      status: 'due_soon', // up_to_date, due_soon, overdue
    },
    {
      id: 'vac-2',
      petName: 'Rex',
      vaccine: 'Raiva',
      dateGiven: '20/12/2025',
      nextDose: '20/12/2026',
      status: 'up_to_date',
    },
    {
      id: 'vac-3',
      petName: 'Luna',
      vaccine: 'V4 (Felina)',
      dateGiven: '01/01/2025',
      nextDose: '01/01/2026',
      status: 'overdue',
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up_to_date': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'due_soon': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'overdue': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default: return 'text-surface-600 bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'up_to_date': return 'Em dia';
      case 'due_soon': return 'Vence em breve';
      case 'overdue': return 'Atrasada';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up_to_date': return <CheckCircle2 className="w-4 h-4" />;
      case 'due_soon': return <AlertTriangle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Cartão de Vacinas</h1>
        <p className="text-surface-500">Acompanhe o esquema vacinal dos seus pets e não perca os prazos.</p>
      </div>

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-500">
                <th className="p-4">Pet</th>
                <th className="p-4">Vacina</th>
                <th className="p-4">Última Aplicação</th>
                <th className="p-4">Próxima Dose</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {vaccines.map((vac) => (
                <tr key={vac.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="p-4 font-medium text-surface-900 dark:text-white">
                    {vac.petName}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-surface-400" />
                      <span className="text-surface-700 dark:text-surface-300">{vac.vaccine}</span>
                    </div>
                  </td>
                  <td className="p-4 text-surface-600 dark:text-surface-400">
                    {vac.dateGiven}
                  </td>
                  <td className="p-4 font-medium text-surface-900 dark:text-white">
                    {vac.nextDose}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vac.status)}`}>
                      {getStatusIcon(vac.status)}
                      {getStatusLabel(vac.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
