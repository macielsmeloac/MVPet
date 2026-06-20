import { ClipboardList, Download, FileText, FlaskConical } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';
import { format, parseISO } from 'date-fns';

export function TutorPrescriptionsExamsPage() {
  const { tutorAuth, pets, medicalRecords } = useTutorStore();

  if (!tutorAuth) return null;

  const documents: any[] = [];

  // Extract prescriptions from medical records
  medicalRecords.forEach(mr => {
    if (mr.prescriptions && Array.isArray(mr.prescriptions) && mr.prescriptions.length > 0) {
      const petName = pets.find(p => p.id === mr.petId)?.name || 'Pet';
      
      // For each prescription in the array
      mr.prescriptions.forEach((presc: any, index: number) => {
        documents.push({
          id: `presc-${mr.id}-${index}`,
          petName,
          date: mr.date,
          sortDate: new Date(mr.date).getTime(),
          type: 'prescription',
          title: presc.medication ? `Receita - ${presc.medication}` : 'Receita Médica',
          vet: mr.veterinarianName,
        });
      });
    }
  });

  // Sort descending by date
  documents.sort((a, b) => b.sortDate - a.sortDate);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Receitas</h1>
        <p className="text-surface-500">Acesse as prescrições médicas emitidas para seus pets.</p>
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
                  <span className="font-medium text-surface-700 dark:text-surface-300">{doc.petName}</span> • {formatDate(doc.date)}
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

        {documents.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700">
            <FileText className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <p className="text-surface-500 font-medium">Nenhuma receita encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
