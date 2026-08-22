import { NextResponse } from 'next/server';
import { addOrderEvent } from '@/lib/db';

// Esta rota receberá os POSTs (Webhooks) do Cakto sempre que um pagamento for aprovado
export async function POST(request: Request) {
  try {
    // Pegar o corpo da requisição enviada pelo Cakto
    const orderData = await request.json();
    
    console.log('Webhook recebido do Cakto! Pedido ID:', orderData.id || orderData.data?.id);

    try {
      // Salva o pedido no DB em memória (Padrão Open Delivery)
      // O Brendi (POS) vai fazer o polling na nossa API /v1/events/polling para baixar o pedido
      addOrderEvent(orderData);
      
      return NextResponse.json(
        { message: 'Sucesso. Pedido salvo na fila para a Brendi.' },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.error('Erro ao salvar no DB Open Delivery:', dbError.message);
      
      return NextResponse.json(
        { message: 'Webhook recebido, mas falha interna ao salvar', error: dbError.message },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Erro na rota do Webhook do Cakto (JSON inválido?):', error);
    return NextResponse.json(
      { message: 'Erro ao processar requisição' },
      { status: 400 }
    );
  }
}
