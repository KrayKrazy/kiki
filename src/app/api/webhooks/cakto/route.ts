import { NextResponse } from 'next/server';
import { sendOrderToBrendi } from '@/lib/brendi';

// Esta rota receberá os POSTs (Webhooks) do Cakto sempre que um pagamento for aprovado
export async function POST(request: Request) {
  try {
    // Pegar o corpo da requisição enviada pelo Cakto
    const orderData = await request.json();
    
    console.log('Webhook recebido do Cakto! Pedido ID:', orderData.id || orderData.transaction_id);

    // Enviar o pedido para o Brendi, adaptando se necessário
    const brendiResponse = await sendOrderToBrendi(orderData);

    return NextResponse.json(
      { message: 'Pagamento Cakto processado e enviado para o Brendi com sucesso!', data: brendiResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no Webhook do Cakto:', error);
    return NextResponse.json(
      { message: 'Erro ao processar o Webhook do Cakto' },
      { status: 500 }
    );
  }
}
