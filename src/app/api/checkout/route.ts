import { NextResponse } from 'next/server';

const CAKTO_LOGIN = process.env.CAKTO_LOGIN || 'vH18q1Qm2DscUVDu9UF029ksnx5MCmL2zjft26Tk';
const CAKTO_SECRET_KEY = process.env.CAKTO_SECRET_KEY || 'LdDE2Gu9f2KSNcWsN7J0uy8RPwgblNI80eJyFHgm8jvkC6Bu3otIy77yx37HaRRMIx9uerRxAoAZg0UrS547iM5enlqmeMCGpANV5Qnhc7gxuvb2arocyqe8RUYhiodZ';

// Endpoints possíveis da Cakto para testar
const ENDPOINTS_TO_TRY = [
  'https://api.cakto.com.br/public_api/offers/',
  'https://api.cakto.com.br/v1/offers',
  'https://api.cakto.com.br/api/v1/checkout',
  'https://api.cakto.com.br/public_api/checkouts/',
];

// Formatos de autenticação para testar
async function tryFetch(url: string, body: object, authHeader: string) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text, ok: res.ok };
  } catch (e: any) {
    return { status: 0, body: e.message, ok: false };
  }
}

export async function POST(request: Request) {
  try {
    const { items, total } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    const itemsDescription = items.map((i: any) => `${i.quantity}x ${i.title}`).join(', ');
    const totalCents = Math.round(total * 100);

    const payload = {
      name: `Pedido Kikis Burguer — ${itemsDescription}`,
      price: totalCents,
      currency: 'BRL',
      description: itemsDescription,
      quantity: 1,
      payment_methods: ['pix', 'credit_card'],
    };

    // Tenta diferentes combinações de endpoint + autenticação para diagnosticar
    const attempts: any[] = [];

    for (const url of ENDPOINTS_TO_TRY) {
      const result = await tryFetch(url, payload, `Bearer ${CAKTO_LOGIN}`);
      attempts.push({ url, auth: 'Bearer LOGIN', ...result });
      if (result.ok) {
        // Sucesso! Tenta extrair o link
        try {
          const data = JSON.parse(result.body);
          const checkoutUrl = data.checkout_url || data.url || data.link || data.payment_url || `https://pay.cakto.com.br/${data.id}`;
          return NextResponse.json({ checkoutUrl });
        } catch {
          // corpo não é JSON válido
        }
      }
    }

    // Também tenta com a chave secreta como Bearer
    for (const url of ENDPOINTS_TO_TRY.slice(0, 2)) {
      const result = await tryFetch(url, payload, `Bearer ${CAKTO_SECRET_KEY}`);
      attempts.push({ url, auth: 'Bearer SECRET', ...result });
      if (result.ok) {
        try {
          const data = JSON.parse(result.body);
          const checkoutUrl = data.checkout_url || data.url || data.link || `https://pay.cakto.com.br/${data.id}`;
          return NextResponse.json({ checkoutUrl });
        } catch {}
      }
    }

    // Nenhum funcionou — retorna diagnóstico completo para investigação
    console.error('=== CAKTO API DIAGNOSTICS ===');
    attempts.forEach(a => console.error(`${a.url} [${a.auth}] → ${a.status}: ${a.body?.substring(0, 200)}`));

    return NextResponse.json({
      error: 'Não foi possível criar o checkout no Cakto',
      debug: attempts.map(a => ({
        url: a.url,
        auth: a.auth,
        status: a.status,
        response: a.body?.substring(0, 300),
      }))
    }, { status: 502 });

  } catch (error: any) {
    console.error('Checkout route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
