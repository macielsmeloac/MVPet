import { useState } from 'react';
import { ShoppingBag, Search, Plus, Minus, CreditCard, QrCode, CheckCircle } from 'lucide-react';
import { useTutorStore } from '../../store/useTutorStore';

export function TutorMarketplacePage() {
  const { tutorAuth, products, placeOrder } = useTutorStore();
  const [cart, setCart] = useState<{id: string, name: string, price: number, qty: number}[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'shop' | 'cart' | 'payment' | 'success'>('shop');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (!tutorAuth) return null;

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.salePrice, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleFinishOrder = async () => {
    setIsPlacingOrder(true);
    const success = await placeOrder(cart);
    setIsPlacingOrder(false);
    
    if (success) {
      setCheckoutStep('success');
      setCart([]);
    } else {
      alert('Ocorreu um erro ao processar o pedido. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Loja da Clínica</h1>
          <p className="text-surface-500">Compre produtos online e retire na clínica ou solicite entrega.</p>
        </div>
        
        {checkoutStep === 'shop' && (
          <button 
            onClick={() => setCheckoutStep('cart')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            Carrinho ({cart.reduce((acc, item) => acc + item.qty, 0)})
          </button>
        )}
      </div>

      {checkoutStep === 'shop' && (
        <>
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-surface-900 dark:text-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                <div className="h-48 overflow-hidden bg-surface-100 dark:bg-surface-900 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-surface-300" />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-surface-900 dark:text-white mb-2 flex-1">{product.name}</h3>
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-xs text-surface-500 mb-1">Estoque: {product.stockQuantity || 0}</p>
                      <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        R$ {(product.salePrice || 0).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {checkoutStep === 'cart' && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">Seu Carrinho</h2>
          
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-surface-300 mx-auto mb-4" />
              <p className="text-surface-500 mb-6">Seu carrinho está vazio.</p>
              <button 
                onClick={() => setCheckoutStep('shop')}
                className="text-indigo-600 font-medium hover:underline"
              >
                Voltar às compras
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-4 border-b border-surface-100 dark:border-surface-700">
                    <div className="flex-1">
                      <h4 className="font-medium text-surface-900 dark:text-white">{item.name}</h4>
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-surface-50 dark:bg-surface-900 rounded-lg p-1 border border-surface-200 dark:border-surface-700">
                        <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white"><Minus className="w-4 h-4" /></button>
                        <span className="w-8 text-center font-medium text-surface-900 dark:text-white">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white"><Plus className="w-4 h-4" /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-500 hover:text-red-700 font-medium">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-xl font-bold text-surface-900 dark:text-white mb-8">
                <span>Total:</span>
                <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className="flex justify-between gap-4">
                <button 
                  onClick={() => setCheckoutStep('shop')}
                  className="px-6 py-3 rounded-xl border border-surface-300 dark:border-surface-600 font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                >
                  Continuar Comprando
                </button>
                <button 
                  onClick={() => setCheckoutStep('payment')}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm"
                >
                  Ir para Pagamento
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {checkoutStep === 'payment' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">Pagamento Seguro</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setPaymentMethod('credit')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${
                paymentMethod === 'credit' 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' 
                  : 'border-surface-200 dark:border-surface-700 text-surface-600 hover:bg-surface-50 dark:hover:bg-surface-700/50'
              }`}
            >
              <CreditCard className="w-8 h-8 mb-2" />
              <span className="font-bold">Cartão de Crédito</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('pix')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${
                paymentMethod === 'pix' 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' 
                  : 'border-surface-200 dark:border-surface-700 text-surface-600 hover:bg-surface-50 dark:hover:bg-surface-700/50'
              }`}
            >
              <QrCode className="w-8 h-8 mb-2" />
              <span className="font-bold">PIX</span>
            </button>
          </div>

          {paymentMethod === 'credit' ? (
            <div className="space-y-4 mb-8">
              <input type="text" placeholder="Número do Cartão" className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl" />
              <div className="flex gap-4">
                <input type="text" placeholder="Validade (MM/AA)" className="w-1/2 px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl" />
                <input type="text" placeholder="CVV" className="w-1/2 px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl" />
              </div>
              <input type="text" placeholder="Nome no Cartão" className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl" />
            </div>
          ) : (
            <div className="text-center bg-surface-50 dark:bg-surface-900 p-8 rounded-xl border border-surface-200 dark:border-surface-700 mb-8">
              <QrCode className="w-32 h-32 mx-auto text-surface-800 dark:text-white mb-4" />
              <p className="font-medium text-surface-900 dark:text-white mb-2">Escaneie o QR Code ou copie a chave PIX</p>
              <button className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Copiar Chave PIX
              </button>
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-bold text-surface-900 dark:text-white mb-6 border-t border-surface-200 dark:border-surface-700 pt-6">
            <span>Total a pagar:</span>
            <span className="text-indigo-600 dark:text-indigo-400">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setCheckoutStep('cart')}
              className="px-6 py-3 rounded-xl border border-surface-300 dark:border-surface-600 font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors w-1/3"
            >
              Voltar
            </button>
            <button 
              onClick={handleFinishOrder}
              disabled={isPlacingOrder}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-colors shadow-sm w-2/3"
            >
              {isPlacingOrder ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </div>
      )}

      {checkoutStep === 'success' && (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white mb-4">Pedido Confirmado!</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-8">
            Seu pedido foi recebido pela clínica e já entrou na fila de separação. 
            Você será notificado quando estiver pronto.
          </p>
          <button 
            onClick={() => setCheckoutStep('shop')}
            className="px-6 py-3 bg-surface-900 dark:bg-white text-white dark:text-surface-900 font-bold rounded-xl hover:bg-surface-800 dark:hover:bg-surface-100 transition-colors"
          >
            Voltar para Loja
          </button>
        </div>
      )}

    </div>
  );
}
