import { HeartPulse, Syringe, Calendar, Bell } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';
import { isAfter, isBefore, addDays, parseISO, format } from 'date-fns';

export function TutorDashboardPage() {
  const { tutorAuth, pets, vaccinations, hospitalizations, appointments } = useTutorStore();

  if (!tutorAuth) return null;

  const today = new Date();
  
  // Calculate upcoming notices
  const notices: any[] = [];
  
  // Add upcoming appointments (next 7 days)
  appointments.forEach(app => {
    const appDate = parseISO(app.date);
    if (isAfter(appDate, today) && isBefore(appDate, addDays(today, 7))) {
      const petName = pets.find(p => p.id === app.petId)?.name || 'Pet';
      notices.push({
        id: `app-${app.id}`,
        icon: <Calendar className="w-5 h-5 text-blue-500" />,
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        title: `Agendamento - ${petName}`,
        desc: `${format(appDate, 'dd/MM/yyyy')} às ${app.time}`
      });
    }
  });

  // Add upcoming vaccines (next 15 days)
  vaccinations.forEach(vac => {
    if (vac.nextDoseDate) {
      const nextDate = parseISO(vac.nextDoseDate);
      if (isAfter(nextDate, today) && isBefore(nextDate, addDays(today, 15))) {
        const petName = pets.find(p => p.id === vac.petId)?.name || 'Pet';
        notices.push({
          id: `vac-${vac.id}`,
          icon: <Syringe className="w-5 h-5 text-amber-500" />,
          bg: 'bg-amber-50 dark:bg-amber-900/30',
          title: `Vacina ${vac.vaccineName} de ${petName} vence em breve`,
          desc: `Agende a aplicação até dia ${format(nextDate, 'dd/MM/yyyy')}.`
        });
      }
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Resumo dos Pets</h1>
          <p className="text-surface-500">Acompanhe a saúde e os compromissos dos seus animais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map(pet => {
          // Status calculation
          const isHospitalized = hospitalizations.some(h => h.petId === pet.id && h.status === 'active');
          const statusText = isHospitalized ? 'Internado' : 'Aparentemente Saudável';

          // Next vaccine calculation
          const petVacs = vaccinations.filter(v => v.petId === pet.id && v.nextDoseDate);
          let nextVacStr = 'Sem previsão';
          if (petVacs.length > 0) {
            const sortedVacs = petVacs.sort((a, b) => new Date(a.nextDoseDate!).getTime() - new Date(b.nextDoseDate!).getTime());
            const nextUpcoming = sortedVacs.find(v => isAfter(parseISO(v.nextDoseDate!), today));
            if (nextUpcoming) {
              nextVacStr = format(parseISO(nextUpcoming.nextDoseDate!), 'dd/MM/yyyy');
            }
          }

          return (
            <div key={pet.id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {pet.photoUrl ? (
                    <img 
                      src={pet.photoUrl} 
                      alt={pet.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900/50"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800 text-indigo-500 font-bold text-xl">
                      {pet.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-surface-900 dark:text-white">{pet.name}</h3>
                    <p className="text-sm text-surface-500">{pet.breed}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                      <HeartPulse className={`w-4 h-4 ${isHospitalized ? 'text-amber-500' : 'text-rose-500'}`} />
                      <span>Status Clínico</span>
                    </div>
                    <span className="font-medium text-surface-900 dark:text-white">{statusText}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                      <Syringe className="w-4 h-4 text-emerald-500" />
                      <span>Próxima Vacina</span>
                    </div>
                    <span className="font-medium text-surface-900 dark:text-white">{nextVacStr}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {pets.length === 0 && (
          <div className="col-span-full py-12 text-center text-surface-500">
            Nenhum pet encontrado.
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          Avisos Recentes
        </h2>
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 divide-y divide-surface-100 dark:divide-surface-700/50">
          {notices.length > 0 ? notices.map(notice => (
            <div key={notice.id} className="p-4 flex gap-4">
              <div className={`w-10 h-10 rounded-full ${notice.bg} flex items-center justify-center shrink-0`}>
                {notice.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{notice.title}</p>
                <p className="text-xs text-surface-500">{notice.desc}</p>
              </div>
            </div>
          )) : (
            <div className="p-6 text-center text-surface-500 text-sm">
              Nenhum aviso recente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
