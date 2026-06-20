import { FileText, Stethoscope, Clock } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';

export function TutorMedicalRecordsPage() {
  const { tutorAuth } = useTutorStore();

  if (!tutorAuth) return null;

  // Mock data
  const records = [
    {
      id: 'rec-1',
      petName: 'Rex',
      date: '10/10/2026',
      type: 'Consulta de Rotina',
      vet: 'Dr. Marcos',
      summary: 'Animal apresenta bom estado geral. Exame clínico sem alterações evidentes.',
    },
    {
      id: 'rec-2',
      petName: 'Luna',
      date: '05/09/2026',
      type: 'Internação (Boletim)',
      vet: 'Dra. Ana',
      summary: 'Paciente estável, alimentou-se bem pela manhã. Aguardando resultado do hemograma.',
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Prontuários e Boletins</h1>
        <p className="text-surface-500">Histórico de atendimentos e internações dos seus pets nesta clínica.</p>
      </div>

      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-indigo-500" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                  {record.petName}
                  <span className="text-sm font-normal text-surface-500">({record.type})</span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <Clock className="w-4 h-4" />
                  {record.date}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                <Stethoscope className="w-4 h-4" />
                {record.vet}
              </div>
              
              <p className="text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-900 p-3 rounded-lg text-sm border border-surface-100 dark:border-surface-700">
                {record.summary}
              </p>
            </div>
          </div>
        ))}

        {records.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700">
            <FileText className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <p className="text-surface-500 font-medium">Nenhum prontuário encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
