import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Droplets, Plus, Search, Edit2, Trash2, Download,
  CheckCircle, XCircle, Clock, Heart, Filter, PawPrint, User,
  ChevronDown
} from 'lucide-react';
import { useDonorStore, type BloodDonor, type BloodType, type DonorStatus } from '../store/useDonorStore';
import { useDataStore } from '../store/useDataStore';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function statusBadge(status: DonorStatus) {
  const map: Record<DonorStatus, { label: string; className: string }> = {
    ativo: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    inativo: { label: 'Inativo', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    em_avaliacao: { label: 'Em Avaliação', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  };
  const { label, className } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function exportCSV(donors: BloodDonor[]) {
  const headers = ['Nome do Pet', 'Tutor', 'Espécie', 'Raça', 'Idade (anos)', 'Peso (kg)', 'Tipo Sanguíneo', 'Status', 'Última Doação', 'Próxima Disponível', 'Total Doações'];
  const rows = donors.map((d) => [
    d.petName, d.tutorName, d.species, d.breed, d.ageYears, d.weightKg,
    d.bloodType, d.status, d.lastDonationDate ?? '-', d.nextAvailableDate ?? '-', d.totalDonations,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `banco-doadores-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ────────────────────────────────────────────────────────────
// Modal de adicionar / editar doador
// ────────────────────────────────────────────────────────────
const BLOOD_TYPES: BloodType[] = ['DEA 1.1+', 'DEA 1.1-', 'A', 'B', 'AB', 'Desconhecido'];
const STATUS_OPTIONS: { value: DonorStatus; label: string }[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'em_avaliacao', label: 'Em Avaliação' },
];

type ModalMode = 'add' | 'edit';

interface DonorModalProps {
  mode: ModalMode;
  initial?: BloodDonor;
  onClose: () => void;
  onSave: (data: BloodDonor) => void;
}

function DonorModal({ mode, initial, onClose, onSave }: DonorModalProps) {
  const { pets, tutors } = useDataStore();

  const [selectedPetId, setSelectedPetId] = useState(initial?.petId ?? '');
  const [bloodType, setBloodType] = useState<BloodType>(initial?.bloodType ?? 'Desconhecido');
  const [status, setStatus] = useState<DonorStatus>(initial?.status ?? 'em_avaliacao');
  const [consent, setConsent] = useState(initial?.tutorConsent ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const relatedTutor = selectedPet ? tutors.find((t) => t.id === selectedPet.tutorId) : undefined;

  function calcAge(birthDate: string) {
    if (!birthDate) return 0;
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPet) return;

    const donor: BloodDonor = {
      id: initial?.id ?? uid(),
      petId: selectedPet.id,
      petName: selectedPet.name,
      tutorId: relatedTutor?.id ?? '',
      tutorName: relatedTutor?.name ?? 'Sem tutor',
      species: selectedPet.species,
      breed: selectedPet.breed,
      ageYears: calcAge(selectedPet.birthDate),
      weightKg: selectedPet.weight,
      bloodType,
      status,
      tutorConsent: consent,
      notes,
      totalDonations: initial?.totalDonations ?? 0,
      lastDonationDate: initial?.lastDonationDate,
      nextAvailableDate: initial?.nextAvailableDate,
      registeredAt: initial?.registeredAt ?? new Date().toISOString(),
    };
    onSave(donor);
  }

  const inputCls = 'w-full text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2.5 bg-white/50 dark:bg-surface-900/50 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all';
  const labelCls = 'text-sm font-semibold text-surface-600 dark:text-surface-300 block mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-surface-900 rounded-[var(--radius-xl)] shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-surface-900 dark:text-white text-base">
              {mode === 'add' ? 'Cadastrar Doador' : 'Editar Doador'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[var(--radius-md)] hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Seleção de Pet */}
          <div>
            <label className={labelCls}>
              <PawPrint className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
              Pet Cadastrado *
            </label>
            <select
              className={inputCls}
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              required
              disabled={mode === 'edit'}
            >
              <option value="">Selecione um pet...</option>
              {pets.map((p) => {
                const t = tutors.find((t) => t.id === p.tutorId);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.species} ({t?.name ?? 'Sem tutor'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Info do pet selecionado */}
          {selectedPet && (
            <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-[var(--radius-md)] grid grid-cols-2 gap-2 text-xs text-surface-600 dark:text-surface-400">
              <span><strong>Raça:</strong> {selectedPet.breed}</span>
              <span><strong>Peso:</strong> {selectedPet.weight} kg</span>
              <span><strong>Tutor:</strong> {relatedTutor?.name ?? '—'}</span>
              <span><strong>Telefone:</strong> {relatedTutor?.phone ?? '—'}</span>
            </div>
          )}

          {/* Tipo sanguíneo */}
          <div>
            <label className={labelCls}>Tipo Sanguíneo</label>
            <select className={inputCls} value={bloodType} onChange={(e) => setBloodType(e.target.value as BloodType)}>
              {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status do Doador</label>
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as DonorStatus)}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Consentimento */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="w-4 h-4 rounded accent-red-500"
            />
            <span className="text-sm text-surface-700 dark:text-surface-300">
              Tutor autorizou a doação de sangue por escrito
            </span>
          </label>

          {/* Observações */}
          <div>
            <label className={labelCls}>Observações clínicas</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Doador hígido, vacinação em dia, sem uso de antiparasitário recente..."
            />
          </div>

          {/* Ações */}
          <div className="flex gap-3 justify-end pt-2 border-t border-surface-200/50 dark:border-surface-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-[var(--radius-md)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-[var(--radius-md)] transition-colors shadow-sm"
            >
              <Droplets className="w-4 h-4" />
              {mode === 'add' ? 'Cadastrar Doador' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Página Principal
// ────────────────────────────────────────────────────────────
export function DonorsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { donors, addDonor, updateDonor, deleteDonor, registerDonation } = useDonorStore();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<DonorStatus | 'todos'>('todos');
  const [filterSpecies, setFilterSpecies] = useState('todos');
  const [modal, setModal] = useState<{ mode: ModalMode; donor?: BloodDonor } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const newPetId = searchParams.get('newPetId');
    if (newPetId && !modal) {
      setModal({ mode: 'add', donor: { petId: newPetId } as BloodDonor });
      navigate('/doadores', { replace: true });
    }
  }, [searchParams, modal, navigate]);

  // Filtros
  const filtered = useMemo(() => {
    return donors.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.petName.toLowerCase().includes(q) ||
        d.tutorName.toLowerCase().includes(q) ||
        d.breed.toLowerCase().includes(q) ||
        d.bloodType.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'todos' || d.status === filterStatus;
      const matchSpecies = filterSpecies === 'todos' || d.species === filterSpecies;
      return matchSearch && matchStatus && matchSpecies;
    });
  }, [donors, search, filterStatus, filterSpecies]);

  const speciesList = useMemo(() => {
    const s = new Set(donors.map((d) => d.species));
    return Array.from(s);
  }, [donors]);

  // Estatísticas
  const stats = useMemo(() => ({
    total: donors.length,
    ativos: donors.filter((d) => d.status === 'ativo').length,
    totalDoacoes: donors.reduce((acc, d) => acc + d.totalDonations, 0),
    disponiveis: donors.filter((d) => {
      if (d.status !== 'ativo') return false;
      if (!d.nextAvailableDate) return true;
      return new Date(d.nextAvailableDate) <= new Date();
    }).length,
  }), [donors]);

  function handleSave(donor: BloodDonor) {
    if (modal?.mode === 'add') addDonor(donor);
    else updateDonor(donor.id, donor);
    setModal(null);
  }

  function handleDelete(id: string) {
    deleteDonor(id);
    setConfirmDelete(null);
  }

  const cardCls = 'bg-white/80 dark:bg-surface-800/80 backdrop-blur-md rounded-[var(--radius-xl)] border border-surface-200/50 dark:border-surface-700/50 shadow-sm';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-6 h-6 text-red-500" />
            Banco de Doadores de Sangue
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Gerencie os pets doadores cadastrados na clínica
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-[var(--radius-md)] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Novo Doador
          </button>
        </div>
      </div>

      {/* ── Estatísticas ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total de Doadores', value: stats.total, icon: Heart, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
          { label: 'Doadores Ativos', value: stats.ativos, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Disponíveis Agora', value: stats.disponiveis, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Total de Doações', value: stats.totalDoacoes, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${cardCls} p-4 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-[var(--radius-md)] ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{value}</p>
              <p className="text-xs text-surface-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Busca e filtros ── */}
      <div className={`${cardCls} p-4 space-y-3`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por nome do pet, tutor, raça ou tipo sanguíneo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-[var(--radius-md)] border transition-colors ${showFilters ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
          >
            <Filter className="w-4 h-4" /> Filtros <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-1 border-t border-surface-200/50 dark:border-surface-700/50">
            <div>
              <label className="text-xs font-semibold text-surface-500 mb-1 block">Status</label>
              <select
                className="text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-2 py-1.5 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as DonorStatus | 'todos')}
              >
                <option value="todos">Todos</option>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {speciesList.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-surface-500 mb-1 block">Espécie</label>
                <select
                  className="text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-2 py-1.5 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                  value={filterSpecies}
                  onChange={(e) => setFilterSpecies(e.target.value)}
                >
                  <option value="todos">Todas</option>
                  {speciesList.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={() => { setFilterStatus('todos'); setFilterSpecies('todos'); setSearch(''); }}
                className="text-xs text-red-500 hover:underline font-semibold"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabela de doadores ── */}
      <div className={`${cardCls} overflow-hidden`}>
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-surface-400">
            <Droplets className="w-12 h-12 opacity-20" />
            <p className="font-semibold">
              {donors.length === 0
                ? 'Nenhum doador cadastrado ainda'
                : 'Nenhum resultado para os filtros aplicados'}
            </p>
            {donors.length === 0 && (
              <button
                onClick={() => setModal({ mode: 'add' })}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-[var(--radius-md)] transition-colors"
              >
                <Plus className="w-4 h-4" /> Cadastrar primeiro doador
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/30">
                  {['Pet (ID)', 'Raça', 'Idade', 'Peso', 'Tipo Sang.', 'Status', 'Última Doação', 'Próx. Disponível', 'Ações'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                {filtered.map((donor) => {
                  const isAvailable =
                    donor.status === 'ativo' &&
                    (!donor.nextAvailableDate || new Date(donor.nextAvailableDate) <= new Date());

                  return (
                    <tr key={donor.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors group">
                      {/* Pet / Tutor */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/crm?tutorId=${donor.tutorId}`)}
                          className="text-left group/link cursor-pointer"
                          title="Ver cadastro na clínica"
                        >
                          <p className="font-semibold text-surface-900 dark:text-white group-hover/link:text-red-500 dark:group-hover/link:text-red-400 transition-colors flex items-center gap-1">
                            <PawPrint className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            {donor.petName}
                          </p>
                          <p className="text-xs text-surface-500 font-mono mt-0.5 opacity-80">
                            {donor.petId}
                          </p>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-surface-700 dark:text-surface-300">{donor.breed || '—'}</td>
                      <td className="px-4 py-3 text-surface-700 dark:text-surface-300">{donor.ageYears} anos</td>
                      <td className="px-4 py-3 text-surface-700 dark:text-surface-300">{donor.weightKg} kg</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-red-600 dark:text-red-400">{donor.bloodType}</span>
                      </td>
                      <td className="px-4 py-3">{statusBadge(donor.status)}</td>
                      <td className="px-4 py-3 text-surface-600 dark:text-surface-400">
                        {donor.lastDonationDate
                          ? new Date(donor.lastDonationDate).toLocaleDateString('pt-BR')
                          : <span className="text-surface-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {isAvailable ? (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Disponível
                          </span>
                        ) : donor.nextAvailableDate ? (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            {new Date(donor.nextAvailableDate).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-surface-400">—</span>
                        )}
                      </td>
                      {/* Ações */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {donor.status === 'ativo' && isAvailable && (
                            <button
                              onClick={() => registerDonation(donor.id)}
                              title="Registrar doação"
                              className="p-1.5 rounded-[var(--radius-sm)] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                              <Droplets className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setModal({ mode: 'edit', donor })}
                            title="Editar doador"
                            className="p-1.5 rounded-[var(--radius-sm)] text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(donor.id)}
                            title="Remover doador"
                            className="p-1.5 rounded-[var(--radius-sm)] text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Rodapé de resultados ── */}
      {filtered.length > 0 && (
        <p className="text-xs text-surface-400 text-center">
          Exibindo {filtered.length} de {donors.length} doador{donors.length !== 1 ? 'es' : ''}
        </p>
      )}

      {/* ── Modal de cadastro / edição ── */}
      {modal && (
        <DonorModal
          mode={modal.mode}
          initial={modal.donor}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* ── Confirmação de exclusão ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-surface-900 rounded-[var(--radius-xl)] shadow-2xl border border-surface-200 dark:border-surface-700 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-surface-900 dark:text-white">Remover Doador</p>
                <p className="text-sm text-surface-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-[var(--radius-md)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-[var(--radius-md)] transition-colors"
              >
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
