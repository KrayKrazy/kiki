'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackViewContent, trackAddToCart, trackInitiateCheckout, trackPageView } from '@/lib/tracking';

// ─── TIPOS ──────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tags: string[]; // tags para segmentação de tráfego
}

interface CartItem extends Product {
  quantity: number;
}

// ─── CATÁLOGO (substitua pelos produtos reais depois) ────────────────────────
const PRODUCTS: Product[] = [
  {
    id: 'kb-001',
    title: 'Kikis Classic',
    description: 'Pão brioche, hambúrguer artesanal, queijo derretido, alface fresca, tomate e crispy de cebola.',
    price: 35.90,
    image: '/images/imgi_33_670884343_17941661679178357_98842869332700983_n.jpg',
    category: 'Hambúrgueres',
    tags: ['bestseller', 'classic', 'artesanal']
  },
  {
    id: 'kb-002',
    title: 'Smash Duplo',
    description: 'Dois smash burgers com crosta perfeita, muito queijo cheddar e pão especial macio.',
    price: 32.50,
    image: '/images/imgi_29_696097150_17944968282178357_5048090921074709923_n.jpg',
    category: 'Hambúrgueres',
    tags: ['smash', 'duplo', 'queijo']
  },
  {
    id: 'kb-003',
    title: 'Bacon Experience',
    description: 'Para os amantes de bacon. Hambúrguer suculento com fatias generosas de bacon crocante.',
    price: 38.00,
    image: '/images/imgi_25_728247068_17951173869178357_7920520746195335792_n.jpg',
    category: 'Hambúrgueres',
    tags: ['bacon', 'premium', 'especial']
  }
];

