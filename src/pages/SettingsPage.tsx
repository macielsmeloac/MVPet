import { useState } from 'react';
import { Building2, Users, Percent, Bell, FileText, Save, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

type Tab = 'clinica' | 'usuarios' | 'comissoes' | 'alertas' | 'fiscal';

interface User { id: string; name: string; role: string; email: string; active: boolean; }
interface CommissionRule { id: string; serviceType: string; rate: number; }

const ROLES = ['Administrador', 'Veterinário', 'Recepcionista', 'Plantonista', 'Tosador', 'Auxiliar'];
const SERVICE_TYPES = ['Consulta', 'Cirurgia', 'Vacina', 'Banho', 'Banho + Tosa', 'Internação', 'Exame', 'Retorno'];

const inputCls = 'w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all';
const labelCls = 'block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1';
const cardCls = 'bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 p-5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4 pb-2 border-b border-surface-100 dark:border-surface-700">{children}</h3>;
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end pt-4">
      <button onClick={onSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-[var(--radius-md)] transition-colors shadow-sm">
        <Save className="w-4 h-4" /> Salvar Alterações
      </button>
    </div>
  );
}

function TabClinica() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <SectionTitle>Dados da Clínica</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome Fantasia"><input className={inputCls} defaultValue="Clínica Vet MVPet" /></Field>
          <Field label="Razão Social"><input className={inputCls} defaultValue="MVPet Serviços Veterinários LTDA" /></Field>
          <Field label="CNPJ"><input className={inputCls} defaultValue="12.345.678/0001-99" /></Field>
          <Field label="Inscrição Municipal"><input className={inputCls} defaultValue="123456-7" /></Field>
          <Field label="Telefone"><input className={inputCls} defaultValue="(11) 3456-7890" /></Field>
          <Field label="WhatsApp"><input className={inputCls} defaultValue="(11) 98765-4321" /></Field>
          <Field label="E-mail" ><input className={inputCls} defaultValue="contato@mvpet.com.br" /></Field>
          <Field label="Site"><input className={inputCls} defaultValue="www.mvpet.com.br" /></Field>
        </div>
      </div>
      <div className={cardCls}>
        <SectionTitle>Endereço</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Field label="Rua / Avenida"><input className={inputCls} defaultValue="Rua dos Animais" /></Field></div>
          <Field label="Número"><input className={inputCls} defaultValue="100" /></Field>
          <Field label="Complemento"><input className={inputCls} defaultValue="Sala 01" /></Field>
          <Field label="Bairro"><input className={inputCls} defaultValue="Jardim Pet" /></Field>
          <Field label="Cidade"><input className={inputCls} defaultValue="São Paulo" /></Field>
          <Field label="Estado"><input className={inputCls} defaultValue="SP" /></Field>
          <Field label="CEP"><input className={inputCls} defaultValue="01234-567" /></Field>
        </div>
      </div>
      <div className={cardCls}>
        <SectionTitle>Horário de Funcionamento</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((d) => (
            <div key={d} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={d !== 'Domingo'} className="w-4 h-4 rounded border-surface-300 text-primary-500" />
              <span className="text-sm text-surface-700 dark:text-surface-300 w-16">{d}</span>
              <input type="time" defaultValue="08:00" className="text-xs border border-surface-200 dark:border-surface-700 rounded px-2 py-1 bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300" />
              <span className="text-xs text-surface-400">–</span>
              <input type="time" defaultValue="18:00" className="text-xs border border-surface-200 dark:border-surface-700 rounded px-2 py-1 bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300" />
            </div>
          ))}
        </div>
      </div>
      {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400 text-right font-medium animate-fade-in">✓ Dados salvos com sucesso!</p>}
      <SaveBar onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }} />
    </div>
  );
}

