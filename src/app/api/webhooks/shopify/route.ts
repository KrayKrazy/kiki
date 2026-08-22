import { NextResponse } from 'next/server';
import { sendOrderToBrendi } from '../../../lib/brendi';

// Esta rota receberá os POSTs (Webhooks) do Shopify sempre que um pedido for criado/pago
export async function POST(request: Request) {
  try {
    // Pegar o corpo da requisição enviada pelo Shopify
    const orderData = await request.json();
    
    console.log('Webhook recebido do Shopify! Pedido ID:', orderData.id);

    // Enviar o pedido para o Brendi
    const brendiResponse = await sendOrderToBrendi(orderData);

    return NextResponse.json(
      { message: 'Pedido processado e enviado para o Brendi com sucesso!', data: brendiResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no Webhook do Shopify:', error);
    return NextResponse.json(
      { message: 'Erro ao processar o Webhook' },
      { status: 500 }
    );
  }
}
