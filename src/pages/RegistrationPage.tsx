import { useState } from 'react';
import { PlusCircle, Save, X, User, Calendar } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { useNavigate } from 'react-router-dom';
import type { Tutor } from '../types';

type Tab = 'tutor' | 'service';

export function RegistrationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tutor');

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary-500" /> Cadastros
          </h1>
          <p className="text-sm text-surface-500">
            Cadastre novos clientes e serviços.
            <span className="ml-2 text-indigo-500 font-medium">
              Pets são cadastrados dentro do perfil do cliente · Produtos são cadastrados no Estoque.
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-md rounded-[var(--radius-xl)] border border-surface-200/50 dark:border-surface-700/50 overflow-hidden shadow-sm">
        <div className="flex border-b border-surface-200/50 dark:border-surface-700/50 overflow-x-auto">
          <TabButton active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={User} label="Novo Cliente" />
          <TabButton active={activeTab === 'service'} onClick={() => setActiveTab('service')} icon={Calendar} label="Novo Serviço" />
        </div>

        <div className="p-6">
          {activeTab === 'tutor' && <TutorForm />}
          {activeTab === 'service' && <ServiceForm />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
        active
          ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
          : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-50/50 dark:hover:bg-surface-700/30'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function TutorForm() {
  const { addTutor, tutors } = useDataStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neigh, setNeigh] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [zip, setZip] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cpf.trim()) return;

    const newTutor: Tutor = {
      id: `t-${Date.now()}`,
      name,
      cpf,
      email: email || 'cliente@email.com',
      phone: phone || '(00) 00000-0000',
      whatsapp: phone.replace(/\D/g, '') || '00000000000',
      address: {
        street: street || 'Rua Principal',
        number: number || 'S/N',
        complement: '',
        neighborhood: neigh || 'Centro',
        city: city || 'São Paulo',
        state: state || 'SP',
        zipCode: zip || '00000-000',
      },
      isSubscriber: false,
      hasDebt: false,
      tags: ['Novo'],
      petIds: [],
      credits: 0,
      financialHistory: [],
      createdAt: new Date().toISOString().split('T')[0]!,
    };

    addTutor(newTutor);
    alert(`✅ Cliente "${name}" cadastrado com sucesso! Redirecionando para o perfil...`);
    navigate(`/crm/${newTutor.id}`);
  };

  return (
    <form className="space-y-4 animate-fade-in" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-surface-800 dark:text-white mb-4">Dados do Cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome Completo *" placeholder="Ex: João da Silva" required value={name} onChange={e => setName(e.target.value)} />
        <Input label="CPF *" placeholder="000.000.000-00" required value={cpf} onChange={e => setCpf(e.target.value)} />
        <Input label="Telefone / WhatsApp *" placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
        <Input label="E-mail" placeholder="joao@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />

        <div className="md:col-span-2 border-t border-surface-200 dark:border-surface-700 pt-4">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">Endereço</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Rua" placeholder="Av. Principal" className="md:col-span-2" value={street} onChange={e => setStreet(e.target.value)} />
            <Input label="Número" placeholder="123" value={number} onChange={e => setNumber(e.target.value)} />
            <Input label="Bairro" placeholder="Centro" value={neigh} onChange={e => setNeigh(e.target.value)} />
            <Input label="Cidade" placeholder="São Paulo" value={city} onChange={e => setCity(e.target.value)} />
            <Input label="Estado" placeholder="SP" value={state} onChange={e => setState(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-surface-200/50 dark:border-surface-700/50 mt-6">
        <button type="button" onClick={() => navigate('/crm')} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-[var(--radius-md)] transition-colors">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button type="submit" className="flex items-center gap-1.5 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-[var(--radius-md)] transition-colors shadow-sm">
          <Save className="w-4 h-4" /> Salvar e Abrir Perfil
        </button>
      </div>
    </form>
  );
}

function ServiceForm() {
  return (
    <form className="space-y-4 animate-fade-in" onSubmit={(e) => { e.preventDefault(); alert('Serviço cadastrado!'); }}>
      <h2 className="text-lg font-bold text-surface-800 dark:text-white mb-4">Dados do Serviço</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome do Serviço *" placeholder="Ex: Banho Completo (Porte P)" required />
        <Select label="Setor *" options={['Banho & Tosa', 'Consultório', 'Clínica', 'Laboratório']} />
        <Input label="Preço Base (R$) *" type="number" step="0.01" required />
        <Input label="Duração Estimada (minutos)" type="number" step="15" defaultValue="60" />
        <Input label="Comissão Padrão (%)" type="number" step="1" defaultValue="0" />
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t border-surface-200/50 dark:border-surface-700/50 mt-6">
        <button type="button" className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-[var(--radius-md)] transition-colors">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button type="submit" className="flex items-center gap-1.5 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-[var(--radius-md)] transition-colors shadow-sm">
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>
    </form>
  );
}

function Input({ label, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <div className={className}>
      <label className="text-sm font-semibold text-surface-600 dark:text-surface-300 block mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2.5 bg-white/50 dark:bg-surface-900/50 text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
      />
    </div>
  );
}

function Select({ label, options, className = '' }: { label: string; options: string[]; className?: string }) {
  return (
    <div className={className}>
      <label className="text-sm font-semibold text-surface-600 dark:text-surface-300 block mb-1.5">{label}</label>
      <select className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2.5 bg-white/50 dark:bg-surface-900/50 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
