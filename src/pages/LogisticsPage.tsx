import { Truck, MapPin, Phone, User, CheckCircle2, Clock } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { TransportStatus } from '../types';

const statusConfig: Record<TransportStatus, { title: string; color: string; border: string }> = {
  'waiting-pickup': { title: 'Aguardando Coleta', color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/50' },
  'on-the-way-pet': { title: 'A Caminho (Buscando)', color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/50' },
  'at-shop': { title: 'No Petshop', color: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-900/50' },
  'ready-delivery': { title: 'A Caminho (Entregando)', color: 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-900/50' },
  'delivered': { title: 'Entregue', color: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-900/50' }
};

const statuses: TransportStatus[] = ['waiting-pickup', 'on-the-way-pet', 'at-shop', 'ready-delivery', 'delivered'];

export function LogisticsPage() {
  const { transportOrders, pets, tutors, updateTransportStatus } = useDataStore();

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('orderId', id);
  };

  const handleDrop = (e: React.DragEvent, status: TransportStatus) => {
    const id = e.dataTransfer.getData('orderId');
    if (id) updateTransportStatus(id, status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-500" /> Leva e Traz (Logística)
        </h1>
        <p className="text-sm text-surface-500">Controle do translado de pets em tempo real. Arraste os cards para atualizar o status.</p>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {statuses.map(status => {
          const cfg = statusConfig[status];
          const orders = transportOrders.filter(o => o.status === status);
          
          return (
            <div 
              key={status}
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
              className="flex-1 min-w-[280px] bg-surface-50 dark:bg-surface-800/40 rounded-[var(--radius-lg)] border border-surface-200 dark:border-surface-700 flex flex-col h-full"
            >
              <div className={`p-3 border-b ${cfg.border} ${cfg.color} font-semibold text-sm rounded-t-[var(--radius-lg)] flex justify-between items-center`}>
                {cfg.title}
                <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">{orders.length}</span>
              </div>
              
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {orders.map(order => {
                  const pet = pets.find(p => p.id === order.petId);
                  const tutor = tutors.find(t => t.id === order.tutorId);
                  
                  return (
                    <div 
                      key={order.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order.id)}
                      className="bg-white dark:bg-surface-800 p-3 rounded-[var(--radius-md)] shadow-sm border border-surface-200 dark:border-surface-700 cursor-grab active:cursor-grabbing hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-surface-900 dark:text-white">{pet?.name}</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-surface-500 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> {order.scheduledTime}
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 mb-3">
                        <p className="text-xs text-surface-600 dark:text-surface-400 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-surface-400" /> {tutor?.name}
                        </p>
                        <p className="text-xs text-surface-600 dark:text-surface-400 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-surface-400 shrink-0 mt-0.5" /> 
                          <span className="line-clamp-2">{status === 'waiting-pickup' || status === 'on-the-way-pet' ? order.pickupAddress : order.deliveryAddress}</span>
                        </p>
                        <p className="text-xs text-surface-600 dark:text-surface-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-surface-400" /> {tutor?.phone}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-surface-100 dark:border-surface-700 flex justify-between items-center text-[10px] text-surface-500">
                        <span>Motorista: {order.driverName}</span>
                        {status === 'delivered' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
