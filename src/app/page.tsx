import React from 'react';

// Dados mockados para exibição inicial até termos a integração real com o Shopify conectada
const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'X-Bacon Especial',
    description: 'Pão brioche, hambúrguer artesanal 180g, muito bacon, queijo cheddar, alface e tomate.',
    price: 35.90,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Kikis Classic',
    description: 'Pão tradicional, hambúrguer 160g, queijo prato, cebola caramelizada e maionese da casa.',
    price: 28.50,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Double Smash',
    description: 'Pão brioche, 2x smash burger 90g, duplo cheddar e molho especial.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1594212699903-eca27f6e0766?q=80&w=400&auto=format&fit=crop'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-600 text-white p-6 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Kikis Burguer</h1>
          <button className="bg-white text-orange-600 px-4 py-2 rounded-full font-semibold hover:bg-orange-100 transition-colors">
            Carrinho (0)
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-orange-100 py-12 text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">O melhor hambúrguer da cidade</h2>
        <p className="text-gray-600 text-lg">Peça online e receba quentinho na sua casa!</p>
      </section>

      {/* Product List */}
      <section className="max-w-5xl mx-auto py-12 px-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 border-b-2 border-orange-200 pb-2">Nosso Cardápio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_PRODUCTS.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
              <div 
                className="h-48 bg-cover bg-center" 
                style={{ backgroundImage: `url(${product.image})` }}
              ></div>
              <div className="p-5">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h4>
                <p className="text-gray-600 text-sm mb-4 min-h-[60px]">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-extrabold text-orange-600">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-6 mt-12">
        <p>© 2026 Kikis Burguer. Todos os direitos reservados.</p>
        <p className="text-sm mt-2">Plataforma integrada com Shopify & Brendi</p>
      </footer>
    </main>
  );
}
