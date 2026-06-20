import { useState } from 'react';
import { PlusCircle, Save, X, User, PawPrint, Package, Calendar } from 'lucide-react';

type Tab = 'tutor' | 'pet' | 'product' | 'service';

export function RegistrationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tutor');

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary-500" /> Cadastros Rápidos
          </h1>
          <p className="text-sm text-surface-500">Adicione novos clientes, pets, produtos e serviços à plataforma.</p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-md rounded-[var(--radius-xl)] border border-surface-200/50 dark:border-surface-700/50 overflow-hidden shadow-sm">
        <div className="flex border-b border-surface-200/50 dark:border-surface-700/50 overflow-x-auto">
          <TabButton active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={User} label="Novo Tutor" />
          <TabButton active={activeTab === 'pet'} onClick={() => setActiveTab('pet')} icon={PawPrint} label="Novo Pet" />
          <TabButton active={activeTab === 'product'} onClick={() => setActiveTab('product')} icon={Package} label="Novo Produto" />
          <TabButton active={activeTab === 'service'} onClick={() => setActiveTab('service')} icon={Calendar} label="Novo Serviço" />
        </div>

        <div className="p-6">
          {activeTab === 'tutor' && <TutorForm />}
          {activeTab === 'pet' && <PetForm />}
          {activeTab === 'product' && <ProductForm />}
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
  return (
    <form className="space-y-4 animate-fade-in" onSubmit={(e) => { e.preventDefault(); alert('Tutor cadastrado!'); }}>
      <h2 className="text-lg font-bold text-surface-800 dark:text-white mb-4">Dados do Tutor</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nome Completo *" placeholder="Ex: João da Silva" required />
        <Input label="CPF *" placeholder="000.000.000-00" required />
        <Input label="Telefone / WhatsApp *" placeholder="(00) 00000-0000" required />
        <Input label="E-mail" placeholder="joao@email.com" type="email" />
        <Input label="Endereço (Rua, Nº, Bairro)" placeholder="Av. Principal, 123 - Centro" className="md:col-span-2" />
      </div>
      <FormActions />
    </form>
  );
}

function PetForm() {
  return (
    <form className="space-y-4 animate-fade-in" onSubmit={(e) => { e.preventDefault(); alert('Pet cadastrado!'); }}>
      <h2 className="text-lg font-bold text-surface-800 dark:text-white mb-4">Dados do Pet</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input label="Nome do Pet *" placeholder="Ex: Rex" required />
        <Select label="Espécie *" options={['Cachorro', 'Gato', 'Ave', 'Roedor', 'Outro']} />
        <Input label="Raça" placeholder="Ex: Golden Retriever" />
        <Select label="Sexo *" options={['Macho', 'Fêmea']} />
        <Input label="Data de Nascimento (ou idade)" type="date" />
        <Input label="Peso Atual (kg)" type="number" step="0.1" placeholder="Ex: 12.5" />
        <div className="lg:col-span-3">
          <label className="text-sm font-semibold text-surface-600 dark:text-surface-300 block mb-1.5">Tutor Responsável *</label>
          <select className="w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2.5 bg-white/50 dark:bg-surface-900/50 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">
            <option value="">Selecione um tutor cadastrado</option>
            <option value="1">João Santos - 111.111.111-11</option>
            <option value="2">Ana Oliveira - 222.222.222-22</option>
          </select>
        </div>
      </div>
      <FormActions />
    </form>
  );
}

function ProductForm() {
  return (
    <form className="space-y-4 animate-fade-in" onSubmit={(e) => { e.preventDefault(); alert('Produto cadastrado!'); }}>
      <h2 className="text-lg font-bold text-surface-800 dark:text-white mb-4">Dados do Produto (Estoque)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Nome do Produto *" placeholder="Ex: Bravecto 10 a 20kg" className="md:col-span-2" required />
        <Input label="Código SKU *" placeholder="EX: BRV-001" required />
        <Select label="Categoria *" options={['Medicamento', 'Ração', 'Higiene e Beleza', 'Acessório', 'Outro']} />
        <Input label="Preço de Custo (R$)" type="number" step="0.01" />
        <Input label="Preço de Venda (R$) *" type="number" step="0.01" required />
        <Input label="Qtd Inicial Estoque" type="number" defaultValue="0" />
        <Input label="Estoque Mínimo (Alerta)" type="number" defaultValue="5" />
      </div>
      <FormActions />
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
      <FormActions />
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

function FormActions() {
  return (
    <div className="flex gap-3 justify-end pt-4 border-t border-surface-200/50 dark:border-surface-700/50 mt-6">
      <button type="button" className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-[var(--radius-md)] transition-colors">
        <X className="w-4 h-4" /> Cancelar
      </button>
      <button type="submit" className="flex items-center gap-1.5 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-[var(--radius-md)] transition-colors shadow-sm">
        <Save className="w-4 h-4" /> Salvar
      </button>
    </div>
  );
}
