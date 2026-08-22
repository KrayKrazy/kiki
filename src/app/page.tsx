import React from 'react';

// Utilizando as imagens que baixamos da marca
const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Kikis Classic',
    description: 'Pão brioche, hambúrguer artesanal, queijo derretido, alface fresca, tomate e crispy de cebola.',
    price: 35.90,
    image: '/images/imgi_33_670884343_17941661679178357_98842869332700983_n.jpg'
  },
  {
    id: '2',
    title: 'Smash Duplo',
    description: 'Dois smash burgers com crosta perfeita, muito queijo e nosso pão especial macio.',
    price: 32.50,
    image: '/images/imgi_29_696097150_17944968282178357_5048090921074709923_n.jpg'
  },
  {
    id: '3',
    title: 'Bacon Experience',
    description: 'Para os amantes de bacon. Hambúrguer suculento e fatias generosas de bacon.',
    price: 38.00,
    image: '/images/imgi_25_728247068_17951173869178357_7920520746195335792_n.jpg'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      {/* Header com a cor da logo e a própria logo */}
      <header className="bg-[#4a0404] text-white p-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/logo_kiki.jpg" alt="Kikis Burguer Logo" className="h-14 w-14 rounded-full border-2 border-white/20 object-cover" />
            <div>
              <h1 className="text-2xl font-serif tracking-widest text-white">KIKIS BURGUER</h1>
              <p className="text-xs text-stone-300 font-light italic">- Hambúrgueria artesanal -</p>
            </div>
          </div>
          <button className="bg-white text-[#4a0404] px-5 py-2 rounded-full font-bold hover:bg-stone-200 transition-colors shadow-md">
            Carrinho (0)
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-stone-900 text-center relative overflow-hidden">
        {/* Imagem de fundo borrada */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm"
          style={{ backgroundImage: `url('/images/imgi_32_683623199_1495267098850141_5860433048599750493_n.jpg')` }}
        ></div>
        <div className="relative z-10 py-24 px-4 bg-gradient-to-t from-[#4a0404]/80 to-transparent">
          <h2 className="text-5xl md:text-6xl font-serif text-white mb-6 drop-shadow-lg tracking-wide">
            A VERDADEIRA EXPERIÊNCIA
          </h2>
          <p className="text-stone-200 text-lg md:text-xl max-w-2xl mx-auto font-light mb-8">
            Hambúrgueres artesanais feitos com paixão. Peça agora e sinta a diferença.
          </p>
          <a href="#cardapio" className="inline-block bg-[#a31616] text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-red-700 transition shadow-[0_0_15px_rgba(163,22,22,0.5)]">
            Ver Cardápio
          </a>
        </div>
      </section>

      {/* Product List */}
      <section id="cardapio" className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-serif text-[#4a0404] mb-4">Nossas Especialidades</h3>
          <div className="w-24 h-1 bg-[#4a0404] mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_PRODUCTS.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-stone-100 group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h4 className="text-2xl font-bold text-stone-900 mb-3 font-serif">{product.title}</h4>
                <p className="text-stone-500 text-sm mb-6 min-h-[60px] leading-relaxed">{product.description}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">A partir de</p>
                    <span className="text-2xl font-bold text-[#4a0404]">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <button className="bg-stone-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#4a0404] transition-colors shadow-md">
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#2a0202] text-stone-400 py-10 mt-12 border-t-4 border-[#4a0404]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo_kiki.jpg" alt="Logo" className="w-10 h-10 rounded-full opacity-80" />
            <span className="font-serif tracking-widest text-stone-300">KIKIS BURGUER</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm">© 2026 Kikis Burguer. Todos os direitos reservados.</p>
            <p className="text-xs mt-1 text-stone-500">Desenvolvido com integração Shopify & Brendi</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
