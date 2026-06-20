import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSaaSStore } from '../store/useSaaSStore';
import type { SaaSClient, SaaSInvoice, BusinessPlan, PaymentMethod } from '../types';
import { planConfig } from '../utils/plan-config';
import {
  TrendingUp,
  Users,
  CreditCard,
  Percent,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Ban,
  Play,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function SuperAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const {
    saasClients,
    saasInvoices,
    initializeSaaSData,
    addSaaSClient,
    updateSaaSClient,
    toggleSaaSClientStatus,
    confirmSaaSInvoicePayment
  } = useSaaSStore();

  useEffect(() => {
    initializeSaaSData();
  }, [initializeSaaSData]);

  // Estados locais para filtros e buscas
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<string>('all');
  const [clientPlanFilter, setClientPlanFilter] = useState<string>('all');

  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');

  // Estados para Modais
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState<string | null>(null); // Invoice ID

  // Novo cliente formulário
  const [newClient, setNewClient] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    plan: 'complete' as BusinessPlan,
    monthlyFee: 399.90,
    status: 'active' as SaaSClient['status']
  });

  // Alterar mensalidade dependendo do plano no modal
  useEffect(() => {
    const fees: Record<BusinessPlan, number> = {
      petshop: 199.90,
      clinic: 299.90,
      office: 149.90,
      complete: 399.90
    };
    setNewClient((prev) => ({ ...prev, monthlyFee: fees[prev.plan] }));
  }, [newClient.plan]);

  // Cálculos de Métricas SaaS baseadas no estado
  const activeClinics = saasClients.filter((c) => c.status === 'active');
  const trialClinics = saasClients.filter((c) => c.status === 'trial');
  const suspendedClinics = saasClients.filter((c) => c.status === 'suspended');

  // MRR (Faturamento Recorrente Mensal) = Soma das mensalidades de clientes ativos + trials ativos (opcional, vamos contar apenas os ativos no faturamento)
  const mrrVal = activeClinics.reduce((sum, c) => sum + c.monthlyFee, 0);

  // Total pago acumulado
  const totalPaidRevenue = saasInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Total pendente / atrasado
  const totalPendingInvoices = saasInvoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdueInvoices = saasInvoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Dados para gráficos de faturamento (Simulação de crescimento do SaaS)
  const chartData = [
    { name: 'Jan', receita: mrrVal * 0.7 },
    { name: 'Fev', receita: mrrVal * 0.8 },
    { name: 'Mar', receita: mrrVal * 0.85 },
    { name: 'Abr', receita: mrrVal * 0.95 },
    { name: 'Mai', receita: mrrVal }
  ];

  // Dados para pizza de distribuição de planos
  const planCounts = saasClients.reduce((acc, client) => {
    acc[client.plan] = (acc[client.plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(planCounts).map(([planKey, count]) => ({
    name: planConfig[planKey as BusinessPlan]?.label || planKey,
    value: count
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  // Handler para adicionar cliente
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `client-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('pt-BR');
    
    const billingDate = new Date();
    billingDate.setDate(billingDate.getDate() + (newClient.status === 'trial' ? 10 : 30));
    const nextBillingStr = billingDate.toLocaleDateString('pt-BR');

    const clientToAdd: SaaSClient = {
      id: newId,
      ...newClient,
      registrationDate: dateStr,
      nextBillingDate: nextBillingStr
    };

    addSaaSClient(clientToAdd);
    setShowAddClientModal(false);
    // Limpar form
    setNewClient({
      name: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      plan: 'complete',
      monthlyFee: 399.90,
      status: 'active'
    });
  };

  // Handler para confirmar pagamento manual
  const handlePaymentConfirm = (method: PaymentMethod) => {
    if (showConfirmPaymentModal) {
      confirmSaaSInvoicePayment(showConfirmPaymentModal, method);
      setShowConfirmPaymentModal(null);
    }
  };

  // Filtros aplicados em tempo de execução
  const filteredClients = saasClients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesStatus = clientStatusFilter === 'all' || c.status === clientStatusFilter;
    const matchesPlan = clientPlanFilter === 'all' || c.plan === clientPlanFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const filteredInvoices = saasInvoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.id.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesStatus = invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header com efeito Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-6 rounded-[var(--radius-xl)] border border-amber-500/20 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin-slow" />
            <span className="text-xs font-bold text-amber-500 tracking-wider uppercase">Painel de Controle Central</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Gestão da Plataforma MVPet
          </h1>
          <p className="text-surface-600 dark:text-surface-400 text-sm mt-0.5">
            Monitore assinantes, faturamento recorrente, inadimplências e a saúde geral do SaaS.
          </p>
        </div>
        
        {activeTab === 'clients' && (
          <button
            onClick={() => setShowAddClientModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-4 py-2.5 rounded-[var(--radius-md)] text-sm shadow-[0_4px_12px_rgba(245,158,11,0.25)] transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Clínica</span>
          </button>
        )}
      </div>

      {/* Tabs Internas */}
      <div className="flex border-b border-surface-200 dark:border-surface-700 gap-2 shrink-0 overflow-x-auto pb-px">
        <button
          onClick={() => setSearchParams({ tab: 'dashboard' })}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300 dark:hover:text-surface-300'
          }`}
        >
          Resumo & Gráficos
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'clients' })}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'clients'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300 dark:hover:text-surface-300'
          }`}
        >
          Clínicas Assinantes ({saasClients.length})
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'billing' })}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'billing'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300 dark:hover:text-surface-300'
          }`}
        >
          Faturamento & Cobranças
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ABA DASHBOARD (MÉTRICAS & SAÚDE) */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Widgets de SaaS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* MRR */}
            <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">MRR (Recorrência Mensal)</span>
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-surface-900 dark:text-white mt-2">
                  R$ {mrrVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <span>📈 +12.4% este mês</span>
                </p>
              </div>
            </div>

            {/* Assinantes Ativos */}
            <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">Assinantes Ativos</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-surface-900 dark:text-white mt-2">
                  {activeClinics.length} <span className="text-xs font-medium text-surface-500">de {saasClients.length}</span>
                </h3>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1 flex gap-2">
                  <span className="text-blue-500 font-semibold">{trialClinics.length} em Teste</span>
                  <span className="text-danger font-semibold">{suspendedClinics.length} Suspensos</span>
                </p>
              </div>
            </div>

            {/* Receita Total Recebida */}
            <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">Receita Recebida</span>
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-surface-900 dark:text-white mt-2">
                  R$ {totalPaidRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[11px] text-surface-500 mt-1">
                  Soma de faturas pagas na plataforma
                </p>
              </div>
            </div>

            {/* Churn Rate simulado */}
            <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">Taxa de Churn (Cancelamento)</span>
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-surface-900 dark:text-white mt-2">
                  2.3%
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  📉 Excelente (abaixo da média de mercado)
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos em Linha & Pizza */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Crescimento de Faturamento */}
            <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm lg:col-span-2">
              <h4 className="text-sm font-bold text-surface-950 dark:text-white mb-4">Crescimento de Faturamento do SaaS</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                    />
                    <Area type="monotone" dataKey="receita" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReceita)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de pizza com planos */}
            <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col justify-between">
              <h4 className="text-sm font-bold text-surface-950 dark:text-white mb-2">Divisão por Planos do SaaS</h4>
              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {pieData.map((data, index) => (
                  <div key={data.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-surface-600 dark:text-surface-400">{data.name}</span>
                    </div>
                    <span className="font-bold text-surface-800 dark:text-surface-200">{data.value} clínicas</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recentes Logins / Pagamentos */}
          <div className="bg-white dark:bg-surface-800 p-5 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm">
            <h4 className="text-sm font-bold text-surface-950 dark:text-white mb-4">Registro de Atividades SaaS</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-surface-800 dark:text-surface-200 font-semibold">
                    Pagamento Recebido da clínica <span className="font-bold">Clínica Veterinária VIP</span>
                  </p>
                  <p className="text-[10px] text-surface-500 mt-0.5">Via Cartão de Crédito de R$ 399,90 — 14/05/2026 às 14:45</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-surface-800 dark:text-surface-200 font-semibold">
                    Novo Cadastro de Clínica Parceira
                  </p>
                  <p className="text-surface-600 dark:text-surface-400 mt-0.5">
                    <span className="font-bold">Estética & Saúde Bicho Mimado</span> iniciou o período de teste grátis (Trial).
                  </p>
                  <p className="text-[10px] text-surface-500 mt-0.5">Responsável: Marcos Roberto Silva — 10/05/2026</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700 text-xs">
                <div className="w-6 h-6 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-surface-800 dark:text-surface-200 font-semibold">
                    Assinatura Suspensa por Inadimplência
                  </p>
                  <p className="text-surface-600 dark:text-surface-400 mt-0.5">
                    A clínica <span className="font-bold">Consultório Vet Dr. Álvaro</span> foi automaticamente suspensa devido ao atraso de sua fatura vencida em 20/05/2026.
                  </p>
                  <p className="text-[10px] text-surface-500 mt-0.5">Administrador do sistema — 20/05/2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ABA CLIENTES (GESTÃO DE CLÍNICAS) */}
      {/* ========================================================================= */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {/* Filtros de Clínicas */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm shrink-0">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar por clínica, e-mail ou proprietário..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {/* Filtro Status */}
              <div className="flex items-center gap-1 text-xs font-semibold bg-surface-50 dark:bg-surface-900 px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-700 dark:text-surface-300">
                <Filter className="w-3.5 h-3.5 text-surface-450" />
                <select
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-semibold focus:ring-0 ml-1 text-surface-800 dark:text-surface-200 cursor-pointer"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativas</option>
                  <option value="suspended">Suspensas</option>
                  <option value="trial">Testes (Trial)</option>
                </select>
              </div>

              {/* Filtro Planos */}
              <div className="flex items-center gap-1 text-xs font-semibold bg-surface-50 dark:bg-surface-900 px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-700 dark:text-surface-300">
                <Filter className="w-3.5 h-3.5 text-surface-450" />
                <select
                  value={clientPlanFilter}
                  onChange={(e) => setClientPlanFilter(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-semibold focus:ring-0 ml-1 text-surface-800 dark:text-surface-200 cursor-pointer"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="petshop">Estética & Petshop</option>
                  <option value="clinic">Clínica & Hospital</option>
                  <option value="office">Consultório</option>
                  <option value="complete">Pet+Clin (Completo)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabela de Clínicas */}
          <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50 dark:bg-surface-800/60 border-b border-surface-200 dark:border-surface-700 text-xs font-bold text-surface-550 dark:text-surface-400 uppercase tracking-wider">
                    <th className="py-4 px-5">Clínica Assinante</th>
                    <th className="py-4 px-5">Proprietário / Contato</th>
                    <th className="py-4 px-5">Plano Contratado</th>
                    <th className="py-4 px-5">Cobrança / Valor</th>
                    <th className="py-4 px-5">Cadastrada</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700 text-sm">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-surface-500 dark:text-surface-400">
                        Nenhuma clínica assinante encontrada com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const plan = planConfig[client.plan];

                      return (
                        <tr key={client.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-750/30 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                                {client.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-surface-900 dark:text-white block">
                                  {client.name}
                                </span>
                                <span className="text-xs text-surface-500 dark:text-surface-400 block mt-0.5">
                                  ID: {client.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div>
                              <span className="font-medium text-surface-800 dark:text-surface-200 block">
                                {client.ownerName}
                              </span>
                              <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-surface-500 dark:text-surface-400">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  {client.ownerEmail}
                                </span>
                                <span className="flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  {client.ownerPhone}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg">{plan?.icon}</span>
                              <span className="font-semibold text-surface-850 dark:text-surface-150">
                                {plan?.label}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div>
                              <span className="font-bold text-surface-900 dark:text-white block">
                                R$ {client.monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-surface-500 dark:text-surface-400 block mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Prox: {client.nextBillingDate}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-5 text-surface-550 dark:text-surface-400">
                            {client.registrationDate}
                          </td>

                          <td className="py-4 px-5">
                            {client.status === 'active' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-500/10">
                                <CheckCircle className="w-3 h-3" /> Ativa
                              </span>
                            )}
                            {client.status === 'suspended' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/10">
                                <Ban className="w-3 h-3" /> Suspensa
                              </span>
                            )}
                            {client.status === 'trial' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 border border-blue-500/10">
                                <Clock className="w-3 h-3" /> Teste Grátis
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => toggleSaaSClientStatus(client.id)}
                                className={`p-1.5 rounded-[var(--radius-md)] border transition-colors cursor-pointer ${
                                  client.status === 'active'
                                    ? 'border-danger/20 hover:bg-danger/10 text-danger'
                                    : 'border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450'
                                }`}
                                title={client.status === 'active' ? 'Bloquear Assinante' : 'Ativar Assinante'}
                              >
                                {client.status === 'active' ? <Ban className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ABA FATURAMENTO & COBRANÇAS */}
      {/* ========================================================================= */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          {/* Métricas rápidas de Faturamento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-surface-500 uppercase font-semibold">Total Recebido (Mensalidades)</span>
                <h4 className="text-xl font-bold text-surface-900 dark:text-white">
                  R$ {totalPaidRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h4>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-surface-500 uppercase font-semibold">Mensalidades a Receber</span>
                <h4 className="text-xl font-bold text-surface-900 dark:text-white">
                  R$ {totalPendingInvoices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h4>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-surface-500 uppercase font-semibold">Mensalidades em Atraso</span>
                <h4 className="text-xl font-bold text-surface-950">
                  R$ {totalOverdueInvoices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h4>
              </div>
            </div>
          </div>

          {/* Filtros de Faturamento */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm shrink-0">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar por clínica ou número da fatura..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold bg-surface-50 dark:bg-surface-900 px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-700 dark:text-surface-300">
              <Filter className="w-3.5 h-3.5 text-surface-450" />
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold focus:ring-0 ml-1 text-surface-800 dark:text-surface-200 cursor-pointer"
              >
                <option value="all">Todas as Cobranças</option>
                <option value="paid">Pagas</option>
                <option value="pending">Pendentes</option>
                <option value="overdue">Atrasadas</option>
              </select>
            </div>
          </div>

          {/* Tabela de Faturas */}
          <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50 dark:bg-surface-800/60 border-b border-surface-200 dark:border-surface-700 text-xs font-bold text-surface-550 dark:text-surface-400 uppercase tracking-wider">
                    <th className="py-4 px-5">Fatura ID</th>
                    <th className="py-4 px-5">Clínica Assinante</th>
                    <th className="py-4 px-5">Plano</th>
                    <th className="py-4 px-5">Valor</th>
                    <th className="py-4 px-5">Data de Vencimento</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Data / Método Pagto</th>
                    <th className="py-4 px-5 text-right">Confirmar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700 text-sm">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-surface-500 dark:text-surface-400">
                        Nenhuma fatura/cobrança encontrada com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const plan = planConfig[inv.plan];

                      return (
                        <tr key={inv.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-750/30 transition-colors">
                          <td className="py-4 px-5 font-bold text-surface-900 dark:text-white">
                            #{inv.id}
                          </td>

                          <td className="py-4 px-5">
                            <span className="font-semibold text-surface-850 dark:text-surface-150">
                              {inv.clientName}
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            <span className="text-xs px-2 py-1 rounded bg-surface-100 dark:bg-surface-700 font-semibold text-surface-700 dark:text-surface-300">
                              {plan?.label}
                            </span>
                          </td>

                          <td className="py-4 px-5 font-bold text-surface-900 dark:text-white">
                            R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-4 px-5 text-surface-600 dark:text-surface-400">
                            {inv.dueDate}
                          </td>

                          <td className="py-4 px-5">
                            {inv.status === 'paid' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-500/10">
                                Pago
                              </span>
                            )}
                            {inv.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 border border-amber-500/10">
                                Pendente
                              </span>
                            )}
                            {inv.status === 'overdue' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/10">
                                Atrasado
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5">
                            {inv.status === 'paid' ? (
                              <div className="text-xs">
                                <span className="block text-surface-800 dark:text-surface-200 font-medium">
                                  {inv.paidAt}
                                </span>
                                <span className="block text-surface-500 dark:text-surface-400 text-[10px] mt-0.5 uppercase font-bold tracking-wider">
                                  Via {inv.paymentMethod?.toUpperCase()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-surface-400">—</span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            {inv.status !== 'paid' ? (
                              <button
                                onClick={() => setShowConfirmPaymentModal(inv.id)}
                                className="flex items-center justify-center gap-1.5 ml-auto text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-[var(--radius-md)] cursor-pointer transition-colors shadow-sm"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Confirmar</span>
                              </button>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center ml-auto">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: CADASTRAR NOVA CLÍNICA ASSINANTE */}
      {/* ========================================================================= */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-800 w-full max-w-lg rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 shadow-modal animate-scale-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/40">
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">Cadastrar Nova Clínica (Parceiro)</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Crie uma nova conta de inquilino para acessar a plataforma.</p>
              </div>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddClientSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Nome da clínica */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                    Nome da Clínica / Petshop
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clínica Veterinária São Francisco"
                    value={newClient.name}
                    onChange={(e) => setNewClient((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50"
                  />
                </div>

                {/* Proprietário */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                    Nome do Proprietário / Gestor
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dr. Roberto Alencar"
                    value={newClient.ownerName}
                    onChange={(e) => setNewClient((prev) => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50"
                  />
                </div>

                {/* Contato grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                      E-mail Corporativo
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="exemplo@email.com"
                      value={newClient.ownerEmail}
                      onChange={(e) => setNewClient((prev) => ({ ...prev, ownerEmail: e.target.value }))}
                      className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                      Telefone / Celular
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(00) 00000-0000"
                      value={newClient.ownerPhone}
                      onChange={(e) => setNewClient((prev) => ({ ...prev, ownerPhone: e.target.value }))}
                      className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* Plano e Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                      Plano SaaS
                    </label>
                    <select
                      value={newClient.plan}
                      onChange={(e) => setNewClient((prev) => ({ ...prev, plan: e.target.value as BusinessPlan }))}
                      className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="complete">Pet+Clin (Completo) — R$ 399.90</option>
                      <option value="clinic">Clínica & Hospital — R$ 299.90</option>
                      <option value="petshop">Petshop & Estética — R$ 199.90</option>
                      <option value="office">Consultório — R$ 149.90</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                      Status Inicial
                    </label>
                    <select
                      value={newClient.status}
                      onChange={(e) => setNewClient((prev) => ({ ...prev, status: e.target.value as SaaSClient['status'] }))}
                      className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="active">Ativo (Mensalidade Paga)</option>
                      <option value="trial">Período de Teste (Trial - 10 dias)</option>
                    </select>
                  </div>
                </div>

                {/* Info de Mensalidade */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-[var(--radius-md)] text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-between">
                  <span>Valor de faturamento mensal:</span>
                  <span className="text-sm font-bold">R$ {newClient.monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-750 rounded-[var(--radius-md)] text-sm font-semibold text-surface-750 dark:text-surface-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-[var(--radius-md)] text-sm font-bold shadow-sm cursor-pointer"
                >
                  Cadastrar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CONFIRMAR PAGAMENTO DE MENSALIDADE */}
      {/* ========================================================================= */}
      {showConfirmPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-800 w-full max-w-md rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 shadow-modal animate-scale-in overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/40 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">Confirmar Recebimento SaaS</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Selecione o método de pagamento para liquidar esta mensalidade.</p>
              </div>
              <button
                onClick={() => setShowConfirmPaymentModal(null)}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {(() => {
                const invoice = saasInvoices.find((inv) => inv.id === showConfirmPaymentModal);
                if (!invoice) return null;

                return (
                  <div className="space-y-4">
                    {/* Sumário da Fatura */}
                    <div className="p-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-lg)] text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-surface-500 uppercase font-semibold">Cliente / Assinante:</span>
                        <span className="font-bold text-surface-900 dark:text-white">{invoice.clientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-500 uppercase font-semibold">Fatura Código:</span>
                        <span className="font-semibold text-surface-900 dark:text-white">#{invoice.id}</span>
                      </div>
                      <div className="flex justify-between border-t border-surface-200 dark:border-surface-700 pt-2 text-sm mt-1">
                        <span className="font-bold text-surface-700 dark:text-surface-300">Valor da Mensalidade:</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-450">
                          R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Botões de pagamento rápido */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">
                        Selecione o Meio de Recebimento:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handlePaymentConfirm('pix')}
                          className="flex flex-col items-center justify-center p-3 border border-surface-200 dark:border-surface-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-[var(--radius-md)] text-xs font-bold text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer transition-all gap-1.5"
                        >
                          <span className="text-lg">⚡</span>
                          <span>Transferência Pix</span>
                        </button>
                        <button
                          onClick={() => handlePaymentConfirm('credit')}
                          className="flex flex-col items-center justify-center p-3 border border-surface-200 dark:border-surface-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-[var(--radius-md)] text-xs font-bold text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer transition-all gap-1.5"
                        >
                          <span className="text-lg">💳</span>
                          <span>Cartão de Crédito</span>
                        </button>
                        <button
                          onClick={() => handlePaymentConfirm('debit')}
                          className="flex flex-col items-center justify-center p-3 border border-surface-200 dark:border-surface-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-[var(--radius-md)] text-xs font-bold text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer transition-all gap-1.5"
                        >
                          <span className="text-lg">💵</span>
                          <span>Boleto Bancário</span>
                        </button>
                        <button
                          onClick={() => handlePaymentConfirm('cash')}
                          className="flex flex-col items-center justify-center p-3 border border-surface-200 dark:border-surface-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-[var(--radius-md)] text-xs font-bold text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer transition-all gap-1.5"
                        >
                          <span className="text-lg">💰</span>
                          <span>Depósito / Outro</span>
                        </button>
                      </div>
                    </div>

                    {/* Aviso de ativação automática */}
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-[var(--radius-md)] text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500 animate-pulse" />
                      <span>
                        **Ativação Automática:** Se o cliente correspondente estiver **Suspenso**, confirmar este pagamento irá reativar o acesso da clínica instantaneamente!
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-5 border-t border-surface-200 dark:border-surface-700">
              <button
                onClick={() => setShowConfirmPaymentModal(null)}
                className="px-4 py-2 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-750 rounded-[var(--radius-md)] text-sm font-semibold text-surface-750 dark:text-surface-200 cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
