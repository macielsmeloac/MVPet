import type { BusinessPlan } from '../types';
import {
  LayoutDashboard, Calendar, ClipboardList, Bed, AlertTriangle,
  Scissors, ShoppingCart, DollarSign, Package, Users,
  Truck, CreditCard, FileText, UserCircle, Settings, Heart, PlusCircle, Droplets
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  plans: BusinessPlan[];
  category: string;
}

export const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Principal',
  },
  {
    id: 'appointments',
    label: 'Agenda',
    icon: Calendar,
    path: '/agenda',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Atendimento',
  },
  {
    id: 'registration',
    label: 'Cadastro',
    icon: PlusCircle,
    path: '/cadastro',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Atendimento',
  },
  {
    id: 'medical-records',
    label: 'Prontuários',
    icon: ClipboardList,
    path: '/prontuarios',
    plans: ['clinic', 'office', 'complete'],
    category: 'Atendimento',
  },
  {
    id: 'triage',
    label: 'Triagem',
    icon: AlertTriangle,
    path: '/triagem',
    plans: ['clinic', 'complete'],
    category: 'Atendimento',
  },
  {
    id: 'hospitalization',
    label: 'Internação',
    icon: Bed,
    path: '/internacao',
    plans: ['clinic', 'complete'],
    category: 'Atendimento',
  },
  {
    id: 'donors',
    label: 'Banco de Doadores',
    icon: Droplets,
    path: '/doadores',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Atendimento',
  },
  {
    id: 'grooming',
    label: 'Banho & Tosa',
    icon: Scissors,
    path: '/banho-tosa',
    plans: ['petshop', 'complete'],
    category: 'Serviços',
  },
  {
    id: 'pos',
    label: 'Loja',
    icon: ShoppingCart,
    path: '/caixa',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Financeiro',
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: DollarSign,
    path: '/financeiro',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Financeiro',
  },
  {
    id: 'fiscal',
    label: 'Notas Fiscais',
    icon: FileText,
    path: '/fiscal',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Financeiro',
  },
  {
    id: 'inventory',
    label: 'Estoque',
    icon: Package,
    path: '/estoque',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Operacional',
  },
  {
    id: 'crm',
    label: 'CRM & Clientes',
    icon: Users,
    path: '/crm',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Clientes',
  },
  {
    id: 'subscriptions',
    label: 'Clube Pet',
    icon: Heart,
    path: '/clube-pet',
    plans: ['petshop', 'complete'],
    category: 'Clientes',
  },
  {
    id: 'logistics',
    label: 'Leva e Traz',
    icon: Truck,
    path: '/leva-traz',
    plans: ['petshop', 'complete'],
    category: 'Logística',
  },
  {
    id: 'commissions',
    label: 'Comissões',
    icon: CreditCard,
    path: '/comissoes',
    plans: ['petshop', 'clinic', 'complete'],
    category: 'Financeiro',
  },
  {
    id: 'tutor-portal',
    label: 'Portal do Tutor',
    icon: UserCircle,
    path: '/portal-tutor',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Clientes',
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
    plans: ['petshop', 'clinic', 'office', 'complete'],
    category: 'Sistema',
  },
];

export function getNavItemsForPlan(plan: BusinessPlan): NavItem[] {
  return navItems.filter((item) => item.plans.includes(plan));
}

export function getNavCategories(plan: BusinessPlan): { category: string; items: NavItem[] }[] {
  const filtered = getNavItemsForPlan(plan);
  const categories: Record<string, NavItem[]> = {};

  for (const item of filtered) {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category]!.push(item);
  }

  return Object.entries(categories).map(([category, items]) => ({ category, items }));
}

export const planConfig: Record<BusinessPlan, { label: string; description: string; color: string; icon: string }> = {
  petshop: {
    label: 'Petshop & Estética',
    description: 'Banho, tosa, produtos e comissões',
    color: 'bg-amber-500',
    icon: '🐾',
  },
  clinic: {
    label: 'Clínica & Hospital',
    description: 'Prontuários, internação e triagem',
    color: 'bg-primary-500',
    icon: '🩺',
  },
  office: {
    label: 'Consultório',
    description: 'Consultas e venda de medicamentos',
    color: 'bg-blue-500',
    icon: '💊',
  },
  complete: {
    label: 'Pet+Clin',
    description: 'Todos os módulos integrados',
    color: 'bg-emerald-500',
    icon: '⭐',
  },
};
