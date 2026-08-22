import { NextResponse } from 'next/server';

// Rota para receber notificações (webhooks) do Brendi
// Ex: Atualizações de status do pedido (preparando, saiu para entrega, etc)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log('[Webhook Brendi] Notificação recebida:', JSON.stringify(data, null, 2));

    // Aqui você pode adicionar lógica para atualizar o status do pedido no seu banco de dados,
    // enviar um e-mail para o cliente, disparar um SMS/WhatsApp, etc.
    const status = data.status || data.event || 'unknown';
    const orderId = data.order_id || data.id || 'unknown';

    console.log(`Pedido ${orderId} atualizado para o status: ${status}`);

    return NextResponse.json(
      { message: 'Webhook recebido com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Webhook Brendi] Erro ao processar:', error.message);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
