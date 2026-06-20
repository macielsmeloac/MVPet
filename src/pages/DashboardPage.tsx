import { useDataStore } from '../store/useDataStore';
import { useAppStore } from '../store/useAppStore';
import { DollarSign, Calendar, Bed, AlertTriangle, TrendingUp, Users, ShoppingCart, Scissors } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { weeklyRevenueData } from '../data/seed';

function MetricCard({ icon: Icon, label, value, change, color, pulse }: {
  icon: typeof DollarSign; label: string; value: string; change?: string; color: string; pulse?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-5 border border-surface-200 dark:border-surface-700 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 ${pulse ? 'animate-pulse-emergency' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            change.startsWith('+') ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
      <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{label}</p>
    </div>
  );
}

function AppointmentRow({ petName, tutorName, time, status, type }: {
  petName: string; tutorName: string; time: string; status: string; type: string;
}) {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    waiting: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'in-progress': 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    completed: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  const statusLabels: Record<string, string> = {
    scheduled: 'Agendado', waiting: 'Aguardando', 'in-progress': 'Em Atendimento', completed: 'Finalizado', cancelled: 'Cancelado',
  };
  const typeLabels: Record<string, string> = {
    consultation: 'Consulta', surgery: 'Cirurgia', grooming: 'Banho/Tosa', vaccine: 'Vacina', exam: 'Exame', return: 'Retorno',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-surface-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-400">
          {petName[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{petName}</p>
          <p className="text-xs text-surface-500">{tutorName} · {typeLabels[type] ?? type}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-surface-500 font-medium">{time}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[status] ?? ''}`}>
          {statusLabels[status] ?? status}
        </span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { appointments, products, hospitalizations, transactions, pets, tutors } = useDataStore();
  const { currentPlan } = useAppStore();

  const today = new Date().toISOString().split('T')[0]!;
  const todayAppointments = appointments.filter((a) => a.date === today);
  const todayRevenue = transactions.filter((t) => t.date === today && t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const activeHospitalizations = hospitalizations.filter((h) => h.status === 'active');
  const lowStockProducts = products.filter((p) => p.alertType === 'low-stock' || p.alertType === 'expiring');

  const showClinic = currentPlan === 'clinic' || currentPlan === 'complete' || currentPlan === 'office';
  const showPetshop = currentPlan === 'petshop' || currentPlan === 'complete';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          Visão geral do seu negócio · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard icon={DollarSign} label="Faturamento Hoje" value={`R$ ${todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} change="+12%" color="bg-emerald-500" />
        <MetricCard icon={Calendar} label="Atendimentos Hoje" value={String(todayAppointments.length)} change="+3" color="bg-primary-500" />
        {showClinic && (
          <MetricCard icon={Bed} label="Pets Internados" value={String(activeHospitalizations.length)} color="bg-amber-500" />
        )}
        {showPetshop && !showClinic && (
          <MetricCard icon={Scissors} label="Banhos Hoje" value={String(todayAppointments.filter(a => a.type === 'grooming').length)} color="bg-pink-500" />
        )}
        <MetricCard
          icon={AlertTriangle}
          label="Alertas de Estoque"
          value={String(lowStockProducts.length)}
          color={lowStockProducts.length > 0 ? 'bg-danger' : 'bg-surface-400'}
          pulse={lowStockProducts.length > 3}
        />
      </div>

      {/* Charts + Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-5 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-surface-800 dark:text-white">Receita Semanal</h2>
              <p className="text-xs text-surface-500">Receitas vs Despesas</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-4 h-4" />
              +18% vs semana anterior
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyRevenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-surface-500)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-surface-500)' }} tickFormatter={(v) => `R$${v / 1000}k`} />
              <Tooltip formatter={(value: any) => [value !== undefined ? `R$ ${Number(value).toLocaleString('pt-BR')}` : '', '']} contentStyle={{ borderRadius: 10, border: '1px solid var(--color-surface-200)', fontSize: 13 }} />
              <Bar dataKey="revenue" name="Receita" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Despesas" fill="var(--color-surface-300)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-5 border border-surface-200 dark:border-surface-700">
          <h2 className="text-base font-semibold text-surface-800 dark:text-white mb-3">Agenda de Hoje</h2>
          <div className="space-y-0 max-h-[300px] overflow-y-auto">
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-8">Nenhum agendamento hoje</p>
            ) : (
              todayAppointments
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((apt) => {
                  const pet = pets.find((p) => p.id === apt.petId);
                  const tutor = tutors.find((t) => t.id === apt.tutorId);
                  return (
                    <AppointmentRow
                      key={apt.id}
                      petName={pet?.name ?? 'Pet'}
                      tutorName={tutor?.name ?? 'Tutor'}
                      time={apt.startTime}
                      status={apt.status}
                      type={apt.type}
                    />
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-4 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-medium text-surface-500">Ticket Médio</span>
          </div>
          <p className="text-xl font-bold text-surface-900 dark:text-white">
            R$ {tutors.length > 0 ? (todayRevenue / Math.max(tutors.length, 1)).toFixed(2) : '0,00'}
          </p>
        </div>
        {showClinic && (
          <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-4 border border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-2 mb-2">
              <Bed className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-surface-500">Ocupação Internação</span>
            </div>
            <p className="text-xl font-bold text-surface-900 dark:text-white">
              {activeHospitalizations.length}/8 leitos
            </p>
            <div className="w-full h-2 bg-surface-100 dark:bg-surface-700 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(activeHospitalizations.length / 8) * 100}%` }} />
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-4 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-surface-500">Total Clientes</span>
          </div>
          <p className="text-xl font-bold text-surface-900 dark:text-white">{tutors.length}</p>
        </div>
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-4 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-medium text-surface-500">Serviço Top</span>
          </div>
          <p className="text-xl font-bold text-surface-900 dark:text-white">Consulta</p>
          <p className="text-xs text-surface-500 mt-0.5">42% dos atendimentos</p>
        </div>
      </div>

      {/* Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] p-5 border border-surface-200 dark:border-surface-700">
          <h2 className="text-base font-semibold text-surface-800 dark:text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-danger" />
            Alertas de Estoque
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-700/50">
                <div className={`w-2 h-8 rounded-full ${
                  product.alertType === 'low-stock' ? 'bg-danger' : 'bg-warning'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{product.name}</p>
                  <p className="text-xs text-surface-500">
                    {product.alertType === 'low-stock'
                      ? `Estoque: ${product.quantity}/${product.minQuantity} un.`
                      : `Vencimento: ${product.expiryDate}`}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  product.alertType === 'low-stock' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {product.alertType === 'low-stock' ? 'Estoque Baixo' : 'Vencendo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
