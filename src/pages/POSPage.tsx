import { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, DollarSign, ReceiptText, User, X, Gift } from 'lucide-react';
import type { Product } from '../types';

interface CartItem extends Product {
  cartQuantity: number;
}

export function POSPage() {
  const { products, tutors, comandas, clearComanda, addTransaction, subscriptionPlans } = useDataStore();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string>('');
  const [tutorSearch, setTutorSearch] = useState('');
  const [showTutorDropdown, setShowTutorDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit' | 'cash'>('credit');
  const [selectedProfessional, setSelectedProfessional] = useState('Dr. Rodrigo (Vete)');
  const [commissionPercent, setCommissionPercent] = useState<number>(30);
  
  // Estados do Modal de Checkout
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [multiPayment, setMultiPayment] = useState(false);
  const [payment1, setPayment1] = useState(0);
  const [payment2, setPayment2] = useState(0);

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTutors = tutors.filter(t => 
    t.name.toLowerCase().includes(tutorSearch.toLowerCase()) || 
    t.cpf.replace(/\D/g, '').includes(tutorSearch.replace(/\D/g, ''))
  );

  const selectedTutor = tutors.find(t => t.id === selectedTutorId);
  const tutorComanda = selectedTutorId ? (comandas[selectedTutorId] || []) : [];

  // Busca o desconto de clube pet do tutor associado
  const tutorDiscountPercent = selectedTutor && selectedTutor.isSubscriber && selectedTutor.subscriptionPlanId
    ? (subscriptionPlans.find(p => p.id === selectedTutor.subscriptionPlanId)?.discount || 0)
    : 0;

  const tutorPlanName = selectedTutor && selectedTutor.isSubscriber && selectedTutor.subscriptionPlanId
    ? (subscriptionPlans.find(p => p.id === selectedTutor.subscriptionPlanId)?.name || 'Assinante')
    : '';

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.quantity) return prev;
        return prev.map((item) => (item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item));
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQ = item.cartQuantity + delta;
          if (newQ > 0 && newQ <= item.quantity) return { ...item, cartQuantity: newQ };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Cálculos financeiros com desconto de clube fidelidade
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.cartQuantity, 0);
  
  // Desconto de Clube Pet (aplica-se a produtos, não a serviços consumidos)
  const productDiscountAmount = cart.reduce((acc, item) => {
    if (item.sku !== 'SERV') {
      return acc + (item.price * item.cartQuantity * (tutorDiscountPercent / 100));
    }
    return acc;
  }, 0);

  const total = subtotal - productDiscountAmount;

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setPayment1(total);
    setPayment2(0);
    setIsCheckoutModalOpen(true);
  };

  const confirmCheckout = () => {
    addTransaction({
      id: `tr-${Date.now()}`,
      type: 'income',
      category: 'Venda PDV',
      description: `Venda balcão${selectedTutor ? ` - Cliente: ${selectedTutor.name}` : ''} - ${cart.length} itens`,
      amount: total,
      paymentMethod: multiPayment ? 'mixed' : paymentMethod,
      date: new Date().toISOString().split('T')[0]!,
      invoiceStatus: 'pending',
      invoiceType: 'nfc-e'
    });

    if (selectedTutorId) {
      clearComanda(selectedTutorId);
    }

    setCart([]);
    setSearch('');
    setSelectedTutorId('');
    setIsCheckoutModalOpen(false);
    
    // Dispara Toast ou notificação global? Vamos usar alert para nota por enquanto, mas logo abaixo tem o layout
    alert('✅ VENDA E EMISSÃO DE NOTA FISCAL (NFC-e) PROCESSADAS COM SUCESSO!');
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-4 animate-fade-in">
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <h1 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-pink-500" /> Loja & Frente de Caixa
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por código (SKU) ou nome do produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.quantity === 0}
                className={`w-full text-left p-3 rounded-[var(--radius-md)] border transition-all flex items-center justify-between gap-4 ${
                  product.quantity === 0
                    ? 'border-surface-200 dark:border-surface-800 opacity-50 cursor-not-allowed bg-surface-50 dark:bg-surface-900'
                    : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-pink-400 hover:shadow-sm'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-surface-400 mb-0.5">{product.sku}</p>
                  <p className="text-sm font-semibold text-surface-800 dark:text-white truncate">{product.name}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-[11px] font-medium bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 px-2 py-1 rounded">
                    Estq: {product.quantity}
                  </span>
                  <p className="font-bold text-base text-pink-650 dark:text-pink-400 w-24 text-right">R$ {product.price.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[380px] flex flex-col bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 overflow-hidden shrink-0 shadow-sm">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 flex items-center justify-between">
          <h2 className="font-bold text-surface-800 dark:text-white flex items-center gap-2">
            🛒 Carrinho Atual
          </h2>
          <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{cart.length} itens</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Alerta de Comanda Virtual Pendente */}
          {selectedTutor && tutorComanda.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-[var(--radius-md)] text-xs text-amber-800 dark:text-amber-400 space-y-2 animate-scale-in">
              <div className="flex items-center justify-between">
                <p className="font-bold flex items-center gap-1.5">
                  <span>🧾</span> Comanda Virtual Aberta
                </p>
                <span className="bg-amber-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full">
                  {tutorComanda.length} {tutorComanda.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <p className="text-[10px] text-surface-500">
                Este tutor possui itens pendentes registrados em sua comanda de consultório/banho.
              </p>
              <button
                onClick={() => {
                  tutorComanda.forEach((comandaItem) => {
                    if (comandaItem.type === 'product') {
                      const originalProduct = products.find(p => p.name === comandaItem.name || p.id === comandaItem.id);
                      if (originalProduct) {
                        setCart((prev) => {
                          const existing = prev.find(item => item.id === originalProduct.id);
                          if (existing) {
                            return prev.map(item => item.id === originalProduct.id ? { ...item, cartQuantity: item.cartQuantity + comandaItem.quantity } : item);
                          }
                          return [...prev, { ...originalProduct, cartQuantity: comandaItem.quantity }];
                        });
                      } else {
                        // Customizado
                        setCart((prev) => [
                          ...prev,
                          {
                            id: comandaItem.id,
                            sku: 'CUSTOM-PROD',
                            name: comandaItem.name,
                            price: comandaItem.price,
                            costPrice: comandaItem.price * 0.6,
                            quantity: 999,
                            minQuantity: 0,
                            category: 'accessory',
                            alertType: 'ok',
                            cartQuantity: comandaItem.quantity
                          }
                        ]);
                      }
                    } else {
                      // Serviço
                      setCart((prev) => [
                        ...prev,
                        {
                          id: comandaItem.id,
                          sku: 'SERV',
                          name: `${comandaItem.name} (Serviço)`,
                          price: comandaItem.price,
                          costPrice: 0,
                          quantity: 999,
                          minQuantity: 0,
                          category: 'hygiene',
                          alertType: 'ok',
                          cartQuantity: comandaItem.quantity
                        }
                      ]);
                    }
                  });
                  clearComanda(selectedTutorId);
                  alert('Itens da comanda importados com sucesso para o checkout!');
                }}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-[10px] transition-colors cursor-pointer"
              >
                Importar Itens da Comanda
              </button>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-surface-400 space-y-2 py-8">
              <ShoppingCart className="w-10 h-10 opacity-20 animate-pulse" />
              <p className="text-sm">Carrinho vazio</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col p-2.5 border border-surface-150 dark:border-surface-700 rounded-[var(--radius-md)] bg-white dark:bg-surface-800">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[10px] text-surface-400">{item.sku}</p>
                    <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 line-clamp-2">{item.name}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-surface-400 hover:text-red-500 transition-colors p-1 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 border border-surface-250 dark:border-surface-700 rounded-md p-0.5">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-surface-600 dark:text-surface-400 cursor-pointer">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold w-4 text-center text-surface-800 dark:text-surface-200">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-surface-600 dark:text-surface-400 cursor-pointer">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-bold text-sm text-surface-800 dark:text-white">
                    R$ {(item.price * item.cartQuantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 space-y-4">
          <div className="relative">
            <label className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-450 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Cliente / Tutor
            </label>
            
            {selectedTutor ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between border border-pink-300 dark:border-pink-700 bg-pink-500/10 rounded-[var(--radius-md)] px-3 py-1.5 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-pink-700 dark:text-pink-400 truncate">{selectedTutor.name}</p>
                    <p className="text-[10px] font-medium text-surface-500">{selectedTutor.cpf}</p>
                  </div>
                  <button onClick={() => setSelectedTutorId('')} className="p-1 hover:bg-pink-100 dark:hover:bg-pink-900/40 rounded-full text-pink-600 dark:text-pink-450 transition-colors cursor-pointer">
                     <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Badge de Clube Pet de Fidelidade */}
                {tutorDiscountPercent > 0 && (
                  <div className="flex items-center gap-1.5 p-2 bg-gradient-to-r from-pink-500/10 to-pink-650/5 border border-pink-500/20 rounded-[var(--radius-md)] text-[10px] text-pink-600 dark:text-pink-400 font-bold animate-scale-in">
                    <Gift className="w-3.5 h-3.5 text-pink-500 animate-bounce" />
                    <span>Clube {tutorPlanName}: {tutorDiscountPercent}% de desconto em produtos!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou CPF..."
                  value={tutorSearch}
                  onChange={(e) => { setTutorSearch(e.target.value); setShowTutorDropdown(true); }}
                  onFocus={() => setShowTutorDropdown(true)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-pink-500/25 shadow-sm"
                />
                
                {showTutorDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] shadow-lg">
                    <button 
                       onClick={() => { setSelectedTutorId(''); setTutorSearch(''); setShowTutorDropdown(false); }}
                       className="w-full text-left px-3 py-2 border-b border-surface-200 dark:border-surface-700 hover:bg-pink-50/10 bg-surface-50/80 dark:bg-surface-800 sticky top-0 z-10"
                    >
                      <p className="text-sm font-bold text-pink-500">Venda Direta</p>
                      <p className="text-[11px] text-surface-500 font-medium">Cliente sem cadastro / Balcão</p>
                    </button>
                    {filteredTutors.length > 0 ? (
                       filteredTutors.map(t => (
                         <button 
                           key={t.id}
                           onClick={() => {
                             setSelectedTutorId(t.id);
                             setTutorSearch('');
                             setShowTutorDropdown(false);
                           }}
                           className="w-full text-left px-3 py-2 border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700/50 last:border-0"
                         >
                           <p className="text-sm font-semibold text-surface-800 dark:text-white truncate">{t.name}</p>
                           <p className="text-[11px] text-surface-500">{t.cpf}</p>
                         </button>
                       ))
                    ) : (
                       <div className="p-3 text-center text-sm text-surface-500">Nenhum cliente encontrado</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-450 mb-1.5 block">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'credit', label: 'Crédito', icon: CreditCard },
                { id: 'debit', label: 'Débito', icon: CreditCard },
                { id: 'pix', label: 'PIX', icon: ReceiptText },
                { id: 'cash', label: 'Dinheiro', icon: DollarSign },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-[var(--radius-sm)] border text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === method.id
                      ? 'bg-pink-500/10 border-pink-500 text-pink-700 dark:text-pink-400'
                      : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-400 dark:hover:border-surface-600'
                  }`}
                >
                  <method.icon className="w-3.5 h-3.5" /> {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split de Pagamentos Multi-Profissionais */}
          <div className="pt-2 border-t border-surface-200 dark:border-surface-700 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-450 mb-1 flex items-center gap-1.5">
              <span>✂️</span> Split Multi-Profissionais
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <select
                  value={selectedProfessional}
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                  className="w-full text-xs border border-surface-200 dark:border-surface-750 rounded-[var(--radius-md)] px-2 py-1.5 bg-white dark:bg-surface-850 text-surface-700 dark:text-surface-300 focus:outline-none"
                >
                  <option>Dr. Rodrigo (Vete)</option>
                  <option>Dra. Julia (Cirurgiã)</option>
                  <option>Esteticista Lucas (Groomer)</option>
                  <option>Dr. Plantonista (Internações)</option>
                </select>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(Number(e.target.value))}
                  className="w-full pl-3 pr-6 py-1 text-xs border border-surface-200 dark:border-surface-750 rounded-[var(--radius-md)] bg-white dark:bg-surface-850 text-surface-700 dark:text-surface-300 font-bold focus:outline-none"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-surface-400">%</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-surface-200 dark:border-surface-700 space-y-1.5">
            {tutorDiscountPercent > 0 && cart.length > 0 && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-surface-500">Subtotal</span>
                  <span className="text-surface-700 dark:text-surface-300">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs text-pink-650 font-semibold">
                  <span>Desconto de Assinante</span>
                  <span>- R$ {productDiscountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-surface-600 dark:text-surface-400">Total a Pagar</span>
              <span className="text-2xl font-extrabold text-surface-900 dark:text-white">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            disabled={cart.length === 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-[var(--radius-md)] transition-colors shadow-md flex justify-center items-center gap-2 cursor-pointer"
          >
            <ReceiptText className="w-5 h-5" /> Finalizar Venda
          </button>
        </div>
      </div>

      {/* Modal de Checkout / Emissão de Nota */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-800 w-full max-w-lg rounded-[var(--radius-xl)] border border-surface-200 dark:border-surface-700 shadow-modal animate-scale-in overflow-hidden">
            <div className="p-5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/40 flex items-center justify-between">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-emerald-500" /> Checkout & Emissão Fiscal
              </h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center p-4 bg-surface-50 dark:bg-surface-900/50 rounded-lg border border-surface-200 dark:border-surface-700">
                <div>
                  <p className="text-xs font-bold text-surface-500 uppercase">Total a Pagar</p>
                  <p className="text-2xl font-extrabold text-surface-900 dark:text-white">R$ {total.toFixed(2)}</p>
                </div>
                {selectedTutor && (
                  <div className="text-right">
                    <p className="text-[10px] text-surface-500">Cliente</p>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{selectedTutor.name}</p>
                  </div>
                )}
              </div>

              {/* Pagamento Múltiplo */}
              <div className="p-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-surface-700 dark:text-surface-200">Pagamento Múltiplo?</span>
                  <input type="checkbox" checked={multiPayment} onChange={(e) => setMultiPayment(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                </div>
                
                {multiPayment ? (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                    <div>
                      <label className="text-xs text-surface-500 block mb-1">Valor 1 (Crédito)</label>
                      <input type="number" value={payment1} onChange={(e) => { setPayment1(Number(e.target.value)); setPayment2(total - Number(e.target.value)); }} className="w-full p-2 text-sm border rounded bg-surface-50 dark:bg-surface-900" />
                    </div>
                    <div>
                      <label className="text-xs text-surface-500 block mb-1">Valor 2 (PIX/Dinheiro)</label>
                      <input type="number" value={payment2} readOnly className="w-full p-2 text-sm border rounded bg-surface-200 dark:bg-surface-700 text-surface-500" />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-surface-500">
                    O valor total de R$ {total.toFixed(2)} será pago integralmente via <span className="font-bold">{paymentMethod.toUpperCase()}</span>.
                  </div>
                )}
              </div>

              {/* Split Comissão Resumo */}
              <div className="p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-xs">
                <p className="font-bold text-surface-700 dark:text-surface-300 mb-1">✂️ Resumo do Split de Comissão</p>
                <div className="flex justify-between text-surface-500">
                  <span>{selectedProfessional} ({commissionPercent}%)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ {((total * commissionPercent) / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-lg text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
                <ReceiptText className="w-4 h-4 mt-0.5" />
                <p>Uma Nota Fiscal de Consumidor Eletrônica (NFC-e) será emitida e enviada para a SEFAZ após a confirmação deste pagamento.</p>
              </div>
            </div>

            <div className="p-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/40 flex justify-end gap-3">
              <button onClick={() => setIsCheckoutModalOpen(false)} className="px-4 py-2 text-sm font-bold text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 rounded">
                Cancelar
              </button>
              <button onClick={confirmCheckout} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow rounded flex items-center gap-2">
                Confirmar Pagamento & Emitir NFC-e
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
