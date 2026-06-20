import { useState, useMemo } from 'react';
import { useDataStore } from '../store/useDataStore';
import type { Commission } from '../types';
import {
  DollarSign, CheckCircle, Clock, TrendingUp, User,
  ChevronDown, Search, Trophy, Filter, CreditCard,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PERIOD_OPTIONS = [
  { label: 'Este mês', value: 'month' },
  { label: 'Esta semana', value: 'week' },
  { label: 'Todos', value: 'all' },
] as const;
type Period = (typeof PERIOD_OPTIONS)[number]['value'];

function inPeriod(dateStr: string, period: Period): boolean {
  const d = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  if (period === 'all') return true;
  if (period === 'month')
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }
  return true;
}

// ─── sub-components ──────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-surface-900 dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Commission['status'] }) {
  return status === 'paid' ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
      <CheckCircle className="w-3 h-3" /> Pago
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" /> Pendente
    </span>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────
export function CommissionsPage() {
  const { commissions, markCommissionPaid } = useDataStore();

  const [period, setPeriod] = useState<Period>('month');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null);

  // unique employees
  const employees = useMemo(() => {
    const names = [...new Set(commissions.map((c) => c.employeeName))].sort();
    return names;
  }, [commissions]);

  // filtered list
  const filtered = useMemo(() => {
    return commissions.filter((c) => {
      if (!inPeriod(c.date, period)) return false;
      if (employeeFilter !== 'all' && c.employeeName !== employeeFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search && !c.serviceDescription.toLowerCase().includes(search.toLowerCase()) && !c.employeeName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [commissions, period, employeeFilter, statusFilter, search]);

  // KPIs
  const totalPending = filtered.filter((c) => c.status === 'pending').reduce((s, c) => s + c.commissionValue, 0);
  const totalPaid = filtered.filter((c) => c.status === 'paid').reduce((s, c) => s + c.commissionValue, 0);
  const totalAll = filtered.reduce((s, c) => s + c.commissionValue, 0);

  // top employee
  const byEmployee = employees.map((name) => ({
    name,
    total: filtered.filter((c) => c.employeeName === name).reduce((s, c) => s + c.commissionValue, 0),
    count: filtered.filter((c) => c.employeeName === name).length,
  })).sort((a, b) => b.total - a.total);
  const topEmployee = byEmployee[0];

  const handlePayAll = () => {
    filtered.filter((c) => c.status === 'pending').forEach((c) => markCommissionPaid(c.id));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Comissões</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Acompanhamento e pagamento de comissões da equipe</p>
        </div>

        {/* Period picker */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-sm font-medium text-surface-700 dark:text-surface-300 hover:border-primary-400 transition-colors"
          >
            <Filter className="w-4 h-4 text-surface-400" />
            {PERIOD_OPTIONS.find((p) => p.value === period)?.label}
            <ChevronDown className="w-4 h-4 text-surface-400" />
          </button>
          {showPeriodMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] shadow-lg z-20 min-w-[160px] py-1">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setPeriod(opt.value); setShowPeriodMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors ${period === opt.value ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-surface-700 dark:text-surface-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Total a Pagar"
          value={fmt(totalPending)}
          icon={Clock}
          color="bg-amber-500"
          sub={`${filtered.filter((c) => c.status === 'pending').length} lançamentos`}
        />
        <SummaryCard
          label="Total Pago no Período"
          value={fmt(totalPaid)}
          icon={CheckCircle}
          color="bg-emerald-500"
          sub={`${filtered.filter((c) => c.status === 'paid').length} lançamentos`}
        />
        <SummaryCard
          label="Volume Total"
          value={fmt(totalAll)}
          icon={TrendingUp}
          color="bg-primary-500"
          sub={`${filtered.length} lançamentos`}
        />
        <SummaryCard
          label="Destaque do Período"
          value={topEmployee?.name.split(' ')[0] ?? '—'}
          icon={Trophy}
          color="bg-rose-500"
          sub={topEmployee ? fmt(topEmployee.total) : undefined}
        />
      </div>

      {/* Employee breakdown */}
      {byEmployee.length > 0 && (
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-5">
          <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-500" /> Ranking por Funcionário
          </h2>
          <div className="space-y-3">
            {byEmployee.map((emp, i) => {
              const pct = totalAll > 0 ? (emp.total / totalAll) * 100 : 0;
              return (
                <div key={emp.name} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-surface-800 dark:text-white truncate">{emp.name}</span>
                      <span className="text-sm font-bold text-surface-900 dark:text-white ml-2">{fmt(emp.total)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters + table */}
      <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-surface-100 dark:border-surface-700">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por serviço ou funcionário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>

          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          >
            <option value="all">Todos os funcionários</option>
            {employees.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>

          <div className="flex rounded-[var(--radius-md)] overflow-hidden border border-surface-200 dark:border-surface-700">
            {(['all', 'pending', 'paid'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary-500 text-white' : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
              >
                {s === 'all' ? 'Todos' : s === 'pending' ? 'Pendente' : 'Pago'}
              </button>
            ))}
          </div>

          {filtered.some((c) => c.status === 'pending') && (
            <button
              onClick={handlePayAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-[var(--radius-md)] transition-colors shadow-sm"
            >
              <CreditCard className="w-4 h-4" /> Pagar Todos Pendentes
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-900/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Funcionário</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Serviço / Produto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Data</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Venda</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">% Com.</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Comissão</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-surface-400 text-sm">
                    Nenhum lançamento encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filtered
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-400 shrink-0">
                            {c.employeeName.charAt(0)}
                          </div>
                          <span className="font-medium text-surface-800 dark:text-white">{c.employeeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-surface-600 dark:text-surface-400 max-w-xs truncate">{c.serviceDescription}</td>
                      <td className="px-4 py-3 text-surface-500 dark:text-surface-400 whitespace-nowrap">
                        {new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-surface-700 dark:text-surface-300">{fmt(c.saleAmount)}</td>
                      <td className="px-4 py-3 text-right text-surface-500 dark:text-surface-400">{c.commissionRate}%</td>
                      <td className="px-4 py-3 text-right font-bold text-primary-600 dark:text-primary-400">{fmt(c.commissionValue)}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {c.status === 'pending' && (
                          confirmPayId === c.id ? (
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => { markCommissionPaid(c.id); setConfirmPayId(null); }}
                                className="px-2 py-1 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setConfirmPayId(null)}
                                className="px-2 py-1 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmPayId(c.id)}
                              className="px-3 py-1 text-xs font-semibold border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            >
                              Marcar Pago
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-surface-100 dark:border-surface-700 flex flex-wrap justify-end gap-6 bg-surface-50 dark:bg-surface-900/30">
            <span className="text-xs text-surface-500">{filtered.length} lançamentos</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">A pagar: {fmt(totalPending)}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Pago: {fmt(totalPaid)}</span>
            <span className="text-xs font-bold text-surface-800 dark:text-white">Total: {fmt(totalAll)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
