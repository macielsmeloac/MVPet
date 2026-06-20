import { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import { DollarSign, ArrowUpRight, ArrowDownRight, Filter, Download, Plus, Search } from 'lucide-react';
import type { Transaction } from '../types';

export function FinancialPage() {
  const { transactions } = useDataStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions
    .filter((t) => filterType === 'all' || t.type === filterType)
    .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const typeLabel: Record<string, string> = {
    income: 'Receita',
    expense: 'Despesa'
  };

  const paymentMethodLabel: Record<string, string> = {
    pix: 'PIX', credit: 'Cartão de Crédito', debit: 'Cartão de Débito', cash: 'Dinheiro', transfer: 'Transferência'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" /> Financeiro
          </h1>
          <p className="text-sm text-surface-500">Gestão de receitas, despesas e fluxo de caixa</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 rounded-[var(--radius-md)] hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-[var(--radius-md)] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Nova Transação
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-500">Total Receitas</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-500">Total Despesas</span>
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-danger" />
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-500">Saldo Previsto</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${balance >= 0 ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <DollarSign className={`w-4 h-4 ${balance >= 0 ? 'text-primary-500' : 'text-danger'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-surface-900 dark:text-white' : 'text-danger'}`}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar transação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-surface-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200"
            >
              <option value="all">Todas</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-50 dark:bg-surface-900/50 text-surface-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Pagamento</th>
                <th className="px-6 py-3 text-right">Valor</th>
                <th className="px-6 py-3 text-center">Status NF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-surface-500">Nenhuma transação encontrada</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-surface-600 dark:text-surface-400">{t.date}</td>
                    <td className="px-6 py-4 font-medium text-surface-800 dark:text-surface-200">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className="bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 px-2 py-1 rounded text-xs">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{paymentMethodLabel[t.paymentMethod]}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-danger'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {t.invoiceStatus ? (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          t.invoiceStatus === 'issued' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          t.invoiceStatus === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {t.invoiceStatus === 'issued' ? 'Emitida' : t.invoiceStatus === 'pending' ? 'Pendente' : 'Cancelada'}
                        </span>
                      ) : (
                        <span className="text-surface-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
