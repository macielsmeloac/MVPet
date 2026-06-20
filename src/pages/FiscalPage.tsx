import { FileText, Send, AlertTriangle, FileCheck2, Filter } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

export function FiscalPage() {
  const { transactions } = useDataStore();

  const pendingInvoices = transactions.filter(t => t.type === 'income' && t.invoiceStatus === 'pending');
  const issuedInvoices = transactions.filter(t => t.type === 'income' && t.invoiceStatus === 'issued');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> Emissão de Notas Fiscais
          </h1>
          <p className="text-sm text-surface-500">Gestão de NFC-e (Cupom) e NFS-e (Serviços)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending Invoices */}
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-amber-50 dark:bg-amber-950/20">
            <h2 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Pendentes de Emissão ({pendingInvoices.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {pendingInvoices.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-8">Nenhuma nota pendente.</p>
            ) : (
              pendingInvoices.map(t => (
                <div key={t.id} className="border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm text-surface-900 dark:text-white line-clamp-1">{t.description}</span>
                    <span className="font-bold text-sm text-surface-900 dark:text-white whitespace-nowrap ml-2">R$ {t.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end mt-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                      {t.invoiceType === 'nfc-e' ? 'NFC-e (Produto)' : 'NFS-e (Serviço)'}
                    </span>
                    <button className="flex items-center gap-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded transition-colors">
                      <Send className="w-3 h-3" /> Emitir Agora
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Issued Invoices */}
        <div className="bg-white dark:bg-surface-800 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
            <h2 className="font-semibold text-surface-800 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-green-500" /> Últimas Emitidas
            </h2>
            <button className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {issuedInvoices.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-8">Nenhuma nota emitida ainda.</p>
            ) : (
              issuedInvoices.map(t => (
                <div key={t.id} className="border border-surface-200 dark:border-surface-700 rounded-[var(--radius-md)] p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-surface-700 dark:text-surface-300 line-clamp-1">{t.description}</span>
                    <span className="font-bold text-sm text-surface-900 dark:text-white whitespace-nowrap ml-2">R$ {t.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-surface-500 mb-2">Emitida em {t.date} · Aut: 352109...</p>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                    <span className="text-[10px] font-bold uppercase text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" /> Autorizada
                    </span>
                    <div className="flex gap-2">
                      <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Imprimir</button>
                      <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">PDF</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
