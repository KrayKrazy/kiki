import { NextResponse } from 'next/server';

const CAKTO_API_URL = 'https://api.cakto.com.br/public_api';
const CAKTO_LOGIN = process.env.CAKTO_LOGIN || 'vH18q1Qm2DscUVDu9UF029ksnx5MCmL2zjft26Tk';
const CAKTO_SECRET_KEY = process.env.CAKTO_SECRET_KEY || 'LdDE2Gu9f2KSNcWsN7J0uy8RPwgblNI80eJyFHgm8jvkC6Bu3otIy77yx37HaRRMIx9uerRxAoAZg0UrS547iM5enlqmeMCGpANV5Qnhc7gxuvb2arocyqe8RUYhiodZ';

export async function POST(request: Request) {
  try {
    const { items, total } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    // Monta a descrição dos itens para o checkout
    const itemsDescription = items.map((i: any) => `${i.quantity}x ${i.title}`).join(', ');

    // Cria a oferta/checkout na API da Cakto
    const response = await fetch(`${CAKTO_API_URL}/offers/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CAKTO_LOGIN}`,
        'X-Secret-Key': CAKTO_SECRET_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Pedido Kikis Burguer — ${itemsDescription}`,
        price: Math.round(total * 100), // Cakto usa centavos
        currency: 'BRL',
        description: itemsDescription,
        quantity: 1,
        payment_methods: ['pix', 'credit_card'],
        metadata: {
          source: 'ecommerce_kikis',
          items: items.map((i: any) => ({
            id: i.id,
            name: i.title,
            qty: i.quantity,
            unit_price: i.price
          }))
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      // A Cakto retorna o link no formato pay.cakto.com.br/{id}
      const checkoutUrl = data.checkout_url || `https://pay.cakto.com.br/${data.id}`;
      return NextResponse.json({ checkoutUrl });
    }

    // Fallback: se a API retornar erro, loga e responde com erro
    const errorBody = await response.text();
    console.error('Cakto API error:', response.status, errorBody);
    return NextResponse.json(
      { error: 'Erro ao criar checkout no Cakto', details: errorBody },
      { status: response.status }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
