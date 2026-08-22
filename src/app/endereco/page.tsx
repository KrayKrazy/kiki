'use client';

import { useState, useEffect } from 'react';
import { trackInitiateCheckout } from '@/lib/tracking';

export default function EnderecoPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('kiki_cart');
    if (saved) {
      setCart(JSON.parse(saved));
    } else {
      window.location.href = '/';
    }
  }, []);

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const isValid = street.trim() !== '' && number.trim() !== '' && neighborhood.trim() !== '';

  const handlePay = async () => {
    if (!isValid) return;
    
    trackInitiateCheckout(cart, total);
    setLoading(true);
    setError('');
    
    try {
      const address = { street, number, neighborhood };
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total, address })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        // Limpa o carrinho
        localStorage.removeItem('kiki_cart');
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Erro ao gerar link de pagamento.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(`Erro de conexão: ${err.message}`);
      setLoading(false);
    }
  };

  if (cart.length === 0) return null; // Evita piscar tela vazia antes de redirecionar

  return (
    <div className="min-h-screen bg-[var(--cream)] flex flex-col">
      <header className="bg-[var(--burgundy-dark)] text-white p-4 flex justify-between items-center shadow-md">
        <button onClick={() => window.location.href = '/'} className="text-sm text-stone-300 flex items-center gap-2">
          ← Voltar
        </button>
        <span className="font-serif font-bold tracking-widest text-lg">KIKIS BURGUER</span>
        <div className="w-16" /> {/* Spacer */}
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col mt-4">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Para onde enviamos?</h1>
        <p className="text-stone-500 mb-8">Preencha os dados abaixo para receber seu pedido fresquinho.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-5 flex-1">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Rua / Avenida</label>
            <input 
              type="text" 
              value={street} 
              onChange={e => setStreet(e.target.value)} 
              placeholder="Ex: Rua das Flores"
              className="w-full bg-white border border-stone-200 rounded-xl p-4 text-base focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 shadow-sm transition-all text-stone-800" 
            />
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Número</label>
              <input 
                type="text" 
                value={number} 
                onChange={e => setNumber(e.target.value)} 
                placeholder="Ex: 123"
                className="w-full bg-white border border-stone-200 rounded-xl p-4 text-base focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 shadow-sm transition-all text-stone-800" 
              />
            </div>
            <div className="w-2/3">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Bairro</label>
              <input 
                type="text" 
                value={neighborhood} 
                onChange={e => setNeighborhood(e.target.value)} 
                placeholder="Ex: Centro"
                className="w-full bg-white border border-stone-200 rounded-xl p-4 text-base focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 shadow-sm transition-all text-stone-800" 
              />
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl p-6 shadow-xl border border-stone-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-stone-500">Total do Pedido</span>
            <span className="font-serif text-3xl font-bold text-[var(--burgundy)]">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
          
          <button
            onClick={handlePay}
            disabled={!isValid || loading}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
              isValid ? 'bg-[var(--gold)] text-[var(--burgundy-dark)] hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <><div className="spinner border-[var(--burgundy-dark)]" /><span>Gerando Pagamento...</span></>
            ) : (
              <span>Pagar com Cakto →</span>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