// ─── COMPONENTE DO PRODUTO ───────────────────────────────────────────────────
function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  return (
    // Tags de rastreamento como data-attributes (lidos pelo GTM)
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-stone-100 group flex flex-col"
      data-product-id={product.id}
      data-product-name={product.title}
      data-product-price={product.price}
      data-product-category={product.category}
      data-product-tags={product.tags.join(',')}
    >
      <div
        className="relative h-64 overflow-hidden cursor-pointer"
        onClick={() => trackViewContent(product)}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Badge de tag (primeira tag como destaque) */}
        {product.tags[0] && (
          <span className="absolute top-3 left-3 bg-[#4a0404] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {product.tags[0]}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h4 className="text-2xl font-bold text-stone-900 mb-2 font-serif">{product.title}</h4>
        <p className="text-stone-500 text-sm mb-4 flex-1 leading-relaxed">{product.description}</p>

        {/* Tags de categoria para SEO e rastreamento */}
        <div className="flex flex-wrap gap-1 mb-4">
          {product.tags.map(tag => (
            <span
              key={tag}
              className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full"
              data-tag={tag}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-end mt-auto">
          <div>
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">A partir de</p>
            <span className="text-2xl font-bold text-[#4a0404]">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button
            className="bg-stone-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#4a0404] transition-colors shadow-md active:scale-95"
            onClick={() => onAddToCart(product)}
            data-action="add-to-cart"
            data-product-id={product.id}
          >
            + Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE DO CARRINHO ──────────────────────────────────────────────────
function Cart({
  items,
  onClose,
  onUpdateQty,
  onRemove,
  onCheckout
}: {
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-section="cart">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Painel */}
      <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="bg-[#4a0404] text-white p-5 flex justify-between items-center">
          <h2 className="text-xl font-bold font-serif">Seu Pedido</h2>
          <button onClick={onClose} className="text-2xl leading-none hover:text-stone-300 transition-colors">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-4">
            <span className="text-6xl">🍔</span>
            <p className="text-lg font-medium">Seu carrinho está vazio</p>
            <button onClick={onClose} className="text-sm text-[#4a0404] underline">Ver cardápio</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-stone-50 rounded-xl p-3 border border-stone-100"
                  data-cart-item-id={item.id}
                  data-cart-item-name={item.title}
                  data-cart-item-price={item.price}
                  data-cart-item-qty={item.quantity}
                >
                  <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-bold text-stone-900 text-sm">{item.title}</p>
                    <p className="text-[#4a0404] font-bold mt-1">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 bg-stone-200 rounded-full flex items-center justify-center font-bold hover:bg-stone-300 transition-colors"
                      >−</button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 bg-stone-200 rounded-full flex items-center justify-center font-bold hover:bg-stone-300 transition-colors"
                      >+</button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors"
                        data-action="remove-from-cart"
                        data-product-id={item.id}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo e checkout */}
            <div className="border-t border-stone-200 p-5 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#4a0404]">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-[#4a0404] text-white py-4 rounded-xl font-bold text-lg hover:bg-red-900 transition-colors shadow-lg active:scale-95"
                data-action="initiate-checkout"
                data-total={total}
              >
                Finalizar Pedido →
              </button>
              <p className="text-xs text-center text-stone-400">Pagamento seguro via Cakto</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    trackPageView('home');
  }, []);

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    trackAddToCart({ ...product, quantity: 1 });
    setNotification(`"${product.title}" adicionado!`);
    setTimeout(() => setNotification(''), 2500);
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const handleCheckout = useCallback(() => {
    const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    trackInitiateCheckout(cart, total);
    // Aqui vai redirecionar para o link do Cakto
    alert('Redirecionando para o pagamento via Cakto...\n\n(Configure o link de checkout do Cakto na variável NEXT_PUBLIC_CAKTO_CHECKOUT_URL)');
  }, [cart]);

  return (
    <main className="min-h-screen bg-neutral-50 font-sans" data-page="home">

      {/* Notificação flutuante de item adicionado */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-xl font-medium text-sm animate-bounce">
          ✓ {notification}
        </div>
      )}

      {/* Carrinho lateral */}
      {cartOpen && (
        <Cart
          items={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onCheckout={handleCheckout}
        />
      )}

      {/* ── Header ── */}
      <header className="bg-[#4a0404] text-white p-4 shadow-xl sticky top-0 z-40" data-section="header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/logo_kiki.jpg" alt="Kikis Burguer Logo" className="h-14 w-14 rounded-full border-2 border-white/20 object-cover" />
            <div>
              <h1 className="text-2xl font-serif tracking-widest text-white">KIKIS BURGUER</h1>
              <p className="text-xs text-stone-300 font-light italic">- Hambúrgueria artesanal -</p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative bg-white text-[#4a0404] px-5 py-2 rounded-full font-bold hover:bg-stone-200 transition-colors shadow-md"
            data-action="open-cart"
          >
            🛒 Carrinho
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="bg-stone-900 text-center relative overflow-hidden" data-section="hero">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-105"
          style={{ backgroundImage: `url('/images/imgi_32_683623199_1495267098850141_5860433048599750493_n.jpg')` }}
        />
        <div className="relative z-10 py-24 px-4 bg-gradient-to-t from-[#4a0404]/80 to-transparent">
          <h2 className="text-5xl md:text-6xl font-serif text-white mb-6 drop-shadow-lg tracking-wide">
            A VERDADEIRA EXPERIÊNCIA
          </h2>
          <p className="text-stone-200 text-lg md:text-xl max-w-2xl mx-auto font-light mb-8">
            Hambúrgueres artesanais feitos com paixão. Peça agora e sinta a diferença.
          </p>
          <a
            href="#cardapio"
            className="inline-block bg-[#a31616] text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-red-700 transition shadow-[0_0_15px_rgba(163,22,22,0.5)]"
            data-action="hero-cta"
          >
            Ver Cardápio
          </a>
        </div>
      </section>

      {/* ── Cardápio ── */}
      <section id="cardapio" className="max-w-6xl mx-auto py-16 px-4" data-section="cardapio">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-serif text-[#4a0404] mb-4">Nossas Especialidades</h3>
          <div className="w-24 h-1 bg-[#4a0404] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#2a0202] text-stone-400 py-10 mt-12 border-t-4 border-[#4a0404]" data-section="footer">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo_kiki.jpg" alt="Logo" className="w-10 h-10 rounded-full opacity-80" />
            <span className="font-serif tracking-widest text-stone-300">KIKIS BURGUER</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm">© 2026 Kikis Burguer. Todos os direitos reservados.</p>
            <p className="text-xs mt-1 text-stone-500">Desenvolvido com integração Cakto & Brendi</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
