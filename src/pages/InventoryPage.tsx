import { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import { Package, Search, Plus, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, X, Save } from 'lucide-react';
import type { Product } from '../types';

export function InventoryPage() {
  const { products, addProduct } = useDataStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAlerts, setFilterAlerts] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('medication');
  const [newPrice, setNewPrice] = useState(0);
  const [newCostPrice, setNewCostPrice] = useState(0);
  const [newQty, setNewQty] = useState(0);
  const [newMinQty, setNewMinQty] = useState(5);
  const [newExpiry, setNewExpiry] = useState('');
  const [newSupplier, setNewSupplier] = useState('');

  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products
    .filter((p) => filterCategory === 'all' || p.category === filterCategory)
    .filter((p) => !filterAlerts || (p.alertType === 'low-stock' || p.alertType === 'expiring'))
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalValue = products.reduce((acc, p) => acc + (p.costPrice * p.quantity), 0);
  const lowStockCount = products.filter(p => p.alertType === 'low-stock').length;
  const expiringCount = products.filter(p => p.alertType === 'expiring').length;

  const categoryLabels: Record<string, string> = {
    medication: 'Medicamento', food: 'Ração', hygiene: 'Higiene e Beleza',
    accessory: 'Acessório', surgical: 'Material Cirúrgico', vaccine: 'Vacina'
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSku.trim() || newPrice <= 0) return;

    let alertType: Product['alertType'] = 'ok';
    if (newQty <= newMinQty) alertType = 'low-stock';
    else if (newExpiry) {
      const daysToExpiry = Math.floor((new Date(newExpiry).getTime() - Date.now()) / 86400000);
      if (daysToExpiry < 0) alertType = 'expired';
      else if (daysToExpiry <= 30) alertType = 'expiring';
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      name: newName,
      sku: newSku,
      category: newCategory,
      price: Number(newPrice),
      costPrice: Number(newCostPrice),
      quantity: Number(newQty),
      minQuantity: Number(newMinQty),
      expiryDate: newExpiry || undefined,
      supplier: newSupplier || undefined,
      alertType,
    };

    addProduct(product);
    setShowAddModal(false);
    // Reset form
    setNewName(''); setNewSku(''); setNewPrice(0); setNewCostPrice(0);
    setNewQty(0); setNewMinQty(5); setNewExpiry(''); setNewSupplier('');
  };

  const inputCls = 'w-full text-sm border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2.5 bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all';
  const labelCls = 'text-xs font-semibold text-surface-600 dark:text-surface-400 block mb-1';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" /> Controle de Estoque
          </h1>
          <p className="text-sm text-surface-500">Gerencie produtos, lotes e validade</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 rounded-[var(--radius-md)] hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            <ArrowDownToLine className="w-4 h-4" /> Entrada
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 rounded-[var(--radius-md)] hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            <ArrowUpFromLine className="w-4 h-4" /> Saída
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-[var(--radius-md)] transition-colors shadow-sm ml-2"
          >
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
          <p className="text-sm text-surface-500 mb-1">Total de Itens Cadastrados</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{products.length}</p>
        </div>
        <div className="bg-white dark:bg-surface-800 p-4 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700">
          <p className="text-sm text-surface-500 mb-1">Valor Total em Estoque</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-[var(--radius-lg)] border border-red-200 dark:border-red-900/30">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-medium text-red-800 dark:text-red-400">Estoque Baixo</p>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-500">{lowStockCount} itens</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-[var(--radius-lg)] border border-amber-200 dark:border-amber-900/30">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Próximos ao Vencimento</p>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-500">{expiringCount} itens</p>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto flex-1">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar produto ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] px-3 py-2 bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((c) => <option key={c} value={c}>{categoryLabels[c] ?? c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 cursor-pointer">
              <input type="checkbox" checked={filterAlerts} onChange={(e) => setFilterAlerts(e.target.checked)} className="rounded border-surface-300 text-primary-500 focus:ring-primary-500/30" />
              Somente com alertas
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-50 dark:bg-surface-900/50 text-surface-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Produto / SKU</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3 text-right">Custo / Venda</th>
                <th className="px-6 py-3 text-center">Quantidade</th>
                <th className="px-6 py-3 text-center">Vencimento</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-surface-500">Nenhum produto encontrado</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-surface-800 dark:text-white">{p.name}</p>
                      <p className="text-xs text-surface-500">SKU: {p.sku}</p>
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">{categoryLabels[p.category] ?? p.category}</td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-surface-500 text-xs line-through">R$ {p.costPrice.toFixed(2)}</p>
                      <p className="font-medium text-surface-800 dark:text-surface-200">R$ {p.price.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold text-lg ${p.quantity <= p.minQuantity ? 'text-red-600' : 'text-surface-800 dark:text-surface-200'}`}>
                          {p.quantity}
                        </span>
                        <span className="text-[10px] text-surface-400">Min: {p.minQuantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-surface-600 dark:text-surface-400">
                      {p.expiryDate ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.alertType === 'low-stock' ? (
                        <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center justify-center gap-1 w-max mx-auto">
                          Estoque Baixo
                        </span>
                      ) : p.alertType === 'expiring' ? (
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center justify-center gap-1 w-max mx-auto">
                          Vencendo
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase w-max mx-auto block">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: NOVO PRODUTO ───────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-800 w-full max-w-xl rounded-2xl border border-surface-200 dark:border-surface-700 shadow-2xl animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/40">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" /> Cadastrar Novo Produto
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Nome do Produto *</label>
                  <input className={inputCls} required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Bravecto 10 a 20kg" />
                </div>

                <div>
                  <label className={labelCls}>Código SKU *</label>
                  <input className={inputCls} required value={newSku} onChange={e => setNewSku(e.target.value)} placeholder="Ex: BRV-001" />
                </div>

                <div>
                  <label className={labelCls}>Categoria *</label>
                  <select className={inputCls} value={newCategory} onChange={e => setNewCategory(e.target.value as Product['category'])}>
                    <option value="medication">Medicamento</option>
                    <option value="food">Ração</option>
                    <option value="hygiene">Higiene e Beleza</option>
                    <option value="accessory">Acessório</option>
                    <option value="surgical">Material Cirúrgico</option>
                    <option value="vaccine">Vacina</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Preço de Custo (R$)</label>
                  <input type="number" step="0.01" min="0" className={inputCls} value={newCostPrice || ''} onChange={e => setNewCostPrice(Number(e.target.value))} placeholder="0,00" />
                </div>

                <div>
                  <label className={labelCls}>Preço de Venda (R$) *</label>
                  <input type="number" step="0.01" min="0.01" className={inputCls} required value={newPrice || ''} onChange={e => setNewPrice(Number(e.target.value))} placeholder="0,00" />
                </div>

                <div>
                  <label className={labelCls}>Quantidade em Estoque</label>
                  <input type="number" min="0" className={inputCls} value={newQty} onChange={e => setNewQty(Number(e.target.value))} />
                </div>

                <div>
                  <label className={labelCls}>Estoque Mínimo (Alerta)</label>
                  <input type="number" min="0" className={inputCls} value={newMinQty} onChange={e => setNewMinQty(Number(e.target.value))} />
                </div>

                <div>
                  <label className={labelCls}>Data de Vencimento</label>
                  <input type="date" className={inputCls} value={newExpiry} onChange={e => setNewExpiry(e.target.value)} />
                </div>

                <div>
                  <label className={labelCls}>Fornecedor</label>
                  <input className={inputCls} value={newSupplier} onChange={e => setNewSupplier(e.target.value)} placeholder="Ex: Distribuidora X" />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-surface-200 dark:border-surface-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" /> Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
