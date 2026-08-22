import { NextResponse } from 'next/server';

const CAKTO_API = 'https://api.cakto.com.br/public_api';
const CAKTO_CLIENT_ID     = process.env.CAKTO_LOGIN       || 'vH18q1Qm2DscUVDu9UF029ksnx5MCmL2zjft26Tk';
const CAKTO_CLIENT_SECRET = process.env.CAKTO_SECRET_KEY  || 'LdDE2Gu9f2KSNcWsN7J0uy8RPwgblNI80eJyFHgm8jvkC6Bu3otIy77yx37HaRRMIx9uerRxAoAZg0UrS547iM5enlqmeMCGpANV5Qnhc7gxuvb2arocyqe8RUYhiodZ';

// Link de pagamento fixo criado no painel da Cakto — usado como fallback
const CAKTO_FALLBACK_URL = process.env.CAKTO_FALLBACK_URL || 'https://pay.cakto.com.br/386o2zi_1056408';

// ─── PASSO 1: Obter access_token via OAuth2 ────────────────────────────────
async function getCaktoToken(): Promise<string> {
  // Tenta endpoint /public_api/token/ primeiro, depois /oauth/token como fallback
  const tokenUrls = [
    `${CAKTO_API}/token/`,
    'https://api.cakto.com.br/oauth/token',
    'https://api.cakto.com.br/oauth2/token',
  ];

  for (const url of tokenUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'client_credentials',
          client_id:     CAKTO_CLIENT_ID,
          client_secret: CAKTO_CLIENT_SECRET,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Cakto] Token obtido via ${url}`);
        return data.access_token;
      }

      const errText = await res.text();
      console.warn(`[Cakto] Token endpoint ${url} retornou ${res.status}: ${errText.substring(0, 200)}`);
    } catch (e: any) {
      console.warn(`[Cakto] Falha em ${url}: ${e.message}`);
    }
  }

  throw new Error('Não foi possível obter token da Cakto. Verifique client_id e client_secret.');
}

// ─── PASSO 2: Listar produtos e pegar o primeiro ID ───────────────────────
async function getFirstProductId(token: string): Promise<string> {
  // Se tiver um PRODUCT_ID específico configurado, usa ele
  if (process.env.CAKTO_PRODUCT_ID) {
    return process.env.CAKTO_PRODUCT_ID;
  }

  const res = await fetch(`${CAKTO_API}/products/`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao listar produtos Cakto (${res.status}): ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  // A API pode retornar array ou objeto com { results: [] }
  const products = Array.isArray(data) ? data : (data.results || []);

  if (products.length === 0) {
    throw new Error('Nenhum produto encontrado na conta Cakto. Crie um produto no painel primeiro.');
  }

  console.log(`[Cakto] ${products.length} produto(s) encontrado(s). Usando: ${products[0].id} — ${products[0].name}`);
  return products[0].id;
}

// ─── PASSO 3: Criar oferta e retornar link ─────────────────────────────────
async function createOffer(token: string, productId: string, name: string, price: number) {
  const res = await fetch(`${CAKTO_API}/offers/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      price,          // Reais (ex: 35.90) — NÃO centavos
      product: productId,
      status: 'active',
      type: 'unique',
    }),
  });

  const responseText = await res.text();
  console.log(`[Cakto] Criar oferta → ${res.status}: ${responseText.substring(0, 300)}`);

  if (!res.ok) {
    throw new Error(`Erro ao criar oferta Cakto (${res.status}): ${responseText.substring(0, 300)}`);
  }

  const data = JSON.parse(responseText);
  return `https://pay.cakto.com.br/${data.id}`;
}

// ─── HANDLER ──────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { items, total } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    const itemsDescription = items
      .map((i: any) => `${i.quantity}x ${i.title}`)
      .join(', ');

    // Executa o fluxo completo: token → produto → oferta → link
    try {
      const token       = await getCaktoToken();
      const productId   = await getFirstProductId(token);
      const checkoutUrl = await createOffer(
        token,
        productId,
        `Pedido Kikis Burguer — ${itemsDescription}`,
        parseFloat(total.toFixed(2))
      );
      return NextResponse.json({ checkoutUrl });
    } catch (apiError: any) {
      // Se a API falhar, usa o link fixo como fallback seguro
      console.warn('[Cakto] API dinâmica falhou, usando link fixo:', apiError.message);
      return NextResponse.json({ checkoutUrl: CAKTO_FALLBACK_URL });
    }

  } catch (error: any) {
    console.error('[Cakto] Erro no checkout:', error.message);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar link de pagamento' },
      { status: 502 }
    );
  }
}