function TabUsuarios() {
  const [users, setUsers] = useState<User[]>([
    { id: 'u1', name: 'Dra. Camila Rocha', role: 'Veterinário', email: 'camila@mvpet.com.br', active: true },
    { id: 'u2', name: 'Dr. Rafael Souza', role: 'Veterinário', email: 'rafael@mvpet.com.br', active: true },
    { id: 'u3', name: 'Tosador Lucas', role: 'Tosador', email: 'lucas@mvpet.com.br', active: true },
    { id: 'u4', name: 'Tosadora Juliana', role: 'Tosador', email: 'juliana@mvpet.com.br', active: true },
    { id: 'u5', name: 'Pedro Motorista', role: 'Auxiliar', email: 'pedro@mvpet.com.br', active: false },
    { id: 'u6', name: 'Admin Geral', role: 'Administrador', email: 'admin@mvpet.com.br', active: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', role: 'Recepcionista', email: '' });
  const [showPass, setShowPass] = useState(false);

  const addUser = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers(u => [...u, { id: `u${Date.now()}`, ...newUser, active: true }]);
    setNewUser({ name: '', role: 'Recepcionista', email: '' });
    setShowForm(false);
  };

  const roleColor = (r: string) => {
    if (r === 'Administrador') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    if (r === 'Veterinário') return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400';
    if (r === 'Tosador') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400';
  };

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Equipe ({users.filter(u => u.active).length} ativos)</SectionTitle>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-[var(--radius-md)] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Novo Usuário
          </button>
        </div>
        {showForm && (
          <div className="bg-surface-50 dark:bg-surface-900/50 rounded-[var(--radius-md)] p-4 mb-4 space-y-3 border border-surface-200 dark:border-surface-700 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Nome Completo"><input className={inputCls} value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} placeholder="Nome..." /></Field>
              <Field label="E-mail"><input className={inputCls} value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} placeholder="email@..." /></Field>
              <Field label="Função">
                <select className={inputCls} value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>
            <div className="relative">
              <Field label="Senha Provisória">
                <input type={showPass ? 'text' : 'password'} className={inputCls} placeholder="Senha..." />
              </Field>
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-7 text-surface-400 hover:text-surface-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">Cancelar</button>
              <button onClick={addUser} className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-[var(--radius-md)] transition-colors">Adicionar</button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className={`flex items-center gap-3 p-3 rounded-[var(--radius-md)] border transition-colors ${u.active ? 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800' : 'border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/30 opacity-60'}`}>
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-400 shrink-0">{u.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-800 dark:text-white">{u.name}</p>
                <p className="text-xs text-surface-400">{u.email}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleColor(u.role)}`}>{u.role}</span>
              <button onClick={() => setUsers(us => us.map(x => x.id === u.id ? { ...x, active: !x.active } : x))}
                className={`text-xs px-2 py-1 rounded border transition-colors ${u.active ? 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-red-300 hover:text-red-500' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
                {u.active ? 'Desativar' : 'Ativar'}
              </button>
              <button onClick={() => setUsers(us => us.filter(x => x.id !== u.id))} className="text-surface-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabComissoes() {
  const [rules, setRules] = useState<CommissionRule[]>(
    SERVICE_TYPES.map((s, i) => ({ id: `r${i}`, serviceType: s, rate: s === 'Banho' || s === 'Banho + Tosa' ? 40 : s === 'Cirurgia' ? 8 : 10 }))
  );
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <SectionTitle>Taxas de Comissão por Tipo de Serviço</SectionTitle>
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">Configure o percentual padrão de comissão para cada categoria de serviço. Esses valores são usados ao lançar vendas automaticamente.</p>
        <div className="space-y-3">
          {rules.map(r => (
            <div key={r.id} className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-700">
              <span className="flex-1 text-sm font-medium text-surface-700 dark:text-surface-300">{r.serviceType}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number" min={0} max={100} value={r.rate}
                  onChange={e => setRules(rs => rs.map(x => x.id === r.id ? { ...x, rate: Number(e.target.value) } : x))}
                  className="w-20 text-sm text-center border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-2 py-1.5 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
                <span className="text-sm text-surface-500">%</span>
              </div>
              <div className="w-24 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${r.rate}%` }} />
              </div>
            </div>
          ))}
        </div>
        {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-4 font-medium animate-fade-in">✓ Taxas salvas!</p>}
        <SaveBar onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }} />
      </div>
    </div>
  );
}

function TabAlertas() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <SectionTitle>Estoque</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Alertar quando estoque abaixo de (unidades)"><input type="number" className={inputCls} defaultValue={5} /></Field>
          <Field label="Alertar sobre vencimentos com antecedência (dias)"><input type="number" className={inputCls} defaultValue={30} /></Field>
        </div>
      </div>
      <div className={cardCls}>
        <SectionTitle>Financeiro e Inadimplência</SectionTitle>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-700">
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-white">Bloquear cadastro de pet para tutores inadimplentes</p>
              <p className="text-xs text-surface-400">Exibe alerta e impede adicionar novos animais enquanto há débito</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-surface-300 peer-focus:ring-2 peer-focus:ring-primary-500/20 dark:bg-surface-600 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
          <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-700">
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-white">Alertar ao agendar consulta para inadimplentes</p>
              <p className="text-xs text-surface-400">Exibe banner de aviso ao tentar marcar consulta</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-surface-300 dark:bg-surface-600 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
          <Field label="Considerar inadimplente após (dias sem pagamento)"><input type="number" className={inputCls} defaultValue={15} /></Field>
          <Field label="Limite máximo de desconto por operador (%)"><input type="number" className={inputCls} defaultValue={10} /></Field>
        </div>
      </div>
      <div className={cardCls}>
        <SectionTitle>Vacinas e Retornos</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Alertar sobre vacinas vencendo em (dias)"><input type="number" className={inputCls} defaultValue={30} /></Field>
          <Field label="Alertar sobre retornos pendentes após (dias)"><input type="number" className={inputCls} defaultValue={7} /></Field>
        </div>
      </div>
      {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400 text-right font-medium animate-fade-in">✓ Configurações de alertas salvas!</p>}
      <SaveBar onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }} />
    </div>
  );
}

