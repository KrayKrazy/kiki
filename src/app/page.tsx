'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { trackViewContent, trackAddToCart, trackInitiateCheckout, trackPageView } from '@/lib/tracking';

// ─── TIPOS ───────────────────────────────────────────────────────────────────
interface Product {
  id: string; title: string; description: string;
  price: number; image: string; category: string; tags: string[];
}
interface CartItem extends Product { quantity: number; }

// ─── CATÁLOGO ─────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  { id: 'kb-001', title: 'Kikis Classic', description: 'Pão brioche, hambúrguer artesanal, queijo derretido, alface fresca, tomate e crispy de cebola.', price: 35.90, image: '/images/imgi_33_670884343_17941661679178357_98842869332700983_n.jpg', category: 'Hambúrgueres', tags: ['bestseller', 'classic', 'artesanal'] },
  { id: 'kb-002', title: 'Smash Duplo', description: 'Dois smash burgers com crosta perfeita, duplo cheddar derretido e pão brioche especial.', price: 32.50, image: '/images/imgi_29_696097150_17944968282178357_5048090921074709923_n.jpg', category: 'Hambúrgueres', tags: ['smash', 'duplo', 'queijo'] },
  { id: 'kb-003', title: 'Bacon Experience', description: 'Para os amantes de bacon. Hambúrguer suculento com fatias generosas de bacon crocante artesanal.', price: 38.00, image: '/images/imgi_25_728247068_17951173869178357_7920520746195335792_n.jpg', category: 'Hambúrgueres', tags: ['bacon', 'premium', 'especial'] },
];

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ringRef.current) ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('mousemove', onMouseMove); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <>
      <div id="cursor-dot"  ref={dotRef} />
      <div id="cursor-ring" ref={ringRef} />
    </>
  );
}

