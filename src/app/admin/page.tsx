'use client';

import { useEffect, useState, useRef } from 'react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      
      // Checa se tem pedido novo para tocar o som
      if (orders.length > 0 && data.orders.length > orders.length) {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
        }
      }
      
      setOrders(data.orders);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll a cada 5 segundos
    return () => clearInterval(interval);
  }, [orders.length]);

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      {/* Audio oculto para notificação */}
      <audio ref={audioRef} src="https://www.soundjay.com/buttons/sounds/bell-ringing-05.mp3" preload="auto" />
      
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-stone-900 font-serif">Painel da Cozinha</h1>
            <p className="text-stone-500">Pedidos processados pela Cakto</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-bold text-stone-600">Conectado (Tempo Real)</span>
          </div>
        </header>

        {loading ? (
          <p className="text-stone-500">Carregando pedidos...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-stone-200">
            <p className="text-2xl text-stone-400 font-serif">Nenhum pedido ainda.</p>
            <p className="text-stone-400 mt-2">Os pedidos pagos na Cakto aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg border-t-4 border-[var(--burgundy)] p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pedido</span>
                    <h3 className="text-xl font-black text-stone-900">#{order.displayId}</h3>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Pago (Cakto)
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Cliente</span>
                  <p className="text-stone-800 font-medium">{order.customer.name}</p>
                </div>
                
                <div className="mb-4 bg-stone-50 p-3 rounded-lg border border-stone-100">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Endereço de Entrega</span>
                  <p className="text-stone-800 text-sm font-medium">
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.number}
                  </p>
                  <p className="text-stone-600 text-sm">
                    {order.deliveryAddress?.neighborhood}
                  </p>
                </div>
                
                <div className="mb-6 flex-1">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Itens</span>
                  <ul className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="font-bold text-[var(--burgundy)]">{item.quantity}x</span>
                        <span className="flex-1 ml-2 font-medium text-stone-800 truncate">{item.name}</span>
                        <span className="text-stone-500 text-xs mt-0.5">R$ {item.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border-t border-stone-100 pt-4 flex justify-between items-end mt-auto">
                  <span className="text-stone-500 text-sm font-medium">Total:</span>
                  <span className="text-xl font-black text-stone-900">R$ {order.total.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
