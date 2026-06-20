import { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import { BarChart3, TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function ReportsPage() {
  const { transactions, appointments } = useDataStore();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Calculate metrics...
  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  // Dummy data for the SVG charts
  const revenueData = [
    { label: 'Seg', value: 1200 },
    { label: 'Ter', value: 1900 },
    { label: 'Qua', value: 1500 },
    { label: 'Qui', value: 2200 },
    { label: 'Sex', value: 2800 },
    { label: 'Sáb', value: 3500 },
    { label: 'Dom', value: 1100 },
  ];
  const maxRevenue = Math.max(...revenueData.map(d => d.value));

  const serviceData = [
    { label: 'Consultas', value: 85 },
    { label: 'Vacinas', value: 42 },
    { label: 'Banhos', value: 120 },
    { label: 'Cirurgias', value: 15 },
    { label: 'Exames', value: 64 },
  ];
  const maxService = Math.max(...serviceData.map(d => d.value));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Relatórios e BI</h1>
          <p className="text-surface-500 text-sm mt-1">Visão estratégica e indicadores de desempenho da clínica</p>
        </div>
        <select 
          value={period} 
          onChange={e => setPeriod(e.target.value as any)}
          className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 rounded-[var(--radius-md)] px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 3 meses</option>
          <option value="1y">Este ano</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-surface-500">Receita Bruta</p>
              <h3 className="text-2xl font-bold text-surface-900 dark:text-white mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-4 h-4" /> <span>+12.5%</span> <span className="text-surface-400 font-normal text-xs ml-1">vs. mês anterior</span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-surface-500">Despesas</p>
              <h3 className="text-2xl font-bold text-surface-900 dark:text-white mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
            <ArrowUpRight className="w-4 h-4" /> <span>+4.2%</span> <span className="text-surface-400 font-normal text-xs ml-1">vs. mês anterior</span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-surface-500">Lucro Líquido</p>
              <h3 className="text-2xl font-bold text-surface-900 dark:text-white mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netProfit)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-4 h-4" /> <span>+18.3%</span> <span className="text-surface-400 font-normal text-xs ml-1">vs. mês anterior</span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-surface-500">Atendimentos</p>
              <h3 className="text-2xl font-bold text-surface-900 dark:text-white mt-1">
                {appointments.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
            <ArrowDownRight className="w-4 h-4" /> <span>-2.1%</span> <span className="text-surface-400 font-normal text-xs ml-1">vs. mês anterior</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-surface-800 p-6 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-8">Receita Diária (Últimos 7 dias)</h3>
          <div className="h-64 flex items-end justify-between gap-2 pb-6 border-b border-surface-100 dark:border-surface-700 relative">
            {revenueData.map((d, i) => {
              const height = (d.value / maxRevenue) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-surface-800 dark:bg-white text-white dark:text-surface-900 text-xs px-2 py-1 rounded mb-2 whitespace-nowrap z-10 absolute pointer-events-none shadow-lg -top-10" >
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.value)}
                  </div>
                  <div className="w-full max-w-[40px] bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-400 dark:hover:bg-emerald-500 rounded-t-sm transition-all duration-300 relative overflow-hidden" style={{ height: `${height}%` }}>
                    <div className="absolute bottom-0 w-full bg-emerald-500 dark:bg-emerald-400" style={{ height: '3px' }} />
                  </div>
                  <span className="text-xs font-medium text-surface-500 mt-3 absolute -bottom-6">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Services Chart */}
        <div className="bg-white dark:bg-surface-800 p-6 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-6">Serviços Mais Realizados</h3>
          <div className="space-y-5">
            {serviceData.map((d, i) => {
              const width = (d.value / maxService) * 100;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-surface-700 dark:text-surface-300">{d.label}</span>
                    <span className="text-surface-500 font-medium">{d.value} un.</span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