// ─── SCROLL REVEAL HOOK ───────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── HERO PARALLAX HOOK ───────────────────────────────────────────────────────
function useParallax(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const onScroll = () => {
      if (ref.current) ref.current.style.transform = `translateY(${window.scrollY * 0.35}px) scale(1.1)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ref]);
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd, delay = 0 }: { product: Product; onAdd: (p: Product) => void; delay?: number }) {
  return (
    <div
      className={`reveal card-glow bg-white rounded-3xl overflow-hidden flex flex-col border border-stone-100 delay-${delay}`}
      data-product-id={product.id} data-product-name={product.title}
      data-product-price={product.price} data-product-category={product.category}
      data-product-tags={product.tags.join(',')}
    >
      {/* Imagem */}
      <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => trackViewContent(product)}>
        <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Badge */}
        <span className="absolute top-4 left-4 bg-[var(--gold)] text-[var(--burgundy-dark)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
          {product.tags[0]}
        </span>
        {/* Preço flutuante */}
        <span className="absolute bottom-4 right-4 bg-white/95 text-[var(--burgundy)] font-bold px-3 py-1 rounded-full text-sm shadow-md">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-6 flex flex-col flex-1">
        <h4 className="font-serif text-2xl font-bold text-stone-900 mb-2">{product.title}</h4>
        <p className="text-stone-500 text-sm leading-relaxed flex-1 mb-4">{product.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {product.tags.map(tag => (
            <span key={tag} className="text-xs border border-stone-200 text-stone-400 px-2 py-0.5 rounded-full" data-tag={tag}>
              #{tag}
            </span>
          ))}
        </div>

        <button
          className="btn-primary w-full bg-[var(--burgundy)] text-white py-3 rounded-xl font-semibold tracking-wide shadow-md"
          onClick={() => onAdd(product)} data-action="add-to-cart" data-product-id={product.id}
        >
          <span>+ Adicionar ao Pedido</span>
        </button>
      </div>
    </div>
  );
}

// ─── CART ─────────────────────────────────────────────────────────────────────
function Cart({ items, onClose, onUpdateQty, onRemove, onCheckout, loading }: {
  items: CartItem[]; onClose: () => void; onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void; onCheckout: () => void; loading: boolean;
}) {
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-section="cart">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="cart-panel relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-[var(--burgundy)] text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold">Seu Pedido</h2>
            <p className="text-stone-300 text-xs mt-0.5">{items.reduce((a,i)=>a+i.quantity,0)} item(s) selecionado(s)</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors text-lg">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-4 p-8">
            <div className="text-7xl">🍔</div>
            <p className="font-serif text-2xl text-stone-600">Seu carrinho está vazio</p>
            <p className="text-sm text-center">Adicione nossos deliciosos hambúrgueres ao seu pedido!</p>
            <button onClick={onClose} className="mt-2 text-[var(--burgundy)] font-semibold border-b border-[var(--burgundy)] hover:opacity-70 transition-opacity">← Ver cardápio</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-4 bg-stone-50 rounded-2xl p-3 border border-stone-100"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  data-cart-item-id={item.id} data-cart-item-qty={item.quantity} data-cart-item-price={item.price}
                >
                  <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-900 text-sm truncate">{item.title}</p>
                    <p className="text-[var(--burgundy)] font-bold mt-0.5">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => onUpdateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-stone-200 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-300 transition-colors">−</button>
                      <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-stone-200 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-300 transition-colors">+</button>
                      <button onClick={() => onRemove(item.id)} className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors" data-action="remove-from-cart" data-product-id={item.id}>✕ remover</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="border-t border-stone-100 p-6 space-y-4 bg-white">
              <div className="flex justify-between items-baseline">
                <span className="text-stone-500 text-sm">Subtotal</span>
                <span className="font-bold text-lg text-stone-900">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="h-px bg-stone-100" />
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-stone-800">Total</span>
                <span className="font-serif font-bold text-2xl text-[var(--burgundy)]">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                onClick={onCheckout}
                disabled={loading}
                className="w-full bg-[var(--burgundy)] text-white py-4 rounded-2xl font-bold text-base hover:bg-[var(--burgundy-light)] transition-colors shadow-lg flex items-center justify-center gap-3"
                data-action="initiate-checkout" data-total={total}
              >
                {loading ? <><div className="spinner" /><span>Aguarde...</span></> : <span>Finalizar Pedido →</span>}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                <span>🔒</span>
                <span>Pagamento 100% seguro via Cakto</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function Home() {
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen]   = useState(false);
  const [toast, setToast]         = useState('');
  const [loading, setLoading]     = useState(false);
  const heroBgRef = useRef<HTMLDivElement>(null);

  useScrollReveal();
  useParallax(heroBgRef);

  useEffect(() => { trackPageView('home'); }, []);

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...product, quantity: 1 }];
    });
    trackAddToCart({ ...product, quantity: 1 });
    setToast(`"${product.title}" adicionado!`);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setCart(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const removeItem = useCallback((id: string) => { setCart(prev => prev.filter(i => i.id !== id)); }, []);

  const handleCheckout = useCallback(async () => {
    const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    trackInitiateCheckout(cart, total);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setToast('Erro ao gerar link de pagamento. Tente novamente.');
        setTimeout(() => setToast(''), 3000);
      }
    } catch {
      setToast('Erro de conexão. Tente novamente.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [cart]);

  return (
    <main className="min-h-screen bg-[var(--cream)]" data-page="home">
      <CustomCursor />

      {/* Toast */}
      {toast && (
        <div className="notification-toast fixed top-5 right-5 z-[60] bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-2 max-w-xs">
          <span className="text-[var(--gold)]">✓</span> {toast}
        </div>
      )}

      {/* Carrinho */}
      {cartOpen && (
        <Cart items={cart} onClose={() => setCartOpen(false)} onUpdateQty={updateQty}
          onRemove={removeItem} onCheckout={handleCheckout} loading={loading} />
      )}

      {/* ── HEADER ── */}
      <header className="bg-[var(--burgundy-dark)] text-white px-6 py-4 sticky top-0 z-40 border-b border-white/5" data-section="header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/images/logo_kiki.jpg" alt="Kikis Burguer" className="h-12 w-12 rounded-full border border-[var(--gold)]/40 object-cover" />
            <div>
              <h1 className="font-serif text-xl tracking-widest text-white">KIKIS BURGUER</h1>
              <p className="text-xs text-[var(--gold)] italic tracking-wider">— Hambúrgueria artesanal —</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-stone-300">
            <a href="#cardapio" className="hover:text-[var(--gold)] transition-colors">Cardápio</a>
            <a href="#sobre"    className="hover:text-[var(--gold)] transition-colors">Sobre</a>
          </nav>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-[var(--gold)] text-[var(--burgundy-dark)] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[var(--gold-light)] transition-colors shadow-lg"
            data-action="open-cart"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Pedido
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--burgundy)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">{totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden noise-overlay" data-section="hero">
        <div ref={heroBgRef} className="hero-bg absolute inset-0 scale-110">
          <img src="/images/imgi_32_683623199_1495267098850141_5860433048599750493_n.jpg" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--burgundy-dark)]/70 via-[var(--burgundy)]/50 to-[var(--burgundy-dark)]/90" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <p className="reveal text-[var(--gold)] text-xs tracking-[0.4em] font-semibold uppercase mb-6">Hambúrgueria Artesanal</p>
          <h2 className="reveal delay-100 font-serif text-6xl md:text-8xl text-white font-black mb-6 leading-tight drop-shadow-2xl">
            A VERDADEIRA<br />
            <span className="gold-shimmer">EXPERIÊNCIA</span>
          </h2>
          <p className="reveal delay-200 text-stone-300 text-lg md:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed">
            Ingredientes selecionados, preparo artesanal e entrega direto para você.
          </p>
          <div className="reveal delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#cardapio" className="btn-primary inline-block bg-[var(--gold)] text-[var(--burgundy-dark)] font-bold px-10 py-4 rounded-full text-base shadow-[0_0_30px_rgba(201,168,76,0.4)]" data-action="hero-cta-menu">
              <span>Ver Cardápio</span>
            </a>
            <button onClick={() => setCartOpen(true)} className="btn-primary inline-block border border-white/30 text-white font-semibold px-10 py-4 rounded-full text-base hover:border-[var(--gold)]" data-action="hero-cta-cart">
              <span>Meu Pedido {totalItems > 0 && `(${totalItems})`}</span>
            </button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs tracking-widest">
          <span>SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ── CARDÁPIO ── */}
      <section id="cardapio" className="py-24 px-4" data-section="cardapio">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16">
            <p className="reveal text-[var(--gold)] text-xs tracking-[0.4em] font-semibold uppercase mb-4">Nosso Menu</p>
            <h3 className="reveal delay-100 font-serif text-5xl text-[var(--burgundy)] font-bold mb-6">Especialidades</h3>
            <div className="reveal delay-200 gold-divider" />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product, i) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} delay={(i + 1) * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section id="sobre" className="bg-[var(--burgundy-dark)] py-24 px-4 relative overflow-hidden" data-section="sobre">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="reveal text-[var(--gold)] text-xs tracking-[0.4em] font-semibold uppercase mb-4">Nossa História</p>
          <h3 className="reveal delay-100 font-serif text-4xl md:text-5xl text-white font-bold mb-8">Feito com Paixão</h3>
          <p className="reveal delay-200 text-stone-400 text-lg leading-relaxed mb-8">
            A Kikis Burguer nasceu do amor pelos hambúrgueres artesanais. Cada ingrediente é cuidadosamente selecionado e cada lanche é preparado com dedicação para que você tenha a melhor experiência gastronômica.
          </p>
          <a href="#cardapio" className="reveal delay-300 inline-block btn-primary border border-[var(--gold)]/50 text-[var(--gold)] font-semibold px-8 py-3 rounded-full">
            <span>Peça Agora</span>
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-stone-500 py-10 border-t border-white/5" data-section="footer">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo_kiki.jpg" alt="Logo" className="w-9 h-9 rounded-full opacity-60 object-cover" />
            <span className="font-serif tracking-widest text-stone-400 text-sm">KIKIS BURGUER</span>
          </div>
          <p className="text-xs">© 2026 Kikis Burguer. Todos os direitos reservados.</p>
          <p className="text-xs">Integração <span className="text-[var(--gold)]">Cakto</span> + <span className="text-[var(--gold)]">Brendi</span></p>
        </div>
      </footer>
    </main>
  );
}
