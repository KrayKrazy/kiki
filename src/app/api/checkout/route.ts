import { NextResponse } from 'next/server';

const CAKTO_API = 'https://api.cakto.com.br/public_api';

// Credenciais OAuth2 — devem ser criadas em: app.cakto.com.br/dashboard/cakto-api
// (diferente das chaves de webhook)
const CAKTO_CLIENT_ID     = process.env.CAKTO_CLIENT_ID     || process.env.CAKTO_LOGIN       || '';
const CAKTO_CLIENT_SECRET = process.env.CAKTO_CLIENT_SECRET || process.env.CAKTO_SECRET_KEY  || '';

// Link fixo de fallback (gerado no painel Cakto)
const CAKTO_FALLBACK_URL = process.env.CAKTO_FALLBACK_URL || 'https://pay.cakto.com.br/386o2zi_1056408';

// ─── PASSO 1: Obter access_token ─────────────────────────────────────────────
// Ref: https://docs.cakto.com.br/authentication
// ATENÇÃO: A Cakto NÃO usa grant_type — apenas client_id + client_secret
async function getCaktoToken(): Promise<string> {
  const res = await fetch(`${CAKTO_API}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     CAKTO_CLIENT_ID,
      client_secret: CAKTO_CLIENT_SECRET,
    }).toString(),
  });

  const text = await res.text();
  console.log(`[Cakto Token] ${res.status}:`, text.substring(0, 300));

  if (!res.ok) {
    throw new Error(`Token Cakto falhou (${res.status}): ${text.substring(0, 200)}`);
  }

  const data = JSON.parse(text);
  console.log(`[Cakto Token] OK — expira em ${data.expires_in}s, escopos: ${data.scope}`);
  return data.access_token;
}

// ─── PASSO 2: Buscar ID do produto ───────────────────────────────────────────
async function getProductId(token: string): Promise<string> {
  // Usa o product ID fixo se configurado na variável de ambiente
  if (process.env.CAKTO_PRODUCT_ID) return process.env.CAKTO_PRODUCT_ID;

  const res = await fetch(`${CAKTO_API}/products/`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Produtos Cakto falhou (${res.status}): ${text.substring(0, 200)}`);

  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : (data.results || []);

  if (!list.length) throw new Error('Nenhum produto encontrado na conta Cakto.');

  console.log(`[Cakto Products] ${list.length} produto(s). Usando: ${list[0].id} — ${list[0].name}`);
  return list[0].id;
}

// ─── PASSO 3: Criar oferta dinâmica ──────────────────────────────────────────
async function createOffer(token: string, productId: string, name: string, price: number): Promise<string> {
  const body = { name, price, product: productId, status: 'active', type: 'unique' };

  const res = await fetch(`${CAKTO_API}/offers/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log(`[Cakto Offer] ${res.status}:`, text.substring(0, 300));

  if (!res.ok) throw new Error(`Oferta Cakto falhou (${res.status}): ${text.substring(0, 200)}`);

  const data = JSON.parse(text);
  return `https://pay.cakto.com.br/${data.id}`;
}

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { items, total } = await request.json();

    if (!items?.length) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    const itemsDescription = items.map((i: any) => `${i.quantity}x ${i.title}`).join(', ');

    try {
      const token      = await getCaktoToken();
      const productId  = await getProductId(token);
      const checkoutUrl = await createOffer(
        token,
        productId,
        `Pedido Kikis Burguer — ${itemsDescription}`,
        parseFloat(total.toFixed(2))
      );
      return NextResponse.json({ checkoutUrl });

    } catch (apiErr: any) {
      // Fallback: se API falhar, usa link fixo
      console.warn('[Cakto] Usando fallback:', apiErr.message);
      return NextResponse.json({ checkoutUrl: CAKTO_FALLBACK_URL });
    }

  } catch (err: any) {
    console.error('[Cakto] Erro geral:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
