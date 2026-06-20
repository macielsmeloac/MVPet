import { FileText, Stethoscope, Clock, Activity } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';
import { format, parseISO } from 'date-fns';

export function TutorMedicalRecordsPage() {
  const { tutorAuth, pets, medicalRecords, hospitalizations } = useTutorStore();

  if (!tutorAuth) return null;

  const records: any[] = [];

  // Add standard medical records
  medicalRecords.forEach(mr => {
    const petName = pets.find(p => p.id === mr.petId)?.name || 'Pet';
    records.push({
      id: `mr-${mr.id}`,
      petName,
      date: mr.date,
      sortDate: new Date(mr.date).getTime(),
      type: 'Consulta',
      vet: mr.veterinarianName,
      summary: mr.conduct || mr.observations || 'Sem observações clínicas cadastradas.',
      icon: <FileText className="w-6 h-6 text-indigo-500" />,
      bg: 'bg-indigo-50 dark:bg-indigo-900/30'
    });
  });

  // Add daily reports (boletins) from hospitalizations
  hospitalizations.forEach(hosp => {
    const petName = pets.find(p => p.id === hosp.petId)?.name || 'Pet';
    if (hosp.evolution && Array.isArray(hosp.evolution)) {
      hosp.evolution.forEach((evo: any) => {
        records.push({
          id: `evo-${evo.id}`,
          petName,
          date: evo.date, // usually an ISO string
          sortDate: new Date(evo.date).getTime(),
          type: 'Boletim Diário (Internação)',
          vet: evo.veterinarian || hosp.veterinarianName,
          summary: evo.clinical_evolution || 'Evolução clínica sem detalhes.',
          icon: <Activity className="w-6 h-6 text-rose-500" />,
          bg: 'bg-rose-50 dark:bg-rose-900/30'
        });
      });
    }
  });

  // Sort descending by date
  records.sort((a, b) => b.sortDate - a.sortDate);

  const formatDate = (dateString: string) => {
    try {
      if (dateString.includes('T')) {
        return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
      }
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Prontuários e Boletins</h1>
        <p className="text-surface-500">Histórico de atendimentos e internações dos seus pets nesta clínica.</p>
      </div>

      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl ${record.bg} flex items-center justify-center shrink-0`}>
              {record.icon}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                  {record.petName}
                  <span className="text-sm font-normal text-surface-500">({record.type})</span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <Clock className="w-4 h-4" />
                  {formatDate(record.date)}
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
            <p className="text-surface-500 font-medium">Nenhum prontuário ou boletim encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
