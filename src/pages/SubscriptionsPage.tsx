import { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import type { SubscriptionPlan } from '../types';
import {
  Heart,
  Check,
  Star,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Percent,
  TrendingUp,
  Settings,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

// Dicionário de Configurações de Estilos Cromáticos das Cores de Destaque
interface ColorConfig {
  bg: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  badgeLabel: string;
}

const colorConfigs: Record<string, ColorConfig> = {
  gold: {
    bg: 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/10 dark:to-surface-800 border-amber-300 dark:border-amber-700/60 shadow-sm shadow-amber-500/5',
    text: 'text-amber-800 dark:text-amber-400',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    iconBg: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    badgeLabel: 'VIP Gold'
  },
  orange: {
    bg: 'bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/10 dark:to-surface-800 border-orange-300 dark:border-orange-700/60 shadow-sm shadow-orange-500/5',
    text: 'text-orange-850 dark:text-orange-400',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-white',
    iconBg: 'bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
    badgeLabel: 'Destaque Laranja'
  },
  red: {
    bg: 'bg-gradient-to-b from-rose-50 to-white dark:from-rose-950/10 dark:to-surface-800 border-rose-350 dark:border-rose-750/60 shadow-sm shadow-rose-500/5',
    text: 'text-rose-800 dark:text-rose-450',
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
    iconBg: 'bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450',
    badgeLabel: 'Premium Red'
  },
  green: {
    bg: 'bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/10 dark:to-surface-800 border-emerald-300 dark:border-emerald-700/60 shadow-sm shadow-emerald-500/5',
    text: 'text-emerald-800 dark:text-emerald-450',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    badgeLabel: 'Destaque Verde'
  },
  navy: {
    bg: 'bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/10 dark:to-surface-800 border-indigo-350 dark:border-indigo-700/60 shadow-sm shadow-indigo-500/5',
    text: 'text-indigo-800 dark:text-indigo-400',
    badgeBg: 'bg-indigo-650',
    badgeText: 'text-white',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    badgeLabel: 'VIP Navy'
  },
  blue: {
    bg: 'bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/10 dark:to-surface-800 border-blue-300 dark:border-blue-700/60 shadow-sm shadow-blue-500/5',
    text: 'text-blue-800 dark:text-blue-450',
    badgeBg: 'bg-blue-550',
    badgeText: 'text-white',
    iconBg: 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-450',
    badgeLabel: 'Destaque Azul'
  },
  pink: {
    bg: 'bg-gradient-to-b from-pink-50 to-white dark:from-pink-950/10 dark:to-surface-800 border-pink-300 dark:border-pink-700/60 shadow-sm shadow-pink-500/5',
    text: 'text-pink-850 dark:text-pink-400',
    badgeBg: 'bg-pink-500',
    badgeText: 'text-white',
    iconBg: 'bg-pink-100 dark:bg-pink-950/30 text-pink-650 dark:text-pink-400',
    badgeLabel: 'VIP Rosa'
  },
  lilac: {
    bg: 'bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/10 dark:to-surface-800 border-purple-300 dark:border-purple-700/60 shadow-sm shadow-purple-500/5',
    text: 'text-purple-800 dark:text-purple-400',
    badgeBg: 'bg-purple-500',
    badgeText: 'text-white',
    iconBg: 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    badgeLabel: 'Premium Lilás'
  }
};

const colorsList = [
  { id: 'gold', name: 'Amarelo Gold', hex: 'bg-amber-400 border-amber-600' },
  { id: 'orange', name: 'Laranja', hex: 'bg-orange-400 border-orange-605' },
  { id: 'red', name: 'Vermelho', hex: 'bg-red-400 border-red-600' },
  { id: 'green', name: 'Verde', hex: 'bg-emerald-450 border-emerald-600' },
  { id: 'navy', name: 'Azul Marinho', hex: 'bg-indigo-700 border-indigo-900' },
  { id: 'blue', name: 'Azul', hex: 'bg-blue-400 border-blue-600' },
  { id: 'pink', name: 'Rosa', hex: 'bg-pink-400 border-pink-600' },
  { id: 'lilac', name: 'Lilás', hex: 'bg-purple-400 border-purple-600' }
];

export function SubscriptionsPage() {
  const {
    subscriptionPlans,
    tutors,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan
  } = useDataStore();

  // Estados locais de controle de modais
  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Estados locais do formulário
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planPrice, setPlanPrice] = useState<number>(0);
  const [planDiscount, setPlanDiscount] = useState<number>(0);
  const [planServices, setPlanServices] = useState<{ name: string; quantity: number }[]>([
    { name: '', quantity: 1 }
  ]);
  const [planHighlightColor, setPlanHighlightColor] = useState<string>('');

  // Handler para abrir modal de criação
  const handleOpenCreateModal = () => {
    setEditingPlanId(null);
    setPlanName('');
    setPlanDescription('');
    setPlanPrice(0);
    setPlanDiscount(0);
    setPlanServices([{ name: '', quantity: 1 }]);
    setPlanHighlightColor('');
    setShowModal(true);
  };

  // Handler para abrir modal de edição
  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setPlanDescription(plan.description);
    setPlanPrice(plan.price);
    setPlanDiscount(plan.discount);
    setPlanServices(plan.services && plan.services.length > 0 ? [...plan.services] : [{ name: '', quantity: 1 }]);
    setPlanHighlightColor(plan.highlightColor || '');
    setShowModal(true);
  };

  // Funções de manipulação da lista dinâmica de serviços/benefícios
  const handleAddServiceRow = () => {
    setPlanServices((prev) => [...prev, { name: '', quantity: 1 }]);
  };

  const handleRemoveServiceRow = (index: number) => {
    if (planServices.length > 1) {
      setPlanServices((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleServiceChange = (index: number, field: 'name' | 'quantity', value: string | number) => {
    setPlanServices((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, [field]: value } : s))
    );
  };

  // Submissão do Formulário (Salvar Plano)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!planName.trim()) return;
    const cleanServices = planServices.filter((s) => s.name.trim() !== '');

    if (editingPlanId) {
      // Atualizar plano existente
      updateSubscriptionPlan(editingPlanId, {
        name: planName,
        description: planDescription,
        price: Number(planPrice),
        discount: Number(planDiscount),
        services: cleanServices,
        highlightColor: planHighlightColor,
        isFeatured: planHighlightColor !== ''
      });
    } else {
      // Criar novo plano
      const newPlan: SubscriptionPlan = {
        id: `subplan-${Date.now()}`,
        name: planName,
        description: planDescription,
        price: Number(planPrice),
        discount: Number(planDiscount),
        services: cleanServices,
        isActive: true,
        highlightColor: planHighlightColor,
        isFeatured: planHighlightColor !== ''
      };
      addSubscriptionPlan(newPlan);
    }

    setShowModal(false);
  };

  // Filtragem dos planos
  const activePlans = subscriptionPlans.filter((p) => p.isActive !== false);
  const inactivePlans = subscriptionPlans.filter((p) => p.isActive === false);
  const displayedPlans = showInactive ? [...activePlans, ...inactivePlans] : activePlans;

  // Estatísticas rápidas baseadas no estado
  const totalSubscribers = tutors.filter((t) => t.subscriptionPlanId).length;
  
  // Faturamento Estimado Mensal do Clube Pet (Loyalty MRR da clínica)
  const estimatedLoyaltyMRR = tutors.reduce((sum, tutor) => {
    if (tutor.subscriptionPlanId) {
      const plan = subscriptionPlans.find((p) => p.id === tutor.subscriptionPlanId);
      return sum + (plan ? plan.price : 0);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Banner / Header Premium */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-pink-500/10 via-pink-650/5 to-transparent p-6 rounded-[var(--radius-xl)] border border-pink-500/20 shadow-sm backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-950/40 flex items-center justify-center shrink-0 shadow-sm">
            <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="w-4 h-4 text-pink-500 animate-spin-slow" />
              <span className="text-[10px] font-bold text-pink-500 tracking-wider uppercase">Fidelização Relevante</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              Clube Pet & Fidelidade
            </h1>
            <p className="text-surface-600 dark:text-surface-400 text-sm mt-0.5 max-w-2xl">
              Crie planos de assinatura recorrentes com total autonomia. Fidelize os tutores de pets com banhos, consultas e descontos exclusivos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {inactivePlans.length > 0 && (
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 border rounded-[var(--radius-md)] cursor-pointer transition-all ${
                showInactive
                  ? 'bg-surface-100 border-surface-300 dark:bg-surface-800 dark:border-surface-700 text-surface-800 dark:text-surface-200'
                  : 'bg-transparent border-surface-200 dark:border-surface-800 text-surface-500 hover:text-surface-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{showInactive ? 'Ocultar Inativos' : `Mostrar Inativos (${inactivePlans.length})`}</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-650 hover:from-pink-600 hover:to-pink-700 text-white font-bold px-4 py-2.5 rounded-[var(--radius-md)] text-sm shadow-[0_4px_12px_rgba(236,72,153,0.25)] transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Plano</span>
          </button>
        </div>
      </div>

      {/* Grid de Estatísticas Rápidas da Clínica */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-surface-500 uppercase font-semibold">Total de Planos Ativos</span>
            <h4 className="text-xl font-extrabold text-surface-900 dark:text-white">{activePlans.length}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-surface-500 uppercase font-semibold">Tutores Assinantes</span>
            <h4 className="text-xl font-extrabold text-surface-900 dark:text-white">
              {totalSubscribers} <span className="text-xs font-normal text-surface-500">tutores</span>
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <span>💰</span>
          </div>
          <div>
            <span className="text-xs text-surface-500 uppercase font-semibold">Recorrência Estimada Local</span>
            <h4 className="text-xl font-extrabold text-surface-900 dark:text-white">
              R$ {estimatedLoyaltyMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h4>
          </div>
        </div>
      </div>

      {/* Grid de Planos com Autonomia de Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPlans.map((plan, index) => {
          const subscribersCount = tutors.filter((t) => t.subscriptionPlanId === plan.id).length;
          const isInactive = plan.isActive === false;
          
          // Mapeamento e validação da cor de destaque
          const isHighlighted = !isInactive && plan.highlightColor && colorConfigs[plan.highlightColor];
          const colorConfig = isHighlighted ? colorConfigs[plan.highlightColor!] : null;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[var(--radius-xl)] border p-6 transition-all duration-300 hover:shadow-md ${
                isInactive
                  ? 'bg-surface-50 dark:bg-surface-800/40 border-surface-200/50 dark:border-surface-800/50 opacity-60'
                  : colorConfig
                  ? colorConfig.bg
                  : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 shadow-sm'
              }`}
            >
              {/* Badge Dinâmica de Status / Destaque Cromático */}
              {isInactive ? (
                <div className="absolute -top-3 left-6 bg-surface-400 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 border border-surface-300 z-10 shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5" /> Descontinuado
                </div>
              ) : colorConfig ? (
                <div className={`absolute -top-3 left-6 ${colorConfig.badgeBg} ${colorConfig.badgeText} text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm z-10`}>
                  <Star className="w-3 h-3 fill-current animate-spin-slow" /> {colorConfig.badgeLabel}
                </div>
              ) : (
                <div className="absolute -top-3 left-6 bg-pink-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm z-10">
                  <Heart className="w-3 h-3 fill-white" /> Ativo
                </div>
              )}

              {/* Botões de Ações CRUD no Card */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                <button
                  onClick={() => handleOpenEditModal(plan)}
                  className="p-1.5 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-650 transition-colors cursor-pointer"
                  title="Editar Plano"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {!isInactive && (
                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente descontinuar o plano "${plan.name}"? Tutores que assinam este plano continuarão com ele, mas novas adesões serão bloqueadas.`)) {
                        deleteSubscriptionPlan(plan.id);
                      }
                    }}
                    className="p-1.5 rounded-full hover:bg-danger/10 text-surface-400 hover:text-danger transition-colors cursor-pointer"
                    title="Descontinuar Plano"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {isInactive && (
                  <button
                    onClick={() => updateSubscriptionPlan(plan.id, { isActive: true })}
                    className="p-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-surface-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="Reativar Plano"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Título & Descrição */}
              <div className="mb-4 mt-2">
                <h3
                  className={`text-lg font-bold tracking-tight ${
                    isInactive
                      ? 'text-surface-400'
                      : colorConfig
                      ? colorConfig.text
                      : 'text-surface-900 dark:text-white'
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="text-xs text-surface-500 h-10 mt-1 line-clamp-2">
                  {plan.description || 'Nenhuma descrição definida para este plano.'}
                </p>
              </div>

              {/* Preço Mensal */}
              <div className="mb-5 flex items-end gap-1">
                <span className="text-3xl font-extrabold text-surface-900 dark:text-white">
                  R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-surface-500 text-xs mb-1 font-semibold">/mês</span>
              </div>

              {/* Lista Dinâmica de Benefícios */}
              <div className="flex-1 space-y-2.5 mb-6 border-t border-surface-100 dark:border-surface-700/60 pt-4">
                {plan.services && plan.services.length > 0 ? (
                  plan.services.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isInactive
                          ? 'bg-surface-200 text-surface-400'
                          : colorConfig
                          ? colorConfig.iconBg
                          : 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                      }`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-surface-700 dark:text-surface-300">
                        <strong>{service.quantity}x</strong> {service.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-surface-400 italic">Sem serviços específicos inclusos.</p>
                )}

                {/* Benefício de Desconto da Loja */}
                {plan.discount > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      isInactive
                        ? 'bg-surface-200 text-surface-400'
                        : colorConfig
                        ? colorConfig.iconBg
                        : 'bg-pink-100 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400'
                    }`}>
                      <Percent className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      <strong>{plan.discount}%</strong> de desconto em produtos da loja
                    </span>
                  </div>
                )}
              </div>

              {/* Estatísticas de Assinatura no Rodapé */}
              <div className="pt-4 border-t border-surface-200 dark:border-surface-700/60 mt-auto flex items-center justify-between text-xs">
                <span className="text-surface-500 font-semibold">{subscribersCount} assinantes ativos</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                  isInactive 
                    ? 'bg-surface-200 text-surface-500' 
                    : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300'
                }`}>
                  Fidelidade
                </span>
              </div>
            </div>
          );
        })}

        {/* Card Delineado Premium de "+" (Inserção Rápida de Novo Plano) */}
        <div
          onClick={handleOpenCreateModal}
          className="border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-pink-500 dark:hover:border-pink-500/50 rounded-[var(--radius-xl)] p-6 flex flex-col items-center justify-center text-center group cursor-pointer transition-all duration-300 min-h-[300px] hover:bg-pink-50/10 dark:hover:bg-pink-950/5"
        >
          <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500 group-hover:bg-pink-100 dark:group-hover:bg-pink-950/30 group-hover:text-pink-500 flex items-center justify-center transition-all shadow-sm mb-4">
            <Plus className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-surface-800 dark:text-surface-200 group-hover:text-pink-500 transition-colors">
            Adicionar Plano de Fidelidade
          </h4>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 max-w-xs">
            Crie categorias exclusivas (Bronze, Prata, Ouro, VIP) de assinaturas para os animais dos clientes.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CRIAR OU EDITAR PLANO DE FIDELIDADE (AUTONOMIA DA CLÍNICA) */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-800 w-full max-w-xl rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 shadow-modal animate-scale-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/40">
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                  {editingPlanId ? 'Editar Plano de Fidelidade' : 'Novo Plano de Fidelidade'}
                </h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                  Preencha os valores e benefícios que a clínica oferecerá aos tutores.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {/* Nome do Plano */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                    Nome do Plano *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: VIP Platina, Plano Prata"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                    Descrição do Plano
                  </label>
                  <textarea
                    placeholder="Ex: Ideal para quem deseja manter banhos frequentes e consultas médicas preventivas no mês."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50"
                  />
                </div>

                {/* Preço e Desconto na Loja */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                      Preço Mensal (R$) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      placeholder="99.90"
                      value={planPrice || ''}
                      onChange={(e) => setPlanPrice(Number(e.target.value))}
                      className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1">
                      Desconto em Produtos da Loja (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="10"
                      value={planDiscount || ''}
                      onChange={(e) => setPlanDiscount(Number(e.target.value))}
                      className="w-full p-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50"
                    />
                  </div>
                </div>

                {/* Seletor Cromático de Destaque Premium (Opcional) */}
                <div className="space-y-2 border border-surface-250 dark:border-surface-700 p-4 rounded-[var(--radius-lg)] bg-surface-50/50 dark:bg-surface-900/40">
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    Selecione a cor para destaque (Opcional)
                  </label>
                  <p className="text-[11px] text-surface-500">
                    Escolha uma cor para dar destaque visual ao card na grade de planos de fidelidade.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    {/* Botão para Remover Destaque (Estilo Padrão) */}
                    <button
                      type="button"
                      onClick={() => setPlanHighlightColor('')}
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer ${
                        planHighlightColor === ''
                          ? 'ring-2 ring-pink-500 scale-110 border-pink-500 shadow-md'
                          : 'border-surface-300 dark:border-surface-650 hover:scale-105 opacity-80'
                      } bg-white dark:bg-surface-800`}
                      title="Nenhum destaque (Estilo Padrão)"
                    >
                      <X className="w-3.5 h-3.5 text-surface-400" />
                    </button>

                    {/* Paleta Completa Solicitada pelo Usuário */}
                    {colorsList.map((col) => {
                      const isSelected = planHighlightColor === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setPlanHighlightColor(col.id)}
                          className={`w-8 h-8 rounded-full border transition-all cursor-pointer ${col.hex} ${
                            isSelected
                              ? 'ring-2 ring-pink-500 scale-115 border-white dark:border-surface-900 shadow-md'
                              : 'hover:scale-105 opacity-85 hover:opacity-100'
                          }`}
                          title={col.name}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Serviços Inclusos (Opção A - Livre e Flexível) */}
                <div className="border-t border-surface-200 dark:border-surface-700 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                      Serviços Inclusos por Mês (Benefícios)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddServiceRow}
                      className="flex items-center gap-1 text-[11px] font-bold text-pink-500 hover:text-pink-600 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Benefício</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {planServices.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 animate-scale-in">
                        {/* Nome do Serviço */}
                        <input
                          type="text"
                          required
                          placeholder="Ex: Banho & Tosa, Consulta Clínica"
                          value={service.name}
                          onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                          className="flex-1 p-2 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-850 dark:text-surface-150 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50"
                        />
                        {/* Quantidade */}
                        <div className="w-24 flex items-center bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] overflow-hidden">
                          <span className="px-2 text-xs text-surface-450 font-bold">Qtd</span>
                          <input
                            type="number"
                            required
                            min="1"
                            value={service.quantity}
                            onChange={(e) => handleServiceChange(index, 'quantity', Number(e.target.value))}
                            className="w-full p-2 text-sm bg-transparent border-none focus:ring-0 text-center text-surface-850 dark:text-surface-150 focus:outline-none"
                          />
                        </div>
                        {/* Botão Remover */}
                        <button
                          type="button"
                          disabled={planServices.length === 1}
                          onClick={() => handleRemoveServiceRow(index)}
                          className={`p-2 rounded hover:bg-danger/10 text-surface-400 hover:text-danger transition-colors cursor-pointer ${
                            planServices.length === 1 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Remover benefício"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-5 border-t border-surface-200 dark:border-surface-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-750 rounded-[var(--radius-md)] text-sm font-semibold text-surface-750 dark:text-surface-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-pink-650 hover:from-pink-600 hover:to-pink-700 text-white rounded-[var(--radius-md)] text-sm font-bold shadow-sm cursor-pointer"
                >
                  {editingPlanId ? 'Salvar Alterações' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