function TabFiscal() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-[var(--radius-md)]">
          <span className="text-amber-600 dark:text-amber-400 text-sm">⚠️</span>
          <p className="text-xs text-amber-700 dark:text-amber-400">Configurações fiscais são de responsabilidade do contador da empresa. Utilize este painel apenas para consulta e configuração básica.</p>
        </div>
        <SectionTitle>Emissão de NFS-e (Serviços)</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Série da Nota"><input className={inputCls} defaultValue="1" /></Field>
          <Field label="Próximo Número"><input className={inputCls} defaultValue="100" /></Field>
          <Field label="Código do Município (IBGE)"><input className={inputCls} defaultValue="3550308" /></Field>
          <Field label="Código de Serviço (LC 116)"><input className={inputCls} defaultValue="8.01" /></Field>
          <div className="md:col-span-2">
            <Field label="Ambiente">
              <select className={inputCls} defaultValue="homologacao">
                <option value="homologacao">Homologação (Teste)</option>
                <option value="producao">Produção</option>
              </select>
            </Field>
          </div>
        </div>
      </div>
      <div className={cardCls}>
        <SectionTitle>Emissão de NFC-e / NF-e (Produtos)</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="CNPJ Emitente"><input className={inputCls} defaultValue="12.345.678/0001-99" /></Field>
          <Field label="Inscrição Estadual"><input className={inputCls} defaultValue="123.456.789.000" /></Field>
          <Field label="Série NFC-e"><input className={inputCls} defaultValue="001" /></Field>
          <Field label="Próximo Número NFC-e"><input className={inputCls} defaultValue="1" /></Field>
          <Field label="CSC (Token)"><input type="password" className={inputCls} defaultValue="token-aqui" /></Field>
          <Field label="ID Token"><input className={inputCls} defaultValue="1" /></Field>
          <div className="md:col-span-2">
            <Field label="Ambiente NFC-e">
              <select className={inputCls} defaultValue="homologacao">
                <option value="homologacao">Homologação (Teste)</option>
                <option value="producao">Produção</option>
              </select>
            </Field>
          </div>
        </div>
      </div>
      <div className={cardCls}>
        <SectionTitle>Preferências de Emissão</SectionTitle>
        <div className="space-y-3">
          {[
            { label: 'Emitir NFS-e automaticamente ao finalizar serviço', desc: 'Gera e envia a nota automaticamente no fechamento' },
            { label: 'Emitir NFC-e automaticamente ao finalizar venda de produto', desc: 'Emite nota do consumidor ao fechar a venda no PDV' },
            { label: 'Enviar nota por e-mail ao tutor automaticamente', desc: 'Envia cópia da nota para o e-mail cadastrado' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-700">
              <div>
                <p className="text-sm font-medium text-surface-800 dark:text-white">{item.label}</p>
                <p className="text-xs text-surface-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-5 bg-surface-300 dark:bg-surface-600 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      </div>
      {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400 text-right font-medium animate-fade-in">✓ Configurações fiscais salvas!</p>}
      <SaveBar onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }} />
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: 'clinica', label: 'Clínica', icon: Building2 },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'comissoes', label: 'Comissões', icon: Percent },
  { id: 'alertas', label: 'Alertas', icon: Bell },
  { id: 'fiscal', label: 'Fiscal', icon: FileText },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('clinica');

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Personalize o sistema conforme as necessidades da sua clínica</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-[var(--radius-lg)] p-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === t.id
                ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'clinica' && <TabClinica />}
        {activeTab === 'usuarios' && <TabUsuarios />}
        {activeTab === 'comissoes' && <TabComissoes />}
        {activeTab === 'alertas' && <TabAlertas />}
        {activeTab === 'fiscal' && <TabFiscal />}
      </div>
    </div>
  );
}
