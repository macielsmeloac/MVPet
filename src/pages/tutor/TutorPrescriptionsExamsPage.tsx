import { ClipboardList, Download, FileText, FlaskConical } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';

export function TutorPrescriptionsExamsPage() {
  const { tutorAuth } = useTutorStore();

  if (!tutorAuth) return null;

  // Mock data
  const documents = [
    {
      id: 'doc-1',
      petName: 'Rex',
      date: '10/10/2026',
      type: 'prescription',
      title: 'Receita Médica - Antibiótico',
      vet: 'Dr. Marcos',
    },
    {
      id: 'doc-2',
      petName: 'Luna',
      date: '05/09/2026',
      type: 'exam',
      title: 'Resultado de Hemograma',
      vet: 'Laboratório Central',
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Exames e Receitas</h1>
        <p className="text-surface-500">Acesse laudos e prescrições médicas digitalizadas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                doc.type === 'prescription' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500'
              }`}>
                {doc.type === 'prescription' ? <FileText className="w-6 h-6" /> : <FlaskConical className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-sm text-surface-500 flex items-center gap-1">
                  <span className="font-medium text-surface-700 dark:text-surface-300">{doc.petName}</span> • {doc.date}
                </p>
                <p className="text-xs text-surface-400 mt-1">{doc.vet}</p>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-surface-50 hover:bg-surface-100 dark:bg-surface-900 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 font-medium rounded-lg border border-surface-200 dark:border-surface-700 transition-colors">
              <Download className="w-4 h-4" />
              Baixar PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
