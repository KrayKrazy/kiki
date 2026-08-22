import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const CAKTO_API = 'https://api.cakto.com.br/public_api';

// Credenciais OAuth2 criadas em: app.cakto.com.br/dashboard/cakto-api
const CAKTO_CLIENT_ID     = process.env.CAKTO_CLIENT_ID     || 'Ml0WcZX2n4ChxDueDPI0OsDwB2kk2UBxAatXrdpQ';
const CAKTO_CLIENT_SECRET = process.env.CAKTO_CLIENT_SECRET || 'VRMenW45jwcWYg2r1RY5hEGsgidGnNDBb7nSuFnZq5TKMd3RXTRV2DxyOenkFwcDlMtqubAYRWibAXESatpoT8r79UhYuW1H648YfliMyqMqayO6dApSJKHQEFiP1Aku';

// Link fixo de fallback
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
  // Fixado para o ID do produto "Pedido Kikis Burguer" para evitar conflitos com a Kelevra
  return 'cfa2524f-0db0-4d20-b339-b10ed1a42ad8';
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
